import { Text } from "react-email";

import { BrandLogo } from "../components/elements/BrandLogo";
import { EmailDivider } from "../components/elements/EmailDivider";
import { EmailFooter } from "../components/elements/EmailFooter";
import { EmailHeading } from "../components/elements/EmailHeading";
import { EmailText } from "../components/elements/EmailText";
import { PrimaryButton } from "../components/elements/PrimaryButton";
import { Layout } from "../components/layout/Layout";
import { EMAIL_THEME } from "../theme";

type TOrgApprovedEmailTemplate = {
  organizationName: string;
  signinUrl: string;
};

export function OrgApprovedEmailTemplate({ organizationName, signinUrl }: TOrgApprovedEmailTemplate) {
  return (
    <Layout
      preview={`${organizationName} is approved on ${EMAIL_THEME.brand}. You can sign in now.`}
      title="You're approved"
      footer={
        <EmailFooter>
          If you weren&apos;t expecting this, contact us at {EMAIL_THEME.supportEmail}.
        </EmailFooter>
      }
    >
      <BrandLogo />
      <EmailHeading>{organizationName} is approved</EmailHeading>
      <EmailText>
        We&apos;ve reviewed and approved {organizationName} on {EMAIL_THEME.brand}. Sign in to start
        managing your indoor maps, floor plans, and team access.
      </EmailText>
      <PrimaryButton href={signinUrl}>Sign In</PrimaryButton>
      <EmailDivider />
      <Text style={{ margin: 0, fontSize: 12, lineHeight: "18px", color: EMAIL_THEME.muted }}>
        This email was sent after your organization passed review.
      </Text>
    </Layout>
  );
}
