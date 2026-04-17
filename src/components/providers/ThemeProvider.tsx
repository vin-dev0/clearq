"use client";

import * as React from "react";
import { useAppStore } from "@/store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useAppStore();

  React.useEffect(() => {
    const root = document.documentElement;
    
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  return <>{children}</>;
}

