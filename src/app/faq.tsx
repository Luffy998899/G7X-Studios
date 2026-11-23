"use client";

import { useState } from "react";
import { ArrowUpRight, ChevronDown, MessageCircle } from "lucide-react";

const questions = [
  {
    number: "01",
    question: "What do you need to get started?",
    answer: "A short description of your business, the people you want to reach, and any current brand materials or websites you like. We can work through the rest together.",
  },
  {
    number: "02",
    question: "How long does a website take?",
    answer: "The schedule depends on the pages, content, and review rounds. We agree on a scope and timeline before the build begins.",
  },
  {
    number: "03",
    question: "Can you work with our existing brand?",
    answer: "Yes. We can build from your current logo, type, colours, and content, or establish a visual direction for the website if those pieces are still taking shape.",
  },
  {
    number: "04",
    question: "How does booking a call work?",
    answer: "Tell us about your project, then choose an available 30-minute time. We currently offer calls Monday to Friday at 11:00 AM, 4:30 PM, 6:30 PM, and 9:00 PM IST. Your chosen time is reserved when the booking is confirmed.",
  },
  {
    number: "05",
    question: "Can you improve an existing website?",
    answer: "Share your current site and the changes you have in mind. We can discuss whether focused improvements or a more complete rebuild would best serve your goals.",
  },
  {
    number: "06",
    question: "Will the website work on phones and tablets?",
    answer: "Yes. We design responsive layouts and check the important pages, navigation, and contact actions on smaller screens as well as desktop.",
  },
  {
    number: "07",
    question: "What kinds of businesses do you work with?",
    answer: "Our published work includes automotive retail, influencer events, and hospitality. We shape each website around the business, its visitors, and the action the site needs to support.",
  },
];

export default function Faq() {
  const [active, setActive] = useState<number | null>(null);

  return <div className="faq-content">
    <div className="faq-accordion">
      {questions.map((item, index) => <div className={`faq-item${active === index ? " is-active" : ""}`} key={item.number}>
        <button type="button" aria-expanded={active === index} aria-controls={`faq-panel-${index}`} id={`faq-button-${index}`} onClick={() => setActive(active === index ? null : index)}>
          <span className="faq-number">{item.number}</span><span className="faq-question">{item.question}</span><ChevronDown size={20} aria-hidden="true"/>
        </button>
        <div className="faq-answer" id={`faq-panel-${index}`} role="region" aria-labelledby={`faq-button-${index}`} hidden={active !== index}><p>{item.answer}</p></div>
      </div>)}
    </div>
    <div className="faq-help">
      <span className="faq-help-icon"><MessageCircle size={20} aria-hidden="true" /></span>
      <div><strong>Still have a question?</strong><p>Tell us what you&apos;re planning and we&apos;ll reply by email.</p></div>
      <a href="#contact">Ask us anything <ArrowUpRight size={18} aria-hidden="true" /></a>
    </div>
  </div>;
}
