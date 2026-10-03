import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { canViewShipment } from "@/lib/shipments";
import { computeCharge, haversineKm } from "@/lib/pricing";

interface Ctx {
  params: Promise<{ id: string }>;
}

/** Live price preview using current admin-directed pricing. */
export async function GET(_request: Request, { params }: Ctx) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const shipment = await prisma.shipment.findUnique({
    where: { id: (await params).id },
  });
  if (!shipment || !canViewShipment({ ...user, customerId: shipment.customerId })) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const pricing = await prisma.pricingConfig.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  if (!pricing) {
    return NextResponse.json({ error: "Pricing not configured" }, { status: 400 });
  }

  let distanceKm = shipment.distanceKm ?? 0;
  let source: "manual" | "haversine" | "unset" = "unset";
  if (shipment.distanceKm != null) {
    source = "manual";
  } else if (
    shipment.pickupLat != null &&
    shipment.pickupLng != null &&
    shipment.deliveryLat != null &&
    shipment.deliveryLng != null
  ) {
    distanceKm = haversineKm(
      { lat: shipment.pickupLat, lng: shipment.pickupLng },
      { lat: shipment.deliveryLat, lng: shipment.deliveryLng },
    );
    source = "haversine";
  }
  return NextResponse.json({
    quote: computeCharge(distanceKm, pricing),
    source,
  });
}
