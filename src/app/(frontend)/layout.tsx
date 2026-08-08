import { IBM_Plex_Sans, Montserrat } from "next/font/google";
import type { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
import React from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import { appleStartupImages } from "./apple-startup-images";
import "./global.css";

const fontSans = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans-source",
});

const fontHeading = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-heading-source",
  weight: ["400", "500", "600", "700"],
});

// const routeLoaderTemplate =
//   '<div class="wayfinder-route-loader" role="bar"></div>';

export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    startupImage: appleStartupImages,
    title: "WayFinder",
  },
  description: "Indoor maps and wayfinding for public venues and facilities.",
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  title: "Wayfinder",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { color: "#eef1ec", media: "(prefers-color-scheme: light)" },
    { color: "#212a24", media: "(prefers-color-scheme: dark)" },
  ],
  userScalable: false,
  width: "device-width",
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontHeading.variable} antialiased`}
      >
        <NextTopLoader
          color="var(--primary)"
          height={3}
          shadow={false}
          showForHashAnchor={false}
          showSpinner={false}
          // template={routeLoaderTemplate}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
