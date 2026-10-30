import { useEffect, useState } from "react";
import { getHealth } from "../lib/api";

type State = "checking" | "ready" | "degraded" | "offline";

export default function BackendStatus() {
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    let cancelled = false;
    getHealth()
      .then((h) => !cancelled && setState(h.model_loaded ? "ready" : "degraded"))
      .catch(() => !cancelled && setState("offline"));
    return () => {
      cancelled = true;
    };
  }, []);

  const map = {
    checking: { dot: "bg-sage-400", text: "Checking service" },
    ready: { dot: "bg-forest-600", text: "Model ready" },
    degraded: { dot: "bg-amber-500", text: "Model not loaded" },
    offline: { dot: "bg-red-500", text: "Service offline" },
  }[state];

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-sage-200 bg-white px-3 py-1 text-xs font-medium text-forest-800" role="status">
      <span className={`h-2 w-2 rounded-full ${map.dot}`} aria-hidden />
      {map.text}
    </span>
  );
}
