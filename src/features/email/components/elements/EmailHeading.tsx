import { Heading } from "react-email";

import { EMAIL_THEME } from "../../theme";

type TEmailHeading = {
  children: React.ReactNode;
};

export function EmailHeading({ children }: TEmailHeading) {
  return (
    <Heading
      as="h1"
      style={{
        margin: "28px 0 14px",
        fontSize: 24,
        lineHeight: "32px",
        fontWeight: 700,
        color: EMAIL_THEME.text,
      }}
    >
      {children}
    </Heading>
  );
}
