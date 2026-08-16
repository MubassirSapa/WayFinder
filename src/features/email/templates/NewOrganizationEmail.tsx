import { BrandLogo } from "../components/elements/BrandLogo";
import { EmailFooter } from "../components/elements/EmailFooter";
import { EmailHeading } from "../components/elements/EmailHeading";
import { EmailText } from "../components/elements/EmailText";
import { PrimaryButton } from "../components/elements/PrimaryButton";
import { Layout } from "../components/layout/Layout";
import { EMAIL_THEME } from "../theme";

type TNewOrganizationEmailTemplate = {
  organizationName: string;
  organizationType: string;
  reviewUrl: string;
};

export function NewOrganizationEmailTemplate({
  organizationName,
  organizationType,
  reviewUrl,
}: TNewOrganizationEmailTemplate) {
  return (
    <Layout
      preview={`${organizationName} signed up on ${EMAIL_THEME.brand} and is waiting for review.`}
      title="New organization awaiting review"
      footer={<EmailFooter>Sent because a new organization signed up on {EMAIL_THEME.brand}.</EmailFooter>}
    >
      <BrandLogo />
      <EmailHeading>New organization awaiting review</EmailHeading>
      <EmailText>
        {organizationName} ({organizationType}) signed up and can&apos;t be used until it&apos;s
        approved. Review it in the admin panel and approve it there when it&apos;s ready.
      </EmailText>
      <PrimaryButton href={reviewUrl}>Review Organization</PrimaryButton>
    </Layout>
  );
}
