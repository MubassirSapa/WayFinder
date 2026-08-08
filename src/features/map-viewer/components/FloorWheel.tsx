"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Matches the row height baked into the inline pixel math below (drag clamp,
// selection-band position, stack height) - keep these in sync if it changes.
const ROW_HEIGHT = 40;
// A drag past this many pixels counts as an intentional swipe to the next/
// previous item, mirroring MapViewerSidebar's own SHEET_DRAG_THRESHOLD.
const DRAG_COMMIT_THRESHOLD = 28;
// How long the "slide fully into place" animation takes before the item set
// actually swaps - the setTimeout below is tied to this same constant so the
// visual slide and the data swap always finish at the same moment.
const SLIDE_DURATION_MS = 200;

export interface FloorWheelItem {
  // Route mode only: which color the floor number itself renders in -
  // "start" (green) is the route's first floor, "destination" (red) is its
  // last, "stop" (blue) is any floor in between. Left undefined outside of
  // route mode (plain floor browsing renders in the normal text color).
  colorVariant?: "destination" | "start" | "stop" | null;
  key: string;
  label: string;
}

interface FloorWheelProps {
  activeIndex: number;
  ariaLabel: string;
  items: FloorWheelItem[];
  onChange: (index: number) => void;
}

// A vertical 3-row picker (previous item faded above, current item bold and
// centered in a stationary selection band, next item faded below) - the same
// idea as a native iOS/calendar duration wheel, just capped to 3 visible rows
// since floor lists are short. Shared by RouteFloorSelect and FloorNavigator
// so the drag/tap mechanics and visual language only exist in one place.
//
// Touch (phone) drives it by dragging or tapping a visible neighbor row - a
// mouse user has no equivalent gesture, so desktop additionally gets a plain
// up/down arrow pair above and below the wheel; those arrows are hidden
// below the md breakpoint since the drag/tap affordance already covers it.
export function FloorWheel({
  activeIndex,
  ariaLabel,
  items,
  onChange,
}: FloorWheelProps) {
  // Renders `items` top-to-bottom in the order given - it's the caller's job
  // to decide what "up" means for their own array (FloorNavigator flips its
  // level-ascending floors so a higher floor sits above a lower one;
  // RouteFloorSelect keeps its segments in real route-traversal order, which
  // isn't guaranteed to be level-ascending - a route walking downward has
  // already-descending segments, and reversing them here would un-reverse
  // exactly that case).
  const activeItem = items[activeIndex] ?? null;
  const previousItem = items[activeIndex - 1] ?? null;
  const nextItem = items[activeIndex + 1] ?? null;

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  // True only for the single frame that swaps the item set and snaps the
  // offset back to 0 together - that frame must skip the transition, since
  // "old content fully slid to +/-ROW_HEIGHT" and "new content at 0" are the
  // same pixels; animating between them would be a pointless extra hop.
  const [suppressTransition, setSuppressTransition] = useState(false);
  const dragStartYRef = useRef<number | null>(null);
  const settleTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (settleTimeoutRef.current !== null) {
        window.clearTimeout(settleTimeoutRef.current);
      }
    };
  }, []);

  // Runs the frame after suppressTransition is set, so the transition-free
  // swap has actually painted before transitions turn back on for the next
  // drag/tap.
  useEffect(() => {
    if (!suppressTransition) {
      return;
    }
    const frame = requestAnimationFrame(() => setSuppressTransition(false));
    return () => cancelAnimationFrame(frame);
  }, [suppressTransition]);

  if (!activeItem) {
    return null;
  }

  // Slides the still-current item set the rest of the way to the committed
  // edge first (animated), then swaps to the new active index and resets the
  // offset in one transition-free frame. Calling onChange immediately
  // instead - resetting the offset in the same update that swaps the data -
  // is what caused the old jump-cut: the row content would flip to the new
  // floor mid-slide instead of after it finished.
  const commitChange = (direction: "next" | "previous") => {
    if (settleTimeoutRef.current !== null) {
      window.clearTimeout(settleTimeoutRef.current);
    }

    const targetIndex = direction === "next" ? activeIndex + 1 : activeIndex - 1;
    setDragOffset(direction === "next" ? -ROW_HEIGHT : ROW_HEIGHT);

    settleTimeoutRef.current = window.setTimeout(() => {
      settleTimeoutRef.current = null;
      setSuppressTransition(true);
      onChange(targetIndex);
      setDragOffset(0);
    }, SLIDE_DURATION_MS);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStartYRef.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartYRef.current === null) {
      return;
    }

    const delta = event.clientY - dragStartYRef.current;
    // Dragging down reveals the previous item (clamped to one row); up
    // reveals the next. Clamped to 0 on whichever side has nothing to land
    // on, so the wheel can't be dragged past the first/last item.
    const max = previousItem ? ROW_HEIGHT : 0;
    const min = nextItem ? -ROW_HEIGHT : 0;
    setDragOffset(Math.min(max, Math.max(min, delta)));
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragStartYRef.current = null;
    setIsDragging(false);

    if (dragOffset <= -DRAG_COMMIT_THRESHOLD && nextItem) {
      commitChange("next");
    } else if (dragOffset >= DRAG_COMMIT_THRESHOLD && previousItem) {
      commitChange("previous");
    } else {
      setDragOffset(0);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <ArrowButton
        direction="previous"
        disabled={!previousItem}
        label={previousItem?.label}
        onClick={() => commitChange("previous")}
      />

      <div
        aria-label={ariaLabel}
        className="flex w-14 items-stretch gap-1 rounded-xl border border-border bg-card/95 p-1 shadow-lg backdrop-blur-xl"
        role="group"
      >
        <div className="flex min-w-0 flex-1 items-center">
          <div
            className="relative min-w-0 flex-1 touch-none select-none overflow-hidden"
            onPointerCancel={endDrag}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            style={{ height: ROW_HEIGHT * 3 }}
          >
            {/* Stationary selection band the rows scroll behind - same idea
                as a native picker wheel's fixed center window. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 rounded-lg bg-muted/70"
              style={{ height: ROW_HEIGHT, top: ROW_HEIGHT }}
            />

            <div
              style={{
                transform: `translateY(${dragOffset}px)`,
                transition:
                  !isDragging && !suppressTransition ? `transform ${SLIDE_DURATION_MS}ms ease-out` : "none",
              }}
            >
              <FloorWheelRow
                height={ROW_HEIGHT}
                item={previousItem}
                onSelect={previousItem ? () => commitChange("previous") : undefined}
                variant="faded"
              />
              <FloorWheelRow height={ROW_HEIGHT} item={activeItem} variant="active" />
              <FloorWheelRow
                height={ROW_HEIGHT}
                item={nextItem}
                onSelect={nextItem ? () => commitChange("next") : undefined}
                variant="faded"
              />
            </div>
          </div>
        </div>

        <span aria-live="polite" className="sr-only" role="status">
          {activeItem.label}
        </span>
      </div>

      <ArrowButton
        direction="next"
        disabled={!nextItem}
        label={nextItem?.label}
        onClick={() => commitChange("next")}
      />
    </div>
  );
}

interface ArrowButtonProps {
  direction: "next" | "previous";
  disabled: boolean;
  label: string | undefined;
  onClick: () => void;
}

// Mouse-only affordance - hidden below md, since phones already have the
// drag/tap gesture on the wheel itself.
function ArrowButton({ direction, disabled, label, onClick }: ArrowButtonProps) {
  const Icon = direction === "previous" ? ArrowUp : ArrowDown;

  return (
    <Button
      aria-label={label ? `Go to ${label}` : "No more floors"}
      className="hidden size-7 shrink-0 rounded-full border-border bg-card/95 text-muted-foreground shadow-lg backdrop-blur-xl hover:bg-muted hover:text-foreground md:flex"
      disabled={disabled}
      onClick={onClick}
      size="icon"
      type="button"
      variant="outline"
    >
      <Icon className="size-3.5" aria-hidden />
    </Button>
  );
}

interface FloorWheelRowProps {
  height: number;
  item: FloorWheelItem | null;
  onSelect?: () => void;
  variant: "active" | "faded";
}

function FloorWheelRow({ height, item, onSelect, variant }: FloorWheelRowProps) {
  if (!item) {
    return <div style={{ height }} />;
  }

  const isActive = variant === "active";
  const colorClassName = item.colorVariant === "start"
    ? "text-(--map-viewer-route-origin)"
    : item.colorVariant === "destination"
      ? "text-(--map-viewer-route-floor-destination)"
      : item.colorVariant === "stop"
        ? "text-(--map-viewer-route-floor-stop)"
        : null;

  return (
    <Button
      className={cn(
        "h-auto w-full min-w-0 justify-center gap-1.5 rounded-none border-none bg-transparent px-2 text-center hover:bg-transparent dark:hover:bg-transparent",
        isActive
          ? "cursor-default text-sm font-semibold text-foreground sm:text-base"
          : "text-xs text-muted-foreground opacity-50 transition-opacity hover:opacity-80",
        colorClassName,
      )}
      disabled={isActive}
      onClick={onSelect}
      style={{ height }}
      type="button"
      variant="ghost"
    >
      <span className="truncate">{item.label}</span>
    </Button>
  );
}
