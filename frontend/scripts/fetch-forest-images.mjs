/**
 * Downloads one landscape photograph per forest type into public/forests/<slug>.jpg
 * so ForestSphere serves them from your own site (fast, offline-safe, never blocked).
 *
 * Run from the frontend folder:   node scripts/fetch-forest-images.mjs
 * Re-download everything:         node scripts/fetch-forest-images.mjs --force
 * Re-download just one forest:     node scripts/fetch-forest-images.mjs --force --only lodgepole-pine
 *
 * Photos come from the Wikipedia/Wikimedia Commons articles listed below. The script
 * prints which file it picked for each forest; replace any you dislike by dropping
 * your own picture at public/forests/<slug>.jpg.
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "forests");
const UA = "ForestSphere/1.0 (student project; one-time image download script)";
const FORCE = process.argv.includes("--force");
const ONLY = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;

/**
 * Optional per-forest settings:
 *   sources : [{ host, title }] places to look for photos (default: the English Wikipedia article `titles`)
 *   prefer  : words in a photo's file name/description that make it a better match
 *   avoid   : words that disqualify a photo (wrong habitat, close-ups, ...)
 *   strict  : never fall back to an article's lead photo, which may show the wrong habitat
 */
const FORESTS = [
  { slug: "spruce-fir", titles: ["Picea engelmannii", "Abies lasiocarpa"] },
  {
    // The old pick was the Mendocino *pygmy* forest (a stunted coastal California bog), not a Rocky Mountain
    // lodgepole forest. Use the Commons gallery for the Rocky Mountain subspecies (latifolia) instead.
    slug: "lodgepole-pine",
    titles: ["Pinus contorta"],
    sources: [
      { host: "commons.wikimedia.org", title: "Pinus contorta subsp. latifolia" },
      { host: "commons.wikimedia.org", title: "Category:Pinus contorta subsp. latifolia" },
      { host: "en.wikipedia.org", title: "Lodgepole pine" },
    ],
    prefer: /latifolia|rocky mountain|colorado|wyoming|montana|yellowstone|sprague|shoshone|teton|lodgepole|forest|stand|landscape|mountain/i,
    avoid: /pygmy|mendocino|bolander|muskeg|anacortes|shore pine|coast|pacific rim|wrangell|beach|bog|dune|dwarf|lembert|cultivat|garden|arboretum|nursery|new zealand|bonsai|foliage|cone|needle|bark|seedling|sapling|stump|roots|trunk|close|detail/i,
    strict: true,
  },
  { slug: "ponderosa-pine", titles: ["Pinus ponderosa"] },
  { slug: "cottonwood-willow", titles: ["Populus deltoides subsp. monilifera", "Populus deltoides", "Populus angustifolia"] },
  { slug: "aspen", titles: ["Populus tremuloides"] },
  { slug: "douglas-fir", titles: ["Pseudotsuga menziesii"] },
  { slug: "krummholz", titles: ["Krummholz"] },
];

const BAD = /cone|bark|leaf|leaves|needle|seed|branch|flower|catkin|wood\b|map|range|distribution|herbarium|illustration|drawing|stamp|logo|icon|symbol|diagram|plate|botanical|twig|shoot|bud|fruit|pollen|trunk|section|ring|detail|close|infested|beetle|damage|blight/i;
const GOOD = /forest|stand|grove|woods|woodland|landscape|mountain|lake|valley|trail|national|park|treeline|alpine|autumn|fall/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return r.json();
}

const stripHtml = (h = "") => h.replace(/<[^>]*>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();

/**
 * Best landscape-looking photo on a wiki page (article or Commons gallery) or in a Commons category.
 * Each photo is judged by its file name AND its description, so "Forest, Sprague Lake, Rocky Mountain
 * National Park" beats "Mendocino pygmy forest" even though both file names look harmless.
 */
async function bestFromSource(host, title, opts = {}) {
  const isCategory = /^Category:/i.test(title);
  const params = new URLSearchParams({
    action: "query", format: "json", formatversion: "2",
    prop: "imageinfo", iiprop: "url|size|mime|extmetadata", iiurlwidth: "1600",
  });
  if (isCategory) {
    params.set("generator", "categorymembers");
    params.set("gcmtitle", title);
    params.set("gcmtype", "file");
    params.set("gcmlimit", "100");
  } else {
    params.set("generator", "images");
    params.set("titles", title);
    params.set("gimlimit", "100");
  }
  const j = await getJson(`https://${host}/w/api.php?${params}`);
  const pages = j.query?.pages ?? [];
  const scored = [];
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii || ii.mime !== "image/jpeg" || !ii.width || !ii.height) continue;
    const ratio = ii.width / ii.height;
    if (ii.width < 1400 || ratio < 1.25 || ratio > 2.4) continue;
    const text = `${p.title} ${stripHtml(ii.extmetadata?.ImageDescription?.value)} ${stripHtml(ii.extmetadata?.ObjectName?.value)}`;
    if (BAD.test(p.title) || (opts.avoid && opts.avoid.test(text))) continue;
    const wanted = opts.prefer ?? GOOD;
    const score = (wanted.test(text) ? 2 : 0) + (GOOD.test(p.title) ? 0.5 : 0) + Math.min(ii.width / 1600, 1);
    scored.push({ name: p.title, url: ii.thumburl || ii.url, score });
  }
  scored.sort((x, y) => y.score - x.score);
  return scored[0] ?? null;
}

/** Fallback: the article's lead photograph. */
async function leadPhoto(title) {
  const j = await getJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`);
  const t = j.thumbnail?.source;
  return t ? { name: `${title} (lead photo)`, url: t.replace(/\/\d+px-/, "/1280px-") } : null;
}

async function download(url, file) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  const type = r.headers.get("content-type") ?? "";
  if (!r.ok || !type.startsWith("image/")) throw new Error(`download failed (${r.status} ${type})`);
  await writeFile(file, Buffer.from(await r.arrayBuffer()));
}

await mkdir(OUT, { recursive: true });
let failed = 0;

for (const f of FORESTS) {
  if (ONLY && f.slug !== ONLY) continue;
  const file = path.join(OUT, `${f.slug}.jpg`);
  if (existsSync(file) && !FORCE) {
    console.log(`= ${f.slug}: already exists (use --force to replace)`);
    continue;
  }
  const sources = f.sources ?? f.titles.map((t) => ({ host: "en.wikipedia.org", title: t }));
  let done = false;
  for (const mode of f.strict ? ["landscape"] : ["landscape", "lead"]) {
    for (const src of sources) {
      try {
        const pick = mode === "landscape" ? await bestFromSource(src.host, src.title, f) : await leadPhoto(src.title);
        await sleep(400);
        if (!pick) continue;
        await download(pick.url, file);
        console.log(`✓ ${f.slug}: ${pick.name}  [${src.title}]`);
        done = true;
        break;
      } catch (e) {
        console.log(`  ${f.slug}: ${src.title} -> ${e.message}`);
      }
    }
    if (done) break;
  }
  if (!done) {
    failed++;
    console.log(`✗ ${f.slug}: no suitable photo found. Put your own picture at public/forests/${f.slug}.jpg`);
  }
}

console.log(failed ? `\nFinished with ${failed} missing photo(s).` : "\nDone: forest photos are ready in public/forests/.");