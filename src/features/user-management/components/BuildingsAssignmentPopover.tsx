"use client";

import { useState, useTransition } from "react";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription, PopoverTrigger } from "@/components/ui/popover";

import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";
import { updateOrgUserBuildingsAction } from "../actions/server/update-org-user";
import type { OrgBuildingOption } from "../types/user-management.types";

type BuildingsAssignmentPopoverProps = {
  userId: string;
  buildingOptions: OrgBuildingOption[];
  selectedBuildingIds: string[];
};

export function BuildingsAssignmentPopover({
  userId,
  buildingOptions,
  selectedBuildingIds,
}: BuildingsAssignmentPopoverProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState(new Set(selectedBuildingIds));

  const toggle = (buildingId: string, checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(buildingId);
      else next.delete(buildingId);
      return next;
    });
  };

  const save = () => {
    startTransition(async () => {
      const result = await updateOrgUserBuildingsAction(userId, Array.from(selected));
      if (result?.isSuccess) setOpen(false);
    });
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSelected(new Set(selectedBuildingIds));
      }}
    >
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>
        {USER_MANAGEMENT_CLIENT.MANAGE_BUILDINGS}
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>{USER_MANAGEMENT_CLIENT.MANAGE_BUILDINGS_TITLE}</PopoverTitle>
          <PopoverDescription>{USER_MANAGEMENT_CLIENT.MANAGE_BUILDINGS_DESC}</PopoverDescription>
        </PopoverHeader>

        <div className="flex max-h-48 flex-col gap-2 overflow-y-auto">
          {buildingOptions.map((building) => (
            <label key={building.id} className="flex items-center gap-2 text-xs">
              <Checkbox
                checked={selected.has(building.id)}
                onCheckedChange={(checked) => toggle(building.id, checked === true)}
                disabled={isPending}
              />
              {building.name}
            </label>
          ))}
        </div>

        <Button size="sm" onClick={save} disabled={isPending}>
          {isPending ? <Loader2Icon className="animate-spin" /> : null}
          {USER_MANAGEMENT_CLIENT.SAVE_BUILDINGS}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
