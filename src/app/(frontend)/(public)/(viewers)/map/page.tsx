import { MapUnavailableState } from "@/features/map-viewer/components/MapUnavailableState";
import { getInitialPublishedFloorId } from "@/features/map-viewer/services/server/getMapViewerData";
import { redirect } from "next/navigation";

export default async function PublicMapPage() {
  const floorId = await getInitialPublishedFloorId();

  if (!floorId) {
    return <MapUnavailableState />;
  }

  redirect(`/map/${floorId}`);
}
