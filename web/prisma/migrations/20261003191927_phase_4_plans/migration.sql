-- CreateTable
CREATE TABLE "ShipmentPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shipmentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "serviceId" TEXT,
    "companyId" TEXT,
    "serviceName" TEXT NOT NULL DEFAULT '',
    "companyName" TEXT NOT NULL DEFAULT '',
    "goodsDesc" TEXT NOT NULL DEFAULT '',
    "quantity" TEXT NOT NULL DEFAULT '',
    "weightKg" REAL,
    "dimensions" TEXT NOT NULL DEFAULT '',
    "photos" JSONB NOT NULL DEFAULT [],
    "handlingNotes" TEXT NOT NULL DEFAULT '',
    "pickupAddr" TEXT NOT NULL DEFAULT '',
    "deliveryAddr" TEXT NOT NULL DEFAULT '',
    "pickupTimePref" TEXT NOT NULL DEFAULT '',
    "handlerStatement" TEXT NOT NULL DEFAULT 'Handled by LAS Transport Limited',
    "distanceKm" REAL NOT NULL DEFAULT 0,
    "transportCharge" REAL NOT NULL DEFAULT 0,
    "handlingFee" REAL NOT NULL DEFAULT 0,
    "totalPrice" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "timingEstimate" TEXT NOT NULL DEFAULT '',
    "conditions" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "correctionNote" TEXT NOT NULL DEFAULT '',
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShipmentPlan_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ShipmentPlan_shipmentId_version_key" ON "ShipmentPlan"("shipmentId", "version");
