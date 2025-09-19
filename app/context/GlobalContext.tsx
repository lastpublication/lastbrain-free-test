"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";

interface GlobalContextValue {
  global: any;
  radius: string;
  variantBtn: string;
  variantComponent: string;
  radiusComponent: "none" | "sm" | "md" | "lg" | "full" | "2xl";
  setRadius: (v: "none" | "sm" | "md" | "lg" | "full") => void;
  setVariantBtn: (v: string) => void;
  setVariantComponent: (v: string) => void;
}

export const GlobalContext = createContext<GlobalContextValue | null>(null);

export function useGlobal() {
  const ctx = useContext(GlobalContext);
  if (!ctx) {
    throw new Error("useGlobal must be used within GlobalProvider");
  }
  return ctx;
}

// --- helpers thème ---------------------------------------------------------
function buildThemeCss(vars: any | undefined) {
  if (!vars || typeof vars !== "object") return "";

  const h1 = vars.h1 ?? "2rem";
  const h2 = vars.h2 ?? "1.5rem";
  const h3 = vars.h3 ?? "1.25rem";
  const radius = vars.radius ?? "md";
  const fontFamily =
    vars.fontFamily ??
    "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
  const colors = vars.colors || {};
  const light = colors.light || {};
  const dark = colors.dark || {};

  // Map radius token → real value
  const radiusScale: Record<string, string> = {
    none: "0px",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px",
  };
  const radiusValue = radiusScale[String(radius)] || String(radius);

  // We expose a neutral root + per-mode overrides
  const root =
    `:root{\n` +
    `  --lb-font-family: ${fontFamily};\n` +
    `  --lb-radius: ${radiusValue};\n` +
    `  --lb-h1: ${h1};\n` +
    `  --lb-h2: ${h2};\n` +
    `  --lb-h3: ${h3};\n` +
    `}`;

  const block = (mode: "light" | "dark", c: any) =>
    `html[data-theme='${mode}']{\n` +
    (c.background ? `  --lb-color-background: ${c.background};\n` : "") +
    (c.foreground ? `  --lb-color-foreground: ${c.foreground};\n` : "") +
    (c.default ? `  --lb-color-primary: ${c.default};\n` : "") +
    (c.secondary ? `  --lb-color-secondary: ${c.secondary};\n` : "") +
    (c.success ? `  --lb-color-success: ${c.success};\n` : "") +
    (c.warning ? `  --lb-color-warning: ${c.warning};\n` : "") +
    (c.danger ? `  --lb-color-danger: ${c.danger};\n` : "") +
    (c.content1 ? `  --lb-color-content1: ${c.content1};\n` : "") +
    (c.content2 ? `  --lb-color-content2: ${c.content2};\n` : "") +
    (c.content3 ? `  --lb-color-content3: ${c.content3};\n` : "") +
    `}`;

  const lightCss = block("light", light);
  const darkCss = block("dark", dark);

  // Small defaults styling hook you can use in your app CSS
  const helpers = `\n/* Optional helpers using the variables */\nbody{\n  font-family: var(--lb-font-family);\n  color: var(--lb-color-foreground, #111);\n  background: var(--lb-color-background, #fff);\n}\n.h1{ font-size: var(--lb-h1); }\n.h2{ font-size: var(--lb-h2); }\n.h3{ font-size: var(--lb-h3); }\n.rounded-theme{ border-radius: var(--lb-radius); }\n`;

  return [root, lightCss, darkCss, helpers].join("\n");
}

function applyThemeCss(
  cssVars: any | undefined,
  modeDefault: "light" | "dark" = "light"
) {
  if (typeof window === "undefined") return;
  const css = buildThemeCss(cssVars);
  const id = "lb-theme-style";
  let styleEl = document.getElementById(id) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = id;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = css;
  document.documentElement.setAttribute("data-theme", modeDefault);
}

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [global, setGlobal] = useState<any>(null);
  const [radius, setRadius] = useState<"none" | "sm" | "md" | "lg" | "full">(
    "md"
  );
  const [radiusComponent, setRadiusComponent] = useState<
    "none" | "sm" | "md" | "lg" | "full" | "2xl"
  >("md");
  const [variantBtn, setVariantBtn] = useState<string>("solid");
  const [variantComponent, setVariantComponent] = useState<string>("solid");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    // Bridge to Tailwind/HeroUI runtime vars as well
    root.style.setProperty("--lb-radius", radius as string);
    root.style.setProperty("--radius", radius as string);
    // Expose variants as data-attributes for styling hooks if needed
    root.setAttribute("data-variant-btn", variantBtn);
    root.setAttribute("data-variant-component", variantComponent);
  }, [radius, variantBtn, variantComponent]);

  const fetchInfo = useCallback(async () => {
    try {
      // On récupère la config publiée pour le domaine courant
      const host =
        typeof window !== "undefined" ? window.location.host : undefined;
      const url = `/api/settings`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching settings-domain:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchInfo().then((data) => {
      setGlobal(data);
      // Appliquer le thème si présent
      const cssVars = data?.theme?.css_vars;

      const mode = (cssVars?.mode_default === "dark" ? "dark" : "light") as
        | "light"
        | "dark";
      setRadius(cssVars?.radius ?? radius ?? "md");
      setRadiusComponent(
        cssVars?.radius === "full" ? "2xl" : cssVars?.radius || "md"
      );
      setVariantBtn(
        cssVars?.buttonVariant ?? cssVars?.variantBtn ?? variantBtn ?? "solid"
      );
      setVariantComponent(
        cssVars?.formVariant ??
          cssVars?.variantComponent ??
          variantComponent ??
          "solid"
      );
      applyThemeCss(cssVars, mode);
    });
  }, [fetchInfo]);

  return (
    <GlobalContext.Provider
      value={{
        global,
        radius,
        variantBtn,
        variantComponent,
        radiusComponent,
        setRadius,
        setVariantBtn,
        setVariantComponent,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
