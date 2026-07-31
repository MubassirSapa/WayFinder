import { IBM_Plex_Sans, Montserrat } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import React from "react";

import { ThemeProvider } from "@/components/theme-provider";

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

const routeLoaderTemplate = '<div class="wayfinder-route-loader" role="bar"></div>';

export const metadata = {
  description: "Indoor maps and wayfinding for public venues and facilities.",
  title: "Wayfinder",
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontHeading.variable} antialiased`}>
        <NextTopLoader
          color="var(--primary)"
          height={3}
          shadow={false}
          showForHashAnchor={false}
          showSpinner={false}
          template={routeLoaderTemplate}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
