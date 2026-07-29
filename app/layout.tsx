import type { Metadata } from "next";
import { Geist_Mono, Inter, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";

// Inter is DESIGN.md's documented open-source stand-in for SF Pro. It carries
// Latin only — Bengali glyphs come from Noto Serif Bengali via the composed
// `--font-sans` stack in globals.css.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Bengali, requested directly: Noto Serif Bengali, a variable serif face
// (100–900 in one file, so every weight the UI uses comes from one download).
// It sits *after* Inter in the stack rather than replacing it: font fallback
// is per-glyph, so Latin stays Inter/sans and only Bengali resolves here.
// That keeps "RedX" identical in both languages, and means Bengali text (the
// বাংলা toggle label) renders correctly even while the UI is in English.
// Loaded via next/font/google rather than the <link> snippet Google gives you
// directly — same font, but self-hosted at build time (no runtime request to
// fonts.googleapis.com, no render-blocking <link>, no layout shift).
const notoSerifBengali = Noto_Serif_Bengali({
  variable: "--font-bangla",
  subsets: ["bengali"],
  weight: "variable",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Courier Auto-Splitter",
  description:
    "Compare Pathao, RedX, CarryBee, and Steadfast rates in real time and auto-split orders to the cheapest courier.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSerifBengali.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* Sets `lang` before hydration so assistive tech gets the right
            language from the first paint. This no longer affects typography —
            the font stack resolves Bengali per-glyph regardless of `lang`. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('courier-lang')==='bn')document.documentElement.lang='bn'}catch(e){}",
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
