import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";

import { formatFloorLabel } from "../lib/mapViewerViewport";
import type { ViewerFloor, ViewerMapObject } from "../types/map-viewer.types";

interface MapViewerSidebarProps {
  activeFloor: ViewerFloor | null;
  activeFloorId: string | null;
  floors: ViewerFloor[];
  search: string;
  searchableObjects: ViewerMapObject[];
  selectedObject: ViewerMapObject | null;
  selectedObjectId: string | null;
  onFocusObject: (object: ViewerMapObject) => void;
  onFloorChange: () => void;
  onSearchChange: (value: string) => void;
}

export function MapViewerSidebar({
  activeFloor,
  activeFloorId,
  floors,
  search,
  searchableObjects,
  selectedObject,
  selectedObjectId,
  onFocusObject,
  onFloorChange,
  onSearchChange,
}: MapViewerSidebarProps) {
  return (
    <aside className="order-2 overflow-hidden border-x-0 border-b-0 border-t border-border bg-card/80 shadow-sm backdrop-blur-md sm:rounded-3xl sm:border lg:order-none lg:rounded-4xl">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold">Browse the map</h2>
      </div>

      <div className="space-y-5 p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-10 rounded-2xl border-border bg-background pl-10"
            disabled={!activeFloor}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search rooms, exits, POIs..."
            type="text"
            value={search}
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Floors</h3>
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
                  onClick={onFloorChange}
                >
                  <div>
                    <p className="text-sm font-semibold">{floor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFloorLabel(floor)}
                    </p>
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
          <ScrollArea className="h-[220px] pr-3 sm:h-[280px]">
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
                    onClick={() => onFocusObject(object)}
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
  );
}
