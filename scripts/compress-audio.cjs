const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const ffmpegPath = require("ffmpeg-static");

const ROOT = path.resolve(__dirname, "..");
const AUDIO_FILE = path.join(ROOT, "src", "data", "background.mp3");
const OPTIMIZED_FILE = path.join(ROOT, "src", "data", "background.optimized.mp3");
const TEMP_FILE = path.join(ROOT, "src", "data", "background.optimized.tmp.mp3");

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

function run() {
  if (!fs.existsSync(AUDIO_FILE)) {
    throw new Error(`Arquivo não encontrado: ${AUDIO_FILE}`);
  }

  if (!ffmpegPath) {
    throw new Error("ffmpeg-static não encontrou binário para este ambiente.");
  }

  if (fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE);
  if (fs.existsSync(OPTIMIZED_FILE)) fs.unlinkSync(OPTIMIZED_FILE);

  const before = fs.statSync(AUDIO_FILE).size;

  const args = [
    "-y",
    "-i",
    AUDIO_FILE,
    "-map",
    "0:a:0",
    "-vn",
    "-ac",
    "1",
    "-ar",
    "44100",
    "-b:a",
    "48k",
    "-compression_level",
    "2",
    TEMP_FILE,
  ];

  console.log("Comprimindo trilha de fundo...");
  const result = spawnSync(ffmpegPath, args, { stdio: "inherit" });

  if (result.status !== 0) {
    if (fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE);
    throw new Error(`ffmpeg falhou com código ${result.status}`);
  }

  const after = fs.statSync(TEMP_FILE).size;
  fs.renameSync(TEMP_FILE, OPTIMIZED_FILE);

  const saved = before - after;
  const ratio = before ? ((saved / before) * 100).toFixed(1) : "0.0";

  console.log("");
  console.log(`Antes: ${formatBytes(before)}`);
  console.log(`Depois: ${formatBytes(after)}`);
  console.log(`Economia: ${formatBytes(saved)} (${ratio}%)`);
  console.log(`Saída: ${path.relative(ROOT, OPTIMIZED_FILE)}`);
}

run();
