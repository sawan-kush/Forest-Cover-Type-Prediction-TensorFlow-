import { useEffect, useRef, useState } from "react";
import type { ForestType } from "../lib/forestData";
import ForestScene from "./ForestScene";

const pending = new Map<number, Promise<string[]>>();

/** Looks up the lead photograph of the forest's Wikipedia article(s). Cached per forest. */
function lookupPhotos(forest: ForestType): Promise<string[]> {
  let p = pending.get(forest.id);
  if (!p) {
    p = (async () => {
      for (const title of forest.wikiTitles) {
        try {
          const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
          if (!res.ok) continue;
          const j = await res.json();
          const thumb: string | undefined = j.thumbnail?.source;
          const orig: string | undefined = j.originalimage?.source;
          const out: string[] = [];
          if (thumb) out.push(thumb.replace(/\/\d+px-/, "/1280px-"));
          if (orig) out.push(orig);
          if (thumb) out.push(thumb);
          if (out.length) return out;
        } catch {
          /* try next title */
        }
      }
      return [] as string[];
    })();
    pending.set(forest.id, p);
  }
  return p;
}

interface Props {
  forest: ForestType;
  alt?: string;
  className?: string;
  eager?: boolean;
  zoom?: boolean;
}

/** Photograph for a forest type with graceful fallbacks: local file, Wikipedia photo, then an illustrated scene. */
export default function ForestImage({ forest, alt, className = "", eager = false, zoom = false }: Props) {
  // Extra (Wikipedia) photo URLs, remembered together with the forest they belong to.
  const [extra, setExtra] = useState<{ id: number; urls: string[] }>({ id: -1, urls: [] });
  // How many sources have failed for the current forest.
  const [failed, setFailed] = useState<{ id: number; n: number }>({ id: forest.id, n: 0 });
  // The exact URL that has finished loading. "Loaded" is derived from this (never reset in an effect),
  // so an image that finishes loading before React's effects run (e.g. a cached photo) is not missed.
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const sources = [forest.localImage, ...(extra.id === forest.id ? extra.urls : [])];
  const index = failed.id === forest.id ? failed.n : 0;
  const src: string | undefined = sources[index];
  const loaded = src !== undefined && loadedSrc === src;

  useEffect(() => {
    let off = false;
    lookupPhotos(forest).then((urls) => {
      if (!off) setExtra({ id: forest.id, urls });
    });
    return () => {
      off = true;
    };
  }, [forest]);

  // A cached image can already be complete when it mounts, before any onLoad handler can fire.
  useEffect(() => {
    const el = imgRef.current;
    if (src && el && el.complete && el.naturalWidth > 0) setLoadedSrc(src);
  }, [src]);

  // Only add `relative` when the caller hasn't positioned the wrapper itself.
  // Otherwise `relative` overrides `absolute inset-0` (Tailwind emits it later in the CSS),
  // which collapses the wrapper to zero height and hides the photo.
  const positioned = /(^|\s)(absolute|fixed|sticky|relative)(\s|$)/.test(className);

  return (
    <div className={`${positioned ? "" : "relative"} overflow-hidden bg-forest-900 ${className}`}>
      <ForestScene forest={forest} />
      {src && (
        <img
          key={src}
          ref={imgRef}
          src={src}
          alt={alt ?? `${forest.name} forest`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setLoadedSrc(src)}
          onError={() => {
            if (index > 0) console.warn(`[ForestSphere] could not load photo for ${forest.name}:`, src);
            setFailed({ id: forest.id, n: index + 1 });
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"} ${
            zoom && loaded ? "animate-slowZoom" : ""
          }`}
        />
      )}
    </div>
  );
}