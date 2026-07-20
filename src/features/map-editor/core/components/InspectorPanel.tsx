"use client";

import { useEditorStore } from "@/store";
import { EDITOR_UI_TEXT } from '../../constants/editorUi.constants';
import { EdgeInspector } from "./EdgeInspector";
import { NodeInspector } from "./NodeInspector";
import { ObjectInspector } from "./ObjectInspector";

export function InspectorPanel() {
  const { selectedEntity } = useEditorStore();

  return (
    <div className="w-72 h-full border-l border-editor-border bg-editor-panel/50 flex flex-col backdrop-blur-md">
      <div className="p-4 border-b border-editor-border">
        <h3 className="text-xs font-bold uppercase tracking-wider text-editor-muted-foreground">
          {EDITOR_UI_TEXT.inspector.title}
        </h3>
        <p className="text-[11px] text-editor-subtle-foreground mt-1">
          {EDITOR_UI_TEXT.inspector.description}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!selectedEntity ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-editor-subtle-foreground select-none">
            <svg
              className="h-8 w-8 text-editor-disabled-foreground mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
            <p className="text-xs">{EDITOR_UI_TEXT.inspector.emptyTitle}</p>
            <p className="text-[10px] text-editor-disabled-foreground mt-1 max-w-[180px] leading-relaxed">
              {EDITOR_UI_TEXT.inspector.emptyDescription}
            </p>
          </div>
        ) : selectedEntity.kind === "object" ? (
          <ObjectInspector objectId={selectedEntity.id} />
        ) : selectedEntity.kind === "node" ? (
          <NodeInspector nodeId={selectedEntity.id} />
        ) : (
          <EdgeInspector edgeId={selectedEntity.id} />
        )}
      </div>
    </div>
  );
}
