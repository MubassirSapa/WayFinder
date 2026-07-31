'use client';

import { useAppStore } from "@/store";
import { EDITOR_UI_TEXT } from '../../constants/editorUi.constants';
import { OBJECT_CATEGORIES, OBJECT_CONFIGS } from '../lib/objectDefaults';
import { ToolboxObjectType } from '../types/editor.types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

export function CreateObjectsPanel() {
  const { selectedToolboxType, setMode, setSelectedToolboxType } = useAppStore();

  const handleSelectType = (type: ToolboxObjectType) => {
    setSelectedToolboxType(type);
    // Moving existing objects and placing new ones both live in "select"
    // mode now — picking a type here just changes what double-clicking the
    // canvas places next, it doesn't need its own exclusive mode. Still
    // exits "node"/"path" mode, since those really are exclusive tools.
    setMode('select');
  };

  return (
    <div className="flex flex-col">
      <p className="px-4 pt-4 text-[11px] leading-relaxed text-editor-subtle-foreground">
        {EDITOR_UI_TEXT.objectToolbox.description}
      </p>

      <Accordion
        multiple
        defaultValue={OBJECT_CATEGORIES.map((category) => category.id)}
        className="rounded-none border-none bg-transparent"
      >
        {OBJECT_CATEGORIES.map((category) => (
          <AccordionItem key={category.id} value={category.id} className="border-editor-border data-open:bg-editor-panel/20">
            <AccordionTrigger className="items-center rounded-none px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-editor-subtle-foreground no-underline hover:bg-editor-panel/60 hover:text-editor-muted-foreground hover:no-underline">
              {category.label}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2">
                {category.types.map((type) => {
                  const config = OBJECT_CONFIGS[type];
                  const Icon = config.icon;
                  const isSelected = selectedToolboxType === type;

                  return (
                    <button
                      key={type}
                      onClick={() => handleSelectType(type)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-xs font-medium transition-all",
                        "hover:bg-editor-surface/80 hover:text-editor-foreground",
                        isSelected
                          ? "bg-primary/20 text-primary border border-primary/35 shadow-[0_0_14px_rgba(59,130,246,0.16)]"
                          : "bg-editor-background/35 text-editor-muted-foreground border border-editor-border/80"
                      )}
                    >
                      <div
                        className="p-2 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: isSelected ? 'var(--editor-selection-fill)' : 'color-mix(in oklch, var(--editor-foreground) 3%, transparent)',
                          borderColor: isSelected ? 'var(--editor-selection-border)' : 'color-mix(in oklch, var(--editor-foreground) 6%, transparent)',
                          color: isSelected ? 'var(--editor-selection)' : config.color,
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block truncate text-editor-foreground">{config.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
