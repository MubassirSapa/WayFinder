import { IBM_Plex_Sans, Montserrat } from "next/font/google";
import React from "react";

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

export const metadata = {
  description: "A blank template using Payload in a Next.js app.",
  title: "Payload Blank Template",
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="en">
      <body className={`${fontSans.variable} ${fontHeading.variable} antialiased `}>
        <main>{children}</main>
      </body>
    </html>
  );
}
