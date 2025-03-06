import { MemberCard } from "./member-card";
import { User } from "@shared/schema";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface MemberGridProps {
  members: User[];
  isLoading: boolean;
}

export function MemberGrid({ members, isLoading }: MemberGridProps) {
  if (isLoading) {
    return <LoadingScreen variant="inline" message="Loading members..." />;
  }

  if (!members.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No members found matching your criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member) => (
        <MemberCard
          key={member.id}
          username={member.username}
          displayName={member.displayName || member.username}
          role={member.role}
          status={member.status}
          points={member.points || 0}
          avatarUrl={member.avatarUrl}
        />
      ))}
    </div>
  );
}