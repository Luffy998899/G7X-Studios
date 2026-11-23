# G7X Studios — Landing Page Design

## Direction and references

G7X is an independent web design and development studio. The page should make the offer clear, show the quality of a possible deliverable, and lead visitors to a contact enquiry. Research on 20 November 2026 covered [Ascenta Studio](https://ascentastudio.com/), [Fullbound](https://gofullbound.com/), [Endcap Design](https://endcap.design/), [oops! web studio](https://www.oopsweb.co/), and [Michael Tovmach](https://www.tovmach.com/) using Firecrawl captures and page data. A later user-supplied hero image set the current first-screen composition: compact navigation, left sales copy, a laptop showcase on the right, paired actions, and a short detail row. G7X does not use those studios’ assets or copy.

## Page system

- **Hero:** warm off-white canvas, three-line headline with deep green emphasis, a direct project action and work link, then a laptop showing the published Formula 19 site. The laptop and stone setting are a generated visual asset in `public/hero-laptop.png`; the screen uses a local capture of the live homepage. Detail labels describe the offer rather than claiming unverified project counts or results.
- **Portfolio:** a scroll-dealt deck of three published websites: [Formula 19](https://formula19.ca/), [G7X](https://g7x.in/), and [Misty Meadows Resorts](https://mistymeadowsresorts.com/). Each card uses an actual homepage screenshot and links to the live site. Capture sources are recorded in [`public/projects/README.md`](public/projects/README.md). The deck adapts the supplied React component to this project’s CSS without adding a second styling system.
- **Services:** three plain-language offers: website design, web development, and enquiry and booking flows.
- **Words in review:** four draft testimonial quotes supplied by the owner rotate automatically every 6.5 seconds, with manual controls. The section and each card clearly state that client approval is pending; no review markup is used.
- **FAQ:** seven G7X-specific questions in a centered vertical accordion. A small FAQ badge and restrained headline sit above the list; a contact panel beneath it links to the appointment form. One answer can be open at a time, and clicking it again closes it.
- **Contact and booking:** The landing page ends with a compact two-column appointment section: practical call notes on the left and a white, three-step form on the right. The time step opens on the next bookable weekday with available slots visible. Appointments are available Monday–Friday at 11:00 AM, 4:30 PM, 6:30 PM, and 9:00 PM IST. Bookings use private, timestamped lead records and unique active time slots. A private CRM lets the owner mark appointments complete, releasing future slots. Structured visitor and owner emails require sending credentials. `contact@g7xstudio.com` is the public contact address.
- **Footer:** a warm paper link area with only working destinations fades into a new photographic asset of blue sky and lush rolling green hills. An oversized white G7X wordmark sits into the horizon, matching the supplied footer reference’s main visual.
- **404:** a centered grid card with a large error number, plain explanation, home link, and an appointment CTA. No newsletter appears because this site does not offer one.

## Visual and motion rules

Use ink `#202b28`, paper `#f6f3ed`, warm white `#faf9f7` in the hero, and deep green `#2b594a` for emphasis. Inter Tight carries headings, DM Sans body and UI, and DM Mono compact metadata. The hero headline is around 80px at a 1440px desktop width and around 45px on a phone. Keep shared side edges, strong type hierarchy, and real site content in every project card. The hero enters once. Motion scroll values drive the portfolio deck’s stack and settle effect; reduced-motion visitors see three still cards in normal flow. Keep links, forms, and text usable without animation.

## Verification

Check 1440px, 390px, and 320px layouts for readable previews and no horizontal overflow. Check the FAQ controls, booking times, and mobile footer wordmark. Run `npm run build`, `npm run typecheck`, and `npm run test:smoke` after edits.
