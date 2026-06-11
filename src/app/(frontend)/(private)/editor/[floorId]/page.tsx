import { MapEditorShell } from "@/features/map-editor/components/MapEditorShell";

interface PageProps {
  params: Promise<{
    floorId: string;
  }>;
}

export default async function EditorPage({ params }: PageProps) {
  const { floorId } = await params;

  return <MapEditorShell floorId={floorId} />;
}
