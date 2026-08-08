import { Loader2 } from "lucide-react";

import { EDITOR_UI_TEXT } from "@/features/map-editor/constants/editorUi.constants";

// Mirrors MapEditorShell's own isLoading branch exactly (same classes, same
// copy) so there's no visual flash between this SSR fallback (shown while
// getFloorEditorData resolves server-side) and the client-side loading
// state MapEditorShell shows immediately after it mounts.
export default function EditorLoading() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-editor-background text-editor-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="animate-pulse text-xs font-semibold uppercase tracking-wider text-editor-subtle-foreground">
        {EDITOR_UI_TEXT.loading.editor}
      </p>
    </div>
  );
}
