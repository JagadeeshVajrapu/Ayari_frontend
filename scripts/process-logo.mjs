import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'public/images/ayari-logo.png');

const CHARCOAL = { r: 43, g: 43, b: 43 };
const WHITE = { r: 255, g: 255, b: 255 };

function isRed(r, g, b, a) {
  if (a < 20) return false;
  return r > 120 && g < 100 && b < 100 && r > g + 40 && r > b + 40;
}

function isDark(r, g, b, a) {
  return a > 20 && r < 80 && g < 80 && b < 80;
}

function floodBackground(data, w, h) {
  const bg = new Uint8Array(w * h);
  const q = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const idx = y * w + x;
    if (bg[idx]) return;
    const i = idx * 4;
    if (!isDark(data[i], data[i + 1], data[i + 2], data[i + 3])) return;
    bg[idx] = 1;
    q.push(idx);
  };
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }
  while (q.length) {
    const idx = q.pop();
    const x = idx % w;
    const y = (idx - x) / w;
    push(x - 1, y);
    push(x + 1, y);
    push(x, y - 1);
    push(x, y + 1);
  }
  return bg;
}

function process(data, w, h, textColor) {
  const bg = floodBackground(data, w, h);
  for (let idx = 0; idx < w * h; idx++) {
    const i = idx * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (bg[idx]) {
      data[i + 3] = 0;
      continue;
    }
    if (a < 20) continue;
    if (isRed(r, g, b, a)) continue;
    data[i] = textColor.r;
    data[i + 1] = textColor.g;
    data[i + 2] = textColor.b;
    data[i + 3] = 255;
  }
}

async function writeVariant(out, textColor) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const copy = Buffer.from(data);
  process(copy, info.width, info.height, textColor);
  await sharp(copy, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(out);
  console.log('Wrote', path.basename(out));
}

await writeVariant(path.join(root, 'public/images/ayari-logo-dark-bg.png'), WHITE);
await writeVariant(path.join(root, 'public/images/ayari-logo-light-bg.png'), CHARCOAL);
await writeVariant(path.join(root, 'public/images/ayari-logo-transparent.png'), WHITE);
await sharp(path.join(root, 'public/images/ayari-logo-dark-bg.png'))
  .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(root, 'src/app/icon.png'));
console.log('Icon updated');
