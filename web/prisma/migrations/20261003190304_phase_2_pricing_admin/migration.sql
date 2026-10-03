-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN "deliveryLat" REAL;
ALTER TABLE "Shipment" ADD COLUMN "deliveryLng" REAL;
ALTER TABLE "Shipment" ADD COLUMN "distanceKm" REAL;
ALTER TABLE "Shipment" ADD COLUMN "pickupLat" REAL;
ALTER TABLE "Shipment" ADD COLUMN "pickupLng" REAL;

-- CreateTable
CREATE TABLE "PricingConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "perKmRate" REAL NOT NULL,
    "baseFee" REAL NOT NULL,
    "minimumCharge" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "updatedBy" TEXT,
    "updatedAt" DATETIME NOT NULL
);
