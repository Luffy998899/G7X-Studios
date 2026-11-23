"use client";

import { useEffect } from "react";

export default function SectionNavigation() {
  useEffect(() => {
    function cleanUrl() {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>("a[href*='#']");
      if (!link || link.target || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
      cleanUrl();
    }

    document.addEventListener("click", onClick);
    if (window.location.hash) {
      const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (target) requestAnimationFrame(() => { target.scrollIntoView({ block: "start" }); cleanUrl(); });
    }
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
