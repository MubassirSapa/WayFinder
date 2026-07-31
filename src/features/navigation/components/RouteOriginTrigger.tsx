"use client";

import { Button } from "@/components/ui/button";

import { useAppStore } from "@/store";

interface RouteOriginTriggerProps {
  nodeId: string | null;
  label: string;
}

export function RouteOriginTrigger({ nodeId, label }: RouteOriginTriggerProps) {
  const originNodeId = useAppStore((state) => state.originNodeId);
  const setOrigin = useAppStore((state) => state.setOrigin);
  const setDestination = useAppStore((state) => state.setDestination);

  if (!nodeId) {
    return null;
  }

  const isOrigin = originNodeId === nodeId;

  return (
    <div className="flex gap-2 pt-1">
      <Button
        onClick={() => setOrigin(isOrigin ? null : nodeId)}
        size="sm"
        variant={isOrigin ? "default" : "outline"}
      >
        {isOrigin ? "Starting here" : "Start here"}
      </Button>
      <Button
        onClick={() => setDestination(nodeId)}
        size="sm"
        variant="outline"
      >
        {`Route to ${label}`}
      </Button>
    </div>
  );
}
