import { useEffect, useRef } from "react";
import type { HeroSettings } from "../lib/types";

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? match[1] : null;
}

let ytApiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if ((window as any).YT?.Player) return Promise.resolve();
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve) => {
      const previous = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve();
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    });
  }
  return ytApiPromise;
}

function YouTubeBackground({ videoId, title }: { videoId: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !containerRef.current) return;

      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          fs: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: (event: any) => {
            const iframe = event.target.getIframe();
            iframe.setAttribute("title", title);
            iframe.className =
              "absolute left-1/2 top-1/2 h-[56.25vw] min-h-[120%] w-[177.78vh] min-w-[120%] -translate-x-1/2 -translate-y-1/2";
            iframe.style.pointerEvents = "none";
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.ENDED) {
              event.target.seekTo(0);
              event.target.playVideo();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
    };
  }, [videoId, title]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div ref={containerRef} />
    </div>
  );
}

export default function Hero({ hero }: { hero: HeroSettings }) {
  const youtubeId = hero.mode === "video" ? getYouTubeId(hero.videoUrl ?? "") : null;

  return (
    <section id="home" className="relative z-0 h-[88vh] min-h-[560px] w-full overflow-hidden">
      {hero.mode === "video" && youtubeId ? (
        <YouTubeBackground videoId={youtubeId} title={hero.title} />
      ) : hero.mode === "video" && hero.videoUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={hero.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          poster={hero.imageUrl}
        />
      ) : (
        <img
          src={hero.imageUrl}
          alt={hero.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center text-white">
        {hero.badge && (
          <p className="eyebrow mb-3 text-white/90 drop-shadow">{hero.badge}</p>
        )}
        <h1 className="font-display text-4xl leading-tight drop-shadow-lg md:text-6xl">
          {hero.title}
        </h1>
        {hero.subtitle && (
          <p className="mt-4 max-w-2xl text-base text-white/90 drop-shadow md:text-lg">
            {hero.subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
