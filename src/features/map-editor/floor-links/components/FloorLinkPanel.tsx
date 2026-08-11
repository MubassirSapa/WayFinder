'use client';

import { useState } from "react";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deletePathEdge } from "@/features/map-editor/core/actions/server/edge-actions";
import { assertSuccess } from "@/lib/responses";
import type { EditorMapNode } from "@/features/map-editor/core/types/map.types";
import { useAppStore } from "@/store";

import {
  buildCrossFloorEdge,
  CROSS_FLOOR_DEFAULT_DISTANCE_METERS,
  CROSS_FLOOR_TYPE_BY_NODE_ROLE,
  isConnectorNodeRole,
  type CrossFloorEdgeType,
} from "../lib/crossFloorConnect";
import { useCrossFloorLinks } from "../hooks/useCrossFloorLinks";
import { useLinkableNodes } from "../hooks/useLinkableNodes";

const LINK_TYPE_LABELS: Record<CrossFloorEdgeType, string> = {
  elevator: "Elevator",
  escalator: "Escalator",
  stairs: "Stairs",
};

interface FloorLinkPanelProps {
  node: EditorMapNode;
}

export function FloorLinkPanel({ node }: FloorLinkPanelProps) {
  const floor = useAppStore((state) => state.floor);
  const edgesRecord = useAppStore((state) => state.edges);
  const edges = Object.values(edgesRecord);
  const addEdge = useAppStore((state) => state.addEdge);

  const [targetNodeId, setTargetNodeId] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const { nodes: linkableNodes, isLoading } = useLinkableNodes(
    floor?.buildingId ?? null,
    floor?.id ?? null,
  );
  const { links: existingLinks, removeLinkLocally } = useCrossFloorLinks(floor?.buildingId ?? null);

  // The node's own role already determines which connector type a link from
  // it can be — a stairs_entry node can only ever be linked via "stairs" —
  // so there's nothing to ask the admin to choose here.
  if (!floor || !isConnectorNodeRole(node.role)) {
    return null;
  }

  const linkType = CROSS_FLOOR_TYPE_BY_NODE_ROLE[node.role];
  const linksForNode = existingLinks.filter((link) => link.fromNodeId === node.id || link.toNodeId === node.id);
  const linkableNodesByFloor = linkableNodes
    .filter((candidate) => candidate.role === node.role)
    .reduce<Record<string, typeof linkableNodes>>((groups, candidate) => {
      (groups[candidate.floorName] ??= []).push(candidate);
      return groups;
    }, {});

  const handleCreateLink = () => {
    if (!targetNodeId) {
      return;
    }

    const targetNode = linkableNodes.find((candidate) => candidate.id === targetNodeId);
    if (!targetNode) {
      return;
    }

    const edge = buildCrossFloorEdge(node, targetNode, edges, linkType);
    if (edge) {
      addEdge(edge);
      setTargetNodeId("");
      toast.success("Link added. Save changes to keep it.");
    } else {
      toast.error("That link already exists.");
    }
  };

  const handleDeleteLink = async (edgeId: string) => {
    setIsDeleting(edgeId);
    try {
      assertSuccess(await deletePathEdge(edgeId));
      removeLinkLocally(edgeId);
      toast.success("Link removed.");
    } catch (error) {
      console.error("Error deleting floor link:", error);
      toast.error("Failed to remove the link.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-editor-border bg-editor-background/60 p-4">
      <div className="text-editor-foreground">
        <h3 className="text-xs font-bold uppercase tracking-[0.22em]">
          {LINK_TYPE_LABELS[linkType]} Link
        </h3>
        <p className="text-[10px] text-editor-subtle-foreground mt-0.5">
          Connect to another floor · you&apos;re on <span className="text-editor-muted-foreground">{floor.name}</span>
        </p>
      </div>

      <div className="space-y-2">
        <Select
          disabled={isLoading || linkableNodes.length === 0}
          onValueChange={(value) => setTargetNodeId(value ?? "")}
          value={targetNodeId || null}
        >
          <SelectTrigger className="w-full bg-editor-surface border-editor-border-strong text-editor-foreground">
            <SelectValue>
              {() =>
                isLoading
                  ? "Loading nodes..."
                  : linkableNodes.length === 0
                    ? `No ${LINK_TYPE_LABELS[linkType].toLowerCase()} nodes on other floors yet`
                    : linkableNodes.find((candidate) => candidate.id === targetNodeId)?.label ||
                      `Select a ${LINK_TYPE_LABELS[linkType].toLowerCase()} node`
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-editor-surface border-editor-border text-editor-foreground">
            {Object.entries(linkableNodesByFloor).map(([floorName, nodes]) => (
              <SelectGroup key={floorName}>
                <SelectLabel
                  className="font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--editor-selection)' }}
                >
                  {floorName}
                </SelectLabel>
                {nodes.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id} className="focus:bg-editor-hover">
                    {candidate.label || candidate.role}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>

        <Button
          className="w-full"
          disabled={!targetNodeId}
          onClick={handleCreateLink}
          size="sm"
          variant="default"
        >
          {`Create ${LINK_TYPE_LABELS[linkType].toLowerCase()} link (${CROSS_FLOOR_DEFAULT_DISTANCE_METERS[linkType]}m default)`}
        </Button>
      </div>

      {linksForNode.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-editor-subtle-foreground">Already linked</p>
          {linksForNode.map((link) => {
            const isFromThisNode = link.fromNodeId === node.id;
            const targetFloorName = isFromThisNode ? link.toFloorName : link.fromFloorName;
            const targetNodeLabel = isFromThisNode ? link.toNodeLabel : link.fromNodeLabel;

            return (
              <div
                key={link.id}
                className="rounded-lg border border-editor-border px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-medium text-editor-foreground">{targetNodeLabel}</p>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[10px] text-editor-subtle-foreground">{link.distanceMeters}m</span>
                    <Button
                      aria-label="Remove link"
                      disabled={isDeleting === link.id}
                      onClick={() => handleDeleteLink(link.id)}
                      size="icon-xs"
                      variant="destructive"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-editor-subtle-foreground">
                  {targetFloorName} - {targetNodeLabel}
                </p>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
