"use client";

import { useState, useTransition } from "react";
import { useForm } from "@tanstack/react-form";
import { LogInIcon } from "lucide-react";

import FormAlert from "@/components/shared/form/FormAlert";
import FormCard from "@/components/shared/form/FormCard";
import FormCTA from "@/components/shared/form/FormCTA";
import FormSubmitButton from "@/components/shared/form/FormSubmitButton";
import FormFooterContainer from "@/components/shared/form/containers/FormFooterContainer";
import EmailField from "@/components/shared/form/fields/EmailField";
import PasswordField from "@/components/shared/form/fields/PasswordField";
import { FieldGroup } from "@/components/ui/field";
import { SIGNIN_CLIENT as CLIENT, SIGNIN_CONST } from "@/features/auth/constants/signin";
import { signinAction } from "@/features/auth/server-actions/signin";
import { SigninSchema } from "@/features/auth/validations/signin";

const SigninForm = () => {
  const [isSubmitting, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: SigninSchema,
    },
    onSubmitInvalid: () => {
      setErrorMessage("");
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        const result = await signinAction(value);
        if (!result?.isSuccess) {
          setErrorMessage(result?.message || CLIENT.FALLBACK_SERVER_ERROR);
        }
      });
    },
  });

  return (
    <FormCard
      title={CLIENT.FORM_TITLE}
      description={CLIENT.FORM_DESC}
      showBack={false}
      icon={<LogInIcon className="size-7 text-primary" strokeWidth={1.8} />}
      content={
        <form
          id={SIGNIN_CONST.FORM_ID}
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

            <form.Field name="password">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <PasswordField
                    label={CLIENT.PASSWORD_LABEL}
                    placeholder={CLIENT.PASSWORD_PLACEHOLDER}
                    name={field.name}
                    ariaInvalid={isInvalid}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    autoComplete="current-password"
                    errors={field.state.meta.errors}
                    onChange={(event) => {
                      setErrorMessage("");
                      field.handleChange(event.target.value);
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
            formId={SIGNIN_CONST.FORM_ID}
            isSubmitting={isSubmitting}
            label={CLIENT.SUBMIT_LABEL}
            pendingLabel={CLIENT.PENDING_LABEL}
          />
          <div className="flex w-full flex-col gap-2">
            <FormCTA
              isSubmitting={isSubmitting}
              label={CLIENT.FORGOT_PROMPT}
              linkLabel={CLIENT.FORGOT_CTA}
              href={CLIENT.FORGOT_HREF}
            />
            <FormCTA
              isSubmitting={isSubmitting}
              label={CLIENT.SIGNUP_PROMPT}
              linkLabel={CLIENT.SIGNUP_CTA}
              href={CLIENT.SIGNUP_HREF}
            />
          </div>
        </FormFooterContainer>
      }
    />
  );
};

export default SigninForm;
