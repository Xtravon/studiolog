import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { getStore } from "@netlify/blobs";
import { head, list, put } from "@vercel/blob";
import { MAX_PHOTOS } from "./shipments";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const STORE = "photos";

export type UploadProvider = "local" | "netlify" | "vercel";

/** Netlify has no persistent disk: set UPLOADS_PROVIDER=netlify there.
 *  Vercel likewise: UPLOADS_PROVIDER=vercel (needs BLOB_READ_WRITE_TOKEN).
 *  Local dev keeps files on disk. */
export function uploadProvider(): UploadProvider {
  const explicit = process.env.UPLOADS_PROVIDER?.trim();
  if (explicit === "netlify" || explicit === "vercel" || explicit === "local") {
    return explicit;
  }
  if (process.env.USE_BLOBS === "true") return "netlify";
  return "local";
}

export function uploadsDir(): string {
  const override = process.env.UPLOADS_DIR?.trim();
  if (override) return override;
  return path.join(process.cwd(), "data", "uploads");
}

export async function saveUpload(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are accepted");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Photo must be 5 MB or smaller");
  }
  const key = `${randomUUID()}.jpg`;
  const buffer = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 70 })
    .toBuffer();
  const provider = uploadProvider();
  if (provider === "vercel") {
    await put(key, new Blob([buffer], { type: "image/jpeg" }), {
      access: "public",
      contentType: "image/jpeg",
    });
  } else if (provider === "netlify") {
    await getStore(STORE).set(key, new Blob([buffer], { type: "image/jpeg" }));
  } else {
    await mkdir(uploadsDir(), { recursive: true });
    await writeFile(path.join(uploadsDir(), key), buffer);
  }
  return key;
}

async function readVercelBlob(key: string): Promise<Buffer | null> {
  const found = await list({ prefix: key, limit: 1 });
  const match = found.blobs.find((b) => b.pathname === key);
  if (!match) return null;
  const meta = await head(match.url);
  void meta;
  const res = await fetch(match.url);
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

export async function readUpload(key: string): Promise<Buffer | null> {
  const provider = uploadProvider();
  if (provider === "vercel") {
    return readVercelBlob(key);
  }
  if (provider === "netlify") {
    const data = await getStore(STORE).get(key, { type: "arrayBuffer" });
    if (!data) return null;
    return Buffer.from(data);
  }
  try {
    return await readFile(uploadPath(key));
  } catch {
    return null;
  }
}

export function uploadPath(key: string): string {
  return path.join(uploadsDir(), path.basename(key));
}

export { MAX_PHOTOS };
