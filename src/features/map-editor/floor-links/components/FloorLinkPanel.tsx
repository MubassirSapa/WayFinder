'use client';

import { useEffect, useState } from "react";

import { Waypoints } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deletePathEdge } from "@/features/map-editor/core/actions/floorEditorActions";
import { selectSelectedNode } from "@/features/map-editor/core/store/selectors";
import { useEditorStore } from "@/store";

import { listCrossFloorLinks } from "../actions/floorLinkActions";
import {
  buildCrossFloorEdge,
  CROSS_FLOOR_DEFAULT_DISTANCE_METERS,
  type CrossFloorEdgeType,
} from "../lib/crossFloorConnect";
import { useLinkableNodes } from "../hooks/useLinkableNodes";
import type { CrossFloorLink } from "../types/floorLink.types";

export function FloorLinkPanel() {
  const floor = useEditorStore((state) => state.floor);
  const edgesRecord = useEditorStore((state) => state.edges);
  const edges = Object.values(edgesRecord);
  const addEdge = useEditorStore((state) => state.addEdge);
  const selectedNode = useEditorStore(selectSelectedNode);

  const [targetNodeId, setTargetNodeId] = useState<string>("");
  const [linkType, setLinkType] = useState<CrossFloorEdgeType>("stairs");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [existingLinks, setExistingLinks] = useState<CrossFloorLink[]>([]);

  const { nodes: linkableNodes, isLoading } = useLinkableNodes(
    floor?.buildingId ?? null,
    floor?.id ?? null,
  );

  useEffect(() => {
    if (!floor?.buildingId) {
      return;
    }

    let cancelled = false;
    listCrossFloorLinks(floor.buildingId)
      .then((links) => {
        if (!cancelled) {
          setExistingLinks(links);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setExistingLinks([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [floor?.buildingId]);

  const isSourceEligible = selectedNode?.role === "stairs_entry" || selectedNode?.role === "elevator_entry";
  const linksForSelectedNode = selectedNode
    ? existingLinks.filter((link) => link.fromNodeId === selectedNode.id || link.toNodeId === selectedNode.id)
    : [];

  if (!floor) {
    return null;
  }

  const handleCreateLink = () => {
    if (!selectedNode || !targetNodeId) {
      return;
    }

    const targetNode = linkableNodes.find((node) => node.id === targetNodeId);
    if (!targetNode) {
      return;
    }

    const edge = buildCrossFloorEdge(selectedNode, targetNode, edges, linkType);
    if (edge) {
      addEdge(edge);
      setTargetNodeId("");
    }
  };

  const handleDeleteLink = async (edgeId: string) => {
    setIsDeleting(edgeId);
    try {
      await deletePathEdge(edgeId);
      setExistingLinks((current) => current.filter((link) => link.id !== edgeId));
    } catch (error) {
      console.error("Error deleting floor link:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const linkableNodesByFloor = linkableNodes
    .filter((node) => node.role === (linkType === "stairs" ? "stairs_entry" : "elevator_entry"))
    .reduce<Record<string, typeof linkableNodes>>((groups, node) => {
      (groups[node.floorName] ??= []).push(node);
      return groups;
    }, {});

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2 text-zinc-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10">
          <Waypoints className="h-4 w-4 text-sky-400" />
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.22em]">Floor Links</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            Connect stairs/elevators across floors · you&apos;re on <span className="text-zinc-300">{floor.name}</span>
          </p>
        </div>
      </div>

      {!isSourceEligible ? (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-900/45 p-3 text-[11px] leading-relaxed text-zinc-500">
          Click a stairs or elevator marker on the canvas (switch to Select mode first if needed) to link it to its counterpart on another floor.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] text-zinc-400">
            Linking <span className="font-semibold text-zinc-200">{selectedNode?.label || selectedNode?.role}</span> on <span className="font-semibold text-zinc-200">{floor.name}</span>
          </p>

          {linksForSelectedNode.length > 0 ? (
            <div className="space-y-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">Already linked</p>
              {linksForSelectedNode.map((link) => (
                <div key={link.id} className="flex items-center justify-between gap-2 text-[11px] text-zinc-300">
                  <span>
                    {link.type === "stairs" ? "Stairs" : "Elevator"} to <span className="font-semibold">{link.fromNodeId === selectedNode?.id ? link.toFloorName : link.fromFloorName}</span> ({link.distanceMeters}m)
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

          <div className="flex gap-2">
            {(["stairs", "elevator"] as const).map((type) => (
              <button
                key={type}
                className={
                  linkType === type
                    ? "flex-1 rounded-xl border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-[11px] font-semibold text-sky-300"
                    : "flex-1 rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-[11px] text-zinc-400 hover:bg-zinc-900"
                }
                onClick={() => setLinkType(type)}
                type="button"
              >
                {type === "stairs" ? "Stairs" : "Elevator"} ({CROSS_FLOOR_DEFAULT_DISTANCE_METERS[type]}m default)
              </button>
            ))}
          </div>

          <select
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-[11px] text-zinc-200"
            disabled={isLoading || linkableNodes.length === 0}
            onChange={(event) => setTargetNodeId(event.target.value)}
            value={targetNodeId}
          >
            <option value="">
              {isLoading
                ? "Loading nodes..."
                : linkableNodes.length === 0
                  ? `No ${linkType} nodes on other floors yet`
                  : "Select a node on another floor"}
            </option>
            {Object.entries(linkableNodesByFloor).map(([floorName, nodes]) => (
              <optgroup key={floorName} label={floorName}>
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.label || node.role}
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
            Create floor link
          </Button>
        </div>
      )}

      {existingLinks.length > 0 ? (
        <div className="space-y-2 border-t border-zinc-800 pt-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            All links in this building
          </p>
          {existingLinks.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-[11px] text-zinc-300"
            >
              <span>
                <span className="font-semibold text-zinc-200">{link.fromFloorName}</span>
                {" ↔ "}
                <span className="font-semibold text-zinc-200">{link.toFloorName}</span>
                <span className="text-zinc-500"> · {link.type} · {link.distanceMeters}m</span>
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
      ) : (
        <p className="border-t border-zinc-800 pt-3 text-[10px] text-zinc-600">
          No floor links exist in this building yet.
        </p>
      )}
    </div>
  );
}
