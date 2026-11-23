"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export type DraftTestimonial = { quote: string; attribution: string };

export default function TestimonialDrafts({ items }: { items: DraftTestimonial[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const timer = window.setInterval(() => setActive(index => (index + 1) % items.length), 6500);
    return () => window.clearInterval(timer);
  }, [items.length, paused]);

  const move = (step: number) => setActive(index => (index + step + items.length) % items.length);

  return <div className="draft-carousel" aria-label="Client testimonials">
    <div className="draft-card-stage">{items.map((item, index) => {
      const offset = (index - active + items.length) % items.length;
      const position = offset === 0 ? "is-active" : offset === 1 ? "is-after" : offset === items.length - 1 ? "is-before" : "is-hidden";
      return <article className={`draft-card ${position}`} key={item.attribution} aria-hidden={position === "is-hidden"}>
        <div className="draft-card-head"><span>G7X / CLIENT VOICES</span><span>{String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span></div>
        <span className="draft-card-mark" aria-hidden="true">“</span>
        <blockquote>{item.quote}</blockquote>
        <div className="draft-card-foot"><strong>{item.attribution}</strong></div>
      </article>;
    })}</div>
    <div className="draft-controls"><span>{String(active + 1).padStart(2, "0")} <i>/</i> {String(items.length).padStart(2, "0")}</span><button type="button" onClick={() => move(-1)} aria-label="Previous testimonial"><ChevronLeft size={19}/></button><button type="button" onClick={() => move(1)} aria-label="Next testimonial"><ChevronRight size={19}/></button><button type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? "Resume automatic rotation" : "Pause automatic rotation"}>{paused ? <Play size={17}/> : <Pause size={17}/>}</button></div>
  </div>;
}
