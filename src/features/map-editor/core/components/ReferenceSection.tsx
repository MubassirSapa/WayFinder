'use client';

import { ImageIcon } from 'lucide-react';

import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useEditorStore } from "@/store";
import { EDITOR_UI_TEXT } from '../../constants/editorUi.constants';
import { FloorReferencePanel } from './FloorReferencePanel';

export function ReferenceSection() {
  const floor = useEditorStore((state) => state.floor);

  return (
    <AccordionItem value="reference" className="border-zinc-800 data-open:bg-zinc-900/40">
      <AccordionTrigger className="items-center gap-3 rounded-none px-4 py-3.5 no-underline hover:bg-zinc-900/60 hover:no-underline">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10">
            <ImageIcon className="h-4 w-4 text-sky-400" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-100">
              {EDITOR_UI_TEXT.referencePanel.title}
            </p>
            <p className="mt-0.5 text-[10px] text-zinc-500">
              {EDITOR_UI_TEXT.referencePanel.imageTypeLabel}
            </p>
          </div>
          <Badge variant="outline" className="border-zinc-700 bg-zinc-950/60 text-zinc-300">
            {floor?.backgroundImageUrl
              ? EDITOR_UI_TEXT.referencePanel.attachedStatus
              : EDITOR_UI_TEXT.referencePanel.emptyStatus}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-0">
        <FloorReferencePanel />
      </AccordionContent>
    </AccordionItem>
  );
}
