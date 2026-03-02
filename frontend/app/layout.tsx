import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "Bob the Builder | Instant Ephemeral Backends",
  description: "Describe your API in plain English. Bob generates a live backend endpoint in seconds — powered by Gemini AI, and auto-cleans itself.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased bg-zinc-950 text-zinc-200 selection:bg-zinc-800 selection:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
