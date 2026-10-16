import type { Metadata } from "next";
import { DM_Sans, Manrope, IBM_Plex_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth/context";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "T-Hub Founders | Outpost",
  description: "A private directory for T-Hub startup founders. Find grants, challenges, and mentors.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${manrope.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen bg-paper text-ink font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
