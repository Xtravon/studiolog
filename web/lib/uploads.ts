import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { getStore } from "@netlify/blobs";
import { MAX_PHOTOS } from "./shipments";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const STORE = "photos";

/** Netlify has no persistent disk: set USE_BLOBS=true there for Netlify Blobs. */
export function blobsEnabled(): boolean {
  return process.env.USE_BLOBS === "true";
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
  if (blobsEnabled()) {
    await getStore(STORE).set(key, new Blob([buffer], { type: "image/jpeg" }));
  } else {
    await mkdir(uploadsDir(), { recursive: true });
    await writeFile(path.join(uploadsDir(), key), buffer);
  }
  return key;
}

export async function readUpload(key: string): Promise<Buffer | null> {
  if (blobsEnabled()) {
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
