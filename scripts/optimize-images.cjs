const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const IMG_DIR = path.join(ROOT, "src", "data", "imgs");
const SUPPORTED = new Set([".jpg", ".jpeg", ".png", ".jfif", ".avif", ".webp"]);

const MAX_SIZE = 1600;
const WEBP_QUALITY = 68;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(2)} ${units[index]}`;
}

async function optimizeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const baseName = path.basename(filePath, ext);
  const targetPath = path.join(IMG_DIR, `${baseName}.webp`);

  const beforeStat = fs.statSync(filePath);
  const image = sharp(filePath, { failOnError: false }).rotate();
  const metadata = await image.metadata();

  let pipeline = image;
  if ((metadata.width || 0) > MAX_SIZE || (metadata.height || 0) > MAX_SIZE) {
    pipeline = pipeline.resize({
      width: MAX_SIZE,
      height: MAX_SIZE,
      fit: "inside",
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
    });
  }

  await pipeline
    .webp({
      quality: WEBP_QUALITY,
      effort: 4,
      smartSubsample: true,
    })
    .toFile(targetPath);

  const afterStat = fs.statSync(targetPath);

  if (path.resolve(targetPath) !== path.resolve(filePath)) {
    fs.unlinkSync(filePath);
  }

  return {
    file: path.basename(filePath),
    out: path.basename(targetPath),
    before: beforeStat.size,
    after: afterStat.size,
    width: metadata.width,
    height: metadata.height,
  };
}

async function main() {
  if (!fs.existsSync(IMG_DIR)) {
    throw new Error(`Pasta não encontrada: ${IMG_DIR}`);
  }

  const files = fs
    .readdirSync(IMG_DIR)
    .map((name) => path.join(IMG_DIR, name))
    .filter((filePath) => fs.statSync(filePath).isFile())
    .filter((filePath) => SUPPORTED.has(path.extname(filePath).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));

  if (!files.length) {
    console.log("Nenhuma imagem encontrada para otimizar.");
    return;
  }

  let totalBefore = 0;
  let totalAfter = 0;
  const results = [];

  for (const file of files) {
    const result = await optimizeFile(file);
    totalBefore += result.before;
    totalAfter += result.after;
    results.push(result);
    console.log(
      `${result.file} -> ${result.out} | ${result.width || "?"}x${result.height || "?"} | ${formatBytes(
        result.before,
      )} -> ${formatBytes(result.after)}`,
    );
  }

  const saved = totalBefore - totalAfter;
  const ratio = totalBefore ? ((saved / totalBefore) * 100).toFixed(1) : "0.0";

  console.log("");
  console.log(`Imagens processadas: ${results.length}`);
  console.log(`Total antes: ${formatBytes(totalBefore)}`);
  console.log(`Total depois: ${formatBytes(totalAfter)}`);
  console.log(`Economia: ${formatBytes(saved)} (${ratio}%)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
