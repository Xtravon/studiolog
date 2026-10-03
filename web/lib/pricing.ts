export interface Pricing {
  perKmRate: number;
  baseFee: number;
  minimumCharge: number;
  currency: string;
}

export interface Quote {
  distanceKm: number;
  perKmRate: number;
  baseFee: number;
  minimumCharge: number;
  charge: number;
  currency: string;
}

/** Great-circle distance in km between two coordinates. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * Locked pricing formula (PRD 6.3):
 * charge = max(minimumCharge, baseFee + perKmRate × distanceKm).
 * Changing PricingConfig affects only new quotes; approved plans are snapshots.
 */
export function computeCharge(distanceKm: number, pricing: Pricing): Quote {
  const distance = Math.max(0, distanceKm);
  const charge = Math.max(
    pricing.minimumCharge,
    pricing.baseFee + pricing.perKmRate * distance,
  );
  return {
    distanceKm: round2(distance),
    perKmRate: pricing.perKmRate,
    baseFee: pricing.baseFee,
    minimumCharge: pricing.minimumCharge,
    charge: round2(charge),
    currency: pricing.currency,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
