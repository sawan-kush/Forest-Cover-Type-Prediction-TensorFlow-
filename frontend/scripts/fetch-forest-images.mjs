/**
 * Downloads one landscape photograph per forest type into public/forests/<slug>.jpg
 * so ForestSphere serves them from your own site (fast, offline-safe, never blocked).
 *
 * Run from the frontend folder:   node scripts/fetch-forest-images.mjs
 * Re-download everything:         node scripts/fetch-forest-images.mjs --force
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

const FORESTS = [
  { slug: "spruce-fir", titles: ["Picea engelmannii", "Abies lasiocarpa"] },
  { slug: "lodgepole-pine", titles: ["Pinus contorta"] },
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

/** Best landscape-looking photo among the images used on a Wikipedia article. */
async function bestFromArticle(title) {
  const params = new URLSearchParams({
    action: "query", format: "json", formatversion: "2", generator: "images", titles: title, gimlimit: "80",
    prop: "imageinfo", iiprop: "url|size|mime", iiurlwidth: "1600",
  });
  const j = await getJson(`https://en.wikipedia.org/w/api.php?${params}`);
  const pages = j.query?.pages ?? [];
  const scored = [];
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii || ii.mime !== "image/jpeg" || !ii.width || !ii.height) continue;
    const ratio = ii.width / ii.height;
    if (ii.width < 1400 || ratio < 1.25 || ratio > 2.4) continue;
    if (BAD.test(p.title)) continue;
    const score = (GOOD.test(p.title) ? 2 : 0) + Math.min(ii.width / 1600, 1);
    scored.push({ name: p.title, url: ii.thumburl || ii.url, score });
  }
  scored.sort((a, b) => b.score - a.score);
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
  const file = path.join(OUT, `${f.slug}.jpg`);
  if (existsSync(file) && !FORCE) {
    console.log(`= ${f.slug}: already exists (use --force to replace)`);
    continue;
  }
  let done = false;
  for (const mode of ["landscape", "lead"]) {
    for (const title of f.titles) {
      try {
        const pick = mode === "landscape" ? await bestFromArticle(title) : await leadPhoto(title);
        await sleep(400);
        if (!pick) continue;
        await download(pick.url, file);
        console.log(`✓ ${f.slug}: ${pick.name}  [${title}]`);
        done = true;
        break;
      } catch (e) {
        console.log(`  ${f.slug}: ${title} -> ${e.message}`);
      }
    }
    if (done) break;
  }
  if (!done) {
    failed++;
    console.log(`✗ ${f.slug}: no photo downloaded. Put your own picture at public/forests/${f.slug}.jpg`);
  }
}

console.log(failed ? `\nFinished with ${failed} missing photo(s).` : "\nAll seven forest photos are ready in public/forests/.");