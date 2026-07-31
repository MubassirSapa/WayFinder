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

export function ModeToggle() {
  const { setTheme } = useTheme();
  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const label = `Switch to ${isDark ? "light" : "dark"} mode`;

  function toggleTheme() {
    const nextTheme = isDark ? "light" : "dark";

    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.style.colorScheme = nextTheme;
    setTheme(nextTheme);
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
