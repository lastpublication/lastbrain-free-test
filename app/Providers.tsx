"use client";
import { ThemeProvider, ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}
export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
    </ThemeProvider>
  );
}
