import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Building2, Heart, Share2, TrendingUp, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { SalaryReportButton } from "@/components/salary-report-button";
import { ChatInterface } from "@/components/chat-interface";
import { ReportCard } from "@/components/report-card";
import { EmptyState } from "@/components/empty-state";
import { StatsCard } from "@/components/stats-card";
import { StatsCardSkeleton, ReportCardSkeleton } from "@/components/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { queryClient } from "@/lib/queryClient";
import { 
  getOrganization, 
  getReportsByOrganization, 
  getMessages,
  followOrganization,
  unfollowOrganization,
  createReport,
} from "@/lib/api";

export default function OrganizationDetailPage() {
  const [, params] = useRoute("/org/:slug");
  const { toast } = useToast();
  const { joinOrganization, sendMessage: wsSendMessage, messages: wsMessages } = useWebSocket();
  const [activeTab, setActiveTab] = useState("reports");
  const userId = localStorage.getItem("userId") || "";
  
  // Fetch organization
  const { data: organization, isLoading } = useQuery({
    queryKey: ['/api/organizations', params?.slug],
    queryFn: () => getOrganization(params?.slug || ''),
    enabled: !!params?.slug,
  });

  // Fetch reports
  const { data: reports = [] } = useQuery({
    queryKey: ['/api/reports', organization?.id],
    queryFn: () => getReportsByOrganization(organization?.id || ''),
    enabled: !!organization?.id,
  });

  // Fetch messages
  const { data: initialMessages = [] } = useQuery({
    queryKey: ['/api/messages', organization?.id],
    queryFn: () => getMessages(organization?.id || ''),
    enabled: !!organization?.id && activeTab === 'chat',
  });

  // Combine initial messages with WebSocket messages
  const allMessages = [...initialMessages, ...wsMessages];

  // Join organization chat room when tab changes to chat
  useEffect(() => {
    if (activeTab === 'chat' && organization?.id) {
      joinOrganization(organization.id);
    }
  }, [activeTab, organization?.id, joinOrganization]);

  // Follow/unfollow mutation
  const followMutation = useMutation({
    mutationFn: (orgId: string) => organization?.isFollowing 
      ? unfollowOrganization(orgId) 
      : followOrganization(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
      toast({
        title: organization?.isFollowing ? "Unfollowed" : "Following!",
        description: organization?.isFollowing 
          ? "You won't receive notifications anymore" 
          : "You'll get alerts when salaries are paid",
      });
    },
  });

  // Report mutation
  const reportMutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
      toast({
        title: "Report submitted!",
        description: "Your salary report has been recorded",
      });
    },
  });

  const handleFollow = () => {
    if (organization) {
      followMutation.mutate(organization.id);
    }
  };

  const handleShare = () => {
    if (navigator.share && organization) {
      navigator.share({
        title: `Salary Status - ${organization.name}`,
        text: `Check salary payment status for ${organization.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share this link with your colleagues",
      });
    }
  };

  const handleReportSubmit = (data: any) => {
    reportMutation.mutate(data);
  };

  const handleSendMessage = (content: string) => {
    if (organization && userId) {
      wsSendMessage(organization.id, userId, content);
    }
  };

  if (isLoading) {
    return (
      <div className="pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <div className="space-y-4">
            <div className="h-24 bg-card rounded-md animate-pulse" />
            <div className="grid grid-cols-3 gap-4">
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="pb-20">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <EmptyState
            icon={Building2}
            title="Organization not found"
            description="This organization doesn't exist or has been removed"
            actionLabel="Browse Organizations"
            onAction={() => window.location.href = "/organizations"}
          />
        </div>
      </div>
    );
  }

  const percentage = organization.percentagePaid || 0;
  const isPaid = percentage >= 70;

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-card border-b border-card-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex gap-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
              {organization.logoUrl ? (
                <img
                  src={organization.logoUrl}
                  alt={organization.name}
                  className="w-16 h-16 rounded-md object-cover"
                />
              ) : (
                <Building2 className="w-8 h-8 text-muted-foreground" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="font-accent text-2xl font-bold mb-2">{organization.name}</h1>
              <div className="flex flex-wrap gap-2 mb-3 text-sm text-muted-foreground">
                <span>{organization.type === "government" ? "Government" : "Private"}</span>
                <span>•</span>
                <span className="capitalize">{organization.sector}</span>
                {organization.state && (
                  <>
                    <span>•</span>
                    <span>{organization.state}</span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={organization.isFollowing ? "secondary" : "outline"}
                  size="sm"
                  onClick={handleFollow}
                  disabled={followMutation.isPending}
                  data-testid="button-follow"
                >
                  <Heart className={`w-4 h-4 mr-1 ${organization.isFollowing ? "fill-current" : ""}`} />
                  {organization.isFollowing ? "Following" : "Follow"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare} data-testid="button-share">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Payment Status Banner */}
          <div className="mt-6 p-6 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                <p className="text-4xl font-bold text-primary">{Math.round(percentage)}%</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                isPaid ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {isPaid ? "Dem Don Pay!" : "Waiting..."}
              </div>
            </div>
            <Progress value={percentage} className="h-3 mb-3 [&>div]:bg-primary" />
            <p className="text-sm text-muted-foreground">
              {organization.totalReports} {organization.totalReports === 1 ? "person" : "people"} confirmed payment
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <StatsCard
            title="Total Reports"
            value={organization.totalReports}
            icon={Users}
          />
          <StatsCard
            title="Paid"
            value={`${Math.round(percentage)}%`}
            icon={TrendingUp}
            variant={isPaid ? "success" : "default"}
          />
          <StatsCard
            title="Last Report"
            value={organization.lastReportedAt ? "Recent" : "None"}
            icon={Clock}
          />
        </div>

        {/* Report Button */}
        <SalaryReportButton
          organizationId={organization.id}
          organizationName={organization.name}
          onSubmit={handleReportSubmit}
          isPending={reportMutation.isPending}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reports" data-testid="tab-reports">Reports</TabsTrigger>
            <TabsTrigger value="chat" data-testid="tab-chat">Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4 mt-6">
            {reports.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No reports yet"
                description="Be the first to report salary payment for this organization"
              />
            ) : (
              <div className="space-y-3" data-testid="list-reports">
                {reports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <div className="border border-card-border rounded-lg overflow-hidden bg-card">
              <div className="h-[500px]">
                <ChatInterface
                  organizationId={organization.id}
                  messages={allMessages}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
