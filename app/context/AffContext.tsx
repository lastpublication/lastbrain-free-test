"use client";
import { createContext, useEffect, useMemo, useState } from "react";
import { useGlobal } from "./GlobalContext";
import { Loading } from "../components/Loading";

export const AffContext = createContext<any>(null);

export default function AffProvider({ initial, children }: any) {
  const [aff, setAff] = useState(initial);
  const { global } = useGlobal();
  useEffect(() => {
    if (aff) {
      try {
        localStorage.setItem("lb_aff", JSON.stringify(aff));
      } catch {}
    } else {
      // fallback si cookie pas lisible en front (rare)
      const ls = localStorage.getItem("lb_aff");
      if (ls) setAff(JSON.parse(ls));
    }
  }, [aff]);
  const value = useMemo(() => aff, [aff]);

  if (!global) return <Loading />;

  return <AffContext.Provider value={value}>{children}</AffContext.Provider>;
}
