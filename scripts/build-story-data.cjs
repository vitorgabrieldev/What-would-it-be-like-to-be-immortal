const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INPUT_FILE = path.join(
  ROOT,
  "docs",
  "YTDown.com YouTube Como-seria-ser-IMORTAL Media GgZCN4VJQ-M 001 1080p.txt",
);
const OUTPUT_FILE = path.join(ROOT, "src", "data", "immortalStory.json");
const EXCLUDED_SEGMENT_INDEXES = new Set([12, 13, 14]);

const CHAPTERS = [
  {
    id: "prologo",
    title: "O Desejo de Mais Tempo",
    label: "Agora",
    indexRange: [0, 6],
    type: "story",
    summary:
      "A narrativa começa com a ansiedade humana sobre o tempo, até o momento em que você descobre que não envelhece e não pode morrer.",
    palette: {
      from: "#0f172a",
      via: "#312e81",
      to: "#0ea5e9",
      accent: "#f8fafc",
    },
    scene: "cidade-noturna",
  },
  {
    id: "primeiros-anos",
    title: "5 Anos de Euforia",
    label: "5 anos",
    indexRange: [7, 11],
    type: "story",
    summary:
      "A imortalidade parece perfeita: sem pressa, sem medo do relógio, com tempo para aprender, viajar e moldar a vida sem urgência.",
    palette: {
      from: "#082f49",
      via: "#0f766e",
      to: "#65a30d",
      accent: "#ecfeff",
    },
    scene: "horizonte-aberto",
  },
  {
    id: "cinquenta-anos",
    title: "50 Anos e as Primeiras Perdas",
    label: "50 anos",
    indexRange: [15, 25],
    type: "story",
    summary:
      "O mundo avança, tecnologias amadurecem, mas amigos e familiares começam a desaparecer. Surge o peso emocional da imortalidade.",
    palette: {
      from: "#1f2937",
      via: "#7c2d12",
      to: "#b91c1c",
      accent: "#fee2e2",
    },
    scene: "retratos-desbotando",
  },
  {
    id: "seculos-expansao",
    title: "Séculos de Expansão Humana",
    label: "500 a 10 mil anos",
    indexRange: [26, 33],
    type: "story",
    summary:
      "Humanidade escala energia, ocupa colônias e muda culturalmente até um ponto em que o passado vira quase lenda.",
    palette: {
      from: "#111827",
      via: "#0f766e",
      to: "#14b8a6",
      accent: "#ccfbf1",
    },
    scene: "colonia-espacial",
  },
  {
    id: "terra-extrema",
    title: "A Terra se Torna Estranha",
    label: "10 mil a 200 milhões de anos",
    indexRange: [34, 45],
    type: "story",
    summary:
      "Perda de memória histórica, eras glaciais, colapsos climáticos, supernovas e rearranjo continental transformam a Terra em algo irreconhecível.",
    palette: {
      from: "#1c1917",
      via: "#78350f",
      to: "#f97316",
      accent: "#ffedd5",
    },
    scene: "planeta-ruinas",
  },
  {
    id: "sistema-solar-colapso",
    title: "Colapso do Sistema Solar",
    label: "500 milhões a bilhões de anos",
    indexRange: [46, 63],
    type: "story",
    summary:
      "Riscos cósmicos, aumento da luminosidade solar, morte da Terra e transformação do Sol culminam no fim do sistema solar como lar.",
    palette: {
      from: "#0c0a09",
      via: "#7f1d1d",
      to: "#f59e0b",
      accent: "#fef3c7",
    },
    scene: "gigante-vermelha",
  },
  {
    id: "ultima-luz-galaxias",
    title: "A Última Grande Luz das Galáxias",
    label: "Fim de galáxias próximas",
    indexRange: [64, 74],
    type: "story",
    summary:
      "Você parte pela galáxia, testemunha colisões, explosões e a última grande era luminosa antes do isolamento cosmológico.",
    palette: {
      from: "#020617",
      via: "#1d4ed8",
      to: "#9333ea",
      accent: "#ede9fe",
    },
    scene: "nebulosa-brilhante",
  },
  {
    id: "fim-das-estrelas",
    title: "Fim das Estrelas",
    label: "Trilhões de anos",
    indexRange: [75, 82],
    type: "story",
    summary:
      "A formação estelar termina, anãs vermelhas morrem e a galáxia entra num estado cada vez mais escuro e sem renovação.",
    palette: {
      from: "#030712",
      via: "#111827",
      to: "#374151",
      accent: "#e5e7eb",
    },
    scene: "ceu-vazio",
  },
  {
    id: "era-buracos-negros",
    title: "Era dos Buracos Negros",
    label: "Googol de anos",
    indexRange: [83, 87],
    type: "story",
    summary:
      "Só restam buracos negros, raros eventos compactos e os últimos fótons do universo observável.",
    palette: {
      from: "#000000",
      via: "#111111",
      to: "#1f2937",
      accent: "#f3f4f6",
    },
    scene: "horizonte-eventos",
  },
  {
    id: "era-escuridao",
    title: "Era da Escuridão",
    label: "Pós-luz",
    indexRange: [88, 90],
    type: "story",
    summary:
      "A energia se dissipa, a entropia domina e o universo caminha para seu estado de menor atividade possível.",
    palette: {
      from: "#000000",
      via: "#030712",
      to: "#000000",
      accent: "#d1d5db",
    },
    scene: "escuridao-termica",
  },
  {
    id: "epilogo",
    title: "A Maldição de Nunca Terminar",
    label: "Epilogo",
    indexRange: [91, 96],
    type: "story",
    summary:
      "Sem ninguém para compartilhar a eternidade, a imortalidade se revela uma maldição e reforça o valor da finitude da vida.",
    palette: {
      from: "#020617",
      via: "#111827",
      to: "#1f2937",
      accent: "#f8fafc",
    },
    scene: "silencio",
  },
];

function toSeconds(ts) {
  const [m, s] = ts.split(":").map(Number);
  return m * 60 + s;
}

function slugSegmentId(index, start, end) {
  return `seg-${String(index).padStart(3, "0")}-${start.replace(":", "")}-${end.replace(":", "")}`;
}

function parseTranscript(rawText) {
  const normalized = rawText.replace(/\r\n/g, "\n");
  const regex =
    /\((\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\)\n([\s\S]*?)(?=\n\(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\)|\n\(Transcrito por TurboScribe|$)/g;

  const segments = [];
  let match;

  while ((match = regex.exec(normalized))) {
    const [, start, end, content] = match;
    const text = content.trim().replace(/\n+/g, " ").replace(/\s{2,}/g, " ");
    segments.push({
      start,
      end,
      startSec: toSeconds(start),
      endSec: toSeconds(end),
      text,
    });
  }

  return segments;
}

function buildData() {
  const rawText = fs.readFileSync(INPUT_FILE, "utf8");
  const parsedSegments = parseTranscript(rawText);

  if (parsedSegments.length !== 97) {
    throw new Error(`Esperado 97 segmentos, encontrado ${parsedSegments.length}`);
  }

  const segments = parsedSegments
    .map((segment, originalIndex) => ({ ...segment, originalIndex }))
    .filter((segment) => !EXCLUDED_SEGMENT_INDEXES.has(segment.originalIndex))
    .map((segment, index) => {
    const chapter = CHAPTERS.find(
      (item) =>
        segment.originalIndex >= item.indexRange[0] &&
        segment.originalIndex <= item.indexRange[1],
    );

    if (!chapter) {
      throw new Error(`Segmento original ${segment.originalIndex} sem capítulo mapeado`);
    }

    return {
      id: slugSegmentId(index, segment.start, segment.end),
      index,
      originalIndex: segment.originalIndex,
      start: segment.start,
      end: segment.end,
      startSec: segment.startSec,
      endSec: segment.endSec,
      text: segment.text,
      chapterId: chapter.id,
      type: "story",
    };
  });

  const chapters = CHAPTERS.map((chapter, order) => {
    const [startOriginalIndex, endOriginalIndex] = chapter.indexRange;
    const chapterSegments = segments.filter(
      (item) =>
        item.originalIndex >= startOriginalIndex && item.originalIndex <= endOriginalIndex,
    );

    if (!chapterSegments.length) {
      throw new Error(`Capítulo ${chapter.id} ficou sem segmentos após excluir anúncios`);
    }

    const fullText = chapterSegments.map((item) => item.text).join(" ");

    return {
      id: chapter.id,
      order,
      type: chapter.type,
      title: chapter.title,
      label: chapter.label,
      summary: chapter.summary,
      scene: chapter.scene,
      palette: chapter.palette,
      startSegmentIndex: chapterSegments[0].index,
      endSegmentIndex: chapterSegments[chapterSegments.length - 1].index,
      startSourceSegmentIndex: startOriginalIndex,
      endSourceSegmentIndex: endOriginalIndex,
      startTime: chapterSegments[0].start,
      endTime: chapterSegments[chapterSegments.length - 1].end,
      startSec: chapterSegments[0].startSec,
      endSec: chapterSegments[chapterSegments.length - 1].endSec,
      durationSec:
        chapterSegments[chapterSegments.length - 1].endSec - chapterSegments[0].startSec,
      segmentCount: chapterSegments.length,
      wordCount: fullText.split(/\s+/).filter(Boolean).length,
      segmentIds: chapterSegments.map((item) => item.id),
    };
  });

  const storyText = segments.map((segment) => segment.text).join(" ");

  return {
    meta: {
      title: "Como seria ser imortal",
      language: "pt-BR",
      format: "transcript_scrollytelling",
      source: {
        transcriptProvider: "TurboScribe.ai",
        videoTitle: "Como seria ser IMORTAL",
        videoId: "GgZCN4VJQ-M",
        originalTextFile: path.basename(INPUT_FILE),
      },
      generatedAt: new Date().toISOString(),
      notes: [
        "JSON organizado a partir da transcrição com timestamps.",
        "Trecho de patrocínio do vídeo original removido (segmentos 12-14).",
      ],
    },
    stats: {
      totalSegments: segments.length,
      storySegments: segments.length,
      totalChapters: chapters.length,
      storyChapters: chapters.length,
      durationSec: segments[segments.length - 1].endSec,
      wordCountStory: storyText.split(/\s+/).filter(Boolean).length,
    },
    chapters,
    segments,
  };
}

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
const data = buildData();
fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(`Gerado: ${path.relative(ROOT, OUTPUT_FILE)}`);
console.log(
  `Capítulos: ${data.stats.totalChapters} | Segmentos: ${data.stats.totalSegments}`,
);
