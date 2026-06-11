'use client';

import { WandSparkles, Route, Sparkles, Link2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "@/store";

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
  } = useEditorStore();

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-zinc-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
              <WandSparkles className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.22em]">
                Smart Builder
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Optional automation layer
              </p>
            </div>
          </div>
          <span
            className={
              isSmartBuilderEnabled
                ? "rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-300"
                : "rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500"
            }
          >
            {isSmartBuilderEnabled ? "Active" : "Off"}
          </span>
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-500">
          Optional automation for nodes, connections, and hallway path drawing.
        </p>
      </div>

      <label className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-zinc-100">Enable Smart Builder</p>
          <p className="text-[10px] leading-relaxed text-zinc-500">Keeps the manual editor intact and only adds automation tools.</p>
        </div>
        <Checkbox
          checked={isSmartBuilderEnabled}
          onCheckedChange={(checked) => setSmartBuilderEnabled(checked === true)}
        />
      </label>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 p-3 space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            Automation Toggles
          </p>
        </div>
        <label className="flex items-start justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-3 py-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-100">Auto Nodes</p>
            <p className="text-[10px] text-zinc-500">
              Create default object nodes for eligible objects.
            </p>
          </div>
          <Checkbox
            checked={autoCreateNodes}
            disabled={!isSmartBuilderEnabled}
            onCheckedChange={(checked) => setAutoCreateNodes(checked === true)}
          />
        </label>

        <label className="flex items-start justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-3 py-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-100">Auto Connect</p>
            <p className="text-[10px] text-zinc-500">
              Link object nodes to the nearest hallway point.
            </p>
          </div>
          <Checkbox
            checked={autoConnectNodes}
            disabled={!isSmartBuilderEnabled}
            onCheckedChange={(checked) => setAutoConnectNodes(checked === true)}
          />
        </label>
      </div>

      <Separator className="bg-zinc-800" />

      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
          Actions
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-auto justify-start rounded-xl border-zinc-800 bg-zinc-950/50 px-3 py-3 text-left text-zinc-200 hover:bg-zinc-900"
          disabled={!floor || !isSmartBuilderEnabled}
          onClick={generateMissingNodes}
        >
          <Sparkles className="h-3 w-3" />
          Generate Nodes
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-auto justify-start rounded-xl border-zinc-800 bg-zinc-950/50 px-3 py-3 text-left text-zinc-200 hover:bg-zinc-900"
          disabled={!floor || !isSmartBuilderEnabled}
          onClick={autoConnectExistingNodes}
        >
          <Link2 className="h-3 w-3" />
          Auto Connect
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-auto justify-start rounded-xl border-zinc-800 bg-zinc-950/50 px-3 py-3 text-left text-zinc-200 hover:bg-zinc-900"
          disabled={!floor || hallwayDrawingPoints.length < 2 || !isSmartBuilderEnabled}
          onClick={finishHallwayPath}
        >
          <Route className="h-3 w-3" />
          Finish Hallway Path
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto justify-start rounded-xl px-3 py-3 text-left text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
          disabled={hallwayDrawingPoints.length === 0}
          onClick={clearHallwayDrawingPoints}
        >
          <Trash2 className="h-3 w-3" />
          Clear Path
        </Button>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-3.5 py-3 text-[10px] leading-relaxed text-zinc-500">
        {hallwayDrawingPoints.length > 0
          ? `${hallwayDrawingPoints.length} hallway point${hallwayDrawingPoints.length === 1 ? "" : "s"} queued. In path mode, click empty canvas to add more points, then finish the path.`
          : "In path mode, click empty canvas to queue hallway points while Smart Builder is enabled."}
      </div>
    </div>
  );
}
