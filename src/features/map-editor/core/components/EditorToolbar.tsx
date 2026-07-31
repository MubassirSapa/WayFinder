'use client';

import Link from 'next/link';
import { useAppStore } from "@/store";
import { EDITOR_UI_TEXT } from '../../constants/editorUi.constants';
import { useSaveEditorChanges } from '../hooks/useSaveEditorChanges';
import {
  ArrowLeft,
  MousePointer,
  MapPin,
  Waypoints,
  Save,
  Loader2,
  AlertTriangle,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/shared/theme/ModeToggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { EditorMode } from '../types/editor.types';

export function EditorToolbar() {
  const { mode, floor, isDirty, isSaving, setMode } = useAppStore();
  const { saveChanges } = useSaveEditorChanges();

  const modes: { id: EditorMode; label: string; hint: string; icon: LucideIcon }[] = [
    { id: 'select', label: EDITOR_UI_TEXT.toolbar.modes.select, hint: EDITOR_UI_TEXT.toolbar.modeHints.select, icon: MousePointer },
    { id: 'node', label: EDITOR_UI_TEXT.toolbar.modes.node, hint: EDITOR_UI_TEXT.toolbar.modeHints.node, icon: MapPin },
    { id: 'path', label: EDITOR_UI_TEXT.toolbar.modes.path, hint: EDITOR_UI_TEXT.toolbar.modeHints.path, icon: Waypoints },
  ];

  return (
    <div className="h-16 w-full border-b border-editor-border bg-editor-panel px-6 flex items-center justify-between z-10 select-none">
      {/* Floor Info */}
      <div className="flex items-center gap-3">
        <Button
          nativeButton={false}
          render={<Link href="/dashboard" />}
          size="sm"
          variant="outline"
          className="h-9 gap-2 border-editor-border-strong bg-editor-background px-3 text-editor-foreground hover:bg-editor-surface hover:text-editor-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{EDITOR_UI_TEXT.toolbar.backToDashboard}</span>
        </Button>
        <div className="bg-editor-surface p-2 rounded-lg border border-editor-border-strong">
          <LayoutGrid className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-editor-foreground">{floor?.name || EDITOR_UI_TEXT.loading.floor}</h1>
          <p className="text-[10px] text-editor-muted-foreground mt-0.5">
            {EDITOR_UI_TEXT.toolbar.floorPrefix} {floor?.level ?? 0} &bull; {floor?.width}x{floor?.height} px
          </p>
        </div>
      </div>

      {/* Editor Modes Toggles */}
      <div className="flex items-center bg-editor-background p-1 rounded-lg border border-editor-border gap-1">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;

          return (
            <Tooltip key={m.id}>
              <TooltipTrigger
                render={
                  <Button
                    onClick={() => setMode(m.id)}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 px-3 rounded-md text-xs font-semibold gap-2 transition-all",
                      isActive
                        ? "bg-editor-surface text-editor-foreground hover:bg-editor-surface hover:text-editor-foreground shadow"
                        : "text-editor-muted-foreground hover:text-editor-foreground hover:bg-editor-panel/50"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{m.label}</span>
                  </Button>
                }
              />
              <TooltipContent>{m.hint}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <ModeToggle />
        {/* Dirty indicator */}
        {isDirty && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/10 border border-warning/25 text-warning">
            <AlertTriangle className="h-3 w-3 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-wider">{EDITOR_UI_TEXT.toolbar.unsaved}</span>
          </div>
        )}

        <Button
          onClick={saveChanges}
          disabled={isSaving || !isDirty}
          size="sm"
          className={cn(
            "h-9 px-4 text-xs font-semibold gap-2 shadow",
            isDirty && !isSaving
              ? "bg-primary hover:bg-primary text-primary-foreground"
              : "bg-editor-surface border border-editor-border-strong text-editor-muted-foreground hover:bg-editor-surface cursor-not-allowed"
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{EDITOR_UI_TEXT.toolbar.saving}</span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span>{EDITOR_UI_TEXT.toolbar.save}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
