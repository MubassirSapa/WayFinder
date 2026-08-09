# Adding Fonts in Next.js + shadcn/ui

This doc explains how to add fonts to a Next.js project that uses shadcn/ui and CSS theme variables.

It covers:

- how to load fonts with `next/font`
- how to expose them as CSS variables
- how to wire them into shadcn theme tokens
- how to apply them to body text and headings
- the most common mistake that makes the font "not show up"

## Goal

In this project, we want:

- body text and UI text to use `Montserrat`
- headings to use `IBM Plex Sans`

## 1. Load fonts in `layout.tsx`

Use `next/font/google` in your app layout.

Example from this project:

```tsx
import { IBM_Plex_Sans, Montserrat } from "next/font/google";
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

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontHeading.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Note: the font-variable wiring above (`fontSans`/`fontHeading` → `className`)
is this doc's actual subject and is unchanged from when this was written.
What *has* changed since: the app no longer hardcodes a `dark` class — theme
(light/dark/system) is handled separately by `next-themes`' `ThemeProvider`,
unrelated to font loading. The real `layout.tsx` also wires up
`NextTopLoader`, a `Toaster`, and page metadata, trimmed from this snippet
since they're outside what this doc covers.

### What this does

- downloads and optimizes the fonts through Next.js
- creates CSS variables on the element where the generated class is applied
- makes those variables available to the rest of the app

In this repo, the variables are applied on `body`.

## 2. Map those font variables in `global.css`

shadcn uses theme tokens like `font-sans` and `font-heading`.

You need to map those tokens to the font variables created by Next.js.

Example:

```css
@theme inline {
  --font-heading: var(--font-heading-source);
  --font-sans: var(--font-sans-source);
}
```

In this project, that lives in:

- `src/app/(frontend)/global.css`

## 3. Apply the fonts where they should be used

After the variables are mapped, you still need to apply the actual utility classes.

Example:

```css
@layer base {
  body {
    @apply bg-background text-foreground font-sans;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply font-heading;
  }
}
```

### Result

- paragraphs, buttons, labels, and regular UI text use `font-sans`
- headings use `font-heading`

## 4. Why the font sometimes does not show up

This is the biggest mistake and it happened in this repo.

### Wrong setup

If you apply the Next font variable classes on `body`, but apply `font-sans` on `html`, the font may not work.

Example of the problem:

```css
html {
  @apply font-sans;
}
```

Why this breaks:

- the font variable exists on `body`
- `html` is above `body`
- CSS variables do not flow upward
- so `html` cannot see `--font-sans-source`

That means the app falls back to the default font stack and it looks like the font "is not working".

### Correct setup

Apply `font-sans` on `body` if the font variable class is also on `body`.

```css
body {
  @apply font-sans;
}
```

## 5. How shadcn buttons get the font

You do not have to set the font on every button manually if your base layer is correct.

If `body` uses `font-sans`, then buttons and most UI text will inherit it automatically unless overridden.

That is why this works:

```css
body {
  @apply font-sans;
}
```

And headings can still use a different font:

```css
h1,
h2,
h3,
h4,
h5,
h6 {
  @apply font-heading;
}
```

## 6. Minimal checklist

When adding fonts in a Next.js + shadcn project, verify all of these:

1. Import the font from `next/font/google` or `next/font/local`.
2. Give each font a CSS variable name like `--font-sans-source`.
3. Apply the generated variable classes in `layout.tsx`.
4. Map shadcn tokens in `global.css`:
   `--font-sans` and `--font-heading`.
5. Apply `font-sans` and `font-heading` in the base layer.
6. Make sure the element using `font-sans` can actually see the variable.

## 7. Current project wiring

Current files:

- `src/app/(frontend)/layout.tsx`
- `src/app/(frontend)/global.css`

Current setup:

- `Montserrat` -> `--font-sans-source`
- `IBM Plex Sans` -> `--font-heading-source`
- `body` -> `font-sans`
- `h1` to `h6` -> `font-heading`

## 8. Copy-paste template

### `layout.tsx`

```tsx
import { Heading_Font, Body_Font } from "next/font/google";

const fontSans = Body_Font({
  subsets: ["latin"],
  variable: "--font-sans-source",
});

const fontHeading = Heading_Font({
  subsets: ["latin"],
  variable: "--font-heading-source",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} ${fontHeading.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

### `global.css`

```css
@theme inline {
  --font-sans: var(--font-sans-source);
  --font-heading: var(--font-heading-source);
}

@layer base {
  body {
    @apply font-sans;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply font-heading;
  }
}
```

## 9. Summary

The font setup has 3 layers:

1. `layout.tsx` loads the font and creates CSS variables.
2. `global.css` maps those variables into shadcn theme tokens.
3. your base styles or components apply `font-sans` and `font-heading`.

If any one of those 3 steps is missing, the font usually looks like it is "not working".
