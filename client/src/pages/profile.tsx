import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Heart, FileText, LogOut, Moon, Sun, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/stats-card";
import { OrganizationCard } from "@/components/organization-card";
import { EmptyState } from "@/components/empty-state";
import { StatsCardSkeleton, OrganizationCardSkeleton } from "@/components/loading-skeleton";
import { useLocation } from "wouter";
import { getModeratorStatus } from "@/lib/api";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const [isDark, setIsDark] = useState(false);
  const { data: moderatorStatus } = useQuery({
    queryKey: ["/api/moderation/status"],
    queryFn: getModeratorStatus,
  });
  const phoneNumber = localStorage.getItem("phoneNumber") || "08012345678";
  const displayName = localStorage.getItem("displayName") || `User ${phoneNumber.slice(-4)}`;
  
  const { data: followingOrgs = [], isLoading } = useQuery({
    queryKey: ['/api/follows'],
    queryFn: async () => {
      const { getUserFollows } = await import("@/lib/api");
      return getUserFollows();
    },
  });
  
  // Calculate total reports (simplified - in real app would query from backend)
  const totalReports = 0;

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("phoneNumber");
    setLocation("/login");
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-card border-b border-card-border">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="font-accent text-2xl font-bold mb-1">{displayName}</h1>
              <p className="text-muted-foreground mb-4">{phoneNumber}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={toggleTheme} data-testid="button-theme-toggle">
                  {isDark ? <Sun className="w-4 h-4 mr-1" /> : <Moon className="w-4 h-4 mr-1" />}
                  {isDark ? "Light Mode" : "Dark Mode"}
                </Button>
                {moderatorStatus?.isModerator && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation("/moderation/organizations")}
                    data-testid="button-review-organizations"
                  >
                    <ClipboardCheck className="w-4 h-4 mr-1" />
                    Review companies
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout} data-testid="button-logout">
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <section>
          <h2 className="font-semibold text-lg mb-4">Your Activity</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <StatsCard
                title="Reports Made"
                value={totalReports}
                icon={FileText}
              />
              <StatsCard
                title="Following"
                value={followingOrgs.length}
                icon={Heart}
              />
            </div>
          )}
        </section>

        {/* Following Organizations */}
        <section>
          <h2 className="font-semibold text-lg mb-4">Following</h2>
          {isLoading ? (
            <div className="space-y-4">
              <OrganizationCardSkeleton />
              <OrganizationCardSkeleton />
            </div>
          ) : followingOrgs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <EmptyState
                  icon={Heart}
                  title="Not following any organizations"
                  description="Follow organizations to get notified when salaries are paid"
                  actionLabel="Browse Organizations"
                  onAction={() => setLocation("/organizations")}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4" data-testid="list-following">
              {followingOrgs.map((org) => (
                <OrganizationCard key={org.id} organization={org} />
              ))}
            </div>
          )}
        </section>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About Dem Don Pay</CardTitle>
            <CardDescription>
              Know when salary enter — before you ask!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Dem Don Pay is a community-driven platform that helps Nigerian workers track salary payments across organizations in real-time.
            </p>
            <p>
              Report when your salary enters, chat with colleagues, and stay informed about payment statuses across the country.
            </p>
            <p className="pt-2 text-xs">
              Version 1.0.0 • Made with love for Nigerian workers
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
