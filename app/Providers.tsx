"use client";
import { ToastProvider } from "@heroui/react";
import { ThemeProvider, ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}
export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NextThemesProvider {...themeProps}>
        <ToastProvider
          maxVisibleToasts={3}
          placement="bottom-right"
          toastProps={{
            radius: "lg",
            color: "default",

            variant: "flat",

            classNames: {
              base: "w-full min-w-96",
              closeButton:
                "opacity-100 absolute right-4 top-1/2 -translate-y-1/2 ",
            },
          }}
        />

        {children}
      </NextThemesProvider>
    </ThemeProvider>
  );
}
