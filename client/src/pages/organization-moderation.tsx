import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2, Check, EyeOff, RotateCcw, Save, ShieldCheck } from "lucide-react";
import type { Organization } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  getCommunityOrganizationsForModeration,
  getModeratorStatus,
  moderateOrganization,
  type OrganizationModerationAction,
} from "@/lib/api";

const sectors = [
  ["banking", "Banking"],
  ["telecom", "Telecommunications"],
  ["government", "Government"],
  ["education", "Education"],
  ["healthcare", "Healthcare"],
  ["oil-gas", "Oil and gas"],
  ["other", "Other"],
] as const;

type OrganizationDraft = Pick<Organization, "name" | "type" | "sector" | "state">;

function SubmissionCard({ organization }: { organization: Organization }) {
  const { toast } = useToast();
  const [draft, setDraft] = useState<OrganizationDraft>({
    name: organization.name,
    type: organization.type,
    sector: organization.sector,
    state: organization.state,
  });

  useEffect(() => {
    setDraft({
      name: organization.name,
      type: organization.type,
      sector: organization.sector,
      state: organization.state,
    });
  }, [organization.name, organization.type, organization.sector, organization.state]);

  const mutation = useMutation({
    mutationFn: (action: OrganizationModerationAction) => moderateOrganization(organization.id, action),
    onSuccess: (_updated, action) => {
      queryClient.invalidateQueries({ queryKey: ["/api/moderation/organizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      toast({
        title: action.action === "approve" ? "Company confirmed" :
          action.action === "hide" ? "Company hidden" :
            action.action === "restore" ? "Company restored" : "Company details saved",
        description: "The community listing has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Could not update company",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveDraft = (action: "save" | "approve") => {
    mutation.mutate({
      action,
      name: draft.name.trim(),
      type: draft.type === "government" ? "government" : "private",
      sector: draft.sector,
      state: draft.state?.trim() || null,
    });
  };

  return (
    <Card data-testid={`moderation-org-${organization.id}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{organization.name}</CardTitle>
            <CardDescription className="mt-1">
              Added {new Date(organization.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {!organization.isApproved && <Badge variant="secondary">Needs review</Badge>}
            {organization.isApproved && <Badge variant="outline">Confirmed</Badge>}
            {organization.isHidden && <Badge variant="destructive">Hidden from public</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            saveDraft("save");
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`name-${organization.id}`}>Company name</Label>
              <Input
                id={`name-${organization.id}`}
                value={draft.name}
                maxLength={150}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`type-${organization.id}`}>Organization type</Label>
              <select
                id={`type-${organization.id}`}
                value={draft.type}
                onChange={(event) => setDraft({ ...draft, type: event.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="private">Private</option>
                <option value="government">Government</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`sector-${organization.id}`}>Sector</Label>
              <select
                id={`sector-${organization.id}`}
                value={draft.sector}
                onChange={(event) => setDraft({ ...draft, sector: event.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {sectors.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`state-${organization.id}`}>State or territory</Label>
              <Input
                id={`state-${organization.id}`}
                value={draft.state || ""}
                maxLength={100}
                onChange={(event) => setDraft({ ...draft, state: event.target.value || null })}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button type="submit" variant="outline" disabled={mutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Save corrections
            </Button>
            {!organization.isApproved && (
              <Button
                type="button"
                onClick={() => saveDraft("approve")}
                disabled={mutation.isPending}
              >
                <Check className="mr-2 h-4 w-4" />
                Confirm company
              </Button>
            )}
            {organization.isHidden ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => mutation.mutate({ action: "restore" })}
                disabled={mutation.isPending}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore listing
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                onClick={() => mutation.mutate({ action: "hide" })}
                disabled={mutation.isPending}
              >
                <EyeOff className="mr-2 h-4 w-4" />
                Hide listing
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function OrganizationModerationPage() {
  const { data: moderatorStatus, isLoading: checkingAccess, error: accessError } = useQuery({
    queryKey: ["/api/moderation/status"],
    queryFn: getModeratorStatus,
  });
  const { data: organizations = [], isLoading: loadingOrganizations, error: organizationsError } = useQuery({
    queryKey: ["/api/moderation/organizations"],
    queryFn: getCommunityOrganizationsForModeration,
    enabled: moderatorStatus?.isModerator === true,
  });

  if (checkingAccess) {
    return <main className="mx-auto max-w-4xl px-4 py-10 text-muted-foreground">Checking moderator access…</main>;
  }

  if (accessError || !moderatorStatus?.isModerator) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 pb-24">
        <Card>
          <CardHeader>
            <CardTitle>Moderator access required</CardTitle>
            <CardDescription>This area is only available to approved moderators.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const reviewCount = organizations.filter((organization) => !organization.isApproved).length;

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 pb-24">
      <header>
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-medium">Moderator tools</span>
        </div>
        <h1 className="mt-2 font-accent text-2xl font-bold">Community companies</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review submissions, correct details, or hide duplicates without deleting them.
        </p>
      </header>

      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm">
            <strong>{reviewCount}</strong> {reviewCount === 1 ? "company needs" : "companies need"} confirmation.
            New submissions stay visible with an unverified label until confirmed.
          </p>
        </CardContent>
      </Card>

      {loadingOrganizations ? (
        <p className="py-8 text-center text-muted-foreground">Loading community submissions…</p>
      ) : organizationsError ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">
            Could not load submissions. Refresh the page to try again.
          </CardContent>
        </Card>
      ) : organizations.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No community-added companies to review yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {organizations.map((organization) => (
            <SubmissionCard key={organization.id} organization={organization} />
          ))}
        </div>
      )}
    </main>
  );
}
