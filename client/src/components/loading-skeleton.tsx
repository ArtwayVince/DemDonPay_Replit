import { Skeleton } from "@/components/ui/skeleton";

export function OrganizationCardSkeleton() {
  return (
    <div className="p-4 rounded-md border border-card-border bg-card">
      <div className="flex items-start gap-3">
        <Skeleton className="w-12 h-12 rounded-md flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportCardSkeleton() {
  return (
    <div className="flex gap-3 p-4 rounded-md bg-card border border-card-border">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="p-4 rounded-md border border-card-border bg-card">
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
