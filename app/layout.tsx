import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Noto_Serif_Bengali } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

import { ServiceWorkerRegister } from "@/components/sw-register";
import { StructuredData } from "@/components/structured-data";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_DESCRIPTION_META, SITE_NAME, SITE_URL } from "@/lib/site";

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
  metadataBase: new URL(SITE_URL),
  title: {
    // Kept under ~60 characters — Google truncates longer <title> tags in
    // search results, and the previous version (77 chars) ran past that.
    default: `${SITE_NAME} — Compare Pathao, RedX, CarryBee & Steadfast Rates`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION_META,
  applicationName: SITE_NAME,
  // Bengali-script/phonetic variants live in visible FAQ copy and JSON-LD,
  // not stuffed here — but a handful of engines/site-search tools still read
  // this field, so the branded-query variants belong here too.
  keywords: [
    "courier charge calculator Bangladesh",
    "Pathao delivery charge calculator",
    "RedX delivery charge calculator",
    "Steadfast courier charge calculator",
    "CarryBee delivery charge calculator",
    "courier price comparison Bangladesh",
    "bulk order courier auto splitter",
    "FleetSplit",
    "Fleet Split",
    "Flitspit",
  ],
  authors: [{ name: SITE_NAME }],
  category: "e-commerce logistics",
  alternates: { canonical: "/" },
  // No manual `icons` field — favicon.ico, icon.png, and apple-icon.png in
  // app/ are Next's file-convention icons, auto-detected and linked without
  // needing to be listed here.
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Courier Charge Calculator for Bangladesh`,
    description: SITE_DESCRIPTION_META,
    locale: "en_US",
    alternateLocale: "bn_BD",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Courier Charge Calculator for Bangladesh`,
    description: SITE_DESCRIPTION_META,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1d1f" },
  ],
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
        <StructuredData />
        <ServiceWorkerRegister />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId="G-0JBXG62HCY" />
    </html>
  );
}
