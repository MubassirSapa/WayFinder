'use client';

import React, { type ReactNode } from 'react';
import type { FloorEditorData } from "../types/editor.types";
import { EDITOR_UI_TEXT } from '../../constants/editorUi.constants';
import { useFloorEditorData } from '../hooks/useFloorEditorData';
import { EditorToolbar } from './EditorToolbar';
import { ObjectToolbox } from './ObjectToolbox';
import { MapCanvas } from './MapCanvas';
import { InspectorPanel } from './InspectorPanel';
import { EditorDesktopOnlyNotice } from './EditorDesktopOnlyNotice';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Loader2, AlertCircle } from 'lucide-react';

interface MapEditorShellProps {
  initialData: FloorEditorData | null;
  initialError: string | null;
  leftSidebarFooter?: ReactNode;
}

export function MapEditorShell({
  initialData,
  initialError,
  leftSidebarFooter,
}: MapEditorShellProps) {
  const { isLoading, error } = useFloorEditorData(initialData, initialError);

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
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-editor-surface hover:bg-editor-hover text-editor-foreground text-xs font-semibold rounded-lg border border-editor-border-strong transition-colors"
        >
          {EDITOR_UI_TEXT.errors.reload}
        </button>
      </div>
    );
  }

  return (
    <>
      <EditorDesktopOnlyNotice />
      <TooltipProvider>
        <div className="hidden h-screen w-screen flex-col overflow-hidden bg-editor-background font-sans text-editor-foreground lg:flex">
          {/* Top toolbar */}
          <EditorToolbar />

          {/* Workspace body */}
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Left Toolbox */}
            <ObjectToolbox footer={leftSidebarFooter} />

            {/* Map canvas */}
            <div className="flex-1 h-full min-w-0">
              <MapCanvas />
            </div>

            {/* Right Inspector */}
            <InspectorPanel />
          </div>
        </div>
      </TooltipProvider>
    </>
  );
}
