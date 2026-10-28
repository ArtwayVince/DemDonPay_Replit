import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertReportSchema, insertMessageSchema, insertOrganizationSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

// WebSocket connection tracking
const organizationConnections = new Map<string, Set<WebSocket>>();
const allConnections = new Set<WebSocket>();

// Helper to broadcast updates to all clients
function broadcastUpdate(data: any) {
  const message = JSON.stringify(data);
  allConnections.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server setup for real-time chat (based on javascript_websocket blueprint)
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    let currentOrganizationId: string | null = null;
    allConnections.add(ws);

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'join') {
          // Join organization room
          currentOrganizationId = message.organizationId;
          if (!organizationConnections.has(currentOrganizationId)) {
            organizationConnections.set(currentOrganizationId, new Set());
          }
          organizationConnections.get(currentOrganizationId)!.add(ws);
        } else if (message.type === 'message' && currentOrganizationId) {
          // Save message to database
          const savedMessage = await storage.createMessage({
            userId: message.userId,
            organizationId: currentOrganizationId,
            content: message.content,
          });

          // Broadcast to all clients in the room
          const connections = organizationConnections.get(currentOrganizationId);
          if (connections) {
            const messageData = JSON.stringify({
              type: 'new_message',
              message: savedMessage,
            });
            connections.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(messageData);
              }
            });
          }
        }
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    });

    ws.on('close', () => {
      // Remove from all tracking
      allConnections.delete(ws);
      if (currentOrganizationId) {
        const connections = organizationConnections.get(currentOrganizationId);
        if (connections) {
          connections.delete(ws);
          if (connections.size === 0) {
            organizationConnections.delete(currentOrganizationId);
          }
        }
      }
    });
  });

  // ===== Auth Routes =====

  // Development-only access to a fixed demo account. This route is not
  // registered in production and cannot be used to impersonate arbitrary users.
  if (process.env.NODE_ENV === "development") {
    app.post("/api/auth/dev-login", async (_req, res) => {
      try {
        const phoneNumber = "08000000000";
        let user = await storage.getUserByPhone(phoneNumber);

        if (!user) {
          user = await storage.createUser({
            phoneNumber,
            displayName: "Demo User",
          });
        }

        await storage.verifyUser(user.id);
        res.json({
          user: {
            id: user.id,
            phoneNumber: user.phoneNumber,
            displayName: user.displayName,
          },
        });
      } catch (error) {
        console.error("Development demo login error:", error);
        res.status(500).json({ error: "Failed to log in to the demo account" });
      }
    });
  }
  
  // Register or login with phone number
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      // Check if user exists
      let user = await storage.getUserByPhone(phoneNumber);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          phoneNumber,
          displayName: `User ${phoneNumber.slice(-4)}`,
        });
      }

      // Generate OTP (mock for development)
      const otpCode = "123456"; // In production, generate random 6-digit code
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await storage.updateUserOtp(phoneNumber, otpCode, otpExpiry);

      // In production, send OTP via Twilio here
      console.log(`OTP for ${phoneNumber}: ${otpCode}`);

      res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  // Verify OTP and login
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { phoneNumber, otpCode } = req.body;
      if (!phoneNumber || !otpCode) {
        return res.status(400).json({ error: "Phone number and OTP are required" });
      }

      const user = await storage.getUserByPhone(phoneNumber);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check OTP (mock verification for development - accept any 6-digit code)
      if (otpCode.length === 6) {
        await storage.verifyUser(user.id);
        res.json({ user: { id: user.id, phoneNumber: user.phoneNumber, displayName: user.displayName } });
      } else {
        res.status(401).json({ error: "Invalid OTP" });
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    try {
      const phoneNumber = req.headers['x-phone-number'] as string;
      if (!phoneNumber) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUserByPhone(phoneNumber);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // ===== Organization Routes =====

  // Get all organizations with filters
  app.get("/api/organizations", async (req, res) => {
    try {
      const { search, type, sector, state } = req.query;
      const userId = req.headers['x-user-id'] as string;
      
      const organizations = await storage.getOrganizations({
        search: search as string,
        type: type as string,
        sector: sector as string,
        state: state as string,
      });

      // Add isFollowing for authenticated users
      if (userId) {
        const orgsWithFollowing = await Promise.all(
          organizations.map(async (org) => ({
            ...org,
            isFollowing: await storage.isFollowing(userId, org.id),
          }))
        );
        return res.json(orgsWithFollowing);
      }

      res.json(organizations);
    } catch (error) {
      console.error('Get organizations error:', error);
      res.status(500).json({ error: "Failed to get organizations" });
    }
  });

  // Get organization by slug
  app.get("/api/organizations/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const userId = req.headers['x-user-id'] as string;
      
      const org = await storage.getOrganizationBySlug(slug);
      if (!org) {
        return res.status(404).json({ error: "Organization not found" });
      }

      const orgWithStats = await storage.getOrganizationWithStats(org.id, userId);
      res.json(orgWithStats);
    } catch (error) {
      console.error('Get organization error:', error);
      res.status(500).json({ error: "Failed to get organization" });
    }
  });

  // Create custom organization
  app.post("/api/organizations", async (req, res) => {
    try {
      const validated = insertOrganizationSchema.parse(req.body);
      const name = validated.name.trim();
      if (!name) {
        return res.status(400).json({ error: "Organization name is required" });
      }

      const existingOrganization = await storage.getOrganizationByName(name);
      if (existingOrganization) {
        return res.json(existingOrganization);
      }

      const org = await storage.createOrganization({ ...validated, name });
      res.json(org);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Create organization error:', error);
      res.status(500).json({ error: "Failed to create organization" });
    }
  });

  // ===== Report Routes =====

  // Create salary report
  app.post("/api/reports", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const validated = insertReportSchema.parse(req.body);
      const report = await storage.createReport({
        ...validated,
        userId,
      });

      // Get updated stats and broadcast to all clients
      const stats = await storage.getOrganizationStats(validated.organizationId);
      broadcastUpdate({
        type: 'report_created',
        organizationId: validated.organizationId,
        report,
        stats,
      });

      res.json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Create report error:', error);
      res.status(500).json({ error: "Failed to create report" });
    }
  });

  // Get reports for an organization
  app.get("/api/reports/organization/:organizationId", async (req, res) => {
    try {
      const { organizationId } = req.params;
      const reports = await storage.getReportsByOrganization(organizationId);
      res.json(reports);
    } catch (error) {
      console.error('Get reports error:', error);
      res.status(500).json({ error: "Failed to get reports" });
    }
  });

  // Get organization stats
  app.get("/api/reports/stats/:organizationId", async (req, res) => {
    try {
      const { organizationId } = req.params;
      const stats = await storage.getOrganizationStats(organizationId);
      res.json(stats);
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  // ===== Chat Routes =====

  // Get messages for an organization
  app.get("/api/messages/:organizationId", async (req, res) => {
    try {
      const { organizationId } = req.params;
      const messages = await storage.getMessagesByOrganization(organizationId);
      res.json(messages.reverse()); // Return in chronological order
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: "Failed to get messages" });
    }
  });

  // ===== Follow Routes =====

  // Follow organization
  app.post("/api/follows/:organizationId", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { organizationId } = req.params;
      const follow = await storage.followOrganization(userId, organizationId);
      res.json(follow);
    } catch (error) {
      console.error('Follow error:', error);
      res.status(500).json({ error: "Failed to follow organization" });
    }
  });

  // Unfollow organization
  app.delete("/api/follows/:organizationId", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { organizationId } = req.params;
      await storage.unfollowOrganization(userId, organizationId);
      res.json({ success: true });
    } catch (error) {
      console.error('Unfollow error:', error);
      res.status(500).json({ error: "Failed to unfollow organization" });
    }
  });

  // Get user's followed organizations
  app.get("/api/follows", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const follows = await storage.getUserFollows(userId);
      res.json(follows);
    } catch (error) {
      console.error('Get follows error:', error);
      res.status(500).json({ error: "Failed to get follows" });
    }
  });

  // ===== Notification Routes =====

  // Get user notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: "Failed to get notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:notificationId/read", async (req, res) => {
    try {
      const { notificationId } = req.params;
      await storage.markNotificationRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Mark all notifications as read
  app.patch("/api/notifications/read-all", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      await storage.markAllNotificationsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Mark all notifications read error:', error);
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });

  return httpServer;
}
