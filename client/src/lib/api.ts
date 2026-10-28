// API helper functions
import type { 
  Organization, 
  OrganizationWithStats, 
  Report, 
  Message, 
  Notification,
  InsertReport,
  InsertMessage,
  InsertOrganization,
  User
} from "@shared/schema";

// Get user ID and phone from localStorage for auth headers
const getUserHeaders = () => {
  const userId = localStorage.getItem("userId");
  const phoneNumber = localStorage.getItem("phoneNumber");
  return {
    'x-user-id': userId || '',
    'x-phone-number': phoneNumber || '',
  };
};

// Auth APIs
export const sendOtp = async (phoneNumber: string) => {
  const response = await fetch("/api/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber }),
  });
  if (!response.ok) throw new Error("Failed to send OTP");
  return response.json();
};

export const verifyOtp = async (phoneNumber: string, otpCode: string): Promise<{ user: User }> => {
  const response = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber, otpCode }),
  });
  if (!response.ok) throw new Error("Invalid OTP");
  return response.json();
};

export const loginToDemoAccount = async (): Promise<{ user: User }> => {
  const response = await fetch("/api/auth/dev-login", { method: "POST" });
  if (!response.ok) throw new Error("Demo login is only available in development");
  return response.json();
};

// Organization APIs
export const getOrganizations = async (filters?: {
  search?: string;
  type?: string;
  sector?: string;
  state?: string;
}): Promise<OrganizationWithStats[]> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.type) params.append("type", filters.type);
  if (filters?.sector) params.append("sector", filters.sector);
  if (filters?.state) params.append("state", filters.state);
  
  const response = await fetch(`/api/organizations?${params}`, {
    headers: getUserHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch organizations");
  return response.json();
};

export const getOrganization = async (slug: string): Promise<OrganizationWithStats> => {
  const response = await fetch(`/api/organizations/${slug}`, {
    headers: getUserHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch organization");
  return response.json();
};

export const createOrganization = async (data: InsertOrganization): Promise<Organization> => {
  const response = await fetch("/api/organizations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getUserHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create organization");
  return response.json();
};

// Report APIs
export const createReport = async (data: InsertReport): Promise<Report> => {
  const response = await fetch("/api/reports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getUserHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create report");
  return response.json();
};

export const getReportsByOrganization = async (organizationId: string): Promise<Report[]> => {
  const response = await fetch(`/api/reports/organization/${organizationId}`);
  if (!response.ok) throw new Error("Failed to fetch reports");
  return response.json();
};

export const getOrganizationStats = async (organizationId: string) => {
  const response = await fetch(`/api/reports/stats/${organizationId}`);
  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
};

// Message APIs
export const getMessages = async (organizationId: string): Promise<Message[]> => {
  const response = await fetch(`/api/messages/${organizationId}`);
  if (!response.ok) throw new Error("Failed to fetch messages");
  return response.json();
};

// Follow APIs
export const followOrganization = async (organizationId: string) => {
  const response = await fetch(`/api/follows/${organizationId}`, {
    method: "POST",
    headers: getUserHeaders(),
  });
  if (!response.ok) throw new Error("Failed to follow organization");
  return response.json();
};

export const unfollowOrganization = async (organizationId: string) => {
  const response = await fetch(`/api/follows/${organizationId}`, {
    method: "DELETE",
    headers: getUserHeaders(),
  });
  if (!response.ok) throw new Error("Failed to unfollow organization");
  return response.json();
};

export const getUserFollows = async (): Promise<Organization[]> => {
  const response = await fetch("/api/follows", {
    headers: getUserHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch follows");
  return response.json();
};

// Notification APIs
export const getNotifications = async (): Promise<Notification[]> => {
  const response = await fetch("/api/notifications", {
    headers: getUserHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch notifications");
  return response.json();
};

export const markNotificationRead = async (notificationId: string) => {
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: getUserHeaders(),
  });
  if (!response.ok) throw new Error("Failed to mark notification as read");
  return response.json();
};

export const markAllNotificationsRead = async () => {
  const response = await fetch("/api/notifications/read-all", {
    method: "PATCH",
    headers: getUserHeaders(),
  });
  if (!response.ok) throw new Error("Failed to mark all notifications as read");
  return response.json();
};
