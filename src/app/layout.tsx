/**
 * Root layout. Type system (per the Figma design contract): Syne for
 * display, Inter for body, JetBrains Mono for code — load them via
 * next/font/google here once you're building with network access:
 *
 *   import { Syne, Inter, JetBrains_Mono } from "next/font/google";
 *
 * The scaffold ships with system fonts so it builds anywhere.
 */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "bakingsoda",
  description:
    "a provenance board for makers — the arrow between what inspired you and what you shipped.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-zinc-100 text-zinc-900 antialiased">{children}</body>
    </html>
  );
}
