import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MessageList } from "@/components/features/messages/message-list";
import { ChatWindow } from "@/components/features/messages/chat-window";
import { useState } from "react";
import type { User } from "@shared/schema";

export default function MessagesPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Messages</h1>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <MessageList onSelectUser={setSelectedUser} />
              <div className="lg:col-span-3">
                {selectedUser ? (
                  <ChatWindow selectedUser={selectedUser} />
                ) : (
                  <div className="h-[600px] rounded-lg border bg-card flex items-center justify-center text-muted-foreground">
                    Select a user to start chatting
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
