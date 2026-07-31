import { Text } from "react-email";

import { BrandLogo } from "../components/elements/BrandLogo";
import { EmailDivider } from "../components/elements/EmailDivider";
import { EmailFooter } from "../components/elements/EmailFooter";
import { EmailHeading } from "../components/elements/EmailHeading";
import { EmailText } from "../components/elements/EmailText";
import { PrimaryButton } from "../components/elements/PrimaryButton";
import { Layout } from "../components/layout/Layout";
import { EMAIL_THEME } from "../theme";

type TVerifyEmailTemplate = {
  verificationUrl: string;
};

export function VerifyEmailTemplate({ verificationUrl }: TVerifyEmailTemplate) {
  return (
    <Layout
      preview="Verify your Wayfinder account."
      title="Verify your email"
      footer={
        <EmailFooter>
          If the button does not work, try requesting a new verification email or contact us at{" "}
          {EMAIL_THEME.supportEmail}.
        </EmailFooter>
      }
    >
      <BrandLogo />
      <EmailHeading>Verify your email</EmailHeading>
      <EmailText>
        Thanks for signing up. Confirm your email address to activate your account and continue
        setting up your organization workspace.
      </EmailText>
      <PrimaryButton href={verificationUrl}>Verify Email</PrimaryButton>
      <EmailDivider />
      <Text style={{ margin: 0, fontSize: 12, lineHeight: "18px", color: EMAIL_THEME.muted }}>
        This link is for your Wayfinder account. If you did not sign up, you can ignore this email.
      </Text>
    </Layout>
  );
}
