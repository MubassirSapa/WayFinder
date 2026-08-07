import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import type { PendingInvitationListItem } from "@/features/invitations/types/invitation.types";

import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";
import type {
  OrgBuildingOption,
  OrgUserListItem,
} from "../types/user-management.types";
import { AddTeamMemberDialog } from "./AddTeamMemberDialog";
import { TeamDirectoryList } from "./TeamDirectoryList";

type TeamDirectoryProps = {
  users: OrgUserListItem[];
  buildingOptions: OrgBuildingOption[];
  pendingInvitations: PendingInvitationListItem[];
};

export function TeamDirectory({ users, buildingOptions, pendingInvitations }: TeamDirectoryProps) {
  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title={USER_MANAGEMENT_CLIENT.LIST_TITLE}
        description={USER_MANAGEMENT_CLIENT.LIST_DESC}
        action={<AddTeamMemberDialog buildingOptions={buildingOptions} />}
      />

      <TeamDirectoryList users={users} pendingInvitations={pendingInvitations} />
    </div>
  );
}
