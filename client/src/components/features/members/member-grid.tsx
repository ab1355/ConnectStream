import { MemberCard } from "./member-card";

// Sample data - this would typically come from an API
const members = [
  {
    username: "johndoe",
    displayName: "John Doe",
    role: "admin",
    status: "active",
    points: 1250,
    avatarUrl: "https://picsum.photos/seed/user1/200"
  },
  {
    username: "janedoe",
    displayName: "Jane Doe",
    role: "moderator",
    status: "active",
    points: 850,
    avatarUrl: "https://picsum.photos/seed/user2/200"
  },
  {
    username: "bobsmith",
    displayName: "Bob Smith",
    role: "member",
    status: "active",
    points: 450,
    avatarUrl: "https://picsum.photos/seed/user3/200"
  }
];

export function MemberGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member, index) => (
        <MemberCard key={index} {...member} />
      ))}
    </div>
  );
}
