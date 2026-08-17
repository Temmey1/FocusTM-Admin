"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle light/dark mode"
      className={`relative h-8 w-8 flex items-center justify-center text-ftm-muted hover:text-ftm-white transition-colors duration-200 ${className}`}
    >
      {theme === "dark" ? <Sun className="h-[16px] w-[16px]" /> : <Moon className="h-[16px] w-[16px]" />}
    </button>
  );
}
