'use client';

import { Lock, LockOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';

export function LockObjectsToggle() {
  const areObjectsLocked = useAppStore((state) => state.areObjectsLocked);
  const objects = useAppStore((state) => state.objects);
  const lockedObjectIds = useAppStore((state) => state.lockedObjectIds);
  const setAreObjectsLocked = useAppStore((state) => state.setAreObjectsLocked);

  // Only objects present when the lock was turned on are actually locked -
  // anything added since stays movable until the lock is re-triggered, so
  // surface that instead of implying everything is frozen.
  const hasUnlockedObjects = areObjectsLocked
    && Object.keys(objects).some((id) => !lockedObjectIds.includes(id));

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={areObjectsLocked ? 'Unlock objects' : 'Lock objects'}
            className={cn(
              'relative h-9 w-9',
              areObjectsLocked
                ? 'bg-warning/15 text-warning hover:bg-warning/25 hover:text-warning'
                : 'text-editor-muted-foreground hover:bg-editor-surface hover:text-editor-foreground',
            )}
            onClick={() => setAreObjectsLocked(!areObjectsLocked)}
            size="icon"
            type="button"
            variant="ghost"
          >
            {areObjectsLocked ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
            {hasUnlockedObjects ? (
              <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-warning ring-2 ring-editor-panel" />
            ) : null}
          </Button>
        }
      />
      <TooltipContent>
        {areObjectsLocked
          ? hasUnlockedObjects
            ? "Objects locked. Anything added since is still movable."
            : 'Objects locked'
          : 'Lock objects in place'}
      </TooltipContent>
    </Tooltip>
  );
}
