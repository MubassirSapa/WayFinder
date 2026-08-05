import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type ProfileIdentityHeaderProps = {
  avatarUrl: string | null;
  email: string;
  initial: string;
  name: string;
  roleLabel: string;
};

export function ProfileIdentityHeader({
  avatarUrl,
  email,
  initial,
  name,
  roleLabel,
}: ProfileIdentityHeaderProps) {
  return (
    <section className="text-center" aria-label="Profile identity">
      <div className="h-24 bg-primary sm:h-28" aria-hidden="true" />
      <div className="-mt-12 px-5 pb-6 sm:-mt-14 sm:px-8">
        <Avatar className="mx-auto size-24 border-4 border-card shadow-sm sm:size-28">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
          <AvatarFallback className="bg-muted text-2xl font-semibold text-foreground">
            {initial}
          </AvatarFallback>
        </Avatar>
        <h2 className="mt-3 truncate font-heading text-xl font-semibold sm:text-2xl">{name}</h2>
        <p className="mt-1 truncate text-sm text-muted-foreground">{email}</p>
        <Badge variant="secondary" className="mt-3">
          {roleLabel}
        </Badge>
      </div>
    </section>
  );
}
