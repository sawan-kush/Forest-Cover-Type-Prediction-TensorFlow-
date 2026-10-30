"""Human-readable descriptions, groups and sensible ranges for the 54 features.

Feature NAMES and ORDER always come from model_metadata.pkl. This catalog only
adds presentation details (labels, units, hints) and input sanity limits, keyed
by feature name. It never defines, renames, removes or reorders features.
"""
import re
from typing import Optional

CLASS_NAMES = {
    1: "Spruce/Fir",
    2: "Lodgepole Pine",
    3: "Ponderosa Pine",
    4: "Cottonwood/Willow",
    5: "Aspen",
    6: "Douglas-fir",
    7: "Krummholz",
}

GROUPS = [
    {"id": "elevation", "title": "Elevation and Terrain", "input_type": "number",
     "description": "Height of the site above sea level."},
    {"id": "slope_aspect", "title": "Slope and Aspect", "input_type": "number",
     "description": "Steepness of the ground and the compass direction it faces."},
    {"id": "hydrology", "title": "Hydrological Features", "input_type": "number",
     "description": "Distance to the nearest surface water."},
    {"id": "distance", "title": "Road and Fire Distance", "input_type": "number",
     "description": "Distance to the nearest roadway and wildfire ignition point."},
    {"id": "hillshade", "title": "Hillshade Measurements", "input_type": "number",
     "description": "Sunlight index (0-255) at three times of day on the summer solstice."},
    {"id": "wilderness", "title": "Wilderness Area", "input_type": "one_hot",
     "description": "Choose the one wilderness area the site belongs to."},
    {"id": "soil", "title": "Soil Type", "input_type": "one_hot",
     "description": "Choose the soil that best matches the site. Soils are grouped by family."},
    {"id": "other", "title": "Other Features", "input_type": "number",
     "description": "Features not covered by the standard dataset description."},
]

# hard_min / hard_max: values outside are rejected.
# typical_min / typical_max: approximate range seen in the dataset; values
# outside only trigger a warning because the model has not seen such data.
# default: example starting value (approximate dataset average).
_CONTINUOUS = {
    "Elevation": dict(label="Elevation", group="elevation", unit="m", default=2960,
        hard_min=0, hard_max=9000, typical_min=1859, typical_max=3858,
        description="Elevation of the site in metres above sea level."),
    "Aspect": dict(label="Aspect", group="slope_aspect", unit="degrees", default=155,
        hard_min=0, hard_max=360, typical_min=0, typical_max=360,
        description="Compass direction the slope faces, as an azimuth (0 = north, 90 = east, 180 = south)."),
    "Slope": dict(label="Slope", group="slope_aspect", unit="degrees", default=14,
        hard_min=0, hard_max=90, typical_min=0, typical_max=66,
        description="Steepness of the terrain in degrees."),
    "Horizontal_Distance_To_Hydrology": dict(label="Horizontal distance to water", group="hydrology",
        unit="m", default=270, hard_min=0, hard_max=10000, typical_min=0, typical_max=1397,
        description="Horizontal distance to the nearest surface water feature."),
    "Vertical_Distance_To_Hydrology": dict(label="Vertical distance to water", group="hydrology",
        unit="m", default=46, hard_min=-2000, hard_max=2000, typical_min=-173, typical_max=601,
        description="Vertical distance to the nearest surface water feature. Negative means the water is below the site."),
    "Horizontal_Distance_To_Roadways": dict(label="Distance to nearest roadway", group="distance",
        unit="m", default=2350, hard_min=0, hard_max=20000, typical_min=0, typical_max=7117,
        description="Horizontal distance to the nearest roadway."),
    "Horizontal_Distance_To_Fire_Points": dict(label="Distance to nearest fire ignition point",
        group="distance", unit="m", default=1980, hard_min=0, hard_max=20000, typical_min=0,
        typical_max=7173, description="Horizontal distance to the nearest wildfire ignition point."),
    "Hillshade_9am": dict(label="Hillshade at 9 am", group="hillshade", unit="index 0-255", default=212,
        hard_min=0, hard_max=255, typical_min=0, typical_max=254,
        description="Hillshade index at 9 am on the summer solstice (0 = full shadow, 255 = full sun)."),
    "Hillshade_Noon": dict(label="Hillshade at noon", group="hillshade", unit="index 0-255", default=223,
        hard_min=0, hard_max=255, typical_min=0, typical_max=254,
        description="Hillshade index at noon on the summer solstice."),
    "Hillshade_3pm": dict(label="Hillshade at 3 pm", group="hillshade", unit="index 0-255", default=143,
        hard_min=0, hard_max=255, typical_min=0, typical_max=254,
        description="Hillshade index at 3 pm on the summer solstice."),
}

_WILDERNESS_NAMES = {1: "Rawah", 2: "Neota", 3: "Comanche Peak", 4: "Cache la Poudre"}
_WILDERNESS_RE = re.compile(r"^Wilderness_Area(\d+)$")
_SOIL_RE = re.compile(r"^Soil_Type(\d+)$")

# --------------------------------------------------------------------------- soil types
# Official USFS Ecological Landtype Unit descriptions for the 40 soil codes of the Covertype
# dataset (Blackard & Dean, Colorado State University). The model still receives the code
# (Soil_Type1..Soil_Type40); these names only change what the person sees.
_SOIL_NAMES = {
    1: "Cathedral family - Rock outcrop complex, extremely stony",
    2: "Vanet - Ratake families complex, very stony",
    3: "Haploborolis - Rock outcrop complex, rubbly",
    4: "Ratake family - Rock outcrop complex, rubbly",
    5: "Vanet family - Rock outcrop complex, rubbly",
    6: "Vanet - Wetmore families - Rock outcrop complex, stony",
    7: "Gothic family",
    8: "Supervisor - Limber families complex",
    9: "Troutville family, very stony",
    10: "Bullwark - Catamount families - Rock outcrop complex, rubbly",
    11: "Bullwark - Catamount families - Rock land complex, rubbly",
    12: "Legault family - Rock land complex, stony",
    13: "Catamount family - Rock land - Bullwark family complex, rubbly",
    14: "Pachic Argiborolis - Aquolis complex",
    15: "Unspecified in the USFS soil survey",
    16: "Cryaquolis - Cryoborolis complex",
    17: "Gateview family - Cryaquolis complex",
    18: "Rogert family, very stony",
    19: "Typic Cryaquolis - Borohemists complex",
    20: "Typic Cryaquepts - Typic Cryaquolls complex",
    21: "Typic Cryaquolls - Leighcan family, till substratum complex",
    22: "Leighcan family, till substratum, extremely bouldery",
    23: "Leighcan family, till substratum - Typic Cryaquolls complex",
    24: "Leighcan family, extremely stony",
    25: "Leighcan family, warm, extremely stony",
    26: "Granile - Catamount families complex, very stony",
    27: "Leighcan family, warm - Rock outcrop complex, extremely stony",
    28: "Leighcan family - Rock outcrop complex, extremely stony",
    29: "Como - Legault families complex, extremely stony",
    30: "Como family - Rock land - Legault family complex, extremely stony",
    31: "Leighcan - Catamount families complex, extremely stony",
    32: "Catamount family - Rock outcrop - Leighcan family complex, extremely stony",
    33: "Leighcan - Catamount families - Rock outcrop complex, extremely stony",
    34: "Cryorthents - Rock land complex, extremely stony",
    35: "Cryumbrepts - Rock outcrop - Cryaquepts complex",
    36: "Bross family - Rock land - Cryumbrepts complex, extremely stony",
    37: "Rock outcrop - Cryumbrepts - Cryorthents complex, extremely stony",
    38: "Leighcan - Moran families - Cryaquolls complex, extremely stony",
    39: "Moran family - Cryorthents - Leighcan family complex, extremely stony",
    40: "Moran family - Cryorthents - Rock land complex, extremely stony",
}

# Friendly groups used to organise the dropdown. This grouping is this app's own (based on the
# soil names above), not an official classification.
_SOIL_CATEGORY_RANGES = [
    ("Rocky and rubbly outcrop soils", [1, 2, 3, 4, 5, 6, 10, 11, 12, 13]),
    ("Other mountain soil families", [7, 8, 9, 15, 18]),
    ("Wet and boggy soils", [14, 16, 17, 19, 20]),
    ("Leighcan family soils", [21, 22, 23, 24, 25, 27, 28, 31, 32, 33]),
    ("Como, Granile and Legault soils", [26, 29, 30]),
    ("Cold, rocky high-mountain soils", [34, 35, 36, 37, 38, 39, 40]),
]
SOIL_CATEGORIES = {n: cat for cat, nums in _SOIL_CATEGORY_RANGES for n in nums}
assert sorted(SOIL_CATEGORIES) == list(range(1, 41)) == sorted(_SOIL_NAMES)

DEFAULT_WILDERNESS = "Wilderness_Area1"
DEFAULT_SOIL = "Soil_Type29"


def one_hot_group(name: str) -> Optional[str]:
    """Return 'wilderness' / 'soil' if the name belongs to a one-hot group."""
    if _WILDERNESS_RE.match(name):
        return "wilderness"
    if _SOIL_RE.match(name):
        return "soil"
    return None


def describe_feature(name: str, is_continuous: bool) -> dict:
    """Presentation + validation details for a single feature name."""
    if name in _CONTINUOUS:
        return {"name": name, "kind": "continuous", **_CONTINUOUS[name]}

    m = _WILDERNESS_RE.match(name)
    if m:
        n = int(m.group(1))
        area = _WILDERNESS_NAMES.get(n)
        return {"name": name, "kind": "binary", "group": "wilderness",
                "label": f"{area} Wilderness Area" if area else f"Wilderness Area {n}",
                "description": f"Wilderness area {n}" + (f" ({area})." if area else "."),
                "default": 1 if name == DEFAULT_WILDERNESS else 0}

    m = _SOIL_RE.match(name)
    if m:
        n = int(m.group(1))
        official = _SOIL_NAMES.get(n)
        return {"name": name, "kind": "binary", "group": "soil",
                "label": official or f"Soil Type {n}",
                "category": SOIL_CATEGORIES.get(n, "Other soils"),
                "description": (f"{official}. USFS Ecological Landtype Unit (dataset soil code {n})."
                                if official else f"Soil type {n} (USFS Ecological Landtype Unit code)."),
                "default": 1 if name == DEFAULT_SOIL else 0}

    # Unknown feature name: stay generic, never guess semantics.
    label = name.replace("_", " ")
    if is_continuous:
        return {"name": name, "kind": "continuous", "group": "other", "label": label,
                "unit": "", "description": "Numeric feature (no range information available).",
                "default": 0}
    return {"name": name, "kind": "binary", "group": "other", "label": label,
            "description": "Binary feature (0 or 1).", "default": 0}