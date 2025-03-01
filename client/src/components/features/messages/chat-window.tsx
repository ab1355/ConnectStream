import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Message, insertMessageSchema } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  selectedUser: User;
}

export function ChatWindow({ selectedUser }: ChatWindowProps) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const form = useForm({
    resolver: zodResolver(insertMessageSchema),
    defaultValues: {
      content: "",
      receiverId: selectedUser.id
    }
  });

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedUser.id],
  });

  useEffect(() => {
    // Connect to WebSocket
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?userId=${user?.id}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // Update messages in the UI
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [user?.id]);

  const sendMessage = useMutation({
    mutationFn: async (data: { content: string; receiverId: number }) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return res.json();
    },
    onSuccess: (newMessage) => {
      // Send the message through WebSocket
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(newMessage));
      }
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      form.reset();
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-[600px] rounded-lg border bg-card flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">
          {selectedUser.displayName || selectedUser.username}
        </h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages?.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-[80%] rounded-lg p-3",
                message.senderId === user?.id
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {message.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form
        onSubmit={form.handleSubmit((data) => sendMessage.mutate(data))}
        className="p-4 border-t flex gap-2"
      >
        <Input
          placeholder="Type your message..."
          {...form.register("content")}
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}