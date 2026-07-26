import type { Metadata } from "next";
import { Instrument_Sans, Martian_Mono, Newsreader } from "next/font/google";

import { AskBar } from "@/components/ask/ask-bar";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Rail } from "@/components/layout/rail";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { shell } from "@/lib/copy/shell";
import "./globals.css";

// Display. `weight` is omitted because `axes` is used — the variable font carries the whole
// 200–800 range, and 300 is set in CSS. `opsz` is exposed so the light strokes hold at hero size.
const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-display-family",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body-family",
  display: "swap",
});

const martianMono = Martian_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-utility-family",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Glidda — a guide that walks people through your product",
  description:
    "Glidda gives every new user a guide that answers questions in-page, runs a live demo of your real UI, and drives activation during onboarding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${instrumentSans.variable} ${martianMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only rounded-chip bg-ink px-4 py-2 text-small text-paper focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-(--z-ask)"
        >
          {shell.skipLink}
        </a>
        <AnnouncementBar />
        <SiteHeader />
        {/* `relative` because the Rail is absolutely positioned against the full height of
            `<main>`, which is also its ScrollTrigger. */}
        <main id="main" className="relative flex-1">
          <Rail />
          {children}
        </main>
        <SiteFooter />
        <AskBar />
      </body>
    </html>
  );
}
