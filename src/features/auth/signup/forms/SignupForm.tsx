"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import Link from "next/link";

import FormCard from "@/components/shared/form/FormCard";
import FormAlert from "@/components/shared/form/FormAlert";
import FormSubmitButton from "@/components/shared/form/FormSubmitButton";
import FormCTA from "@/components/shared/form/FormCTA";
import FormFooterContainer from "@/components/shared/form/containers/FormFooterContainer";
import FormFieldError from "@/components/shared/form/FormFieldError";
import TextField from "@/components/shared/form/fields/TextField";
import EmailField from "@/components/shared/form/fields/EmailField";
import PasswordField from "@/components/shared/form/fields/PasswordField";
import { Field, FieldGroup } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { useSignupFlowStore } from "@/features/auth/_store/useSignupFlowStore";
import { signupAction } from "@/server-actions/auth/signup";
import { SignupSchema } from "@/validations/auth/signup";
import { SIGNUP_CLIENT as CLIENT } from "@/constants/auth/signup";
import { PUBLIC_ROUTES } from "@/constants/routes";

const FORM_ID = "signup-form";

const SignupForm = () => {
  const router = useRouter();
  const [isSubmitting, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const organization = useSignupFlowStore((state) => state.organization);
  const resetFlow = useSignupFlowStore((state) => state.reset);

  useEffect(() => {
    if (!organization) {
      router.replace(PUBLIC_ROUTES.REGISTER_ORGANIZATION);
    }
  }, [organization, router]);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreedToTerms: false,
    },
    validators: {
      onSubmit: SignupSchema,
    },
    onSubmitInvalid: () => {
      setErrorMessage("");
    },
    onSubmit: ({ value }) => {
      if (!organization) return;

      startTransition(async () => {
        const result = await signupAction({
          name: value.name,
          email: value.email,
          password: value.password,
          organization,
        });
        if (!result?.isSuccess) {
          setErrorMessage(result?.message || CLIENT.FALLBACK_SERVER_ERROR);
          return;
        }
        resetFlow();
      });
    },
  });

  return (
    <FormCard
      title={CLIENT.FORM_TITLE}
      description={CLIENT.FORM_DESC}
      backHref={PUBLIC_ROUTES.REGISTER_ORGANIZATION}
      content={
        <form
          id={FORM_ID}
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          {organization && (
            <div className="mb-5 rounded-md border border-border bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">Organization</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{organization.name}</p>
            </div>
          )}
          <FieldGroup>
            <form.Field
              name="name">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <TextField
                    label={CLIENT.NAME_LABEL}
                    placeholder={CLIENT.NAME_PLACEHOLDER}
                    name={field.name}
                    ariaInvalid={isInvalid}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    errors={field.state.meta.errors}
                    onChange={(e) => {
                      setErrorMessage("");
                      field.handleChange(e.target.value);
                    }}
                    autoComplete="name"
                    disabled={isSubmitting}
                  />
                );
              }}
            </form.Field>
            <form.Field
              name="email">
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
                    onChange={(e) => {
                      setErrorMessage("");
                      field.handleChange(e.target.value.toLowerCase());
                    }}
                    disabled={isSubmitting}
                  />
                );
              }}
            </form.Field>
            <form.Field
              name="password">
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
                    onChange={(e) => {
                      setErrorMessage("");
                      field.handleChange(e.target.value);
                    }}
                    disabled={isSubmitting}
                  />
                );
              }}
            </form.Field>
            <form.Field
              name="confirmPassword">
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
                    onChange={(e) => {
                      setErrorMessage("");
                      field.handleChange(e.target.value);
                    }}
                    disabled={isSubmitting}
                  />
                );
              }}
            </form.Field>
            <form.Field
              name="agreedToTerms">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <div className="flex items-center gap-2.5">
                      <Checkbox
                        id={field.name}
                        checked={field.state.value}
                        onCheckedChange={(checked) => field.handleChange(Boolean(checked))}
                        aria-invalid={isInvalid}
                        disabled={isSubmitting}
                      />
                      <Label htmlFor={field.name} className="text-xs font-normal text-muted-foreground">
                        <span>
                          {CLIENT.TERMS_PREFIX}{" "}
                          <Link href={PUBLIC_ROUTES.TERMS} className="font-medium text-primary hover:underline">
                            {CLIENT.TERMS_LINK}
                          </Link>{" "}
                          {CLIENT.TERMS_AND}{" "}
                          <Link href={PUBLIC_ROUTES.PRIVACY} className="font-medium text-primary hover:underline">
                            {CLIENT.PRIVACY_LINK}
                          </Link>
                        </span>
                      </Label>
                    </div>
                    <FormFieldError errors={field.state.meta.errors} />
                  </Field>
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
            formId={FORM_ID}
            isSubmitting={isSubmitting}
            label={CLIENT.SUBMIT_LABEL}
            pendingLabel={CLIENT.PENDING_LABEL}
          />
          <FormCTA
            isSubmitting={isSubmitting}
            label={CLIENT.SIGNIN_PROMPT}
            linkLabel={CLIENT.SIGNIN_CTA}
            href={PUBLIC_ROUTES.SIGNIN}
          />
        </FormFooterContainer>
      }
    />
  );
};

export default SignupForm;
