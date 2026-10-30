import { useEffect, useState } from "react";
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
  const [sources, setSources] = useState<string[]>([forest.localImage]);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let off = false;
    setSources([forest.localImage]);
    setIndex(0);
    setLoaded(false);
    lookupPhotos(forest).then((w) => {
      if (!off) setSources([forest.localImage, ...w]);
    });
    return () => {
      off = true;
    };
  }, [forest]);

  const src = sources[index];

  return (
    <div className={`relative overflow-hidden bg-forest-900 ${className}`}>
      <ForestScene forest={forest} />
      {src && (
        <img
          key={src}
          src={src}
          alt={alt ?? `${forest.name} forest`}
          loading={eager ? "eager" : "lazy"}
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (index > 0) console.warn(`[ForestSphere] could not load photo for ${forest.name}:`, src);
            setLoaded(false);
            setIndex((i) => i + 1);
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"} ${
            zoom && loaded ? "animate-slowZoom" : ""
          }`}
        />
      )}
    </div>
  );
}