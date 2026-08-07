"use client";

import { useState, useTransition } from "react";
import { useForm } from "@tanstack/react-form";

import FormAlert from "@/components/shared/form/FormAlert";
import FormCard from "@/components/shared/form/FormCard";
import FormSubmitButton from "@/components/shared/form/FormSubmitButton";
import FormFooterContainer from "@/components/shared/form/containers/FormFooterContainer";
import PasswordField from "@/components/shared/form/fields/PasswordField";
import TextField from "@/components/shared/form/fields/TextField";
import { FieldGroup } from "@/components/ui/field";
import { UsersRoundIcon } from "lucide-react";

import { INVITATIONS_CLIENT as CLIENT, INVITATIONS_CONST } from "../../../constants/invitations.constants";
import { acceptInvitationAction } from "../../../actions/server/accept-invitation";
import { AcceptInvitationSchema } from "../../../validations/accept-invitation";
import type { InvitationPreview } from "../../../types/invitation.types";

const ROLE_LABELS: Record<InvitationPreview["role"], string> = {
  manager: CLIENT.ROLE_MANAGER,
  member: CLIENT.ROLE_MEMBER,
};

type TProps = {
  token: string;
  preview: InvitationPreview;
};

const InviteAcceptForm = ({ token, preview }: TProps) => {
  const [isSubmitting, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm({
    defaultValues: {
      name: preview.name,
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: AcceptInvitationSchema,
    },
    onSubmitInvalid: () => {
      setErrorMessage("");
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        const result = await acceptInvitationAction(value, token);
        if (!result?.isSuccess) {
          setErrorMessage(result?.message || CLIENT.FALLBACK_SERVER_ERROR);
        }
      });
    },
  });

  return (
    <FormCard
      title={CLIENT.ACCEPT_FORM_TITLE}
      description={CLIENT.ACCEPT_FORM_DESC}
      showBack={false}
      icon={<UsersRoundIcon className="size-7 text-primary" strokeWidth={1.8} />}
      content={
        <form
          id={INVITATIONS_CONST.ACCEPT_FORM_ID}
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <div className="mb-5 grid grid-cols-2 gap-3 rounded-md border border-border bg-muted px-4 py-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{CLIENT.ACCEPT_EMAIL_LABEL}</p>
              <p className="mt-1 truncate text-sm font-semibold text-foreground">{preview.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{CLIENT.ACCEPT_ROLE_LABEL}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{ROLE_LABELS[preview.role]}</p>
            </div>
          </div>

          <FieldGroup>
            <form.Field name="name">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <TextField
                    label={CLIENT.ACCEPT_NAME_LABEL}
                    placeholder={CLIENT.ACCEPT_NAME_PLACEHOLDER}
                    name={field.name}
                    ariaInvalid={isInvalid}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    errors={field.state.meta.errors}
                    onChange={(event) => {
                      setErrorMessage("");
                      field.handleChange(event.target.value);
                    }}
                    autoComplete="name"
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
                    label={CLIENT.ACCEPT_PASSWORD_LABEL}
                    placeholder={CLIENT.ACCEPT_PASSWORD_PLACEHOLDER}
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
                    label={CLIENT.ACCEPT_CONFIRM_PASSWORD_LABEL}
                    placeholder={CLIENT.ACCEPT_CONFIRM_PASSWORD_PLACEHOLDER}
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
            formId={INVITATIONS_CONST.ACCEPT_FORM_ID}
            isSubmitting={isSubmitting}
            label={CLIENT.ACCEPT_SUBMIT_LABEL}
            pendingLabel={CLIENT.ACCEPT_PENDING_LABEL}
          />
        </FormFooterContainer>
      }
    />
  );
};

export default InviteAcceptForm;
