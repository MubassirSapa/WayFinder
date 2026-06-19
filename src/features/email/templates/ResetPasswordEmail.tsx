import { Text } from "react-email";

import { BrandLogo } from "../components/elements/BrandLogo";
import { EmailDivider } from "../components/elements/EmailDivider";
import { EmailFooter } from "../components/elements/EmailFooter";
import { EmailHeading } from "../components/elements/EmailHeading";
import { EmailText } from "../components/elements/EmailText";
import { PrimaryButton } from "../components/elements/PrimaryButton";
import { Layout } from "../components/layout/Layout";
import { EMAIL_THEME } from "../theme";

type TResetPasswordEmailTemplate = {
  resetUrl: string;
};

export function ResetPasswordEmailTemplate({ resetUrl }: TResetPasswordEmailTemplate) {
  return (
    <Layout
      preview="Reset your Wayfinder password."
      title="Reset your password"
      footer={
        <EmailFooter>
          If the button does not work, request a new reset email or contact us at{" "}
          {EMAIL_THEME.supportEmail}.
        </EmailFooter>
      }
    >
      <BrandLogo />
      <EmailHeading>Reset your password</EmailHeading>
      <EmailText>
        Use this secure link to create a new password for your Wayfinder account. If you did not
        request this, you can ignore this email.
      </EmailText>
      <PrimaryButton href={resetUrl}>Reset Password</PrimaryButton>
      <EmailDivider />
      <Text style={{ margin: 0, fontSize: 12, lineHeight: "18px", color: EMAIL_THEME.muted }}>
        Your existing password remains active until you finish this reset.
      </Text>
    </Layout>
  );
}
