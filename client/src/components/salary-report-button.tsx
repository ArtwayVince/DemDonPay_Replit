import { useState } from "react";
import { CheckCircle2, Calendar, DollarSign, Upload, X } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReportSchema } from "@shared/schema";
import { format } from "date-fns";
import { z } from "zod";

interface SalaryReportButtonProps {
  organizationId: string;
  organizationName: string;
  onSubmit: (data: z.infer<typeof insertReportSchema>) => void;
  isPending?: boolean;
}

export function SalaryReportButton({ 
  organizationId, 
  organizationName, 
  onSubmit,
  isPending 
}: SalaryReportButtonProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof insertReportSchema>>({
    resolver: zodResolver(insertReportSchema),
    defaultValues: {
      organizationId,
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
        size="lg"
        className="w-full h-14 text-base font-bold bg-primary hover:bg-primary text-primary-foreground shadow-lg"
        onClick={() => setOpen(true)}
        data-testid="button-report-salary"
      >
        <CheckCircle2 className="w-5 h-5 mr-2" />
        SALARY DON ENTER!
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-accent text-xl">Report Salary Payment</DialogTitle>
            <DialogDescription>
              Confirm salary payment for {organizationName}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
