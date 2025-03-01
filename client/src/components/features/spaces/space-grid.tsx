import { SpaceCard } from "./space-card";

// Sample data - this would typically come from an API
const spaces = [
  {
    name: "Tech Innovators",
    description: "A community for technology enthusiasts and innovators to share ideas and collaborate.",
    memberCount: 1234,
    imageUrl: "https://picsum.photos/seed/space1/800/400"
  },
  {
    name: "Design Hub",
    description: "Connect with fellow designers, share work, and get feedback on your projects.",
    memberCount: 856,
    imageUrl: "https://picsum.photos/seed/space2/800/400"
  },
  {
    name: "Startup Network",
    description: "Network with entrepreneurs and discuss startup strategies and challenges.",
    memberCount: 567,
    imageUrl: "https://picsum.photos/seed/space3/800/400"
  }
];

export function SpaceGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {spaces.map((space, index) => (
        <SpaceCard key={index} {...space} />
      ))}
    </div>
  );
}
