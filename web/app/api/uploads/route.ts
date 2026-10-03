import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { saveUpload } from "@/lib/uploads";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.group !== "customer") {
    return NextResponse.json({ error: "Sign in as a customer" }, { status: 401 });
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get("photo");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Attach a photo as 'photo'" }, { status: 400 });
  }
  try {
    const key = await saveUpload(file);
    return NextResponse.json({ key }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 400 },
    );
  }
}
