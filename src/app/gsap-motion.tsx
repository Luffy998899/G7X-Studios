"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

export default function GsapMotion() {
  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".hero-badge", { y: 12, autoAlpha: 0, duration: 0.55 })
        .from(".hero-line > span", { yPercent: 110, duration: 0.9, stagger: 0.1 }, 0.1)
        .from(".hero-copy, .hero-actions, .hero-signals", { y: 18, autoAlpha: 0, duration: 0.65, stagger: 0.08 }, 0.45)
        .from(".hero-art", { x: 25, autoAlpha: 0, duration: 1, ease: "power2.out" }, 0.2);

    });

    return () => media.revert();
  });

  return null;
}
