import { UsersIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";

import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";
import { CreateUserSheet } from "./CreateUserSheet";
import { UserRow } from "./UserRow";
import type { OrgBuildingOption, OrgUserListItem } from "../types/user-management.types";

type UserManagementTableProps = {
  users: OrgUserListItem[];
  buildingOptions: OrgBuildingOption[];
};

export function UserManagementTable({ users, buildingOptions }: UserManagementTableProps) {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title={USER_MANAGEMENT_CLIENT.LIST_TITLE}
        description={USER_MANAGEMENT_CLIENT.LIST_DESC}
        action={<CreateUserSheet buildingOptions={buildingOptions} />}
      />

      {users.length === 0 ? (
        <Card className="items-center px-6 py-14 text-center">
          <UsersIcon className="size-8 text-muted-foreground" />
        </Card>
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{USER_MANAGEMENT_CLIENT.COLUMN_NAME}</TableHead>
                <TableHead>{USER_MANAGEMENT_CLIENT.COLUMN_ROLE}</TableHead>
                <TableHead>{USER_MANAGEMENT_CLIENT.COLUMN_BUILDINGS}</TableHead>
                <TableHead className="text-end">{USER_MANAGEMENT_CLIENT.COLUMN_ACTIONS}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <UserRow key={user.id} user={user} buildingOptions={buildingOptions} />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
