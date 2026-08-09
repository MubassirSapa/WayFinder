import { IBM_Plex_Sans, Montserrat } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { NotFoundPage } from "@/features/viewer/pages/not-found/NotFoundPage";
import "./(frontend)/global.css";

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
  title: "404 | Wayfinder",
  description: "The Wayfinder page you are looking for does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontHeading.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NotFoundPage />
        </ThemeProvider>
      </body>
    </html>
  );
}
