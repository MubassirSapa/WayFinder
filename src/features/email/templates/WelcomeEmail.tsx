import { Text } from "react-email";

import { BrandLogo } from "../components/elements/BrandLogo";
import { EmailDivider } from "../components/elements/EmailDivider";
import { EmailFooter } from "../components/elements/EmailFooter";
import { EmailHeading } from "../components/elements/EmailHeading";
import { EmailText } from "../components/elements/EmailText";
import { PrimaryButton } from "../components/elements/PrimaryButton";
import { Layout } from "../components/layout/Layout";
import { EMAIL_THEME } from "../theme";

type TWelcomeEmailTemplate = {
  signinUrl: string;
  userName?: string | null;
};

export function WelcomeEmailTemplate({ signinUrl, userName }: TWelcomeEmailTemplate) {
  const greeting = userName ? `Welcome, ${userName}` : "Welcome to Wayfinder";

  return (
    <Layout
      preview="Your Wayfinder workspace is ready."
      title="Welcome to Wayfinder"
      footer={
        <EmailFooter>
          If you need help accessing your workspace, contact us at {EMAIL_THEME.supportEmail}.
        </EmailFooter>
      }
    >
      <BrandLogo />
      <EmailHeading>{greeting}</EmailHeading>
      <EmailText>
        Your email is verified and your organization workspace is ready. Sign in to start managing
        your indoor maps, floor plans, and team access.
      </EmailText>
      <PrimaryButton href={signinUrl}>Sign In</PrimaryButton>
      <EmailDivider />
      <Text style={{ margin: 0, fontSize: 12, lineHeight: "18px", color: EMAIL_THEME.muted }}>
        This welcome email was sent after your Wayfinder account was activated.
      </Text>
    </Layout>
  );
}
