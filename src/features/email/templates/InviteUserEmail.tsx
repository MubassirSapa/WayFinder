import { Text } from "react-email";

import { BrandLogo } from "../components/elements/BrandLogo";
import { EmailDivider } from "../components/elements/EmailDivider";
import { EmailFooter } from "../components/elements/EmailFooter";
import { EmailHeading } from "../components/elements/EmailHeading";
import { EmailText } from "../components/elements/EmailText";
import { PrimaryButton } from "../components/elements/PrimaryButton";
import { Layout } from "../components/layout/Layout";
import { EMAIL_THEME } from "../theme";

type TInviteUserEmailTemplate = {
  inviteUrl: string;
  organizationName: string;
  inviterName: string;
  roleLabel: string;
};

export function InviteUserEmailTemplate({
  inviteUrl,
  organizationName,
  inviterName,
  roleLabel,
}: TInviteUserEmailTemplate) {
  return (
    <Layout
      preview={`${inviterName} invited you to join ${organizationName} on ${EMAIL_THEME.brand}.`}
      title="You've been invited"
      footer={
        <EmailFooter>
          If you did not expect this invitation, you can ignore this email or contact us at{" "}
          {EMAIL_THEME.supportEmail}.
        </EmailFooter>
      }
    >
      <BrandLogo />
      <EmailHeading>You&apos;re invited to {organizationName}</EmailHeading>
      <EmailText>
        {inviterName} invited you to join {organizationName} on {EMAIL_THEME.brand} as a{" "}
        {roleLabel}. Accept the invite to set up your account and password.
      </EmailText>
      <PrimaryButton href={inviteUrl}>Accept Invitation</PrimaryButton>
      <EmailDivider />
      <Text style={{ margin: 0, fontSize: 12, lineHeight: "18px", color: EMAIL_THEME.muted }}>
        This invitation expires in 7 days.
      </Text>
    </Layout>
  );
}
