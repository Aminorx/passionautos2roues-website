import * as React from "react";
import { CustomThemeProvider } from "./custom-theme-provider";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: "dark" | "light" | "system";
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <CustomThemeProvider {...props}>{children}</CustomThemeProvider>;
}