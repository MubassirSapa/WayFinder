'use client';

import Link from "next/link";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import {
  Badge,
} from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Minus,
  Move,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

import {
  getViewerEdgePalette,
  getViewerNodePalette,
  getViewerObjectPalette,
  isNodePublicMarker,
} from "../lib/mapStyles";
import type {
  MapViewerData,
  ViewerFloor,
  ViewerMapNode,
  ViewerMapObject,
  ViewerPathEdge,
} from "../types/map-viewer.types";

interface Point {
  x: number;
  y: number;
}

interface MapViewerShellProps {
  data: MapViewerData;
}

function formatFloorLabel(floor: ViewerFloor) {
  return `Level ${floor.level >= 0 ? floor.level : `B${Math.abs(floor.level)}`}`;
}

function clampZoom(value: number) {
  return Math.min(Math.max(value, 0.35), 2.8);
}

export function MapViewerShell({ data }: MapViewerShellProps) {
  const activeFloorId = data.initialFloorId;
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ height: 0, width: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const dragStateRef = useRef<{
    originPan: Point;
    pointerId: number;
    start: Point;
  } | null>(null);
  const floors = data.floors;
  const activeFloor = floors.find((floor) => floor.id === activeFloorId) ?? null;
  const objects = activeFloor ? data.objectsByFloorId[activeFloor.id] ?? [] : [];
  const nodes = activeFloor ? data.nodesByFloorId[activeFloor.id] ?? [] : [];
  const edges = activeFloor ? data.edgesByFloorId[activeFloor.id] ?? [] : [];

  const fitFloorInView = (
    floor: ViewerFloor,
    nextViewport = viewportRef.current
      ? {
          height: viewportRef.current.clientHeight,
          width: viewportRef.current.clientWidth,
        }
      : viewportSize,
  ) => {
    if (!floor || nextViewport.width === 0 || nextViewport.height === 0) {
      return;
    }

    const nextZoom = clampZoom(
      Math.min(
        (nextViewport.width - 80) / floor.width,
        (nextViewport.height - 80) / floor.height,
      ),
    );

    setZoom(nextZoom);
    setPan({
      x: (nextViewport.width - floor.width * nextZoom) / 2,
      y: (nextViewport.height - floor.height * nextZoom) / 2,
    });
  };

  useEffect(() => {
    const element = viewportRef.current;

    if (!element) {
      return;
    }

    const updateSize = () => {
      const nextViewport = {
        height: element.clientHeight,
        width: element.clientWidth,
      };

      setViewportSize(nextViewport);

      const floor = floors.find((candidate) => candidate.id === activeFloorId);
      if (floor) {
        const nextZoom = clampZoom(
          Math.min(
            (nextViewport.width - 80) / floor.width,
            (nextViewport.height - 80) / floor.height,
          ),
        );

        setZoom(nextZoom);
        setPan({
          x: (nextViewport.width - floor.width * nextZoom) / 2,
          y: (nextViewport.height - floor.height * nextZoom) / 2,
        });
      }
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [activeFloorId, floors]);

  const selectedObject = objects.find((object) => object.id === selectedObjectId) ?? null;
  const searchableObjects = objects
    .filter((object) => object.isSearchable)
    .filter((object) => {
      if (!deferredSearch.trim()) {
        return true;
      }

      const query = deferredSearch.trim().toLowerCase();
      return (
        object.name.toLowerCase().includes(query)
        || object.label.toLowerCase().includes(query)
        || object.type.toLowerCase().includes(query)
      );
    })
    .slice(0, 14);

  const focusObject = (object: ViewerMapObject) => {
    if (!activeFloor) {
      return;
    }

    setSelectedObjectId(object.id);

    const objectCenterX = object.x + object.width / 2;
    const objectCenterY = object.y + object.height / 2;

    setPan({
      x: viewportSize.width / 2 - objectCenterX * zoom,
      y: viewportSize.height / 2 - objectCenterY * zoom,
    });
  };

  const changeZoom = (direction: "in" | "out") => {
    const nextZoom = clampZoom(direction === "in" ? zoom * 1.15 : zoom / 1.15);

    if (!activeFloor) {
      setZoom(nextZoom);
      return;
    }

    const centerX = viewportSize.width / 2;
    const centerY = viewportSize.height / 2;
    const worldX = (centerX - pan.x) / zoom;
    const worldY = (centerY - pan.y) / zoom;

    setZoom(nextZoom);
    setPan({
      x: centerX - worldX * nextZoom,
      y: centerY - worldY * nextZoom,
    });
  };

  const resetView = () => {
    if (!activeFloor) {
      return;
    }

    fitFloorInView(activeFloor);
  };

  return (
    <section className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-border bg-background/92 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-[0.28em]">
                  Public Map Viewer
                </p>
              </div>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {activeFloor ? `${activeFloor.buildingId} indoor map` : "Published maps"}
              </h1>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <Badge variant="outline" className="border-border bg-card/70 text-muted-foreground">
                {floors.length} floor{floors.length === 1 ? "" : "s"}
              </Badge>
              {activeFloor ? (
                <Badge variant="outline" className="border-border bg-card/70 text-muted-foreground">
                  {formatFloorLabel(activeFloor)}
                </Badge>
              ) : null}
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 p-4 sm:p-6 lg:grid lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-4xl border border-border bg-card/80 shadow-sm backdrop-blur-md">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">Browse the map</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Search a place, switch floors, and inspect published spaces.
              </p>
            </div>

            <div className="space-y-5 p-5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-10 rounded-2xl border-border bg-background pl-10"
                  disabled={!activeFloor}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search rooms, exits, POIs..."
                  type="text"
                  value={search}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Floors</h3>
                  <p className="text-xs text-muted-foreground">Published only</p>
                </div>
                <div className="grid gap-2">
                  {floors.map((floor) => {
                    const isActive = floor.id === activeFloorId;

                    return (
                      <Link
                        key={floor.id}
                        className={[
                          "block rounded-2xl border px-4 py-3 text-left transition-colors",
                          isActive
                            ? "border-primary/40 bg-primary/10 text-foreground"
                            : "border-border bg-background hover:bg-muted/60",
                        ].join(" ")}
                        href={`/map/${floor.id}`}
                        onClick={() => {
                          setSelectedObjectId(null);
                          setSearch("");
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{floor.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFloorLabel(floor)} • {floor.width} x {floor.height}
                            </p>
                          </div>
                          <Badge variant={isActive ? "secondary" : "outline"}>
                            {floor.level}
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Places</h3>
                  <p className="text-xs text-muted-foreground">
                    {searchableObjects.length} visible
                  </p>
                </div>
                <ScrollArea className="h-[280px] pr-3">
                  <div className="space-y-2">
                    {searchableObjects.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border bg-muted/35 px-4 py-6 text-sm text-muted-foreground">
                        No searchable places match this floor.
                      </div>
                    ) : (
                      searchableObjects.map((object) => (
                        <button
                          key={object.id}
                          className={[
                            "w-full rounded-2xl border px-4 py-3 text-left transition-colors",
                            selectedObjectId === object.id
                              ? "border-primary/40 bg-primary/10"
                              : "border-border bg-background hover:bg-muted/60",
                          ].join(" ")}
                          onClick={() => focusObject(object)}
                          type="button"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {object.label || object.name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {object.type} • {object.isAccessible ? "Accessible" : "Standard"}
                              </p>
                            </div>
                            {object.type === "exit" || object.type === "poi" ? (
                              <Badge variant="outline">{object.type}</Badge>
                            ) : null}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              <Separator />

              <div className="rounded-3xl border border-border bg-muted/35 p-4">
                <h3 className="text-sm font-semibold">
                  {selectedObject ? "Selection" : "Map notes"}
                </h3>
                {selectedObject ? (
                  <div className="mt-3 space-y-2 text-sm">
                    <p className="text-base font-semibold">
                      {selectedObject.label || selectedObject.name}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedObject.type} on {activeFloor?.name}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge variant="outline">
                        {selectedObject.isAccessible ? "Accessible" : "Not marked accessible"}
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(selectedObject.width)} x {Math.round(selectedObject.height)}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Drag to pan, use the controls to zoom, and click a place to inspect it.
                  </p>
                )}
              </div>
            </div>
          </aside>

          <main className="relative min-h-[680px] overflow-hidden rounded-4xl border border-border bg-card shadow-sm">
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card/85 px-4 py-3 backdrop-blur-xl">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Live floor
                </p>
                <p className="text-sm font-medium">
                  {activeFloor ? `${activeFloor.name} • ${formatFloorLabel(activeFloor)}` : "No published floor"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={() => changeZoom("out")} size="icon-sm" type="button" variant="outline">
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <Button onClick={resetView} size="sm" type="button" variant="outline">
                  <Move className="h-3.5 w-3.5" />
                  Reset
                </Button>
                <Button onClick={() => changeZoom("in")} size="icon-sm" type="button" variant="outline">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div
              className="relative h-full min-h-[680px] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_40%),linear-gradient(to_bottom,color-mix(in_oklch,var(--muted)_55%,transparent),transparent_35%)]"
              onPointerMove={(event) => {
                const dragState = dragStateRef.current;

                if (!dragState) {
                  return;
                }

                setPan({
                  x: dragState.originPan.x + event.clientX - dragState.start.x,
                  y: dragState.originPan.y + event.clientY - dragState.start.y,
                });
              }}
              onPointerUp={(event) => {
                if (dragStateRef.current?.pointerId === event.pointerId) {
                  dragStateRef.current = null;
                }
              }}
              onWheel={(event) => {
                event.preventDefault();

                const nextZoom = clampZoom(event.deltaY > 0 ? zoom / 1.08 : zoom * 1.08);
                const viewportRect = viewportRef.current?.getBoundingClientRect();

                if (!viewportRect) {
                  setZoom(nextZoom);
                  return;
                }

                const pointerX = event.clientX - viewportRect.left;
                const pointerY = event.clientY - viewportRect.top;
                const worldX = (pointerX - pan.x) / zoom;
                const worldY = (pointerY - pan.y) / zoom;

                setZoom(nextZoom);
                setPan({
                  x: pointerX - worldX * nextZoom,
                  y: pointerY - worldY * nextZoom,
                });
              }}
              ref={viewportRef}
            >
              {!activeFloor ? (
                <div className="flex h-full items-center justify-center px-6 text-center">
                  <div className="max-w-md space-y-3">
                    <h2 className="text-xl font-semibold">No published map yet</h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Publish at least one floor from the admin side to render the public map viewer.
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className="absolute left-0 top-0 will-change-transform"
                  style={{
                    height: activeFloor.height,
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: "0 0",
                    width: activeFloor.width,
                  }}
                >
                  <svg
                    className="overflow-hidden rounded-[28px] border border-border/80 bg-background shadow-[0_30px_80px_rgba(0,0,0,0.2)]"
                    height={activeFloor.height}
                    onPointerDown={(event) => {
                      dragStateRef.current = {
                        originPan: pan,
                        pointerId: event.pointerId,
                        start: {
                          x: event.clientX,
                          y: event.clientY,
                        },
                      };
                    }}
                    width={activeFloor.width}
                  >
                    <defs>
                      <pattern
                        height="24"
                        id="viewer-grid"
                        patternUnits="userSpaceOnUse"
                        width="24"
                      >
                        <path
                          d="M 24 0 L 0 0 0 24"
                          fill="none"
                          stroke="color-mix(in oklch, var(--border) 55%, transparent)"
                          strokeWidth="1"
                        />
                      </pattern>
                      <pattern
                        height="120"
                        id="viewer-grid-major"
                        patternUnits="userSpaceOnUse"
                        width="120"
                      >
                        <rect fill="url(#viewer-grid)" height="120" width="120" />
                        <path
                          d="M 120 0 L 0 0 0 120"
                          fill="none"
                          stroke="color-mix(in oklch, var(--border) 90%, transparent)"
                          strokeWidth="1.1"
                        />
                      </pattern>
                    </defs>

                    {activeFloor.backgroundImageUrl ? (
                      <image
                        href={activeFloor.backgroundImageUrl}
                        height={activeFloor.height}
                        opacity={0.08}
                        preserveAspectRatio="none"
                        width={activeFloor.width}
                      />
                    ) : null}

                    <rect
                      fill="url(#viewer-grid-major)"
                      height={activeFloor.height}
                      width={activeFloor.width}
                    />

                    <g opacity="0.92">
                      <ViewerEdges edges={edges} nodes={nodes} />
                    </g>

                    <ViewerObjects
                      objects={objects}
                      onSelect={focusObject}
                      selectedObjectId={selectedObjectId}
                    />

                    <ViewerNodes nodes={nodes} />
                  </svg>
                </div>
              )}
            </div>

            {activeFloor ? (
              <div className="absolute bottom-4 left-4 rounded-2xl border border-border bg-card/88 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur-xl">
                Zoom {(zoom * 100).toFixed(0)}% • {objects.length} objects • {nodes.filter(isNodePublicMarker).length} markers
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </section>
  );
}

function ViewerObjects({
  objects,
  onSelect,
  selectedObjectId,
}: {
  objects: ViewerMapObject[];
  onSelect: (object: ViewerMapObject) => void;
  selectedObjectId: string | null;
}) {
  return (
    <g>
      {objects.map((object) => {
        const palette = getViewerObjectPalette(object.type);
        const isSelected = selectedObjectId === object.id;
        const centerX = object.width / 2;
        const centerY = object.height / 2;
        const radius = object.type === "room" || object.type === "section" ? 14 : 8;

        return (
          <g
            key={object.id}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(object);
            }}
            transform={`translate(${object.x}, ${object.y}) rotate(${object.rotation}, ${centerX}, ${centerY})`}
          >
            <rect
              fill={palette.fill}
              height={object.height}
              rx={radius}
              stroke={isSelected ? "var(--primary)" : palette.stroke}
              strokeWidth={isSelected ? 2.4 : 1.2}
              width={object.width}
            />

            {object.type !== "wall" && object.type !== "aisle" && object.width > 52 && object.height > 26 ? (
              <text
                fill={palette.label}
                fontFamily="var(--font-sans)"
                fontSize="11"
                fontWeight="600"
                opacity={0.92}
                textAnchor="middle"
                x={centerX}
                y={centerY}
              >
                {object.label || object.name}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

function ViewerNodes({ nodes }: { nodes: ViewerMapNode[] }) {
  return (
    <g>
      {nodes.filter(isNodePublicMarker).map((node) => {
        const palette = getViewerNodePalette(node.role);

        return (
          <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
            <circle fill={palette.ring} r="14" />
            <circle
              fill={palette.fill}
              r="5.5"
              stroke="var(--background)"
              strokeWidth="2"
            />
            {node.label ? (
              <text
                fill="var(--foreground)"
                fontFamily="var(--font-sans)"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
                y="-14"
              >
                {node.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

function ViewerEdges({
  edges,
  nodes,
}: {
  edges: ViewerPathEdge[];
  nodes: ViewerMapNode[];
}) {
  const nodesById = Object.fromEntries(nodes.map((node) => [node.id, node]));

  return (
    <g>
      {edges.map((edge) => {
        const fromNode = nodesById[edge.fromNodeId];
        const toNode = nodesById[edge.toNodeId];

        if (!fromNode || !toNode) {
          return null;
        }

        const palette = getViewerEdgePalette(edge.type);

        return (
          <line
            key={edge.id}
            stroke={palette.stroke}
            strokeDasharray={edge.type === "stairs" ? "6 5" : undefined}
            strokeLinecap="round"
            strokeOpacity={0.72}
            strokeWidth={edge.type === "walkway" ? 3 : 3.6}
            x1={fromNode.x}
            x2={toNode.x}
            y1={fromNode.y}
            y2={toNode.y}
          />
        );
      })}
    </g>
  );
}
