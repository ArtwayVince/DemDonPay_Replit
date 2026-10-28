import { useState } from "react";
import { CheckCircle2, Calendar, DollarSign, Upload, X } from "lucide-react";
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
import { insertReportSchema, type Organization } from "@shared/schema";
import { format } from "date-fns";
import { z } from "zod";

interface SalaryReportButtonProps {
  organizationId?: string;
  organizationName?: string;
  organizations?: Array<Pick<Organization, "id" | "name">>;
  onSubmit: (data: z.infer<typeof insertReportSchema>) => void;
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
  isPending,
  triggerLabel,
  triggerIcon,
  triggerVariant,
  triggerSize,
  triggerClassName,
  triggerDisabled,
}: SalaryReportButtonProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof insertReportSchema>>({
    resolver: zodResolver(insertReportSchema),
    defaultValues: {
      organizationId: organizationId || "",
      datePaid: new Date().toISOString(),
      isAnonymous: true,
    },
  });

  const handleSubmit = (data: z.infer<typeof insertReportSchema>) => {
    onSubmit(data);
    setOpen(false);
    form.reset();
  };

  return (
    <>
      <Button
        size={triggerSize ?? "lg"}
        variant={triggerVariant ?? "default"}
        className={triggerClassName ?? "w-full h-14 text-base font-bold bg-primary hover:bg-primary text-primary-foreground shadow-lg"}
        onClick={() => setOpen(true)}
        disabled={triggerDisabled || (Boolean(organizations) && organizations!.length === 0)}
        data-testid={organizations ? "button-add-report" : "button-report-salary"}
      >
        {triggerIcon ?? <CheckCircle2 className="w-5 h-5 mr-2" />}
        {triggerLabel ?? "SALARY DON ENTER!"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
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
                          {organizations.map((organization) => (
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
              )}

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
