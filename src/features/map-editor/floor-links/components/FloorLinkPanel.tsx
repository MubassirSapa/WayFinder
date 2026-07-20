'use client';

import { useState } from "react";

import { Waypoints } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deletePathEdge } from "@/features/map-editor/core/actions/floorEditorActions";
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
    }
  };

  const handleDeleteLink = async (edgeId: string) => {
    setIsDeleting(edgeId);
    try {
      await deletePathEdge(edgeId);
      removeLinkLocally(edgeId);
    } catch (error) {
      console.error("Error deleting floor link:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-editor-border bg-editor-background/60 p-4">
      <div className="flex items-center gap-2 text-editor-foreground">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-info/20 bg-info/10">
          <Waypoints className="h-4 w-4 text-info" />
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.22em]">
            {LINK_TYPE_LABELS[linkType]} Link
          </h3>
          <p className="text-[10px] text-editor-subtle-foreground mt-0.5">
            Connect to another floor · you&apos;re on <span className="text-editor-muted-foreground">{floor.name}</span>
          </p>
        </div>
      </div>

      {linksForNode.length > 0 ? (
        <div className="space-y-2 rounded-2xl border border-success/20 bg-success/5 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-success">Already linked</p>
          {linksForNode.map((link) => (
            <div key={link.id} className="flex items-center justify-between gap-2 text-[11px] text-editor-muted-foreground">
              <span>
                To <span className="font-semibold">{link.fromNodeId === node.id ? link.toFloorName : link.fromFloorName}</span> ({link.distanceMeters}m)
              </span>
              <Button
                disabled={isDeleting === link.id}
                onClick={() => handleDeleteLink(link.id)}
                size="xs"
                variant="ghost"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        <select
          className="w-full rounded-xl border border-editor-border bg-editor-background/50 px-3 py-2 text-[11px] text-editor-foreground"
          disabled={isLoading || linkableNodes.length === 0}
          onChange={(event) => setTargetNodeId(event.target.value)}
          value={targetNodeId}
        >
          <option value="">
            {isLoading
              ? "Loading nodes..."
              : linkableNodes.length === 0
                ? `No ${LINK_TYPE_LABELS[linkType].toLowerCase()} nodes on other floors yet`
                : `Select a ${LINK_TYPE_LABELS[linkType].toLowerCase()} node on another floor`}
          </option>
          {Object.entries(linkableNodesByFloor).map(([floorName, nodes]) => (
            <optgroup key={floorName} label={floorName}>
              {nodes.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.label || candidate.role}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <Button
          className="w-full"
          disabled={!targetNodeId}
          onClick={handleCreateLink}
          size="sm"
          variant="outline"
        >
          {`Create ${LINK_TYPE_LABELS[linkType].toLowerCase()} link (${CROSS_FLOOR_DEFAULT_DISTANCE_METERS[linkType]}m default)`}
        </Button>
      </div>
    </div>
  );
}
