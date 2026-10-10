import { NextResponse } from "next/server";

// Digital Asset Links: lets the Android app open this site without a URL bar.
// Fingerprint = SHA-256 of the TWA signing key (twa/android.keystore, local only).
export async function GET() {
  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.xtravon.studiolog",
          sha256_cert_fingerprints: [
            "5B52E9821C4C4374EE63AA750048F9364C9F82A09A6697AA329D2C13F8B40C45",
          ],
        },
      },
    ],
    { headers: { "Content-Type": "application/json" } },
  );
}
