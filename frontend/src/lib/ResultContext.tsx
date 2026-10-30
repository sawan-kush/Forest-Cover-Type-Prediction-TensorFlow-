import { createContext, useContext, useState, type ReactNode } from "react";
import type { PredictionResult, SiteItem } from "../types";

interface Report {
  result: PredictionResult;
  site: SiteItem[];
}

interface Ctx {
  result: PredictionResult | null;
  site: SiteItem[];
  setReport: (r: Report | null) => void;
}

const ResultContext = createContext<Ctx | null>(null);
const KEY = "forestsphere:lastReport";

function readStored(): Report | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Report) : null;
  } catch {
    return null;
  }
}

export function ResultProvider({ children }: { children: ReactNode }) {
  const [report, setState] = useState<Report | null>(readStored);
  const setReport = (r: Report | null) => {
    setState(r);
    try {
      if (r) sessionStorage.setItem(KEY, JSON.stringify(r));
      else sessionStorage.removeItem(KEY);
    } catch {
      /* storage unavailable */
    }
  };
  return (
    <ResultContext.Provider value={{ result: report?.result ?? null, site: report?.site ?? [], setReport }}>
      {children}
    </ResultContext.Provider>
  );
}

export function useResult(): Ctx {
  const ctx = useContext(ResultContext);
  if (!ctx) throw new Error("useResult must be used inside ResultProvider");
  return ctx;
}