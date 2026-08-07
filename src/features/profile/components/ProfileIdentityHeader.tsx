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
    <section className="border-b border-border px-4 py-4 sm:px-5" aria-label="Profile identity">
      <div className="flex min-w-0 items-center gap-3.5">
        <Avatar className="size-14 shrink-0 border border-border shadow-sm sm:size-16">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
          <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 text-start">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold sm:text-lg">{name}</h2>
            <Badge className="font-mono text-[0.625rem] font-medium uppercase tracking-wide" variant="secondary">
              {roleLabel}
            </Badge>
          </div>
          <p className="mt-1 truncate font-mono text-[0.6875rem] text-muted-foreground" title={email}>
            {email}
          </p>
        </div>
      </div>
    </section>
  );
}
