import type { Metadata } from "next";
import { Geist_Mono, Hind_Siliguri, Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";

// Inter is DESIGN.md's documented open-source stand-in for SF Pro.
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Bangla UI font — swapped in for `--font-sans` via `html[lang="bn"]` in
// globals.css when the language toggle switches to বাংলা.
const hindSiliguri = Hind_Siliguri({
  variable: "--font-bangla",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${inter.variable} ${hindSiliguri.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* Sets `lang` before hydration so a returning বাংলা user's font
            doesn't flash from Inter to Hind Siliguri after mount. */}
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
