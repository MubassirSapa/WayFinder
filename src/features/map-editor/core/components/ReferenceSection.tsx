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
    <AccordionItem value="reference" className="border-editor-border data-open:bg-editor-panel/40">
      <AccordionTrigger className="items-center gap-3 rounded-none px-4 py-3.5 no-underline hover:bg-editor-panel/60 hover:no-underline">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-info/20 bg-info/10">
            <ImageIcon className="h-4 w-4 text-info" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-editor-foreground">
              {EDITOR_UI_TEXT.referencePanel.title}
            </p>
            <p className="mt-0.5 text-[10px] text-editor-subtle-foreground">
              {EDITOR_UI_TEXT.referencePanel.imageTypeLabel}
            </p>
          </div>
          <Badge variant="outline" className="border-editor-border-strong bg-editor-background/60 text-editor-muted-foreground">
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
