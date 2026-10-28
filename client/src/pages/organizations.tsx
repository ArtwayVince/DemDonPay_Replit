import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2, Plus } from "lucide-react";
import { OrganizationSearch } from "@/components/organization-search";
import { OrganizationCard } from "@/components/organization-card";
import { OrganizationCardSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import { SalaryReportButton } from "@/components/salary-report-button";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { createOrganization, createReport, getOrganizations } from "@/lib/api";

export default function OrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['/api/organizations', searchQuery, selectedType, selectedSector, selectedState],
    queryFn: () => getOrganizations({
      search: searchQuery,
      type: selectedType || undefined,
      sector: selectedSector || undefined,
      state: selectedState || undefined,
    }),
  });

  const reportMutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Report submitted!",
        description: "Your salary report has been recorded.",
      });
    },
    onError: () => {
      toast({
        title: "Could not submit report",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const createOrganizationMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      setSearchQuery("");
      setSelectedType(null);
      setSelectedSector(null);
      setSelectedState(null);
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
    },
    onError: (error) => {
      toast({
        title: "Could not add company",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredOrganizations = organizations;

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-accent text-2xl font-bold text-foreground">Organizations</h1>
            <SalaryReportButton
              organizations={filteredOrganizations}
              onSubmit={(data) => reportMutation.mutateAsync(data)}
              onCreateOrganization={(data) => createOrganizationMutation.mutateAsync(data)}
              isPending={reportMutation.isPending || createOrganizationMutation.isPending}
              triggerLabel="Add Report"
              triggerIcon={<Plus className="w-4 h-4" />}
              triggerVariant="outline"
              triggerSize="sm"
              triggerClassName="gap-1"
              triggerDisabled={isLoading}
            />
          </div>
          <OrganizationSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedSector={selectedSector}
            onSectorChange={setSelectedSector}
            selectedState={selectedState}
            onStateChange={setSelectedState}
          />
        </div>
      </div>

      {/* Organizations List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            <OrganizationCardSkeleton />
            <OrganizationCardSkeleton />
            <OrganizationCardSkeleton />
            <OrganizationCardSkeleton />
          </div>
        ) : filteredOrganizations.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={searchQuery || selectedType || selectedSector || selectedState 
              ? "No organizations found" 
              : "No organizations yet"}
            description={searchQuery || selectedType || selectedSector || selectedState
              ? "Try adjusting your search or filters"
              : "Organizations will appear here once they're added to the system"}
          />
        ) : (
          <div className="space-y-4" data-testid="list-organizations">
            {filteredOrganizations.map((org) => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
