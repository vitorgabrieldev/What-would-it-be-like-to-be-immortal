const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const SITE_URL = "https://example.com";

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function iconSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(152 136) rotate(41.5) scale(434 356)">
      <stop stop-color="#4F46E5"/>
      <stop offset="0.45" stop-color="#0EA5E9"/>
      <stop offset="1" stop-color="#020617"/>
    </radialGradient>
    <radialGradient id="g2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(384 400) rotate(-145) scale(260 220)">
      <stop stop-color="#22D3EE" stop-opacity="0.7"/>
      <stop offset="1" stop-color="#22D3EE" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="#010101"/>
  <rect width="512" height="512" rx="112" fill="url(#g1)"/>
  <rect width="512" height="512" rx="112" fill="url(#g2)"/>

  <circle cx="256" cy="256" r="150" stroke="rgba(255,255,255,0.14)" stroke-width="2"/>
  <circle cx="256" cy="256" r="108" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
  <circle cx="256" cy="256" r="62" stroke="rgba(255,255,255,0.28)" stroke-width="2"/>

  <path d="M144 304C174 272 210 256 256 256C302 256 338 272 368 304" stroke="white" stroke-opacity="0.75" stroke-width="14" stroke-linecap="round"/>
  <path d="M180 218C200 194 224 180 256 180C288 180 312 194 332 218" stroke="white" stroke-opacity="0.88" stroke-width="12" stroke-linecap="round"/>
  <circle cx="256" cy="256" r="16" fill="white"/>

  <circle cx="120" cy="164" r="3" fill="white" fill-opacity="0.85"/>
  <circle cx="400" cy="124" r="2.5" fill="white" fill-opacity="0.75"/>
  <circle cx="394" cy="366" r="2" fill="white" fill-opacity="0.65"/>
  <circle cx="108" cy="344" r="2.5" fill="white" fill-opacity="0.7"/>
</svg>`;
}

function pinnedSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <path d="M256 86c94 0 170 76 170 170S350 426 256 426 86 350 86 256 162 86 256 86Zm0 20c-83 0-150 67-150 150s67 150 150 150 150-67 150-150S339 106 256 106Zm0 48c57 0 103 46 103 103h-20c0-46-37-83-83-83s-83 37-83 83h-20c0-57 46-103 103-103Zm0 84c10 0 18 8 18 18s-8 18-18 18-18-8-18-18 8-18 18-18Zm-114 70c35-33 71-50 114-50s79 17 114 50l-14 15c-32-30-63-45-100-45s-68 15-100 45l-14-15Z" fill="#fff"/>
</svg>`;
}

function wordmarkSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="820" height="220" viewBox="0 0 820 220" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="wm" x1="0" y1="0" x2="820" y2="220" gradientUnits="userSpaceOnUse">
      <stop stop-color="#A5F3FC"/>
      <stop offset="0.45" stop-color="#60A5FA"/>
      <stop offset="1" stop-color="#C4B5FD"/>
    </linearGradient>
  </defs>
  <rect width="820" height="220" rx="28" fill="#020617"/>
  <g opacity="0.14">
    <circle cx="120" cy="100" r="72" stroke="white"/>
    <circle cx="710" cy="130" r="96" stroke="white"/>
    <circle cx="710" cy="130" r="54" stroke="white"/>
  </g>
  <text x="96" y="112" fill="url(#wm)" font-size="54" font-weight="700" font-family="Sora, Arial, sans-serif" letter-spacing="-2">IMORTAL</text>
  <text x="96" y="160" fill="rgba(255,255,255,0.65)" font-size="24" font-weight="500" font-family="Sora, Arial, sans-serif">Uma história de eternidade, perda e fim do universo</text>
</svg>`;
}

function ogSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(250 160) rotate(35) scale(800 520)">
      <stop stop-color="#312E81"/>
      <stop offset="0.45" stop-color="#0EA5E9"/>
      <stop offset="1" stop-color="#020617"/>
    </radialGradient>
    <radialGradient id="bgB" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(980 510) rotate(-155) scale(500 280)">
      <stop stop-color="#22D3EE" stop-opacity="0.58"/>
      <stop offset="1" stop-color="#22D3EE" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="txt" x1="120" y1="180" x2="1080" y2="470" gradientUnits="userSpaceOnUse">
      <stop stop-color="#E0F2FE"/>
      <stop offset="1" stop-color="#FFFFFF"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#000"/>
  <rect width="1200" height="630" fill="url(#bgA)"/>
  <rect width="1200" height="630" fill="url(#bgB)"/>
  <g opacity="0.12">
    <circle cx="900" cy="170" r="150" stroke="white" stroke-width="2"/>
    <circle cx="900" cy="170" r="110" stroke="white" stroke-width="2"/>
    <circle cx="900" cy="170" r="70" stroke="white" stroke-width="2"/>
    <circle cx="220" cy="500" r="190" stroke="white" stroke-width="2"/>
  </g>
  <g opacity="0.8">
    <circle cx="170" cy="126" r="2.3" fill="white"/>
    <circle cx="1080" cy="90" r="1.8" fill="white"/>
    <circle cx="1020" cy="266" r="2" fill="white"/>
    <circle cx="140" cy="566" r="1.6" fill="white"/>
  </g>
  <text x="90" y="220" fill="rgba(255,255,255,0.6)" font-size="20" font-weight="600" font-family="Sora, Arial, sans-serif" letter-spacing="4">SCROLL STORY EXPERIENCE</text>
  <text x="90" y="320" fill="url(#txt)" font-size="68" font-weight="700" font-family="Sora, Arial, sans-serif" letter-spacing="-2">A história de um ser</text>
  <text x="90" y="400" fill="url(#txt)" font-size="68" font-weight="700" font-family="Sora, Arial, sans-serif" letter-spacing="-2">humano imortal.</text>
  <text x="90" y="488" fill="rgba(255,255,255,0.72)" font-size="30" font-weight="500" font-family="Sora, Arial, sans-serif">Venceu a morte. Descobriu algo pior do que ela.</text>
  <rect x="90" y="536" width="380" height="2" fill="rgba(255,255,255,0.22)"/>
</svg>`;
}

async function generatePngFromSvg(svg, filePath, size) {
  let pipeline = sharp(Buffer.from(svg));
  if (size) {
    pipeline = pipeline.resize(size, size);
  }
  await pipeline.png({ compressionLevel: 9 }).toFile(filePath);
}

async function generatePngFromSvgRect(svg, filePath, width, height) {
  await sharp(Buffer.from(svg))
    .resize(width, height, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(filePath);
}

async function main() {
  ensureDir(PUBLIC_DIR);

  const icon = iconSvg();
  const pinned = pinnedSvg();
  const wordmark = wordmarkSvg();
  const og = ogSvg();

  writeFile(path.join(PUBLIC_DIR, "favicon.svg"), icon);
  writeFile(path.join(PUBLIC_DIR, "safari-pinned-tab.svg"), pinned);
  writeFile(path.join(PUBLIC_DIR, "logo-mark.svg"), icon);
  writeFile(path.join(PUBLIC_DIR, "logo-wordmark.svg"), wordmark);
  writeFile(path.join(PUBLIC_DIR, "og-image.svg"), og);

  await generatePngFromSvg(icon, path.join(PUBLIC_DIR, "favicon-16x16.png"), 16);
  await generatePngFromSvg(icon, path.join(PUBLIC_DIR, "favicon-32x32.png"), 32);
  await generatePngFromSvg(icon, path.join(PUBLIC_DIR, "apple-touch-icon.png"), 180);
  await generatePngFromSvg(icon, path.join(PUBLIC_DIR, "android-chrome-192x192.png"), 192);
  await generatePngFromSvg(icon, path.join(PUBLIC_DIR, "android-chrome-512x512.png"), 512);
  await generatePngFromSvg(icon, path.join(PUBLIC_DIR, "mstile-150x150.png"), 150);
  await generatePngFromSvgRect(og, path.join(PUBLIC_DIR, "og-image.png"), 1200, 630);
  await generatePngFromSvgRect(og, path.join(PUBLIC_DIR, "twitter-image.png"), 1200, 600);

  const manifest = {
    name: "A história de um ser humano imortal",
    short_name: "Imortal",
    description:
      "Experiência narrativa em scroll sobre a vida de um ser humano imortal até o fim do universo.",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#020617",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };

  writeFile(path.join(PUBLIC_DIR, "site.webmanifest"), `${JSON.stringify(manifest, null, 2)}\n`);

  const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/mstile-150x150.png"/>
      <TileColor>#020617</TileColor>
    </tile>
  </msapplication>
</browserconfig>
`;
  writeFile(path.join(PUBLIC_DIR, "browserconfig.xml"), browserconfig);

  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
  writeFile(path.join(PUBLIC_DIR, "robots.txt"), robots);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
  writeFile(path.join(PUBLIC_DIR, "sitemap.xml"), sitemap);

  console.log("Assets de SEO/favicons gerados em public/");
  console.log("Lembrete: ajuste SITE_URL em robots.txt/sitemap.xml (atualmente https://example.com).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
