import Image from "next/image";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import type { TopbarUser } from "../types/dashboard.types";

type UserAvatarProps = {
  user: TopbarUser;
  className?: string;
};

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={cn("overflow-hidden", className)}>
      {user.avatarUrl ? (
        <Image
          alt={`${user.name} avatar`}
          className="object-cover"
          fill
          sizes="40px"
          src={user.avatarUrl}
          unoptimized
        />
      ) : (
        <AvatarFallback>{user.initial}</AvatarFallback>
      )}
    </Avatar>
  );
}
