/* Erzeugt die PWA-Icons als echte PNGs – ohne externe Abhängigkeiten.
   Aufruf:  node tools/make-icons.mjs                                      */
import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return buf => {
    let c = -1;
    for (const b of buf) c = t[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
})();

const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(CRC(body));
  return Buffer.concat([len, body, crc]);
};

function png(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const BG = hex('#0b0e14'), AT = hex('#ff4433'), WT = hex('#3b8cff'), ST = hex('#22c55e');

/* |x|+|y| <= r  →  Raute */
const inDiamond = (x, y, cx, cy, r) => Math.abs(x - cx) + Math.abs(y - cy) <= r;
const inRounded = (x, y, s, r) => {
  const cx = Math.min(Math.max(x, r), s - r), cy = Math.min(Math.max(y, r), s - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
};

function render(size, { maskable = false } = {}) {
  const SS = 3, W = size * SS;
  const px = Buffer.alloc(size * size * 4);
  /* Sicherheitszone: maskable-Icons dürfen am Rand beschnitten werden */
  const k = maskable ? 0.74 : 0.92;
  const cx = W / 2, top = W / 2 - W * 0.155 * k;
  const rBig = W * 0.215 * k, rSml = W * 0.185 * k;
  const wtC = [cx - W * 0.185 * k, W / 2 + W * 0.155 * k];
  const stC = [cx + W * 0.185 * k, W / 2 + W * 0.155 * k];
  const gap = W * 0.018;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let acc = [0, 0, 0, 0];
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const X = x * SS + sx + 0.5, Y = y * SS + sy + 0.5;
        let col = null, a = 1;
        if (maskable || inRounded(X / SS, Y / SS, size, size * 0.22)) col = BG; else a = 0;
        if (a) {
          if (inDiamond(X, Y, cx, top, rBig)) col = AT;
          else if (inDiamond(X, Y, wtC[0], wtC[1], rSml + gap) && !inDiamond(X, Y, cx, top, rBig + gap)) {
            col = inDiamond(X, Y, wtC[0], wtC[1], rSml) ? WT : BG;
          } else if (inDiamond(X, Y, stC[0], stC[1], rSml + gap) && !inDiamond(X, Y, cx, top, rBig + gap)) {
            col = inDiamond(X, Y, stC[0], stC[1], rSml) ? ST : BG;
          }
        }
        acc[0] += a ? col[0] : 0; acc[1] += a ? col[1] : 0; acc[2] += a ? col[2] : 0; acc[3] += a ? 255 : 0;
      }
      const n = SS * SS, o = (y * size + x) * 4;
      px[o] = acc[0] / n; px[o + 1] = acc[1] / n; px[o + 2] = acc[2] / n; px[o + 3] = acc[3] / n;
    }
  }
  return png(size, size, px);
}

const dir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'icons');
fs.writeFileSync(path.join(dir, 'icon-192.png'), render(192));
fs.writeFileSync(path.join(dir, 'icon-512.png'), render(512));
fs.writeFileSync(path.join(dir, 'maskable-512.png'), render(512, { maskable: true }));
console.log('Icons geschrieben.');
