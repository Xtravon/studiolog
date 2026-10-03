"use client";
import { useRouter } from "next/navigation";
import { ShipmentForm } from "@/components/shipment-form";

interface Props {
  services: { id: string; name: string }[];
  companies: { id: string; name: string; isPrimary: boolean }[];
  preselectedService: string;
}

export function NewShipmentForm({ services, companies, preselectedService }: Props) {
  const router = useRouter();
  return (
    <ShipmentForm
      services={services}
      companies={companies}
      initial={{
        serviceId: preselectedService,
        companyId: "",
        goodsDesc: "",
        quantity: "",
        weightKg: "",
        dimensions: "",
        handlingNotes: "",
        pickupAddr: "",
        deliveryAddr: "",
        pickupTimePref: "",
        photos: [],
      }}
      submitLabel="Save draft"
      onSubmit={async (data) => {
        const res = await fetch("/api/shipments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            serviceId: data.serviceId || null,
            companyId: data.companyId || null,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Save failed");
        router.push(`/shipments/${json.id}`);
      }}
    />
  );
}
