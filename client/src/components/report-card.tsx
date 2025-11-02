import { CheckCircle2, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import type { Report } from "@shared/schema";

interface ReportWithUser extends Report {
  user?: {
    displayName: string | null;
    phoneNumber: string;
  };
}

interface ReportCardProps {
  report: ReportWithUser;
}

export function ReportCard({ report }: ReportCardProps) {
  const displayName = report.isAnonymous 
    ? "Anonymous User" 
    : report.user?.displayName || `User ${report.user?.phoneNumber?.slice(-4)}`;
  
  const initials = report.isAnonymous 
    ? "?" 
    : (report.user?.displayName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U");

  return (
    <div 
      className="flex gap-3 p-4 rounded-md bg-card border border-card-border"
      data-testid={`card-report-${report.id}`}
    >
      {/* Avatar */}
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarFallback className={report.isAnonymous ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}>
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{displayName}</span>
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-2">
          Confirmed salary payment on {format(new Date(report.datePaid), "PPP")}
        </p>

        {report.amount && (
          <Badge variant="outline" className="text-xs font-semibold">
            ₦{parseFloat(report.amount).toLocaleString()}
          </Badge>
        )}
      </div>
    </div>
  );
}
