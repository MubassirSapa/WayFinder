import { Building2Icon } from "lucide-react";

import { ROLE_LABELS } from "@/collections/constants/roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";
import type { ManagedRole, OrgBuildingOption, OrgUserDetail } from "../types/user-management.types";
import { BuildingsAssignmentPopover } from "./BuildingsAssignmentPopover";

type UserAccessSectionProps = {
  user: OrgUserDetail;
  buildingOptions: OrgBuildingOption[];
  onRoleChange: (role: ManagedRole) => void;
  isUpdatingRole: boolean;
};

export function UserAccessSection({ user, buildingOptions, onRoleChange, isUpdatingRole }: UserAccessSectionProps) {
  return (
    <section>
      <h3 className="flex items-center gap-1.5 border-b border-border pb-2 font-heading text-sm font-semibold">
        {USER_MANAGEMENT_CLIENT.EDIT_ACCESS}
      </h3>
      <div className="mt-4 max-w-sm space-y-4">
        <Select value={user.role} onValueChange={(value) => onRoleChange(value as ManagedRole)}>
          <SelectTrigger className="h-10 w-full" disabled={isUpdatingRole}>
            <SelectValue>{() => ROLE_LABELS[user.role]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manager">{USER_MANAGEMENT_CLIENT.ROLE_MANAGER}</SelectItem>
            <SelectItem value="member">{USER_MANAGEMENT_CLIENT.ROLE_MEMBER}</SelectItem>
          </SelectContent>
        </Select>

        {user.role === "member" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 truncate">
              {user.buildingNames.length > 0
                ? user.buildingNames.join(", ")
                : USER_MANAGEMENT_CLIENT.NO_BUILDINGS}
            </span>
          </div>
        ) : null}

        {user.role === "member" ? (
          <BuildingsAssignmentPopover
            userId={user.id}
            buildingOptions={buildingOptions}
            selectedBuildingIds={user.buildingIds}
          />
        ) : null}
      </div>
    </section>
  );
}
