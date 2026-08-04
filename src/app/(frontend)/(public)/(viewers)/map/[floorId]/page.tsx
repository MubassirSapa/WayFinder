import { MapUnavailableState } from "@/features/map-viewer/components/MapUnavailableState";
import { MapViewerShell } from "@/features/map-viewer/components/MapViewerShell";
import { getMapViewerData } from "@/features/map-viewer/services/server/getMapViewerData";

interface PublicFloorMapPageProps {
  params: Promise<{
    floorId: string;
  }>;
}

export default async function PublicFloorMapPage({
  params,
}: PublicFloorMapPageProps) {
  const { floorId } = await params;
  const data = await getMapViewerData(floorId);
  const floorExists = data.floors.some((floor) => floor.id === floorId);

  if (!floorExists) {
    return <MapUnavailableState floorId={floorId} />;
  }

  return <MapViewerShell data={{ ...data, initialFloorId: floorId }} />;
}
