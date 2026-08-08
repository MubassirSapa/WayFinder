import { notFound, redirect } from "next/navigation";
import { getObjectFloorId } from "@/features/qr-codes/services/server/objectFloorLookup.ports";

export default async function QrRedirectPage({ params }: QrRedirectPageProps) {
  const { objectId } = await params;
  const floorId = await getObjectFloorId(objectId);

  if (!floorId) {
    notFound();
  }

  redirect(`/map/${floorId}?startObject=${objectId}`);
}

interface QrRedirectPageProps {
  params: Promise<{ objectId: string }>;
}
