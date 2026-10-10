// Generates PWA icons into public/icons/ with sharp. Run: node scripts/make-icons.mjs
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const OUT = path.dirname(fileURLToPath(new URL("../public/icons/icon-192.png", import.meta.url)));

function mark(size, { pad = 0, bg = null } = {}) {
  const inner = size - pad * 2;
  const radius = inner * 0.24;
  const font = Math.round(inner * 0.58);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    (bg ? `<rect width="${size}" height="${size}" fill="${bg}"/>` : "") +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#f97316"/><stop offset="1" stop-color="#ea580c"/>` +
    `</linearGradient></defs>` +
    `<rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" rx="${radius}" fill="url(#g)"/>` +
    `<text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="central" ` +
    `font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="${font}" fill="#ffffff">S</text>` +
    `</svg>`;
  return Buffer.from(svg);
}

mkdirSync(OUT, { recursive: true });
const jobs = [
  ["icon-192.png", 192, {}],
  ["icon-512.png", 512, {}],
  ["maskable-512.png", 512, { pad: 56, bg: "#ea580c" }],
  ["apple-touch-icon.png", 180, {}],
];
for (const [name, size, opts] of jobs) {
  await sharp(mark(size, opts)).png().toFile(path.join(OUT, name));
  console.log("wrote", name);
}
