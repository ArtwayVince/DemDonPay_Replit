import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Message } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

interface WebSocketContextType {
  joinOrganization: (organizationId: string) => void;
  sendMessage: (organizationId: string, userId: string, content: string) => void;
  messages: Message[];
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const currentOrgRef = useRef<string | null>(null);

  useEffect(() => {
    // Connect to WebSocket server
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "new_message") {
          setMessages((prev) => [...prev, data.message]);
        } else if (data.type === "report_created") {
          // Invalidate queries to refresh organization stats and reports
          queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
          queryClient.invalidateQueries({ queryKey: ['/api/reports', data.organizationId] });
          
          // Update specific organization data if cached
          queryClient.setQueryData(
            ['/api/reports/stats', data.organizationId],
            data.stats
          );
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const joinOrganization = (organizationId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      currentOrgRef.current = organizationId;
      wsRef.current.send(JSON.stringify({
        type: "join",
        organizationId,
      }));
      setMessages([]); // Clear messages when joining new org
    }
  };

  const sendMessage = (organizationId: string, userId: string, content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "message",
        userId,
        organizationId,
        content,
      }));
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        joinOrganization,
        sendMessage,
        messages,
        isConnected,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
}
