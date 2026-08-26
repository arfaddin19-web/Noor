import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTheme, Theme } from "../theme";

const STORAGE_KEY = "noor.theme.mode";

export type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Deep-emerald dark is the app's default look; the user can switch to light
 *  from Settings, and the choice is remembered on-device. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === "light" || v === "dark") setModeState(v);
    });
  }, []);

  function setMode(next: ThemeMode) {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }

  const theme = useMemo(() => getTheme(mode), [mode]);
  const value = useMemo(() => ({ theme, mode, setMode }), [theme, mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx.theme;
}

export function useThemeMode(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeMode must be used within a ThemeProvider");
  return ctx;
}
