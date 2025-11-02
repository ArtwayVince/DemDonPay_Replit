import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { formatDistanceToNow } from "date-fns";
import { getNotifications, markAllNotificationsRead } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: getNotifications,
  });
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment_alert":
        return "💰";
      case "custom_org_approved":
        return "✅";
      default:
        return "📢";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "payment_alert":
        return "border-l-primary";
      case "custom_org_approved":
        return "border-l-green-500";
      default:
        return "border-l-blue-500";
    }
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-accent text-2xl font-bold text-foreground">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
                </p>
              )}
            </div>
            {notifications.length > 0 && unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                data-testid="button-mark-all-read"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-md bg-card border border-card-border animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title="No notifications yet"
            description="You'll see salary alerts and updates here when organizations you follow get paid"
          />
        ) : (
          <div className="space-y-3" data-testid="list-notifications">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-md border-l-4 ${getNotificationColor(notification.type)} ${
                  notification.isRead ? "bg-card border-card-border" : "bg-primary/5 border-card-border"
                }`}
                data-testid={`notification-${notification.id}`}
              >
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-semibold text-sm ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
