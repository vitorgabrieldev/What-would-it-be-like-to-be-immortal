import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import storyData from "./data/immortalStory.json";
import backgroundMusic from "./data/background.mp3";

gsap.registerPlugin(ScrollTrigger);

const imageModules = import.meta.glob(
  "./data/imgs/*.{jpg,jpeg,png,avif,webp,jfif}",
  { eager: true, import: "default" },
);

const backgroundImages = Object.entries(imageModules)
  .sort(([a], [b]) => a.localeCompare(b, "pt-BR", { numeric: true }))
  .map(([filePath, src], index) => ({
    id: `bg-img-${index}`,
    src,
    name: filePath.split("/").pop() ?? `img-${index + 1}`,
  }));

const chaptersWithSegments = storyData.chapters.map((chapter) => ({
  ...chapter,
  segments: storyData.segments.filter((segment) => segment.chapterId === chapter.id),
}));

const backgroundScenes = backgroundImages.flatMap((image, index) => {
  const palette = chaptersWithSegments[index % chaptersWithSegments.length]?.palette;
  const nextPalette = chaptersWithSegments[(index + 1) % chaptersWithSegments.length]?.palette;

  const scenes = [
    {
      id: `${image.id}-scene`,
      kind: "image",
      image,
      palette,
      motionSeed: index + 1,
    },
  ];

  if (index < backgroundImages.length - 1) {
    scenes.push({
      id: `${image.id}-color-break`,
      kind: "color",
      palette: nextPalette ?? palette,
      motionSeed: index + 101,
    });
  }

  return scenes;
});

const cosmicStars = Array.from({ length: 28 }, (_, index) => ({
  id: `star-${index}`,
  size: 1 + (index % 4),
  top: (index * 17) % 100,
  left: (index * 29) % 100,
  delay: (index % 9) * 0.7,
  duration: 5 + (index % 7) * 1.4,
  opacity: 0.12 + (index % 5) * 0.06,
}));

const cosmicStreaks = Array.from({ length: 4 }, (_, index) => ({
  id: `streak-${index}`,
  top: 8 + index * 12,
  left: index % 2 === 0 ? -15 : 55,
  width: 180 + index * 36,
  delay: index * 3.8,
  duration: 18 + index * 2.2,
  angle: -18 + index * 4,
  opacity: 0.05 + (index % 3) * 0.03,
}));

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function smoothPulse(value) {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
}

function CosmicAmbient({ progress, activePalette }) {
  const orbitShift = (progress - 0.5) * 120;

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <div
        className="absolute left-[-12vw] top-[6vh] h-[42vh] w-[42vh]"
        style={{
          transform: `translate3d(${orbitShift * 0.25}px, ${-orbitShift * 0.12}px, 0)`,
        }}
      >
        <div
          className="cosmic-orb-a h-full w-full rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, ${activePalette.via}55 0%, ${activePalette.from}18 55%, transparent 72%)`,
          }}
        />
      </div>
      <div
        className="absolute right-[-10vw] top-[22vh] h-[50vh] w-[50vh]"
        style={{
          transform: `translate3d(${orbitShift * -0.2}px, ${orbitShift * 0.08}px, 0)`,
        }}
      >
        <div
          className="cosmic-orb-b h-full w-full rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, ${activePalette.to}50 0%, ${activePalette.via}18 58%, transparent 74%)`,
          }}
        />
      </div>
      <div
        className="absolute bottom-[-18vh] left-[12vw] h-[58vh] w-[70vw]"
        style={{
          transform: `translate3d(${orbitShift * 0.12}px, ${orbitShift * -0.05}px, 0)`,
        }}
      >
        <div
          className="cosmic-nebula h-full w-full rounded-[999px] blur-2xl"
          style={{
            background: `radial-gradient(circle at 30% 50%, ${activePalette.from}44 0%, ${activePalette.to}12 55%, transparent 78%)`,
          }}
        />
      </div>

      <div className="absolute inset-0">
        {cosmicStars.map((star) => (
          <span
            key={star.id}
            className="cosmic-star absolute rounded-full bg-white"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: `${star.top}%`,
              left: `${star.left}%`,
              opacity: star.opacity,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0">
        {cosmicStreaks.map((streak) => (
          <span
            key={streak.id}
            className="cosmic-streak absolute block"
            style={{
              top: `${streak.top}%`,
              left: `${streak.left}%`,
              width: `${streak.width}px`,
              opacity: streak.opacity,
              transform: `rotate(${streak.angle}deg)`,
              animationDelay: `${streak.delay}s`,
              animationDuration: `${streak.duration}s`,
            }}
          />
        ))}
      </div>

      <div
        className="cosmic-ring cosmic-ring-global-a absolute left-1/2 top-1/2 h-[62vw] w-[62vw] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{
          borderColor: `${activePalette.accent}14`,
          transform: `translate(-50%, -50%) rotate(${progress * 80}deg)`,
        }}
      />
      <div
        className="cosmic-ring cosmic-ring-global-b absolute left-1/2 top-1/2 h-[78vw] w-[78vw] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{
          borderColor: `${activePalette.to}12`,
          transform: `translate(-50%, -50%) rotate(${-progress * 56}deg)`,
        }}
      />
    </div>
  );
}

function BackgroundLayerStack({ progress, activePalette }) {
  const sceneCount = Math.max(1, backgroundScenes.length);
  const spacing = sceneCount > 1 ? 1 / (sceneCount - 1) : 1;
  const spread = spacing * 1.25;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: `radial-gradient(circle at 12% 12%, ${activePalette.to}28 0%, transparent 55%),
                       radial-gradient(circle at 85% 18%, ${activePalette.via}24 0%, transparent 60%),
                       radial-gradient(circle at 50% 100%, ${activePalette.from}32 0%, transparent 70%)`,
        }}
      />

      {backgroundScenes.map((scene, sceneIndex) => {
        const center = sceneCount > 1 ? sceneIndex / (sceneCount - 1) : 0.5;
        const distance = Math.abs(progress - center);
        const strength = smoothPulse(1 - distance / spread);

        if (strength <= 0.001) {
          return null;
        }

        const local = (progress - center) / spread;
        const baseX = ((scene.motionSeed % 5) - 2) * 5;
        const baseY = ((scene.motionSeed % 7) - 3) * 4;
        const panX = baseX + local * -24;
        const panY = baseY + local * 14;
        const scale = scene.kind === "image" ? 1.08 + strength * 0.08 : 1.02 + strength * 0.05;
        const rotate = scene.kind === "image" ? local * 2.2 : local * 1.2;
        const opacity = strength * (scene.kind === "image" ? 0.23 : 0.18);
        const tintPalette = scene.palette ?? activePalette;

        return (
          <div
            key={scene.id}
            className="absolute inset-0 transition-opacity duration-[1400ms] ease-out"
            style={{ opacity }}
          >
            {scene.kind === "image" ? (
              <>
                <div
                  className="absolute inset-[-8%]"
                  style={{
                    transform: `translate3d(${panX}px, ${panY}px, 0) scale(${scale}) rotate(${rotate}deg)`,
                    WebkitMaskImage:
                      "radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 48%, rgba(0,0,0,0.45) 76%, rgba(0,0,0,0) 100%)",
                    maskImage:
                      "radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 48%, rgba(0,0,0,0.45) 76%, rgba(0,0,0,0) 100%)",
                  }}
                >
                  <div
                    className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${sceneIndex % 2 ? "bg-drift-reverse" : "bg-drift-forward"} bg-zoom-pulse`}
                    style={{
                      backgroundImage: `url(${scene.image.src})`,
                      opacity: 0.9,
                    }}
                  />
                </div>
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(180deg, ${tintPalette.from}66, transparent 35%, transparent 65%, ${tintPalette.to}66),
                                 radial-gradient(circle at 18% 30%, ${tintPalette.via}55, transparent 58%),
                                 radial-gradient(circle at 82% 70%, ${tintPalette.to}40, transparent 62%)`,
                  }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.55)_80%,rgba(0,0,0,0.85)_100%)]" />
              </>
            ) : (
              <div className="absolute inset-[-10%]">
                <div
                  className="bg-color-blob absolute left-[6%] top-[8%] h-[30vh] w-[30vh] rounded-full blur-2xl"
                  style={{
                    background: `radial-gradient(circle, ${tintPalette.via}88, ${tintPalette.from}22 60%, transparent 72%)`,
                    transform: `translate3d(${panX * 0.5}px, ${panY * 0.35}px, 0) scale(${1 + strength * 0.24})`,
                  }}
                />
                <div
                  className="bg-color-blob absolute right-[10%] top-[24%] h-[36vh] w-[36vh] rounded-full blur-2xl"
                  style={{
                    background: `radial-gradient(circle, ${tintPalette.to}88, ${tintPalette.via}28 58%, transparent 74%)`,
                    transform: `translate3d(${panX * -0.4}px, ${panY * 0.55}px, 0) scale(${1.04 + strength * 0.18})`,
                  }}
                />
                <div
                  className="bg-color-blob absolute bottom-[4%] left-[26%] h-[40vh] w-[52vw] rounded-[999px] blur-2xl"
                  style={{
                    background: `radial-gradient(circle at 50% 45%, ${tintPalette.from}66, ${tintPalette.to}22 62%, transparent 80%)`,
                    transform: `translate3d(${panX * 0.25}px, ${panY * -0.45}px, 0) rotate(${rotate * 0.5}deg) scale(${1 + strength * 0.12})`,
                  }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.45)_76%,rgba(0,0,0,0.8)_100%)]" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChapterScene({ chapter, index }) {
  return (
    <div className="scene-shell relative h-full w-full overflow-hidden rounded-[2rem] p-6">
      <div
        className="scene-gradient absolute inset-0 opacity-75"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${chapter.palette.to}55, transparent 55%),
                       radial-gradient(circle at 80% 30%, ${chapter.palette.via}50, transparent 60%),
                       linear-gradient(160deg, ${chapter.palette.from}cc, ${chapter.palette.to}22)`,
        }}
      />

      <div className="absolute inset-0 opacity-60">
        {Array.from({ length: 20 }).map((_, dotIndex) => (
          <span
            key={`${chapter.id}-dot-${dotIndex}`}
            className="scene-dot absolute block rounded-full bg-white/80"
            style={{
              width: `${2 + ((dotIndex + index) % 4)}px`,
              height: `${2 + ((dotIndex + index) % 4)}px`,
              top: `${(dotIndex * 13 + index * 7) % 100}%`,
              left: `${(dotIndex * 19 + index * 11) % 100}%`,
              opacity: 0.25 + ((dotIndex % 5) * 0.12),
            }}
          />
        ))}
      </div>

      <div className="scene-orb absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10">
        <div
          className="absolute inset-3 rounded-full blur-xl"
          style={{
            background: `radial-gradient(circle, ${chapter.palette.to}99, ${chapter.palette.via}33 55%, transparent 70%)`,
          }}
        />
      </div>

      <div className="scene-ring scene-ring-a absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.08]" />
      <div className="scene-ring scene-ring-b absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.08]" />
      <div className="scene-ring scene-ring-c absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="text-xs uppercase tracking-[0.25em] text-white/70">
          <span>{chapter.scene.replaceAll("-", " ")}</span>
        </div>
        <div className="space-y-3">
          <div
            className="inline-flex items-center rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em]"
            style={{
              borderColor: `${chapter.palette.accent}55`,
              color: chapter.palette.accent,
              backgroundColor: `${chapter.palette.from}66`,
            }}
          >
            {chapter.label}
          </div>
          <h3 className="font-display text-3xl leading-tight text-white">
            {chapter.title}
          </h3>
        </div>
      </div>
    </div>
  );
}

function SegmentParagraph({ segment }) {
  return (
    <p className="segment-line py-1.5 leading-relaxed text-white/90">
      <span className="segment-text block text-[15px] sm:text-base">{segment.text}</span>
    </p>
  );
}

function App() {
  const rootRef = useRef(null);
  const sectionRefs = useRef([]);
  const audioRef = useRef(null);
  const lenisRef = useRef(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const activeChapter = chaptersWithSegments[activeChapterIndex] ?? chaptersWithSegments[0];

  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, chaptersWithSegments.length);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.02;

    const tryPlay = async () => {
      try {
        await audio.play();
      } catch {
        // Autoplay pode ser bloqueado; tentamos novamente na primeira interação.
      }
    };

    const unlockAudio = () => {
      void tryPlay();
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };

    void tryPlay();
    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("touchstart", unlockAudio, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Mantém a trilha discreta: cresce lentamente de ~2% até ~9% conforme o scroll.
    const easedProgress = Math.pow(scrollProgress, 0.8);
    const targetVolume = 0.02 + easedProgress * 0.07;
    audio.volume = Math.min(0.09, Math.max(0.02, targetVolume));
  }, [scrollProgress]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return undefined;

    const lenis = new Lenis({
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.55,
      touchMultiplier: 0.8,
      lerp: 0.06,
      normalizeWheel: true,
      infinite: false,
    });

    lenisRef.current = lenis;

    const onLenisScroll = () => {
      ScrollTrigger.update();
    };

    lenis.on("scroll", onLenisScroll);

    const raf = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);
    window.setTimeout(refresh, 60);

    return () => {
      window.removeEventListener("resize", refresh);
      gsap.ticker.remove(raf);
      lenis.off("scroll", onLenisScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    if (!rootRef.current) return undefined;

    const ctx = gsap.context(() => {
      const hero = rootRef.current.querySelector("[data-hero]");
      const heroInner = rootRef.current.querySelector("[data-hero-inner]");

      if (hero && heroInner) {
        gsap.fromTo(
          heroInner,
          { y: 40, opacity: 0.4 },
          {
            y: -20,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: 1.8,
            },
          },
        );
      }

      sectionRefs.current.forEach((section, index) => {
        if (!section) return;

        const shell = section.querySelector(".chapter-shell");
        const scene = section.querySelector(".scene-shell");
        const title = section.querySelector(".chapter-title");
        const segments = section.querySelectorAll(".segment-line");
        const rings = section.querySelectorAll(".scene-ring");
        const orb = section.querySelector(".scene-orb");

        ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveChapterIndex(index),
          onEnterBack: () => setActiveChapterIndex(index),
        });

        if (shell) {
          gsap.fromTo(
            shell,
            { y: 20, opacity: 0.55 },
            {
              y: 0,
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 85%",
                end: "top 40%",
                scrub: 1.2,
              },
            },
          );
        }

        if (scene && orb) {
          gsap.to(orb, {
            scale: 1.08,
            rotate: index % 2 === 0 ? 45 : -45,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 2.4,
            },
          });

          gsap.to(scene, {
            yPercent: -4,
            rotate: index % 2 === 0 ? 0.6 : -0.6,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 2,
            },
          });
        }

        if (rings.length) {
          gsap.to(rings, {
            rotate: (_, target) => (target.classList.contains("scene-ring-b") ? -70 : 70),
            ease: "none",
            stagger: 0.08,
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 2.2,
            },
          });
        }

        gsap.fromTo(
          [title],
          { y: 12, opacity: 0.2 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 78%",
              end: "top 48%",
              scrub: 0.8,
            },
          },
        );

        if (segments.length) {
          gsap.fromTo(
            segments,
            { y: 8, opacity: 0.08 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.02,
              ease: "power1.out",
              scrollTrigger: {
                trigger: section,
                start: "top 76%",
                end: "top 24%",
                scrub: 0.75,
              },
            },
          );
        }
      });

      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative min-h-screen overflow-x-clip text-zinc-100"
      style={{
        background: `radial-gradient(circle at 15% 10%, ${activeChapter.palette.to}22 0%, transparent 45%),
                     radial-gradient(circle at 85% 15%, ${activeChapter.palette.via}22 0%, transparent 55%),
                     linear-gradient(180deg, ${activeChapter.palette.from}, #010101 42%, #000 100%)`,
      }}
    >
      <div className="pointer-events-none fixed inset-0 opacity-80">
        <BackgroundLayerStack progress={scrollProgress} activePalette={activeChapter.palette} />
      </div>

      <CosmicAmbient progress={scrollProgress} activePalette={activeChapter.palette} />

      <div className="pointer-events-none fixed inset-0 opacity-[0.18]">
        <div className="grid-pattern h-full w-full" />
      </div>

      <audio ref={audioRef} src={backgroundMusic} aria-hidden="true" />

      <div className="pointer-events-none fixed left-0 top-0 z-40 h-1 w-full bg-white/5">
        <div
          className="h-full bg-white/80 transition-all duration-150"
          style={{ width: `${Math.max(1, scrollProgress * 100)}%` }}
        />
      </div>

      <header
        data-hero
        className="relative z-10 flex min-h-screen items-center px-4 py-20 sm:px-8 lg:px-12"
      >
        <div
          data-hero-inner
          className="mx-auto grid w-full max-w-7xl gap-8 rounded-3xl border border-white/10 bg-black/20 p-6 shadow-glow backdrop-blur md:grid-cols-[1.1fr_0.9fr] md:p-10"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/60">
              Scrollytelling • Leitura imersiva
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
              A história de um ser humano imortal.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              Uma jornada em segunda pessoa que começa com liberdade absoluta e termina
              no silêncio térmico do universo. Role para atravessar eras, perdas e o
              último fóton.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">
                {storyData.stats.storySegments} segmentos de história
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">
                {storyData.chapters.filter((item) => item.type === "story").length} capítulos
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">
                ~{Math.round(storyData.stats.durationSec / 60)} minutos de narrativa
              </span>
            </div>
          </div>

          <div className="relative min-h-[320px]">
            <div className="absolute inset-0 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]" />
            <div className="absolute inset-6 rounded-full border border-white/10" />
            <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20">
              <div className="absolute inset-2 rounded-full bg-white/5 blur-xl" />
            </div>
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
            <div className="absolute inset-x-8 bottom-8 rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                Pergunta central
              </p>
              <p className="mt-2 font-display text-2xl leading-tight text-white">
                E se você nunca pudesse morrer?
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 pb-24">
        {chaptersWithSegments.map((chapter, index) => {
          return (
            <section
              key={chapter.id}
              ref={(element) => {
                sectionRefs.current[index] = element;
              }}
              className="chapter-step relative px-4 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
            >
              <div className="chapter-shell mx-auto grid w-full max-w-7xl items-start gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12">
                <div className="lg:sticky lg:top-6">
                  <div className="h-[30vh] min-h-[220px] lg:h-[72vh]">
                    <ChapterScene chapter={chapter} index={index} />
                  </div>
                  <div className="mt-4 hidden text-xs uppercase tracking-[0.2em] text-white/45 lg:block">
                    Capítulo {index + 1}
                  </div>
                </div>

                <article className="pt-1">
                  <div className="chapter-title">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/55">
                      {chapter.label}
                    </p>
                    <h2 className="mt-3 font-display text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
                      {chapter.title}
                    </h2>
                  </div>

                  <div className="mt-6 h-px w-full max-w-3xl bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
                  <div className="mt-8 max-w-4xl space-y-3 sm:space-y-3.5">
                    {chapter.segments.map((segment) => (
                      <SegmentParagraph key={segment.id} segment={segment} />
                    ))}
                  </div>
                </article>
              </div>
            </section>
          );
        })}
      </main>

      <footer className="relative z-10 px-4 pb-20 pt-8 text-center sm:px-8 lg:px-12">
        <h2 className="mx-auto max-w-4xl font-display text-3xl leading-tight text-white sm:text-4xl">
          A imortalidade ainda parece um presente?
        </h2>
      </footer>
    </div>
  );
}

export default App;
