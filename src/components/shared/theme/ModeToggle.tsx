"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

function subscribeToTheme(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributeFilter: ["class"],
    attributes: true,
  });

  return () => observer.disconnect();
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerThemeSnapshot() {
  return false;
}

/** Reusable theme-detection hook, so any component (not just the standalone toggle button) can render theme-aware UI. */
export function useIsDarkTheme() {
  return useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);
}

/** Applies a theme both to `next-themes` and immediately to the DOM, avoiding a flash before the provider re-renders. */
export function applyTheme(nextTheme: "light" | "dark", setTheme: (theme: string) => void) {
  document.documentElement.classList.toggle("dark", nextTheme === "dark");
  document.documentElement.style.colorScheme = nextTheme;
  setTheme(nextTheme);
}

export function ModeToggle() {
  const { setTheme } = useTheme();
  const isDark = useIsDarkTheme();
  const label = `Switch to ${isDark ? "light" : "dark"} mode`;

  function toggleTheme() {
    applyTheme(isDark ? "light" : "dark", setTheme);
  }

  return (
    <Button
      aria-label={label}
      className="size-11 touch-manipulation sm:size-9"
      onClick={toggleTheme}
      size="icon"
      title={label}
      type="button"
      variant="ghost"
    >
      <Sun className="hidden size-4 dark:block" aria-hidden />
      <Moon className="size-4 dark:hidden" aria-hidden />
    </Button>
  );
}
