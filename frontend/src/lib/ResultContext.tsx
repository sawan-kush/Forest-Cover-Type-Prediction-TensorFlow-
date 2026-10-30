import { createContext, useContext, useState, type ReactNode } from "react";
import type { PredictionResult } from "../types";

interface Ctx {
  result: PredictionResult | null;
  setResult: (r: PredictionResult | null) => void;
}

const ResultContext = createContext<Ctx | null>(null);
const KEY = "fct:lastResult";

function readStored(): PredictionResult | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PredictionResult) : null;
  } catch {
    return null;
  }
}

export function ResultProvider({ children }: { children: ReactNode }) {
  const [result, setState] = useState<PredictionResult | null>(readStored);
  const setResult = (r: PredictionResult | null) => {
    setState(r);
    try {
      if (r) sessionStorage.setItem(KEY, JSON.stringify(r));
      else sessionStorage.removeItem(KEY);
    } catch {
      /* storage unavailable */
    }
  };
  return <ResultContext.Provider value={{ result, setResult }}>{children}</ResultContext.Provider>;
}

export function useResult(): Ctx {
  const ctx = useContext(ResultContext);
  if (!ctx) throw new Error("useResult must be used inside ResultProvider");
  return ctx;
}
