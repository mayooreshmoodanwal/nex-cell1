import type { Metadata, Viewport } from "next";
import { Inter, Orbitron } from "next/font/google";
import { Toaster } from "sonner";
import HudFrame from "@/components/ui/HudFrame";
import "./globals.css";

const inter = Inter({
  subsets:  ["latin"],
  variable: "--font-inter",
  display:  "swap",
});

const orbitron = Orbitron({
  subsets:  ["latin"],
  variable: "--font-orbitron",
  display:  "swap",
});

export const metadata: Metadata = {
  title: {
    default:  "Vibe Coders — Where Founders Are Made",
    template: "%s | Vibe Coders",
  },
  description:
    "Vibe Coders is the VC Cell of Mirai School of Technology. Build ventures, earn Mirai Bucks, and connect with fellow founders.",
  keywords:  ["vc cell", "startup", "club", "Mirai", "Vibe Coders", "founders"],
  authors:   [{ name: "Vibe Coders" }],
  openGraph: {
    type:        "website",
    siteName:    "Vibe Coders",
    title:       "Vibe Coders — Where Founders Are Made",
    description: "VC Cell of Mirai School of Technology",
  },
  twitter: {
    card:  "summary_large_image",
    title: "Vibe Coders — Where Founders Are Made",
  },
  robots: {
    index:  true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor:  "#070B14",
  colorScheme: "dark",
  width:       "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${orbitron.variable} font-sans antialiased bg-navy-950 text-white`}>
        <HudFrame />
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background:   "#141B2D",
              border:       "1px solid rgba(6, 182, 212, 0.2)",
              color:        "#ffffff",
              borderRadius: "8px",
              fontFamily:   "'JetBrains Mono', monospace",
              fontSize:     "0.8rem",
            },
          }}
        />
      </body>
    </html>
  );
}
