import sharp from 'sharp';

const source = 'assets/src/reflow-gate.png';
for (const width of [720, 1280]) {
  await sharp(source).resize({ width }).avif({ quality: width === 720 ? 52 : 56 }).toFile(`public/assets/reflow-gate-${width}.avif`);
}
