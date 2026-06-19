import { Text } from "react-email";

import { EMAIL_THEME } from "../../theme";

type TEmailFooter = {
  children: React.ReactNode;
};

export function EmailFooter({ children }: TEmailFooter) {
  return (
    <Text
      style={{
        margin: 0,
        fontSize: 13,
        lineHeight: "20px",
        color: EMAIL_THEME.muted,
      }}
    >
      {children}
    </Text>
  );
}
