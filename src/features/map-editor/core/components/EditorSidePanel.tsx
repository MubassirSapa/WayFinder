'use client';

import type { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface EditorSidePanelTab {
  id: string;
  label: string;
  // A rendered icon element (e.g. <ImageIcon className="h-3.5 w-3.5" />), not a
  // component reference — this crosses the Server -> Client Component boundary
  // (assembled in editor/[floorId]/page.tsx), and only rendered elements/plain
  // data survive that boundary, not component functions.
  icon: ReactNode;
  content: ReactNode;
}

interface EditorSidePanelProps {
  tabs: EditorSidePanelTab[];
}

export function EditorSidePanel({ tabs }: EditorSidePanelProps) {
  return (
    <div className="h-full min-h-0 w-80 shrink-0 border-r border-editor-border bg-editor-panel/60 flex flex-col backdrop-blur-md">
      <Tabs defaultValue={tabs[0]?.id} className="h-full min-h-0 flex-1 gap-0">
        <TabsList
          variant="line"
          className="h-auto w-full shrink-0 justify-start gap-0 border-b border-editor-border bg-editor-background/40 p-0"
        >
          {tabs.map(({ id, label, icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="flex-1 gap-1.5 rounded-none px-3 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-editor-subtle-foreground data-active:text-editor-foreground"
            >
              {icon}
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(({ id, content }) => (
          <TabsContent key={id} value={id} className="flex-1 min-h-0">
            <ScrollArea className="h-full">{content}</ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
