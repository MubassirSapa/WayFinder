import { Hr } from "react-email";

import { EMAIL_THEME } from "../../theme";

export function EmailDivider() {
  return (
    <Hr
      style={{
        borderColor: EMAIL_THEME.border,
        margin: "26px 0",
      }}
    />
  );
}
