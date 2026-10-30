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
    checking: { dot: "bg-sage-400", text: "Connecting" },
    ready: { dot: "bg-forest-500", text: "Service online" },
    degraded: { dot: "bg-amber-400", text: "Service starting" },
    offline: { dot: "bg-red-400", text: "Service offline" },
  }[state];

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-forest-100" role="status">
      <span className={`h-2 w-2 rounded-full ${map.dot}`} aria-hidden />
      {map.text}
    </span>
  );
}