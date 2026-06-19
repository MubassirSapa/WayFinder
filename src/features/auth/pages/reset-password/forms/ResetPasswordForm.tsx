"use client";

import { useState, useTransition } from "react";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { KeyRoundIcon, ShieldCheckIcon, TriangleAlertIcon } from "lucide-react";

import FormAlert from "@/components/shared/form/FormAlert";
import FormCard from "@/components/shared/form/FormCard";
import FormSubmitButton from "@/components/shared/form/FormSubmitButton";
import FormFooterContainer from "@/components/shared/form/containers/FormFooterContainer";
import PasswordField from "@/components/shared/form/fields/PasswordField";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import {
  RESET_PASSWORD_CLIENT as CLIENT,
  RESET_PASSWORD_CONST,
} from "@/features/auth/constants/reset-password";
import { resetPasswordAction } from "@/features/auth/server-actions/reset-password";
import { ResetPasswordSchema } from "@/features/auth/validations/reset-password";
import { TokenSchema } from "@/features/auth/validations/token";

const ResetPasswordForm = ({ token }: TProps) => {
  const [isSubmitting, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const tokenValidation = TokenSchema.safeParse({ token });

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: ResetPasswordSchema,
    },
    onSubmitInvalid: () => {
      setErrorMessage("");
    },
    onSubmit: ({ value }) => {
      if (!tokenValidation.success) {
        setErrorMessage(CLIENT.VALIDATION_TOKEN_ERROR);
        return;
      }

      startTransition(async () => {
        const result = await resetPasswordAction(value, tokenValidation.data.token);
        if (!result?.isSuccess) {
          setErrorMessage(result?.message || CLIENT.FALLBACK_SERVER_ERROR);
          return;
        }
        setIsComplete(true);
      });
    },
  });

  if (!tokenValidation.success) {
    return (
      <FormCard
        title={CLIENT.FORM_TITLE}
        description={CLIENT.VALIDATION_TOKEN_ERROR}
        showBack={false}
        align="center"
        icon={<TriangleAlertIcon className="size-7 text-destructive" strokeWidth={1.8} />}
        footer={
          <Button
            nativeButton={false}
            render={<Link href={CLIENT.SIGNIN_HREF} />}
            size="lg"
            className="h-11 w-full rounded-md text-sm font-semibold"
          >
            {CLIENT.SIGNIN_CTA}
          </Button>
        }
      />
    );
  }

  if (isComplete) {
    return (
      <FormCard
        title={CLIENT.SUCCESS_TITLE}
        description={CLIENT.SUCCESS_DESC}
        showBack={false}
        align="center"
        icon={<ShieldCheckIcon className="size-7 text-primary" strokeWidth={1.8} />}
        footer={
          <Button
            nativeButton={false}
            render={<Link href={CLIENT.SIGNIN_HREF} />}
            size="lg"
            className="h-11 w-full rounded-md text-sm font-semibold"
          >
            {CLIENT.SIGNIN_CTA}
          </Button>
        }
      />
    );
  }

  return (
    <FormCard
      title={CLIENT.FORM_TITLE}
      description={CLIENT.FORM_DESC}
      showBack={false}
      icon={<KeyRoundIcon className="size-7 text-primary" strokeWidth={1.8} />}
      content={
        <form
          id={RESET_PASSWORD_CONST.FORM_ID}
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <FieldGroup>
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
                    autoComplete="new-password"
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

            <form.Field name="confirmPassword">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <PasswordField
                    label={CLIENT.CONFIRM_PASSWORD_LABEL}
                    placeholder={CLIENT.CONFIRM_PASSWORD_PLACEHOLDER}
                    name={field.name}
                    ariaInvalid={isInvalid}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    autoComplete="new-password"
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
            formId={RESET_PASSWORD_CONST.FORM_ID}
            isSubmitting={isSubmitting}
            label={CLIENT.SUBMIT_LABEL}
            pendingLabel={CLIENT.PENDING_LABEL}
          />
        </FormFooterContainer>
      }
    />
  );
};

export default ResetPasswordForm;

type TProps = {
  token?: string;
};
