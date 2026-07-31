import { ImageIcon, LayoutGrid, Settings2 } from "lucide-react";

import { EDITOR_UI_TEXT } from "@/features/map-editor/constants/editorUi.constants";
import { CreateObjectsPanel } from "@/features/map-editor/core/components/CreateObjectsPanel";
import { FloorReferencePanel } from "@/features/map-editor/core/components/FloorReferencePanel";
import { MapEditorShell } from "@/features/map-editor/core/components/MapEditorShell";
import { getFloorEditorData } from "@/features/map-editor/core/services/server/floor.ports";
import { SmartBuilderBridge } from "@/features/map-editor/smart-builder/components/SmartBuilderBridge";
import { SmartBuilderPanel } from "@/features/map-editor/smart-builder/components/SmartBuilderPanel";

interface PageProps {
  params: Promise<{
    floorId: string;
  }>;
}

export default async function EditorPage({ params }: PageProps) {
  const { floorId } = await params;
  const result = await getFloorEditorData(floorId);
  const initialData = result.isSuccess ? result.data : null;
  const initialError = result.isSuccess ? null : result.message;
  const showImageTools = process.env.NODE_ENV !== "production";

  return (
    <>
      <MapEditorShell
        initialData={initialData}
        initialError={initialError}
        leftPanelTabs={[
          {
            id: "create",
            label: EDITOR_UI_TEXT.leftPanel.tabs.create,
            icon: <LayoutGrid className="h-3.5 w-3.5" />,
            content: <CreateObjectsPanel />,
          },
          ...(showImageTools
            ? [
                {
                  id: "image",
                  label: EDITOR_UI_TEXT.leftPanel.tabs.image,
                  icon: <ImageIcon className="h-3.5 w-3.5" />,
                  content: <FloorReferencePanel />,
                },
              ]
            : []),
          {
            id: "automation",
            label: EDITOR_UI_TEXT.leftPanel.tabs.automation,
            icon: <Settings2 className="h-3.5 w-3.5" />,
            content: <SmartBuilderPanel />,
          },
        ]}
      />
      {initialData ? <SmartBuilderBridge /> : null}
    </>
  );
}
