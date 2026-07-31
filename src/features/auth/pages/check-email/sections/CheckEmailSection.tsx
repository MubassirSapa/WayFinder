import { MailCheckIcon } from "lucide-react";

import FormCard from "@/components/shared/form/FormCard";
import { CHECK_EMAIL_CLIENT as CLIENT } from "@/features/auth/constants/check-email";
import { PUBLIC_ROUTES } from "@/constants/routes";

const CheckEmailSection = () => {
  return (
    <FormCard
      title={CLIENT.TITLE}
      description={CLIENT.DESC}
      backHref={PUBLIC_ROUTES.HOME}
      align="center"
      icon={<MailCheckIcon className="size-8 text-primary" strokeWidth={1.75} />}
    />
  );
};

export default CheckEmailSection;
