'use client';

import { useEditorStore } from "@/store";
import { useSaveEditorChanges } from '../hooks/useSaveEditorChanges';
import {
  MousePointer,
  Box,
  MapPin,
  Waypoints,
  Save,
  Loader2,
  AlertTriangle,
  FileCheck,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EditorMode } from '../types/editor.types';

export function EditorToolbar() {
  const { mode, floor, isDirty, isSaving, setMode } = useEditorStore();
  const { saveChanges } = useSaveEditorChanges();

  const modes: { id: EditorMode; label: string; icon: LucideIcon }[] = [
    { id: 'select', label: 'Select & Move', icon: MousePointer },
    { id: 'object', label: 'Place & Move Objects', icon: Box },
    { id: 'node', label: 'Add Path Nodes', icon: MapPin },
    { id: 'path', label: 'Connect Paths', icon: Waypoints },
  ];

  return (
    <div className="h-16 w-full border-b border-zinc-800 bg-zinc-900 px-6 flex items-center justify-between z-10 select-none">
      {/* Floor Info */}
      <div className="flex items-center gap-3">
        <div className="bg-zinc-800 p-2 rounded-lg border border-zinc-700">
          <FileCheck className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-zinc-100">{floor?.name || 'Loading Floor...'}</h1>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Level {floor?.level ?? 0} &bull; {floor?.width}x{floor?.height} px
          </p>
        </div>
      </div>

      {/* Editor Modes Toggles */}
      <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 gap-1">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;

          return (
            <Button
              key={m.id}
              onClick={() => setMode(m.id)}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-3 rounded-md text-xs font-semibold gap-2 transition-all",
                isActive
                  ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 shadow"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{m.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {/* Dirty indicator */}
        {isDirty && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500">
            <AlertTriangle className="h-3 w-3 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Unsaved Changes</span>
          </div>
        )}

        <Button
          onClick={saveChanges}
          disabled={isSaving || !isDirty}
          size="sm"
          className={cn(
            "h-9 px-4 text-xs font-semibold gap-2 shadow",
            isDirty && !isSaving
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-800 cursor-not-allowed"
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
