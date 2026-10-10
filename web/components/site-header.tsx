import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { SignOutButton } from "@/app/me/sign-out-button";

export async function SiteHeader() {
  const user = await getSessionUser();
  const isCustomer = !!user && user.group === "customer";
  const isGeneral = user?.group === "admin" && user.adminRole === "general";
  const isStaff = user?.group === "admin";

  return (
    <header className="sticky top-0 z-10 border-b-2 border-amber-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-black text-white">
            S
          </span>
          StudioLog
        </Link>
        <Link href="/services" className="text-sm font-bold text-stone-700 hover:text-orange-700">
          Services
        </Link>
        {isCustomer && (
          <>
            <Link href="/shipments" className="text-sm font-bold text-stone-700 hover:text-orange-700">
              My shipments
            </Link>
            <Link href="/consultations" className="text-sm font-bold text-stone-700 hover:text-orange-700">
              Consultations
            </Link>
            <Link href="/support" className="text-sm font-bold text-stone-700 hover:text-orange-700">
              Support
            </Link>
          </>
        )}
        {isStaff && (
          <Link href="/admin/shipments" className="text-sm font-bold text-stone-700 hover:text-orange-700">
            Shipments
          </Link>
        )}
        {isStaff && (user.adminRole === "sales_rep" || isGeneral) && (
          <Link href="/admin/consultations" className="text-sm font-bold text-stone-700 hover:text-orange-700">
            Sales desk
          </Link>
        )}
        {isGeneral && (
          <Link href="/admin" className="text-sm font-bold text-violet-800 hover:text-violet-950">
            Admin
          </Link>
        )}
        <span className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <Link href="/me" className="text-sm font-bold text-stone-700 hover:text-orange-700">
                {user.name}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-2 text-sm font-extrabold text-white shadow"
            >
              Sign in
            </Link>
          )}
        </span>
      </nav>
    </header>
  );
}
