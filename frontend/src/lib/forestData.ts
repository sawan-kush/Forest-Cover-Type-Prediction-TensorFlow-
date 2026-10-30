/**
 * ForestSphere forest information database.
 * One entry per cover class (1-7). Edit text here; nothing else needs to change.
 *
 * Photographs: each forest is mapped to the Wikipedia article(s) listed in `wikiTitles`.
 * The lead photograph of the first article that has one is loaded at runtime
 * (see components/ForestImage.tsx). To use your own picture instead, drop a file at
 * `public/forests/<slug>.jpg` — `localImage` is always tried first.
 */
export interface ForestType {
  id: number;
  slug: string;
  name: string;
  scientificName: string;
  tagline: string;
  description: string;
  distribution: string;
  climate: string;
  elevation: string;
  soilTerrain: string;
  ecologicalImportance: string;
  facts: string[];
  keySpecies: string[];
  zone: string;
  accent: string;
  scene: "conifer" | "deciduous" | "riparian" | "stunted";
  localImage: string;
  wikiTitles: string[];
}

export const FORESTS: ForestType[] = [
  {
    id: 1,
    slug: "spruce-fir",
    name: "Spruce/Fir",
    scientificName: "Picea engelmannii (Engelmann spruce) and Abies lasiocarpa (subalpine fir)",
    tagline: "Cold, snowy forests of the high mountains",
    description:
      "Dense, dark forests of Engelmann spruce and subalpine fir that cloak the high mountain slopes below the treeline. Deep snow, short summers and long winters shape everything that lives here.",
    distribution:
      "Across the Rocky Mountains, from western Canada south through the western United States. In Colorado it is one of the most extensive forest types, covering roughly a fifth of the state's forests.",
    climate: "Cold and snowy, with long winters, cool summers and a short growing season.",
    elevation: "In Colorado, typically above about 2,700 m (9,000 ft), up to near the treeline at roughly 3,500 m (11,500 ft).",
    soilTerrain: "Cool, moist mountain slopes and valley bottoms where snow lies for months; soils are rich in decaying organic matter.",
    ecologicalImportance:
      "Spruce-fir forests act as natural water towers: they hold snow, slow its melt and feed the headwaters of major rivers. They shelter wildlife such as elk, snowshoe hare and Canada lynx, and store large amounts of carbon in long-lived trees.",
    facts: [
      "Both trees tolerate shade, so seedlings can grow beneath the existing canopy and slowly replace older trees.",
      "Subalpine fir can reproduce by layering: low branches that touch the ground may take root.",
      "Subalpine fir rarely lives much beyond about 300 years, while Engelmann spruce can live considerably longer.",
      "Engelmann spruce wood is valued for the soundboards of musical instruments.",
    ],
    keySpecies: ["Engelmann spruce", "Subalpine fir"],
    zone: "Subalpine",
    accent: "#2f6b57",
    scene: "conifer",
    localImage: "/forests/spruce-fir.jpg",
    wikiTitles: ["Picea_engelmannii", "Abies_lasiocarpa"],
  },
  {
    id: 2,
    slug: "lodgepole-pine",
    name: "Lodgepole Pine",
    scientificName: "Pinus contorta var. latifolia",
    tagline: "The fire-born pine of the Rockies",
    description:
      "Tall, slender pines that often grow in dense, even-aged stands of almost identical trees, especially on ground that has been cleared by wildfire.",
    distribution:
      "Widespread across western North America, from the Yukon in the north to Colorado in the south. It is the provincial tree of Alberta, Canada.",
    climate: "Cold winters and moderate precipitation; the species copes with a wide range of mountain conditions.",
    elevation: "In Colorado's northern Rockies, commonly about 2,400–3,050 m (8,000–10,000 ft).",
    soilTerrain: "Mountain slopes and plateaus on a wide variety of soils, including poor, gravelly or sandy, well-drained ground.",
    ecologicalImportance:
      "A pioneer species that quickly re-colonises burned ground. Its stands provide cover and food for wildlife and, over time, often shelter young spruce and fir that eventually replace it. Its timber is widely used, and its forests are strongly shaped by wildfire and mountain pine beetle outbreaks.",
    facts: [
      "Many cones are serotinous: sealed with resin until the heat of a fire opens them and releases the seeds.",
      "The name is commonly linked to its straight trunks, used as lodge poles for tipis.",
      "Its needles grow in bundles of two.",
      "Outside its home range it has been introduced to New Zealand, where it is regarded as an invasive plant.",
    ],
    keySpecies: ["Lodgepole pine"],
    zone: "Montane to subalpine",
    accent: "#6f8f3a",
    scene: "conifer",
    localImage: "/forests/lodgepole-pine.jpg",
    wikiTitles: ["South_Central_Rockies_forests", "Lodgepole_pine"],
  },
  {
    id: 3,
    slug: "ponderosa-pine",
    name: "Ponderosa Pine",
    scientificName: "Pinus ponderosa",
    tagline: "Open, sunny pine woodlands of the foothills",
    description:
      "Tall pines with orange-brown, plate-like bark and long needles, usually growing in open, park-like stands with grasses and wildflowers beneath them.",
    distribution:
      "Western North America, from southwestern Canada through the western United States into northern Mexico, reaching east to the edge of the Great Plains.",
    climate: "Warm, dry summers and cool winters; among the more drought-tolerant conifers of the region.",
    elevation: "In Colorado, mostly in the foothills and lower montane zone, roughly 1,800–2,700 m (6,000–9,000 ft).",
    soilTerrain: "Dry, sunny, well-drained slopes, ridges and south-facing hillsides.",
    ecologicalImportance:
      "Open ponderosa forests historically burned often in low-intensity surface fires that cleared the undergrowth. They provide habitat for mule deer, wild turkey and many cavity-nesting birds, and supply valuable timber.",
    facts: [
      "The bark of mature trees breaks into puzzle-like plates that many people say smell of vanilla or butterscotch.",
      "Thick bark helps mature trees survive surface fires.",
      "Needles are long, about 12–25 cm (5–10 in), in bundles of two or three.",
      "It often sits just below Douglas-fir and spruce-fir forests as you climb a mountain.",
    ],
    keySpecies: ["Ponderosa pine"],
    zone: "Foothills and lower montane",
    accent: "#b0703a",
    scene: "conifer",
    localImage: "/forests/ponderosa-pine.jpg",
    wikiTitles: ["Pinus_ponderosa"],
  },
  {
    id: 4,
    slug: "cottonwood-willow",
    name: "Cottonwood/Willow",
    scientificName: "Populus spp. (e.g. Populus deltoides subsp. monilifera, Populus angustifolia) and Salix spp.",
    tagline: "Green ribbons of forest along the water",
    description:
      "Streamside woodlands of cottonwoods and willows that follow rivers, creeks and wet bottomlands, often forming narrow green corridors through otherwise dry country.",
    distribution:
      "Along rivers and streams across the foothills of the Rocky Mountains and the plains of western North America.",
    climate: "Found in many climates, because these trees depend on water in the soil rather than on rainfall alone.",
    elevation: "Generally the lowest-elevation forest type of the region, on valley-bottom streams below the foothill pine forests. The exact range varies from river to river.",
    soilTerrain: "Floodplains, stream banks and bottomlands with moist, sandy or gravelly soil and a high water table.",
    ecologicalImportance:
      "Among the most biologically rich habitats in dry landscapes: shade that keeps streams cooler, nesting and migration habitat for birds, and roots that hold stream banks together against erosion.",
    facts: [
      "Cottonwoods are named for the cotton-like fluff that carries their seeds on the wind.",
      "Cottonwood seedlings usually need bare, moist ground, often created by floods.",
      "Willows grow quickly, and broken twigs can sometimes root where they land.",
    ],
    keySpecies: ["Plains cottonwood", "Narrowleaf cottonwood", "Willows"],
    zone: "Valley bottoms and streams",
    accent: "#4f8a8b",
    scene: "riparian",
    localImage: "/forests/cottonwood-willow.jpg",
    wikiTitles: ["Populus_deltoides_subsp._monilifera", "Populus_deltoides"],
  },
  {
    id: 5,
    slug: "aspen",
    name: "Aspen",
    scientificName: "Populus tremuloides (quaking aspen)",
    tagline: "Golden groves that shimmer in the wind",
    description:
      "Pale-barked broadleaf trees whose round leaves flutter at the slightest breeze and turn brilliant yellow in autumn.",
    distribution:
      "It has the broadest natural range of any tree in North America, from Alaska and Canada across the northern United States and south along the Rockies into Mexico.",
    climate: "Cool climates with cold winters and reliable moisture, though the species tolerates a wide range of conditions.",
    elevation: "In Colorado, commonly about 2,100–3,400 m (7,000–11,000 ft).",
    soilTerrain: "Moist, well-drained mountain soils, often in openings or on ground that has been disturbed by fire or logging.",
    ecologicalImportance:
      "Aspen groves support some of the richest plant and wildlife communities in the Rockies, including elk, deer, beaver and many birds. They regrow quickly after fire and add variety to landscapes otherwise dominated by conifers.",
    facts: [
      "Aspen spread mainly by root suckers, so a whole grove is often a single genetic individual.",
      "Pando, a clonal aspen colony in Utah, is considered one of the largest known organisms by mass.",
      "The greenish-white bark can photosynthesise.",
      "Flattened leaf stalks make the leaves tremble, which gives the tree its name.",
    ],
    keySpecies: ["Quaking aspen"],
    zone: "Montane to subalpine",
    accent: "#d4a017",
    scene: "deciduous",
    localImage: "/forests/aspen.jpg",
    wikiTitles: ["Populus_tremuloides"],
  },
  {
    id: 6,
    slug: "douglas-fir",
    name: "Douglas-fir",
    scientificName: "Pseudotsuga menziesii (Rocky Mountain form: var. glauca)",
    tagline: "Resilient evergreens of the montane slopes",
    description:
      "Evergreen conifers with deeply furrowed bark and distinctive cones whose bracts poke out like small three-pointed tongues. In the Rockies they often grow on cooler, shadier slopes.",
    distribution:
      "Western North America, from British Columbia south to central Mexico. The Rocky Mountain form grows inland, while a taller coastal form grows along the Pacific coast.",
    climate: "Needs more moisture than ponderosa pine but less than the high spruce-fir forests, and tolerates cold winters.",
    elevation: "In Colorado, mainly the montane zone, roughly 1,800–2,900 m (6,000–9,500 ft).",
    soilTerrain: "Well-drained soils on cooler, moister slopes, especially north-facing ones; often mixed with ponderosa pine on drier sites.",
    ecologicalImportance:
      "An important timber tree and a source of shelter and nesting sites for wildlife. Older trees have thick bark that helps them withstand surface fires.",
    facts: [
      "It is not a true fir. The genus name Pseudotsuga means \"false hemlock\".",
      "Its cones' protruding bracts are the subject of a well-known \"mouse tail\" folk story.",
      "Coastal Douglas-firs are among the tallest trees in the world, exceeding 90 m, though the Rocky Mountain form is smaller.",
    ],
    keySpecies: ["Douglas-fir"],
    zone: "Montane",
    accent: "#2b7a4f",
    scene: "conifer",
    localImage: "/forests/douglas-fir.jpg",
    wikiTitles: ["Pseudotsuga_menziesii"],
  },
  {
    id: 7,
    slug: "krummholz",
    name: "Krummholz",
    scientificName: "Not a single species — stunted subalpine conifers such as Picea engelmannii and Abies lasiocarpa",
    tagline: "Wind-sculpted trees at the edge of the treeline",
    description:
      "Twisted, stunted trees at the upper edge of the forest, bent and shaped by wind, ice and extreme cold into low mats or flag-shaped forms.",
    distribution:
      "Found at the treeline of mountain ranges around the world. In the Rockies it is formed mainly by spruce and fir.",
    climate: "Harsh: strong winds, deep cold, blowing ice crystals and a very short growing season.",
    elevation: "In Colorado, around the treeline at roughly 3,400–3,700 m (about 11,000–12,000 ft).",
    soilTerrain: "Exposed ridges and windswept slopes with thin, rocky soils, near the transition to alpine tundra.",
    ecologicalImportance:
      "Krummholz marks the transition between forest and alpine tundra. Its dense mats trap snow, shelter small animals and help protect fragile alpine soils, and scientists watch treeline positions for signs of changing conditions.",
    facts: [
      "The word is German for \"crooked wood\".",
      "Wind and ice often kill buds on the exposed side, leaving \"flag trees\" with branches on one side only.",
      "Branches that touch the ground can root, letting a mat slowly spread.",
      "A knee-high tree can be far older than its size suggests.",
    ],
    keySpecies: ["Stunted Engelmann spruce", "Stunted subalpine fir"],
    zone: "Treeline",
    accent: "#7a8d6e",
    scene: "stunted",
    localImage: "/forests/krummholz.jpg",
    wikiTitles: ["Krummholz"],
  },
];

export const FOREST_BY_ID: Record<number, ForestType> = Object.fromEntries(FORESTS.map((f) => [f.id, f]));
export const getForest = (id: number): ForestType | undefined => FOREST_BY_ID[id];