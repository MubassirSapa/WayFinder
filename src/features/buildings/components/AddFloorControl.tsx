"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { BUILDINGS_CLIENT } from "../constants/buildings.constants";
import { AddFloorDialog } from "./AddFloorDialog";

type AddFloorControlProps = {
  buildingId: string;
  organizationName?: string;
  className?: string;
};

export function AddFloorControl({ buildingId, organizationName, className }: AddFloorControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button className={cn("h-11 px-5", className)} onClick={() => setIsOpen(true)}>
        <PlusIcon />
        {BUILDINGS_CLIENT.ADD_FLOOR}
      </Button>
      <AddFloorDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        buildingId={buildingId}
        organizationName={organizationName}
      />
    </>
  );
}
