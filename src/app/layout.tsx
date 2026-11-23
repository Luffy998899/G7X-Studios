import type { Metadata } from "next";
import { DM_Mono, DM_Sans, Inter_Tight } from "next/font/google";
import SectionNavigation from "./section-navigation";
import { siteUrl } from "./site-url";
import "./globals.css";

const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: "500", variable: "--font-dm-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${interTight.variable} ${dmSans.variable} ${dmMono.variable}`} data-type="service"><body><SectionNavigation />{children}</body></html>;
}
