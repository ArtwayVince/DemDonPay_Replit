import { TrendingUp, Users, Building2, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/stats-card";
import { OrganizationCard } from "@/components/organization-card";
import { OrganizationCardSkeleton, StatsCardSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { getOrganizations } from "@/lib/api";

export default function HomePage() {
  const { data: allOrganizations = [], isLoading } = useQuery({
    queryKey: ['/api/organizations'],
    queryFn: () => getOrganizations(),
  });
  
  // Get top 5 organizations by percentage paid
  const topOrganizations = allOrganizations
    .sort((a, b) => b.percentagePaid - a.percentagePaid)
    .slice(0, 5);
  
  const paidToday = allOrganizations.filter(org => org.percentagePaid >= 70).length;
  const totalReports = allOrganizations.reduce((sum, org) => sum + org.totalReports, 0);

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-accent text-2xl font-bold text-foreground">Dem Don Pay</h1>
          <p className="text-sm text-muted-foreground mt-1">Track salary payments in real-time</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <section>
          <h2 className="font-semibold text-lg mb-4">Today's Overview</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <StatsCard
                title="Organizations Paid"
                value={paidToday}
                description="70%+ confirmed"
                icon={Building2}
                variant="success"
              />
              <StatsCard
                title="Total Reports"
                value={totalReports}
                description="Last 30 days"
                icon={Users}
                variant="default"
              />
            </div>
          )}
        </section>

        {/* Top Organizations */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-lg">Live Salary Status</h2>
              <p className="text-sm text-muted-foreground">Organizations with recent activity</p>
            </div>
            <Link href="/organizations">
              <Button variant="outline" size="sm" data-testid="button-view-all">
                View All
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <OrganizationCardSkeleton />
              <OrganizationCardSkeleton />
              <OrganizationCardSkeleton />
            </div>
          ) : topOrganizations.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No salary reports yet"
              description="Be the first to report when your salary drops! Search for your organization and start reporting."
              actionLabel="Browse Organizations"
              onAction={() => window.location.href = "/organizations"}
            />
          ) : (
            <div className="space-y-4" data-testid="list-top-organizations">
              {topOrganizations.map((org) => (
                <OrganizationCard key={org.id} organization={org} />
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="bg-card border border-card-border rounded-lg p-6 text-center">
          <h3 className="font-semibold text-lg mb-2">Have Your Salary Entered?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Help others by reporting when your salary drops!
          </p>
          <Link href="/organizations">
            <Button size="lg" className="bg-primary" data-testid="button-report-now">
              <TrendingUp className="w-5 h-5 mr-2" />
              Report Now
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
