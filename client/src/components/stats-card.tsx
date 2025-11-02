import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
}

export function StatsCard({ title, value, description, icon: Icon, variant = "default" }: StatsCardProps) {
  const variantClasses = {
    default: "bg-card border-card-border",
    success: "bg-primary/5 border-primary/20",
    warning: "bg-yellow-500/5 border-yellow-500/20",
    danger: "bg-destructive/5 border-destructive/20",
  };

  const iconClasses = {
    default: "text-foreground",
    success: "text-primary",
    warning: "text-yellow-600",
    danger: "text-destructive",
  };

  return (
    <div className={`p-4 rounded-md border ${variantClasses[variant]}`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        {Icon && <Icon className={`w-4 h-4 ${iconClasses[variant]}`} />}
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
