import { ThreadCard } from "./thread-card";

// Sample data - this would typically come from an API
const threads = [
  {
    id: 1,
    title: "Welcome to the Community!",
    author: "admin",
    category: "announcements",
    replies: 24,
    views: 1250,
    lastActivity: "2024-03-01T10:00:00Z"
  },
  {
    id: 2,
    title: "Getting Started Guide",
    author: "moderator",
    category: "help",
    replies: 15,
    views: 890,
    lastActivity: "2024-03-01T09:30:00Z"
  },
  {
    id: 3,
    title: "Feature Request: Dark Mode",
    author: "user123",
    category: "feedback",
    replies: 32,
    views: 567,
    lastActivity: "2024-03-01T08:45:00Z"
  }
];

export function ThreadList() {
  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <ThreadCard key={thread.id} thread={thread} />
      ))}
    </div>
  );
}
