'use client';

import React, { type ReactNode } from 'react';
import { useEditorStore } from "@/store";
import { EDITOR_UI_TEXT } from '../../constants/editorUi.constants';
import { OBJECT_CATEGORIES, OBJECT_CONFIGS } from '../lib/objectDefaults';
import { ToolboxObjectType } from '../types/editor.types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ObjectToolboxProps {
  footer?: ReactNode;
}

export function ObjectToolbox({ footer }: ObjectToolboxProps) {
  const { mode, selectedToolboxType, setMode, setSelectedToolboxType } = useEditorStore();

  const handleSelectType = (type: ToolboxObjectType) => {
    setSelectedToolboxType(type);
    setMode('object');
  };

  return (
    <div className="h-full min-h-0 w-80 shrink-0 border-r border-zinc-800 bg-zinc-900/60 flex flex-col backdrop-blur-md">
      <div className="p-5 border-b border-zinc-800 bg-zinc-950/40">
        <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">{EDITOR_UI_TEXT.objectToolbox.title}</h3>
        <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
          {EDITOR_UI_TEXT.objectToolbox.description}
        </p>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <Accordion
          multiple
          defaultValue={OBJECT_CATEGORIES.map((category) => category.id)}
          className="rounded-none border-none bg-transparent"
        >
          {OBJECT_CATEGORIES.map((category) => (
            <AccordionItem key={category.id} value={category.id} className="border-zinc-800 data-open:bg-zinc-900/20">
              <AccordionTrigger className="items-center rounded-none px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 no-underline hover:bg-zinc-900/60 hover:text-zinc-300 hover:no-underline">
                {category.label}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2">
                  {category.types.map((type) => {
                    const config = OBJECT_CONFIGS[type];
                    const Icon = config.icon;
                    const isSelected = mode === 'object' && selectedToolboxType === type;

                    return (
                      <button
                        key={type}
                        onClick={() => handleSelectType(type)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-xs font-medium transition-all",
                          "hover:bg-zinc-800/80 hover:text-zinc-100",
                          isSelected
                            ? "bg-blue-600/20 text-blue-300 border border-blue-500/35 shadow-[0_0_14px_rgba(59,130,246,0.16)]"
                            : "bg-zinc-950/35 text-zinc-400 border border-zinc-800/80"
                        )}
                      >
                        <div
                          className="p-2 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{
                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                            borderColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                            color: isSelected ? '#3b82f6' : config.color,
                          }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block truncate text-zinc-100">{config.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}

          {footer}
        </Accordion>
      </ScrollArea>
    </div>
  );
}
