import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ThemeName, defaultTheme } from "./themes";

type ThemeSettings = {
  theme: ThemeName;
  contrast: "normal" | "high";
  motion: "normal" | "reduce";
  textSize: "normal" | "large" | "xl";
  textSpacing: "normal" | "increased";
};

type ThemeContextValue = {
  settings: ThemeSettings;
  setTheme: (theme: ThemeName) => void;
  updateSettings: (next: Partial<ThemeSettings>) => void;
};

const STORAGE_KEY = "accounts:theme-settings";

const fallbackSettings: ThemeSettings = {
  theme: defaultTheme,
  contrast: "normal",
  motion: "normal",
  textSize: "normal",
  textSpacing: "normal",
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const applySettings = (settings: ThemeSettings) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.setAttribute("data-theme", settings.theme);

  if (settings.contrast === "high") {
    root.setAttribute("data-contrast", "high");
  } else {
    root.removeAttribute("data-contrast");
  }

  if (settings.motion === "reduce") {
    root.setAttribute("data-motion", "reduce");
  } else {
    root.removeAttribute("data-motion");
  }

  if (settings.textSize === "large" || settings.textSize === "xl") {
    root.setAttribute("data-text-size", settings.textSize);
  } else {
    root.removeAttribute("data-text-size");
  }

  if (settings.textSpacing === "increased") {
    root.setAttribute("data-text-spacing", "increased");
  } else {
    root.removeAttribute("data-text-spacing");
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    if (typeof window === "undefined") return fallbackSettings;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return fallbackSettings;
      const parsed = JSON.parse(stored) as Partial<ThemeSettings>;
      return { ...fallbackSettings, ...parsed };
    } catch {
      return fallbackSettings;
    }
  });

  useEffect(() => {
    applySettings(settings);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  const setTheme = (theme: ThemeName) => {
    setSettings((current) => ({ ...current, theme }));
  };

  const updateSettings = (next: Partial<ThemeSettings>) => {
    setSettings((current) => ({ ...current, ...next }));
  };

  const value = useMemo(
    () => ({
      settings,
      setTheme,
      updateSettings,
    }),
    [settings],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
};
