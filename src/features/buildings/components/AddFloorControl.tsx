"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { BUILDINGS_CLIENT } from "../constants/buildings.constants";
import { AddFloorSheet } from "./AddFloorSheet";

type AddFloorControlProps = {
  buildingId: string;
  organizationName?: string;
  className?: string;
};

export function AddFloorControl({ buildingId, organizationName, className }: AddFloorControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button size="lg" className={cn(className)} onClick={() => setIsOpen(true)}>
        <PlusIcon />
        {BUILDINGS_CLIENT.ADD_FLOOR}
      </Button>
      <AddFloorSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        buildingId={buildingId}
        organizationName={organizationName}
      />
    </>
  );
}
