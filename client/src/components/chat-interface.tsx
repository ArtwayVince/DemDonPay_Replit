import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import type { Message, User } from "@shared/schema";

interface ChatMessage extends Message {
  user?: {
    displayName: string | null;
    phoneNumber: string;
  };
}

interface ChatInterfaceProps {
  organizationId: string;
  messages: ChatMessage[];
  currentUser?: User;
  onSendMessage: (content: string) => void;
  isPending?: boolean;
}

export function ChatInterface({ 
  messages, 
  currentUser, 
  onSendMessage,
  isPending 
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !isPending) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const getInitials = (name: string | null, phone: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return phone.slice(-2);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No messages yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Be the first to start the conversation! Ask about salary status or share your experience.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = currentUser && message.userId === currentUser.id;
            const displayName = message.user?.displayName || `User ${message.user?.phoneNumber?.slice(-4)}`;
            
            return (
              <div
                key={message.id}
                className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                data-testid={`message-${message.id}`}
              >
                {!isOwn && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(message.user?.displayName || null, message.user?.phoneNumber || "XX")}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[80%]`}>
                  {!isOwn && (
                    <span className="text-xs text-muted-foreground mb-1 px-3">
                      {displayName}
                    </span>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 px-3">
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 bg-card">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Wetin dey happen?"
            className="flex-1"
            disabled={isPending || !currentUser}
            data-testid="input-chat-message"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || isPending || !currentUser}
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
