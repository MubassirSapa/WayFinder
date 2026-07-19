'use client';

import { Settings2 } from "lucide-react";

import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useEditorStore } from "@/store";
import { EDITOR_UI_TEXT } from "../../constants/editorUi.constants";
import { SmartBuilderPanel } from "./SmartBuilderPanel";

export function AutomationSection() {
  const isSmartBuilderEnabled = useEditorStore((state) => state.isSmartBuilderEnabled);

  return (
    <AccordionItem value="automation" className="border-editor-border data-open:bg-editor-panel/40">
      <AccordionTrigger className="items-center gap-3 rounded-none px-4 py-3.5 no-underline hover:bg-editor-panel/60 hover:no-underline">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-success/20 bg-success/10">
            <Settings2 className="h-4 w-4 text-success" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-editor-foreground">
              {EDITOR_UI_TEXT.smartBuilder.title}
            </p>
            <p className="mt-0.5 text-[10px] text-editor-subtle-foreground">
              {EDITOR_UI_TEXT.smartBuilder.subtitle}
            </p>
          </div>
          <span
            className={
              isSmartBuilderEnabled
                ? "rounded-full border border-success/30 bg-success/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-success"
                : "rounded-full border border-editor-border-strong bg-editor-panel px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-editor-subtle-foreground"
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
