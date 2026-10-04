import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@studiolog.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";

async function main() {
  if (!/^postgres(ql)?:\/\//.test(process.env.DATABASE_URL ?? "")) {
    await prisma.$executeRawUnsafe("PRAGMA journal_mode=WAL");
  }
  // LAS Transport Limited: primary logistics company, locked as primary.
  const las = await prisma.company.upsert({
    where: { id: "las-transport-limited" },
    update: { name: "LAS Transport Limited", isPrimary: true, active: true },
    create: {
      id: "las-transport-limited",
      name: "LAS Transport Limited",
      isPrimary: true,
      active: true,
    },
  });
  console.log(`company: ${las.name} (primary=${las.isPrimary})`);

  // General admin account via Better Auth (hashes the password for us).
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });
  if (!existing) {
    const result = await auth.api.signUpEmail({
      body: { name: "StudioLog Admin", email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { group: "admin", adminRole: "general", emailVerified: true },
    });
    console.log(`admin: created ${result.user.email} (general)`);
  } else if (existing.group !== "admin") {
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { group: "admin", adminRole: "general", emailVerified: true },
    });
    console.log(`admin: promoted ${ADMIN_EMAIL} to general admin`);
  } else {
    console.log(`admin: ${ADMIN_EMAIL} already seeded`);
  }

  // Demo services for the Phase 1 catalog.
  const services = [
    {
      id: "standard-road-freight",
      name: "Standard Road Freight",
      description: "Reliable interstate transport for boxed goods and equipment.",
      includes: "Pickup and delivery\nCareful loading and unloading\nDelivery confirmation",
    },
    {
      id: "same-city-express",
      name: "Same-City Express",
      description: "Fast pickup and delivery within the same city, same day.",
      includes: "Same-day pickup\nDirect delivery\nLive status updates",
    },
    {
      id: "fragile-special-handling",
      name: "Fragile & Special Handling",
      description: "Extra-care transport for fragile, valuable, or unusual goods.",
      includes: "Protective packing check\nDedicated handling notes\nDelivery confirmation",
    },
  ];
  for (const s of services) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: { name: s.name, description: s.description, includes: s.includes, active: true },
      create: { ...s, active: true },
    });
  }
  console.log(`services: seeded ${services.length}`);

  await prisma.pricingConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      perKmRate: 200,
      baseFee: 5000,
      minimumCharge: 10000,
      currency: "NGN",
    },
  });
  console.log("pricing: default NGN config ensured");

  // Staff demo accounts (dev seed password; change after first sign-in).
  const staff: { email: string; name: string; role: string }[] = [
    { email: "sales@studiolog.local", name: "StudioLog Sales", role: "sales_rep" },
    { email: "ops@studiolog.local", name: "StudioLog Operations", role: "operations" },
  ];
  for (const s of staff) {
    const found = await prisma.user.findUnique({ where: { email: s.email } });
    if (!found) {
      await auth.api.signUpEmail({
        body: { name: s.name, email: s.email, password: ADMIN_PASSWORD },
      });
    }
    await prisma.user.update({
      where: { email: s.email },
      data: { group: "admin", adminRole: s.role, emailVerified: true },
    });
  }
  console.log(`staff: ensured ${staff.length} accounts`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
