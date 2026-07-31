"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";

type SmoothHashLinkProps = ComponentProps<typeof Link>;

export function SmoothHashLink({ href, onClick, ...props }: SmoothHashLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      typeof href !== "string"
    ) {
      return;
    }

    const destination = new URL(href, window.location.href);
    const currentPage = `${window.location.pathname}${window.location.search}`;
    const destinationPage = `${destination.pathname}${destination.search}`;

    if (!destination.hash || destinationPage !== currentPage) {
      return;
    }

    const target = document.getElementById(decodeURIComponent(destination.hash.slice(1)));

    if (!target) {
      return;
    }

    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    window.history.pushState(null, "", `${destinationPage}${destination.hash}`);
  }

  return <Link href={href} onClick={handleClick} {...props} />;
}
