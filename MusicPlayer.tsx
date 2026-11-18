"use client";

import { useEffect, useRef, useState } from "react";
import { Music2, X } from "lucide-react";

interface SpotifyEmbedController {
  addListener: (event: "ready", callback: () => void) => void;
  destroy: () => void;
  play: () => void;
}

interface SpotifyIframeApi {
  createController: (
    element: HTMLDivElement,
    options: { uri: string; width: string; height: string },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
    portfolioSpotifyIframeApi?: SpotifyIframeApi;
  }
}

const spotifyTrackUri = "spotify:track:7jm2PueKmv4EOHfdbdXMKT";
const spotifyIframeApiSrc = "https://open.spotify.com/embed/iframe-api/v1";

export default function MusicPlayer() {
  const [isHomeVisible, setIsHomeVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const homeSection = document.getElementById("home");
    if (!homeSection) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsHomeVisible(entry.isIntersecting);
    });

    observer.observe(homeSection);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const playerContainer = playerContainerRef.current;
    if (!playerContainer) return;

    let isMounted = true;
    let controller: SpotifyEmbedController | null = null;

    const initializePlayer = (api: SpotifyIframeApi) => {
      if (!isMounted || controller) return;

      api.createController(
        playerContainer,
        { uri: spotifyTrackUri, width: "100%", height: "152" },
        (embedController) => {
          if (!isMounted) {
            embedController.destroy();
            return;
          }

          controller = embedController;
          controller.addListener("ready", () => controller?.play());
        },
      );
    };

    window.onSpotifyIframeApiReady = (api) => {
      window.portfolioSpotifyIframeApi = api;
      initializePlayer(api);
    };

    if (window.portfolioSpotifyIframeApi) {
      initializePlayer(window.portfolioSpotifyIframeApi);
    } else if (!document.querySelector(`script[src="${spotifyIframeApiSrc}"]`)) {
      const script = document.createElement("script");
      script.src = spotifyIframeApiSrc;
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      isMounted = false;
      controller?.destroy();
    };
  }, []);

  const playerVisible = isHomeVisible && isOpen;

  return (
    <>
      <div
        aria-hidden={!playerVisible}
        inert={!playerVisible}
        className={`fixed bottom-16 right-5 z-[55] w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden rounded border border-amber-100/20 bg-[#211915] shadow-xl shadow-black/30 transition duration-200 ${
          playerVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <div className="border-b border-amber-100/10 px-3 py-2">
          <p className="text-xs text-[#f2e7d2]">Stacks from All Sides · SKAI ISYOURGOD</p>
          <p className="mt-1 font-mono text-[9px] text-amber-100/60">
            Press Play here if your browser blocks autoplay.
          </p>
        </div>
        <div ref={playerContainerRef} className="h-[152px] w-full" />
      </div>
      {isHomeVisible && (
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? "Minimize music player" : "Open Stacks from All Sides player"}
          aria-expanded={isOpen}
          className="fixed bottom-5 right-5 z-[55] flex h-8 w-8 items-center justify-center rounded-full border border-amber-100/20 bg-[#211915]/80 text-amber-100/70 opacity-70 transition hover:opacity-100 focus-visible:opacity-100"
        >
          {isOpen ? <X size={14} aria-hidden="true" /> : <Music2 size={14} aria-hidden="true" />}
        </button>
      )}
    </>
  );
}
