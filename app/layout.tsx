import type { Metadata } from "next";
import { Instrument_Sans, Martian_Mono, Newsreader } from "next/font/google";
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
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
