import { Link } from "wouter";
import { Building2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { OrganizationWithStats } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface OrganizationCardProps {
  organization: OrganizationWithStats;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  const percentage = organization.percentagePaid || 0;
  const isPaid = percentage >= 70;
  const isLow = percentage < 30;
  
  const getTrendIcon = () => {
    if (percentage >= 70) return <TrendingUp className="w-3 h-3" />;
    if (percentage < 30) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  return (
    <Link href={`/org/${organization.slug}`}>
      <a data-testid={`card-org-${organization.id}`}>
        <div className="p-4 rounded-md border border-card-border bg-card hover-elevate active-elevate-2 transition-all">
          <div className="flex items-start gap-3">
            {/* Logo */}
            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
              {organization.logoUrl ? (
                <img
                  src={organization.logoUrl}
                  alt={organization.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
              ) : (
                <Building2 className="w-6 h-6 text-muted-foreground" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-foreground text-base leading-tight truncate">
                  {organization.name}
                </h3>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  isPaid ? "bg-primary/10 text-primary" :
                  isLow ? "bg-destructive/10 text-destructive" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {getTrendIcon()}
                  <span>{Math.round(percentage)}%</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs">
                  {organization.type === "government" ? "Government" : "Private"}
                </Badge>
                {organization.isCustom && !organization.isApproved && (
                  <Badge variant="secondary" className="text-xs">
                    Community-added · unverified
                  </Badge>
                )}
                {organization.state && (
                  <span className="text-xs text-muted-foreground">{organization.state}</span>
                )}
                <span className="text-xs text-muted-foreground capitalize">{organization.sector}</span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <Progress 
                  value={percentage} 
                  className={`h-2 ${isPaid ? "[&>div]:bg-primary" : isLow ? "[&>div]:bg-destructive" : "[&>div]:bg-muted-foreground"}`}
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {organization.totalReports} {organization.totalReports === 1 ? "report" : "reports"}
                  </span>
                  {organization.lastReportedAt && (
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(organization.lastReportedAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}
