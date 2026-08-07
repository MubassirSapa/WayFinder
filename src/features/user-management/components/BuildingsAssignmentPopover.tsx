"use client";

import { useState, useTransition } from "react";
import { Building2Icon, Loader2Icon } from "lucide-react";

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
  compact?: boolean;
};

export function BuildingsAssignmentPopover({
  userId,
  buildingOptions,
  selectedBuildingIds,
  compact = false,
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
      <PopoverTrigger
        render={
          <Button
            variant={compact ? "ghost" : "outline"}
            size="sm"
            className={compact ? "h-11 shrink-0 px-3 text-xs" : "h-11 w-full"}
          />
        }
      >
        {compact ? <Building2Icon className="size-3.5" aria-hidden="true" /> : null}
        {compact ? USER_MANAGEMENT_CLIENT.EDIT : USER_MANAGEMENT_CLIENT.MANAGE_BUILDINGS}
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[calc(100vw-2rem)]">
        <PopoverHeader>
          <PopoverTitle>{USER_MANAGEMENT_CLIENT.MANAGE_BUILDINGS_TITLE}</PopoverTitle>
          <PopoverDescription>{USER_MANAGEMENT_CLIENT.MANAGE_BUILDINGS_DESC}</PopoverDescription>
        </PopoverHeader>

        <div className="flex max-h-48 flex-col gap-2 overflow-y-auto">
          {buildingOptions.length > 0 ? (
            buildingOptions.map((building) => (
              <label key={building.id} className="flex min-h-11 items-center gap-2 text-xs">
                <Checkbox
                  checked={selected.has(building.id)}
                  onCheckedChange={(checked) => toggle(building.id, checked === true)}
                  disabled={isPending}
                />
                {building.name}
              </label>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">
              {USER_MANAGEMENT_CLIENT.NO_BUILDINGS_AVAILABLE}
            </p>
          )}
        </div>

        <Button className="h-11 w-full" onClick={save} disabled={isPending || buildingOptions.length === 0}>
          {isPending ? <Loader2Icon className="animate-spin" /> : null}
          {USER_MANAGEMENT_CLIENT.SAVE_BUILDINGS}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
