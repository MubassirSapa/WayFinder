'use client';

import React from 'react';
import type { FloorEditorData } from "../types/editor.types";
import { EDITOR_UI_TEXT } from '../../constants/editorUi.constants';
import { useCanvasViewport } from '../hooks/useCanvasViewport';
import { useFloorEditorData } from '../hooks/useFloorEditorData';
import { EditorToolbar } from './EditorToolbar';
import { EditorSidePanel, type EditorSidePanelTab } from './EditorSidePanel';
import { MapCanvas } from './MapCanvas';
import { InspectorPanel } from './InspectorPanel';
import { EditorDesktopOnlyNotice } from './EditorDesktopOnlyNotice';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store';

interface MapEditorShellProps {
  initialData: FloorEditorData | null;
  initialError: string | null;
  leftPanelTabs: EditorSidePanelTab[];
}

export function MapEditorShell({
  initialData,
  initialError,
  leftPanelTabs,
}: MapEditorShellProps) {
  const { isLoading, error } = useFloorEditorData(initialData, initialError);
  const floor = useAppStore((state) => state.floor);
  const {
    changeZoom,
    consumeSuppressedClick,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isPanning,
    pan,
    resetView,
    wrapperRef,
    zoom,
  } = useCanvasViewport({
    floorHeight: floor?.height ?? 0,
    floorId: floor?.id ?? null,
    floorWidth: floor?.width ?? 0,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-editor-background text-editor-muted-foreground gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider text-editor-subtle-foreground animate-pulse">
          {EDITOR_UI_TEXT.loading.editor}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-editor-background text-editor-muted-foreground gap-4 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-base font-bold text-editor-foreground">{EDITOR_UI_TEXT.errors.title}</h2>
        <p className="text-xs text-editor-subtle-foreground max-w-sm leading-relaxed">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          type="button"
          variant="outline"
          className="mt-4 h-auto px-4 py-2 bg-editor-surface hover:bg-editor-hover text-editor-foreground text-xs font-semibold rounded-lg border-editor-border-strong"
        >
          {EDITOR_UI_TEXT.errors.reload}
        </Button>
      </div>
    );
  }

  return (
    <>
      <EditorDesktopOnlyNotice />
      <TooltipProvider>
        <div className="hidden h-screen w-screen flex-col overflow-hidden bg-editor-background font-sans text-editor-foreground lg:flex">
          {/* Top toolbar */}
          <EditorToolbar onResetView={resetView} onZoomChange={changeZoom} zoom={zoom} />

          {/* Workspace body */}
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Left Toolbox */}
            <EditorSidePanel tabs={leftPanelTabs} />

            {/* Map canvas */}
            <div className="flex-1 h-full min-w-0">
              <MapCanvas
                consumeSuppressedClick={consumeSuppressedClick}
                isPanning={isPanning}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                pan={pan}
                wrapperRef={wrapperRef}
                zoom={zoom}
              />
            </div>

            {/* Right Inspector */}
            <InspectorPanel />
          </div>
        </div>
      </TooltipProvider>
    </>
  );
}
