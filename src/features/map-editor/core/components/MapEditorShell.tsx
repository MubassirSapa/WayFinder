'use client';

import React, { type ReactNode } from 'react';
import type { FloorEditorData } from "../actions/floorEditorActions";
import { useFloorEditorData } from '../hooks/useFloorEditorData';
import { EditorToolbar } from './EditorToolbar';
import { ObjectToolbox } from './ObjectToolbox';
import { MapCanvas } from './MapCanvas';
import { InspectorPanel } from './InspectorPanel';
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
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-400 gap-4">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 animate-pulse">
          Loading Floor Map Editor...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-400 gap-4 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-base font-bold text-zinc-100">Editor Load Error</h2>
        <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-lg border border-zinc-700 transition-colors"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
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
  );
}
