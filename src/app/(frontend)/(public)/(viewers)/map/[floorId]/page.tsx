import { MapUnavailableState } from "@/features/map-viewer/components/MapUnavailableState";
import { MapViewerShell } from "@/features/map-viewer/components/MapViewerShell";
import { getMapViewerData } from "@/features/map-viewer/services/server/getMapViewerData";

interface PublicFloorMapPageProps {
  params: Promise<{
    floorId: string;
  }>;
  searchParams: Promise<{
    accessible?: string;
    destObject?: string;
    startObject?: string;
  }>;
}

export default async function PublicFloorMapPage({
  params,
  searchParams,
}: PublicFloorMapPageProps) {
  const { floorId } = await params;
  const { accessible, destObject, startObject } = await searchParams;
  const data = await getMapViewerData(floorId);
  const floorExists = data.floors.some((floor) => floor.id === floorId);

  if (!floorExists) {
    return <MapUnavailableState floorId={floorId} />;
  }

  return (
    <MapViewerShell
      data={{ ...data, initialFloorId: floorId }}
      destObjectId={destObject ?? null}
      sharedAccessibleOnly={accessible === "1"}
      startObjectId={startObject ?? null}
    />
  );
}
