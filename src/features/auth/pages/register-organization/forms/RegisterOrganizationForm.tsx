"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";

import FormCard from "@/components/shared/form/FormCard";
import FormSubmitButton from "@/components/shared/form/FormSubmitButton";
import FormCTA from "@/components/shared/form/FormCTA";
import FormFooterContainer from "@/components/shared/form/containers/FormFooterContainer";
import TextField from "@/components/shared/form/fields/TextField";
import SelectField from "@/components/shared/form/fields/SelectField";
import { FieldGroup } from "@/components/ui/field";

import { useAppStore } from "@/store";
import { OrganizationSchema } from "@/features/auth/validations/organization";
import {
  ORGANIZATION_TYPES,
  REGISTER_ORGANIZATION_CLIENT as CLIENT,
} from "@/features/auth/constants/register-organization";
import { PUBLIC_ROUTES } from "@/constants/routes";

const FORM_ID = "register-organization-form";

const RegisterOrganizationForm = () => {
  const router = useRouter();
  const setOrganization = useAppStore((state) => state.setOrganization);

  const form = useForm({
    defaultValues: {
      name: "",
      type: "",
    },
    validators: {
      onSubmit: OrganizationSchema,
    },
    onSubmit: ({ value }) => {
      const parsed = OrganizationSchema.safeParse(value);
      if (!parsed.success) return;

      setOrganization(parsed.data);
      router.push(PUBLIC_ROUTES.SIGNUP);
    },
  });

  return (
    <FormCard
      title={CLIENT.FORM_TITLE}
      description={CLIENT.FORM_DESC}
      backHref={PUBLIC_ROUTES.HOME}
      content={
        <form
          id={FORM_ID}
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="name">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <TextField
                    label={CLIENT.ORG_NAME_LABEL}
                    placeholder={CLIENT.ORG_NAME_PLACEHOLDER}
                    name={field.name}
                    ariaInvalid={isInvalid}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    errors={field.state.meta.errors}
                    onChange={(e) => field.handleChange(e.target.value)}
                    autoComplete="organization"
                  />
                );
              }}
            </form.Field>
            <form.Field
              name="type">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <SelectField
                    label={CLIENT.ORG_TYPE_LABEL}
                    placeholder={CLIENT.ORG_TYPE_PLACEHOLDER}
                    name={field.name}
                    ariaInvalid={isInvalid}
                    value={field.state.value}
                    errors={field.state.meta.errors}
                    onChange={(value) => field.handleChange(value)}
                    options={ORGANIZATION_TYPES}
                  />
                );
              }}
            </form.Field>
          </FieldGroup>
        </form>
      }
      footer={
        <FormFooterContainer>
          <FormSubmitButton
            formId={FORM_ID}
            label={CLIENT.SUBMIT_LABEL}
            pendingLabel={CLIENT.PENDING_LABEL}
          />
          <FormCTA
            label={CLIENT.SIGNIN_PROMPT}
            linkLabel={CLIENT.SIGNIN_CTA}
            href={PUBLIC_ROUTES.SIGNIN}
          />
        </FormFooterContainer>
      }
    />
  );
};

export default RegisterOrganizationForm;
