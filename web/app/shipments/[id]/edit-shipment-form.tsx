"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShipmentForm, type ShipmentFormData } from "@/components/shipment-form";

interface Props {
  id: string;
  services: { id: string; name: string }[];
  companies: { id: string; name: string; isPrimary: boolean }[];
  initial: ShipmentFormData;
}

export function EditShipmentForm({ id, services, companies, initial }: Props) {
  const router = useRouter();
  const [savedAt, setSavedAt] = useState<string | null>(null);

  return (
    <>
      <ShipmentForm
        services={services}
        companies={companies}
        initial={initial}
        submitLabel="Save changes"
        onSubmit={async (data) => {
          const res = await fetch(`/api/shipments/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...data,
              serviceId: data.serviceId || null,
              companyId: data.companyId || null,
            }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error ?? "Save failed");
          setSavedAt(new Date().toLocaleTimeString());
          router.refresh();
        }}
      />
      {savedAt && (
        <p className="mt-2 text-sm font-bold text-green-800">
          Draft saved at {savedAt} — resume anytime from My shipments.
        </p>
      )}
    </>
  );
}
