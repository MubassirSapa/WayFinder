import { LEVEL_OPTIONS } from "../constants/buildings.constants";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export function levelToBadge(level: number): string {
  return LEVEL_OPTIONS.find((option) => option.value === level)?.badge ?? `L${level}`;
}

export function levelToLabel(level: number): string {
  return LEVEL_OPTIONS.find((option) => option.value === level)?.label ?? `Level ${level}`;
}

export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return "";

  const diff = Math.max(0, now - timestamp);

  if (diff < MINUTE) return "Just now";
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  if (diff < WEEK) {
    const days = Math.floor(diff / DAY);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  const weeks = Math.floor(diff / WEEK);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;

  return new Date(iso).toLocaleDateString();
}
