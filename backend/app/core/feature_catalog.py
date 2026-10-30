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
     "description": "Choose the one soil type of the site."},
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
        return {"name": name, "kind": "binary", "group": "soil", "label": f"Soil Type {n}",
                "description": f"Soil type {n} (USFS Ecological Landtype Unit code).",
                "default": 1 if name == DEFAULT_SOIL else 0}

    # Unknown feature name: stay generic, never guess semantics.
    label = name.replace("_", " ")
    if is_continuous:
        return {"name": name, "kind": "continuous", "group": "other", "label": label,
                "unit": "", "description": "Numeric feature (no range information available).",
                "default": 0}
    return {"name": name, "kind": "binary", "group": "other", "label": label,
            "description": "Binary feature (0 or 1).", "default": 0}
