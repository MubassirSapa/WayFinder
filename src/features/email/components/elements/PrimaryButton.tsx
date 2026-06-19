import { Button, Section } from "react-email";

import { EMAIL_THEME } from "../../theme";

type TPrimaryButton = {
  href: string;
  children: React.ReactNode;
};

export function PrimaryButton({ href, children }: TPrimaryButton) {
  return (
    <Section style={{ margin: "26px 0", textAlign: "center" }}>
      <Button
        href={href}
        style={{
          display: "inline-block",
          background: EMAIL_THEME.primary,
          color: "#ffffff",
          textDecoration: "none",
          borderRadius: 8,
          padding: "12px 18px",
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        {children}
      </Button>
    </Section>
  );
}
