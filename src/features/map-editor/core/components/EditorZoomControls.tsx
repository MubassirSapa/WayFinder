'use client';

import { Minus, Plus, Scan } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface EditorZoomControlsProps {
  onResetView: () => void;
  onZoomChange: (direction: 'in' | 'out') => void;
  zoom: number;
}

export function EditorZoomControls({ onResetView, onZoomChange, zoom }: EditorZoomControlsProps) {
  return (
    <div
      aria-label="Canvas zoom controls"
      className="flex items-center gap-1 rounded-lg border border-editor-border bg-editor-background p-1"
      role="group"
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              aria-label="Zoom out"
              className="h-7 w-7 text-editor-muted-foreground hover:bg-editor-surface hover:text-editor-foreground"
              onClick={() => onZoomChange('out')}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
          }
        />
        <TooltipContent>Zoom out</TooltipContent>
      </Tooltip>
      <span className="min-w-10 text-center text-[10px] font-semibold text-editor-muted-foreground">
        {Math.round(zoom * 100)}%
      </span>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              aria-label="Zoom in"
              className="h-7 w-7 text-editor-muted-foreground hover:bg-editor-surface hover:text-editor-foreground"
              onClick={() => onZoomChange('in')}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          }
        />
        <TooltipContent>Zoom in</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              aria-label="Fit floor to view"
              className="h-7 w-7 text-editor-muted-foreground hover:bg-editor-surface hover:text-editor-foreground"
              onClick={onResetView}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Scan className="h-3.5 w-3.5" />
            </Button>
          }
        />
        <TooltipContent>Fit to view</TooltipContent>
      </Tooltip>
    </div>
  );
}
