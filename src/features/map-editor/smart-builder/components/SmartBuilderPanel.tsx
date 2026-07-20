'use client';

import { Boxes, Link2, Route, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/store";
import { EDITOR_UI_TEXT } from "../../constants/editorUi.constants";

export function SmartBuilderPanel() {
  const {
    floor,
    isSmartBuilderEnabled,
    autoCreateNodes,
    autoConnectNodes,
    hallwayDrawingPoints,
    setSmartBuilderEnabled,
    setAutoCreateNodes,
    setAutoConnectNodes,
    generateMissingNodes,
    autoConnectExistingNodes,
    finishHallwayPath,
    clearHallwayDrawingPoints,
  } = useAppStore();

  return (
    <div className="p-4 space-y-4">
      <p className="text-[11px] leading-relaxed text-editor-subtle-foreground">
        {EDITOR_UI_TEXT.smartBuilder.summary}
      </p>

      <label className="flex items-start justify-between gap-3 rounded-2xl border border-editor-border bg-editor-panel/70 px-4 py-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-editor-foreground">{EDITOR_UI_TEXT.smartBuilder.enabledLabel}</p>
          <p className="text-[10px] leading-relaxed text-editor-subtle-foreground">{EDITOR_UI_TEXT.smartBuilder.enabledDescription}</p>
        </div>
        <Checkbox
          checked={isSmartBuilderEnabled}
          onCheckedChange={(checked) => setSmartBuilderEnabled(checked === true)}
        />
      </label>

      <div className="rounded-2xl border border-editor-border bg-editor-panel/45 p-3 space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-editor-subtle-foreground">
            {EDITOR_UI_TEXT.smartBuilder.options}
          </p>
        </div>
        <label className="flex items-start justify-between gap-3 rounded-xl border border-editor-border/80 bg-editor-background/40 px-3 py-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-editor-foreground">{EDITOR_UI_TEXT.smartBuilder.autoNodes.label}</p>
            <p className="text-[10px] text-editor-subtle-foreground">
              {EDITOR_UI_TEXT.smartBuilder.autoNodes.description}
            </p>
          </div>
          <Checkbox
            checked={autoCreateNodes}
            disabled={!isSmartBuilderEnabled}
            onCheckedChange={(checked) => setAutoCreateNodes(checked === true)}
          />
        </label>

        <label className="flex items-start justify-between gap-3 rounded-xl border border-editor-border/80 bg-editor-background/40 px-3 py-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-editor-foreground">{EDITOR_UI_TEXT.smartBuilder.autoConnect.label}</p>
            <p className="text-[10px] text-editor-subtle-foreground">
              {EDITOR_UI_TEXT.smartBuilder.autoConnect.description}
            </p>
          </div>
          <Checkbox
            checked={autoConnectNodes}
            disabled={!isSmartBuilderEnabled}
            onCheckedChange={(checked) => setAutoConnectNodes(checked === true)}
          />
        </label>
      </div>

      <Separator className="bg-editor-surface" />

      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-editor-subtle-foreground">
          {EDITOR_UI_TEXT.smartBuilder.actions}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-auto justify-start rounded-xl border-editor-border bg-editor-background/50 px-3 py-3 text-left text-editor-foreground hover:bg-editor-panel"
          disabled={!floor || !isSmartBuilderEnabled}
          onClick={generateMissingNodes}
        >
          <Boxes className="h-3 w-3" />
          {EDITOR_UI_TEXT.smartBuilder.generateNodes}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-auto justify-start rounded-xl border-editor-border bg-editor-background/50 px-3 py-3 text-left text-editor-foreground hover:bg-editor-panel"
          disabled={!floor || !isSmartBuilderEnabled}
          onClick={autoConnectExistingNodes}
        >
          <Link2 className="h-3 w-3" />
          {EDITOR_UI_TEXT.smartBuilder.autoConnect.label}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-auto justify-start rounded-xl border-editor-border bg-editor-background/50 px-3 py-3 text-left text-editor-foreground hover:bg-editor-panel"
          disabled={!floor || hallwayDrawingPoints.length < 2 || !isSmartBuilderEnabled}
          onClick={finishHallwayPath}
        >
          <Route className="h-3 w-3" />
          {EDITOR_UI_TEXT.smartBuilder.finishHallwayPath}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto justify-start rounded-xl px-3 py-3 text-left text-editor-muted-foreground hover:bg-editor-panel hover:text-editor-foreground"
          disabled={hallwayDrawingPoints.length === 0}
          onClick={clearHallwayDrawingPoints}
        >
          <Trash2 className="h-3 w-3" />
          {EDITOR_UI_TEXT.smartBuilder.clearPath}
        </Button>
      </div>

      <div className="rounded-2xl border border-editor-border bg-editor-background/70 px-3.5 py-3 text-[10px] leading-relaxed text-editor-subtle-foreground">
        {hallwayDrawingPoints.length > 0
          ? EDITOR_UI_TEXT.smartBuilder.queuedPoints(hallwayDrawingPoints.length)
          : EDITOR_UI_TEXT.smartBuilder.queuedPointsEmpty}
      </div>
    </div>
  );
}
