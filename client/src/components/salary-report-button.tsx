import { useState } from "react";
import { CheckCircle2, Calendar, DollarSign, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  insertReportSchema,
  type InsertOrganization,
  type Organization,
} from "@shared/schema";
import { format } from "date-fns";
import { z } from "zod";

interface SalaryReportButtonProps {
  organizationId?: string;
  organizationName?: string;
  organizations?: Array<Pick<Organization, "id" | "name">>;
  onSubmit: (data: z.infer<typeof insertReportSchema>) => void | Promise<unknown>;
  onCreateOrganization?: (data: InsertOrganization) => Promise<Organization>;
  isPending?: boolean;
  triggerLabel?: string;
  triggerIcon?: ReactNode;
  triggerVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  triggerSize?: "default" | "sm" | "lg" | "icon";
  triggerClassName?: string;
  triggerDisabled?: boolean;
}

export function SalaryReportButton({ 
  organizationId, 
  organizationName, 
  organizations,
  onSubmit,
  onCreateOrganization,
  isPending,
  triggerLabel,
  triggerIcon,
  triggerVariant,
  triggerSize,
  triggerClassName,
  triggerDisabled,
}: SalaryReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [isAddingOrganization, setIsAddingOrganization] = useState(false);
  const [newOrganizationName, setNewOrganizationName] = useState("");
  const [newOrganizationType, setNewOrganizationType] = useState("private");
  const [newOrganizationSector, setNewOrganizationSector] = useState("other");
  const [newOrganizationState, setNewOrganizationState] = useState("");
  const [newOrganizationError, setNewOrganizationError] = useState("");
  const [recentlyCreatedOrganization, setRecentlyCreatedOrganization] = useState<Organization | null>(null);
  const selectableOrganizations = organizations
    ? recentlyCreatedOrganization && !organizations.some((item) => item.id === recentlyCreatedOrganization.id)
      ? [...organizations, recentlyCreatedOrganization]
      : organizations
    : undefined;

  const form = useForm<z.infer<typeof insertReportSchema>>({
    resolver: zodResolver(insertReportSchema),
    defaultValues: {
      organizationId: organizationId || "",
      datePaid: new Date().toISOString(),
      isAnonymous: true,
      reporterRole: "employee",
    },
  });

  const handleSubmit = async (data: z.infer<typeof insertReportSchema>) => {
    try {
      let reportData = data;
      if (organizations && !isAddingOrganization && !data.organizationId) {
        form.setError("organizationId", {
          type: "manual",
          message: "Choose a company or add one.",
        });
        return;
      }

      if (isAddingOrganization) {
        const name = newOrganizationName.trim();
        if (!name) {
          setNewOrganizationError("Enter your company name.");
          return;
        }
        if (!onCreateOrganization) {
          setNewOrganizationError("Adding companies is unavailable right now.");
          return;
        }

        const organization = await onCreateOrganization({
          name,
          type: newOrganizationType,
          sector: newOrganizationSector,
          state: newOrganizationState.trim() || null,
        });
        setRecentlyCreatedOrganization(organization);
        setIsAddingOrganization(false);
        setNewOrganizationError("");
        form.setValue("organizationId", organization.id, { shouldValidate: true });
        reportData = { ...data, organizationId: organization.id };
      }

      await onSubmit(reportData);
      setOpen(false);
      setIsAddingOrganization(false);
      setNewOrganizationName("");
      setNewOrganizationState("");
      form.reset({
        organizationId: organizationId || "",
        datePaid: new Date().toISOString(),
        isAnonymous: true,
        reporterRole: "employee",
      });
    } catch {
      // Keep the form open so the user can correct the company or retry the report.
    }
  };

  return (
    <>
      <Button
        size={triggerSize ?? "lg"}
        variant={triggerVariant ?? "default"}
        className={triggerClassName ?? "w-full h-14 text-base font-bold bg-primary hover:bg-primary text-primary-foreground shadow-lg"}
        onClick={() => setOpen(true)}
        disabled={triggerDisabled}
        data-testid={organizations ? "button-add-report" : "button-report-salary"}
      >
        {triggerIcon ?? <CheckCircle2 className="w-5 h-5 mr-2" />}
        {triggerLabel ?? "SALARY DON ENTER!"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-accent text-xl">Report Salary Payment</DialogTitle>
            <DialogDescription>
              {organizations
                ? "Choose your company and confirm the salary payment."
                : `Confirm salary payment for ${organizationName}`}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {organizations && (
                <>
                  {!isAddingOrganization ? (
                    <>
                      <FormField
                        control={form.control}
                        name="organizationId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="select-report-organization">
                                  <SelectValue placeholder="Choose your company" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {selectableOrganizations?.map((organization) => (
                                  <SelectItem key={organization.id} value={organization.id}>
                                    {organization.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {onCreateOrganization && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-auto p-0 text-sm text-primary"
                          onClick={() => {
                            setIsAddingOrganization(true);
                            setNewOrganizationError("");
                            form.setValue("organizationId", "");
                          }}
                          data-testid="button-add-unlisted-company"
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Company not listed? Add it
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3 rounded-md border border-border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <FormLabel>Add your company</FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsAddingOrganization(false);
                            setNewOrganizationError("");
                          }}
                        >
                          Choose listed company
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <FormLabel htmlFor="new-company-name">Company name</FormLabel>
                        <Input
                          id="new-company-name"
                          value={newOrganizationName}
                          onChange={(event) => {
                            setNewOrganizationName(event.target.value);
                            setNewOrganizationError("");
                          }}
                          placeholder="Enter organization name"
                          maxLength={120}
                          data-testid="input-new-company-name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <FormLabel>Organization type</FormLabel>
                          <Select value={newOrganizationType} onValueChange={setNewOrganizationType}>
                            <SelectTrigger data-testid="select-new-company-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="private">Private</SelectItem>
                              <SelectItem value="government">Government</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <FormLabel>Sector</FormLabel>
                          <Select value={newOrganizationSector} onValueChange={setNewOrganizationSector}>
                            <SelectTrigger data-testid="select-new-company-sector">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="banking">Banking</SelectItem>
                              <SelectItem value="telecom">Telecom</SelectItem>
                              <SelectItem value="government">Government</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="oil-gas">Oil &amp; gas</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <FormLabel htmlFor="new-company-state">State or location (optional)</FormLabel>
                        <Input
                          id="new-company-state"
                          value={newOrganizationState}
                          onChange={(event) => setNewOrganizationState(event.target.value)}
                          placeholder="e.g. Lagos"
                          maxLength={80}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        New companies appear immediately and are marked unverified.
                      </p>
                      {newOrganizationError && (
                        <p role="alert" className="text-sm text-destructive">{newOrganizationError}</p>
                      )}
                    </div>
                  )}
                </>
              )}

              <FormField
                control={form.control}
                name="reporterRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I’m reporting as</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-reporter-role">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="representative">Organization representative</SelectItem>
                      </SelectContent>
                    </Select>
                    {field.value === "representative" && (
                      <p className="text-xs text-muted-foreground">
                        This role is self-reported and not verified by the app.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Paid */}
              <FormField
                control={form.control}
                name="datePaid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Paid</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            data-testid="button-select-date"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {field.value ? format(new Date(field.value), "PPP") : "Select date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString())}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount (Optional) */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="Enter amount in Naira"
                          className="pl-9"
                          data-testid="input-amount"
                          {...field}
                          value={field.value || ""}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Anonymous */}
              <FormField
                control={form.control}
                name="isAnonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-anonymous"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Post anonymously</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Your name won't be shown with this report
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                  data-testid="button-cancel-report"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary"
                  disabled={isPending}
                  data-testid="button-submit-report"
                >
                  {isPending ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
