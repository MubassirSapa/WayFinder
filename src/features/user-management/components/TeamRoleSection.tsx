import { TeamMemberCard } from "./TeamMemberCard";
import type { OrgUserListItem } from "../types/user-management.types";

type TeamRoleSectionProps = {
  title: string;
  users: OrgUserListItem[];
};

export function TeamRoleSection({ title, users }: TeamRoleSectionProps) {
  if (users.length === 0) return null;

  return (
    <section>
      <h3 className="border-b border-border pb-2 font-heading text-sm font-semibold text-foreground">
        {title}
        <span className="ml-1.5 font-normal text-muted-foreground">({users.length})</span>
      </h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {users.map((user) => (
          <TeamMemberCard key={user.id} user={user} />
        ))}
      </div>
    </section>
  );
}
