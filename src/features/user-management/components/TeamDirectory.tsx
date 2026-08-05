import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";

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
};

export function TeamDirectory({ users, buildingOptions }: TeamDirectoryProps) {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title={USER_MANAGEMENT_CLIENT.LIST_TITLE}
        description={USER_MANAGEMENT_CLIENT.LIST_DESC}
        action={<AddTeamMemberDialog buildingOptions={buildingOptions} />}
      />

      <TeamDirectoryList users={users} buildingOptions={buildingOptions} />
    </div>
  );
}
