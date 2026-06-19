import type { ReactNode } from "react";
import { Body, Container, Head, Html, Preview, Section } from "react-email";

import { EMAIL_THEME } from "../../theme";

type TLayout = {
  preview: string;
  title: string;
  children: ReactNode;
  footer: ReactNode;
};

export function Layout({ preview, title, children, footer }: TLayout) {
  return (
    <Html>
      <Head>
        <title>{title}</title>
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          background: EMAIL_THEME.background,
          fontFamily: "Arial, Helvetica, sans-serif",
          color: EMAIL_THEME.text,
        }}
      >
        <Section style={{ padding: "32px 16px" }}>
          <Container
            style={{
              maxWidth: 560,
              background: EMAIL_THEME.surface,
              border: `1px solid ${EMAIL_THEME.border}`,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <Section style={{ padding: "28px 28px 10px" }}>{children}</Section>
            <Section
              style={{
                padding: "20px 28px 28px",
                borderTop: `1px solid ${EMAIL_THEME.border}`,
                background: EMAIL_THEME.footerSurface,
              }}
            >
              {footer}
            </Section>
          </Container>
        </Section>
      </Body>
    </Html>
  );
}
