'use client';

import React from 'react';
import { useEditorStore } from "@/store";
import { OBJECT_CONFIGS } from '../lib/objectDefaults';
import { ToolboxObjectType } from '../types/editor.types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function ObjectToolbox() {
  const { mode, selectedToolboxType, setMode, setSelectedToolboxType } = useEditorStore();

  const handleSelectType = (type: ToolboxObjectType) => {
    setSelectedToolboxType(type);
    setMode('object');
  };

  return (
    <div className="w-60 h-full border-r border-zinc-800 bg-zinc-900/50 flex flex-col backdrop-blur-md">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Object Toolbox</h3>
        <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
          Select an item, then click the grid to place it or drag an existing object to reposition it.
        </p>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-1">
          {Object.entries(OBJECT_CONFIGS).map(([key, config]) => {
            const type = key as ToolboxObjectType;
            const Icon = config.icon;
            const isSelected = mode === 'object' && selectedToolboxType === type;

            return (
              <button
                key={type}
                onClick={() => handleSelectType(type)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs font-medium transition-all",
                  "hover:bg-zinc-800/60 hover:text-zinc-100",
                  isSelected
                    ? "bg-blue-600/25 text-blue-400 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                    : "text-zinc-400 border border-transparent"
                )}
              >
                <div
                  className="p-1.5 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: isSelected ? '#3b82f6' : config.color,
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block truncate">{config.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
