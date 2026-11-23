"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { MotionConfig, motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { ArrowUpRight } from "lucide-react";

export type Project = {
  name: string;
  summary: string;
  url: string;
  display?: string;
  image: string;
  accent: string;
  objectPosition?: string;
  mobileObjectPosition?: string;
  objectFit?: "cover" | "contain";
  imageBackground?: string;
};

function imageStyle(project: Project): CSSProperties {
  return {
    "--image-position": project.objectPosition ?? "center top",
    "--mobile-image-position": project.mobileObjectPosition ?? project.objectPosition ?? "center top",
    "--image-fit": project.objectFit ?? "cover",
    "--image-background": project.imageBackground ?? "transparent",
  } as CSSProperties;
}

type ProjectDeckProps = {
  projects: Project[];
  ground?: string;
  className?: string;
  children?: ReactNode;
};

const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeOut = (value: number) => 1 - (1 - value) ** 3;
const ENTER = 0.72;

function arrived(index: number, progress: number, count: number) {
  if (index === 0) return 1;
  return easeOut(clamp01((progress * Math.max(1, count - 1) - (index - 1)) / ENTER));
}

export function ProjectDeck({ projects, ground = "#f6f3ed", className = "", children }: ProjectDeckProps) {
  const deck = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: deck, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 380, damping: 48, mass: 0.35 });

  return <MotionConfig reducedMotion="user">
    <div
      ref={deck}
      className={`project-deck ${reducedMotion ? "project-deck-still" : ""} ${className}`.trim()}
      style={{ height: reducedMotion ? "auto" : `${Math.max(1, projects.length) * 100}svh`, background: ground }}
      aria-label="Live project websites"
    >
      {reducedMotion
        ? <div className="project-deck-static">{projects.map((project) => <StaticCard key={project.url} project={project} ground={ground} />)}</div>
        : <div className="project-deck-stage">{projects.map((project, index) => <Card key={project.url} project={project} index={index} count={projects.length} progress={progress} ground={ground} />)}</div>}
    </div>
    {children}
  </MotionConfig>;
}

function Card({ project, index, count, progress, ground }: {
  project: Project;
  index: number;
  count: number;
  progress: MotionValue<number>;
  ground: string;
}) {
  const above = (value: number) => {
    let total = 0;
    for (let next = index + 1; next < count; next++) total += arrived(next, value, count);
    return Math.min(3, total);
  };
  const y = useTransform(progress, (value) => `${(1 - arrived(index, value, count)) * 108 - above(value) * 5}svh`);
  const rotateX = useTransform(progress, (value) => -(1 - arrived(index, value, count)) * 30 + above(value) * 5);
  const scale = useTransform(progress, (value) => 0.9 + 0.1 * arrived(index, value, count) - above(value) * 0.05);
  const filter = useTransform(progress, (value) => `blur(${((1 - arrived(index, value, count)) ** 2 * 12 + above(value) * 1.1).toFixed(2)}px)`);
  const dim = useTransform(progress, (value) => above(value) * 0.15);

  return <motion.article
    className="project-deck-card"
    aria-label={`${project.name}: ${project.summary}`}
    style={{ zIndex: index + 1, y, rotateX, scale, filter }}
  >
    <div className="project-deck-frame">
      <img src={project.image} alt={`The ${host(project.url)} homepage`} loading={index < 2 ? "eager" : "lazy"} decoding="async" style={imageStyle(project)} />
      <Visit project={project} ground={ground} />
      <motion.div className="project-deck-dim" aria-hidden="true" style={{ opacity: dim }} />
    </div>
  </motion.article>;
}

function StaticCard({ project, ground }: { project: Project; ground: string }) {
  return <article className="project-deck-static-card" aria-label={`${project.name}: ${project.summary}`}>
    <div className="project-deck-frame">
      <img src={project.image} alt={`The ${host(project.url)} homepage`} loading="lazy" decoding="async" style={imageStyle(project)} />
      <Visit project={project} ground={ground} />
    </div>
  </article>;
}

function Visit({ project, ground }: { project: Project; ground: string }) {
  const corner = <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18"><path d="M18 0V18H0A18 18 0 0 0 18 0Z" fill={ground} /></svg>;
  return <div className="project-deck-visit">
    <div className="project-deck-visit-corner project-deck-visit-corner-top">{corner}</div>
    <div className="project-deck-visit-corner project-deck-visit-corner-left">{corner}</div>
    <a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${project.name} at ${host(project.url)} (opens in a new tab)`} style={{ background: ground }}>
      <span><strong>{project.name}</strong><small>{project.display ?? host(project.url)}</small></span>
      <span className="project-deck-visit-arrow" style={{ background: project.accent }}><ArrowUpRight size={22} strokeWidth={2.2} /></span>
    </a>
  </div>;
}
