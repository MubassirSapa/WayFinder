import { Text } from "react-email";

import { EMAIL_THEME } from "../../theme";

type TEmailText = {
  children: React.ReactNode;
};

export function EmailText({ children }: TEmailText) {
  return (
    <Text
      style={{
        margin: 0,
        fontSize: 15,
        lineHeight: "24px",
        color: EMAIL_THEME.muted,
      }}
    >
      {children}
    </Text>
  );
}
