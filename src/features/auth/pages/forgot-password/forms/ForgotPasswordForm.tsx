"use client";

import { useState, useTransition } from "react";
import { useForm } from "@tanstack/react-form";
import { MailCheckIcon, MailIcon } from "lucide-react";

import FormAlert from "@/components/shared/form/FormAlert";
import FormCard from "@/components/shared/form/FormCard";
import FormCTA from "@/components/shared/form/FormCTA";
import FormSubmitButton from "@/components/shared/form/FormSubmitButton";
import FormFooterContainer from "@/components/shared/form/containers/FormFooterContainer";
import EmailField from "@/components/shared/form/fields/EmailField";
import { FieldGroup } from "@/components/ui/field";
import {
  FORGOT_PASSWORD_CLIENT as CLIENT,
  FORGOT_PASSWORD_CONST,
} from "@/features/auth/constants/forgot-password";
import { forgotPasswordAction } from "@/features/auth/actions/server/forgot-password";
import { ForgotPasswordSchema } from "@/features/auth/validations/forgot-password";

const ForgotPasswordForm = () => {
  const [isSubmitting, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSent, setIsSent] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: ForgotPasswordSchema,
    },
    onSubmitInvalid: () => {
      setErrorMessage("");
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        const result = await forgotPasswordAction(value);
        if (!result?.isSuccess) {
          setErrorMessage(result?.message || CLIENT.FALLBACK_SERVER_ERROR);
          return;
        }
        setIsSent(true);
      });
    },
  });

  if (isSent) {
    return (
      <FormCard
        title={CLIENT.SUCCESS_TITLE}
        description={CLIENT.SUCCESS_DESC}
        align="center"
        icon={<MailCheckIcon className="size-7 text-primary" strokeWidth={1.8} />}
        footer={
          <FormFooterContainer>
            <FormCTA
              label={CLIENT.SIGNIN_PROMPT}
              linkLabel={CLIENT.SIGNIN_CTA}
              href={CLIENT.SIGNIN_HREF}
            />
          </FormFooterContainer>
        }
      />
    );
  }

  return (
    <FormCard
      title={CLIENT.FORM_TITLE}
      description={CLIENT.FORM_DESC}
      icon={<MailIcon className="size-7 text-primary" strokeWidth={1.8} />}
      content={
        <form
          id={FORGOT_PASSWORD_CONST.FORM_ID}
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="email">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <EmailField
                    label={CLIENT.EMAIL_LABEL}
                    placeholder={CLIENT.EMAIL_PLACEHOLDER}
                    name={field.name}
                    ariaInvalid={isInvalid}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    errors={field.state.meta.errors}
                    onChange={(event) => {
                      setErrorMessage("");
                      field.handleChange(event.target.value.toLowerCase());
                    }}
                    disabled={isSubmitting}
                  />
                );
              }}
            </form.Field>
          </FieldGroup>
        </form>
      }
      footer={
        <FormFooterContainer>
          <FormAlert errorMessage={errorMessage} />
          <FormSubmitButton
            formId={FORGOT_PASSWORD_CONST.FORM_ID}
            isSubmitting={isSubmitting}
            label={CLIENT.SUBMIT_LABEL}
            pendingLabel={CLIENT.PENDING_LABEL}
          />
          <FormCTA
            isSubmitting={isSubmitting}
            label={CLIENT.SIGNIN_PROMPT}
            linkLabel={CLIENT.SIGNIN_CTA}
            href={CLIENT.SIGNIN_HREF}
          />
        </FormFooterContainer>
      }
    />
  );
};

export default ForgotPasswordForm;
