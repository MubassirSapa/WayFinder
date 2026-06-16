"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import FormFieldError from "../FormFieldError";
import FormInputField from "../FormInputField";

const PasswordField = (props: TProps) => {
  const {
    name,
    label,
    value,
    onBlur,
    onChange,
    errors,
    required,
    ariaInvalid,
    placeholder,
    autoComplete,
    ...rest
  } = props;

  const [isVisible, setIsVisible] = useState(false);

  return (
    <Field data-invalid={ariaInvalid}>
      <FieldLabel htmlFor={name}>{label ?? "Password"}</FieldLabel>
      <div className="relative">
        <FormInputField
          id={name}
          type={isVisible ? "text" : "password"}
          name={name}
          value={value}
          onBlur={onBlur}
          onChange={onChange}
          aria-invalid={ariaInvalid}
          placeholder={placeholder ?? "Enter your password"}
          autoComplete={autoComplete}
          required={required ?? false}
          className="pr-10"
          {...rest}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsVisible((v) => !v)}
          aria-label={isVisible ? "Hide password" : "Show password"}
          className="absolute inset-y-1 right-1 size-9 text-muted-foreground hover:text-foreground"
        >
          {isVisible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
        </Button>
      </div>
      <FormFieldError errors={errors} />
    </Field>
  );
};

export default PasswordField;

type TProps = React.ComponentPropsWithoutRef<"input"> & {
  label?: string;
  name: string;
  value: string;
  errors: Array<{ message?: string } | undefined>;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  ariaInvalid: boolean;
  placeholder?: string;
  autoComplete: "off" | "new-password" | "current-password";
  required?: boolean;
};
