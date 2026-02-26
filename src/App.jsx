import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import storyData from "./data/immortalStory.json";
import backgroundMusic from "./data/background.optimized.mp3";

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

function hashString(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getSegmentPlacement(segment) {
  const hash = hashString(segment.id ?? String(segment.index ?? ""));
  return hash % 2 === 0 ? "left" : "right";
}

function getEmptinessFactor(activeChapterIndex) {
  const start = Math.max(0, chaptersWithSegments.length - 4);
  if (activeChapterIndex < start) return 0;
  return clamp01((activeChapterIndex - start + 1) / 4);
}

function useViewportFlags() {
  const [flags, setFlags] = useState(() => ({
    isMobile: false,
    reducedMotion: false,
  }));

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      setFlags({
        isMobile: mobileQuery.matches,
        reducedMotion: motionQuery.matches,
      });
    };

    update();
    mobileQuery.addEventListener?.("change", update);
    motionQuery.addEventListener?.("change", update);

    return () => {
      mobileQuery.removeEventListener?.("change", update);
      motionQuery.removeEventListener?.("change", update);
    };
  }, []);

  return flags;
}

function StarDustParticles({ activePalette, enabled }) {
  const [ParticlesComponent, setParticlesComponent] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    let mounted = true;

    (async () => {
      const [{ default: Particles, initParticlesEngine }, { loadSlim }] = await Promise.all([
        import("@tsparticles/react"),
        import("@tsparticles/slim"),
      ]);

      if (!mounted) return;
      setParticlesComponent(() => Particles);

      await initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      });

      if (mounted) setReady(true);
    })();

    return () => {
      mounted = false;
    };
  }, [enabled]);

  if (!enabled || !ready || !ParticlesComponent) {
    return null;
  }

  return (
    <ParticlesComponent
      id="star-dust"
      className="pointer-events-none fixed inset-0 z-[2] opacity-60"
      options={{
        fullScreen: { enable: false },
        fpsLimit: 40,
        detectRetina: false,
        background: { color: { value: "transparent" } },
        particles: {
          number: {
            value: 18,
            density: { enable: true, area: 1200 },
          },
          color: {
            value: [activePalette.accent, activePalette.to, "#ffffff"],
          },
          shape: { type: "circle" },
          opacity: {
            value: { min: 0.03, max: 0.16 },
            animation: {
              enable: true,
              speed: 0.35,
              minimumValue: 0.02,
              sync: false,
            },
          },
          size: {
            value: { min: 0.6, max: 2.2 },
            animation: {
              enable: true,
              speed: 1.1,
              minimumValue: 0.3,
              sync: false,
            },
          },
          move: {
            enable: true,
            speed: { min: 0.08, max: 0.35 },
            random: true,
            outModes: { default: "out" },
            direction: "none",
          },
          links: { enable: false },
        },
        interactivity: {
          detectsOn: "window",
          events: {
            onHover: { enable: false },
            onClick: { enable: false },
            resize: true,
          },
        },
      }}
    />
  );
}

function CosmicAmbient({ progress, activePalette, isMobile, emptiness }) {
  const orbitShift = (progress - 0.5) * 120;
  const fade = 1 - emptiness * 0.72;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden transition-opacity duration-700"
      style={{ opacity: isMobile ? 0.7 * fade : fade }}
    >
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

      {!isMobile ? (
        <div className="absolute inset-0">
          {cosmicStreaks.map((streak) => (
            <span
              key={streak.id}
              className="cosmic-streak absolute block"
              style={{
                top: `${streak.top}%`,
                left: `${streak.left}%`,
                width: `${streak.width}px`,
                opacity: streak.opacity * fade,
                transform: `rotate(${streak.angle}deg)`,
                animationDelay: `${streak.delay}s`,
                animationDuration: `${streak.duration}s`,
              }}
            />
          ))}
        </div>
      ) : null}

      <div
        className="cosmic-ring cosmic-ring-global-a absolute left-1/2 top-1/2 h-[62vw] w-[62vw] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{
          borderColor: `${activePalette.accent}14`,
          transform: `translate(-50%, -50%) rotate(${progress * 80}deg)`,
          opacity: isMobile ? 0.4 * fade : fade,
        }}
      />
      <div
        className="cosmic-ring cosmic-ring-global-b absolute left-1/2 top-1/2 h-[78vw] w-[78vw] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{
          borderColor: `${activePalette.to}12`,
          transform: `translate(-50%, -50%) rotate(${-progress * 56}deg)`,
          opacity: isMobile ? 0.28 * fade : 0.7 * fade,
        }}
      />
    </div>
  );
}

function BackgroundLayerStack({ progress, activePalette, isMobile, emptiness }) {
  const sceneCount = Math.max(1, backgroundScenes.length);
  const spacing = sceneCount > 1 ? 1 / (sceneCount - 1) : 1;
  const spread = spacing * 1.25;
  const fade = 1 - emptiness * 0.8;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-700"
      style={{ opacity: fade }}
    >
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
        const panX = baseX + local * (isMobile ? -14 : -24);
        const panY = baseY + local * (isMobile ? 8 : 14);
        const scale = scene.kind === "image" ? 1.05 + strength * 0.06 : 1.02 + strength * 0.04;
        const rotate = scene.kind === "image" ? local * 2.2 : local * 1.2;
        const opacity =
          strength * (scene.kind === "image" ? (isMobile ? 0.16 : 0.23) : isMobile ? 0.12 : 0.18);
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
                    className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${sceneIndex % 2 ? "bg-drift-reverse" : "bg-drift-forward"} ${isMobile ? "" : "bg-zoom-pulse"}`}
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
  const placement = getSegmentPlacement(segment);

  return (
    <div className={`segment-line segment-line-${placement} py-1.5`}>
      <p className="segment-burst text-white/78">
        <span className="segment-text block">{segment.text}</span>
      </p>
    </div>
  );
}

function App() {
  const rootRef = useRef(null);
  const sectionRefs = useRef([]);
  const audioRef = useRef(null);
  const lenisRef = useRef(null);
  const eraTransitionRef = useRef(null);
  const loadingOverlayRef = useRef(null);
  const [assetsReady, setAssetsReady] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { isMobile, reducedMotion } = useViewportFlags();

  const activeChapter = chaptersWithSegments[activeChapterIndex] ?? chaptersWithSegments[0];
  const emptiness = getEmptinessFactor(activeChapterIndex);

  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, chaptersWithSegments.length);
  }, []);

  useEffect(() => {
    let disposed = false;
    const minDelay = new Promise((resolve) => window.setTimeout(resolve, 700));
    const imagePreloads = backgroundImages.slice(0, Math.min(backgroundImages.length, 4)).map(
      (item) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = item.src;
        }),
    );

    const audio = audioRef.current;
    const audioReadyPromise = new Promise((resolve) => {
      if (!audio) return resolve(false);
      const done = () => {
        audio.removeEventListener("loadedmetadata", done);
        audio.removeEventListener("canplay", done);
        resolve(true);
      };
      audio.addEventListener("loadedmetadata", done, { once: true });
      audio.addEventListener("canplay", done, { once: true });
      window.setTimeout(done, 1200);
    });

    Promise.all([minDelay, audioReadyPromise, ...imagePreloads]).then(() => {
      if (!disposed) setAssetsReady(true);
    });

    return () => {
      disposed = true;
    };
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
    if (reducedMotion) return undefined;

    const lenis = new Lenis({
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: isMobile ? 0.42 : 0.5,
      touchMultiplier: isMobile ? 0.65 : 0.8,
      lerp: isMobile ? 0.075 : 0.05,
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
  }, [isMobile, reducedMotion]);

  useEffect(() => {
    if (!eraTransitionRef.current || reducedMotion) return;

    gsap.killTweensOf(eraTransitionRef.current);
    gsap.fromTo(
      eraTransitionRef.current,
      {
        opacity: 0,
        scale: 1.04,
        rotate: activeChapterIndex % 2 === 0 ? -1 : 1,
      },
      {
        opacity: 0.18,
        scale: 1,
        duration: 0.32,
        ease: "power2.out",
        yoyo: true,
        repeat: 1,
      },
    );
  }, [activeChapterIndex, reducedMotion]);

  useEffect(() => {
    if (!loadingOverlayRef.current) return;
    if (!assetsReady) return;

    gsap.to(loadingOverlayRef.current, {
      opacity: 0,
      duration: 0.65,
      ease: "power2.out",
      pointerEvents: "none",
    });
  }, [assetsReady]);

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

        if (scene && orb && !isMobile) {
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

        if (rings.length && !isMobile) {
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
                scrub: isMobile ? 0.55 : 0.75,
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
  }, [isMobile]);

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
      <div
        ref={eraTransitionRef}
        className="pointer-events-none fixed inset-0 z-[5] opacity-0"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${activeChapter.palette.to}22 0%, transparent 58%),
                       radial-gradient(circle at 20% 25%, ${activeChapter.palette.via}18 0%, transparent 55%),
                       linear-gradient(180deg, transparent 0%, ${activeChapter.palette.from}20 100%)`,
        }}
      />

      <div className="pointer-events-none fixed inset-0 opacity-80">
        <BackgroundLayerStack
          progress={scrollProgress}
          activePalette={activeChapter.palette}
          isMobile={isMobile}
          emptiness={emptiness}
        />
      </div>

      <CosmicAmbient
        progress={scrollProgress}
        activePalette={activeChapter.palette}
        isMobile={isMobile}
        emptiness={emptiness}
      />

      <StarDustParticles
        activePalette={activeChapter.palette}
        enabled={!isMobile && !reducedMotion && emptiness < 0.7}
      />

      <div
        className="pointer-events-none fixed inset-0"
        style={{ opacity: isMobile ? 0.12 : 0.18 - emptiness * 0.08 }}
      >
        <div className="grid-pattern h-full w-full" />
      </div>

      <audio ref={audioRef} src={backgroundMusic} aria-hidden="true" />

      <div
        ref={loadingOverlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      >
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Carregando</p>
          <p className="mt-4 font-display text-2xl text-white/80 sm:text-3xl">
            Ajustando o céu e o tempo...
          </p>
        </div>
      </div>

      <div className="pointer-events-none fixed left-0 top-0 z-40 h-1 w-full bg-white/5">
        <div
          className="h-full bg-white/80 transition-all duration-150"
          style={{ width: `${Math.max(1, scrollProgress * 100)}%` }}
        />
      </div>

      <header
        data-hero
        className="relative z-10 flex min-h-[90svh] items-center px-4 py-16 sm:px-8 sm:py-20 lg:min-h-screen lg:px-12"
      >
        <div
          data-hero-inner
          className="mx-auto grid w-full max-w-7xl gap-8 rounded-3xl border border-white/10 bg-black/15 p-5 shadow-glow backdrop-blur md:grid-cols-[1.1fr_0.9fr] md:p-10"
        >
          <div>
            <h1 className="font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
              A história de um ser humano imortal.
            </h1>
            <p className="mt-8 max-w-xl text-sm leading-relaxed text-white/58 sm:mt-9 sm:text-base lg:mt-10">
              Acompanhe a vida de alguém que venceu a morte e descobriu algo muito pior
              que ela.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5 text-xs sm:text-sm">
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

          <div className="relative hidden min-h-[320px] md:block">
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
          const chapterDepth = clamp01(index / Math.max(1, chaptersWithSegments.length - 1));
          const chapterEmptiness = chapterDepth > 0.65 ? (chapterDepth - 0.65) / 0.35 : 0;
          return (
            <section
              key={chapter.id}
              ref={(element) => {
                sectionRefs.current[index] = element;
              }}
              className="chapter-step relative px-4 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
            >
              <div className="chapter-shell mx-auto grid w-full max-w-[92rem] items-start gap-8 lg:grid-cols-[0.62fr_1.38fr] lg:gap-14">
                <div className="lg:sticky lg:top-6">
                  <div
                    className={`min-h-[200px] ${isMobile ? "h-[22vh]" : "h-[30vh]"} lg:h-[72vh]`}
                    style={{ opacity: 1 - chapterEmptiness * 0.55 }}
                  >
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

                  <div
                    className="mt-6 h-px w-full max-w-3xl bg-gradient-to-r from-white/20 via-white/5 to-transparent"
                    style={{ opacity: 1 - chapterEmptiness * 0.85 }}
                  />
                  <div
                    className="mt-8 grid max-w-6xl"
                    style={{
                      rowGap: `${1 + chapterEmptiness * 1.8}rem`,
                    }}
                  >
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

      <footer className="relative z-10 px-4 pb-28 pt-20 text-center sm:px-8 lg:px-12">
        <div className="mx-auto mb-16 h-px w-full max-w-sm bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <h2 className="mx-auto max-w-4xl font-display text-3xl leading-tight text-white/90 sm:text-4xl">
          A imortalidade ainda parece um presente?
        </h2>
      </footer>
    </div>
  );
}

export default App;
