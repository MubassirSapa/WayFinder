'use client';

import { Settings2 } from "lucide-react";

import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useEditorStore } from "@/store";
import { EDITOR_UI_TEXT } from "../../constants/editorUi.constants";
import { SmartBuilderPanel } from "./SmartBuilderPanel";

export function AutomationSection() {
  const isSmartBuilderEnabled = useEditorStore((state) => state.isSmartBuilderEnabled);

  return (
    <AccordionItem value="automation" className="border-zinc-800 data-open:bg-zinc-900/40">
      <AccordionTrigger className="items-center gap-3 rounded-none px-4 py-3.5 no-underline hover:bg-zinc-900/60 hover:no-underline">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
            <Settings2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-100">
              {EDITOR_UI_TEXT.smartBuilder.title}
            </p>
            <p className="mt-0.5 text-[10px] text-zinc-500">
              {EDITOR_UI_TEXT.smartBuilder.subtitle}
            </p>
          </div>
          <span
            className={
              isSmartBuilderEnabled
                ? "rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-300"
                : "rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500"
            }
          >
            {isSmartBuilderEnabled ? EDITOR_UI_TEXT.smartBuilder.on : EDITOR_UI_TEXT.smartBuilder.off}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-0">
        <SmartBuilderPanel />
      </AccordionContent>
    </AccordionItem>
  );
}
