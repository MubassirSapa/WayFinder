"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormFieldError from "../FormFieldError";

const SelectField = (props: TProps) => {
  const { name, label, value, onChange, errors, ariaInvalid, placeholder, options } = props;

  return (
    <Field data-invalid={ariaInvalid}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Select value={value || null} onValueChange={(val) => onChange(String(val ?? ""))}>
        <SelectTrigger
          id={name}
          aria-invalid={ariaInvalid}
          className="h-11 w-full rounded-md border-border bg-background text-sm shadow-none focus-visible:border-primary focus-visible:ring-primary/20"
        >
          <SelectValue>
            {(val: string | null) =>
              options.find((o) => o.value === val)?.label ?? (
                <span className="text-muted-foreground">{placeholder}</span>
              )
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormFieldError errors={errors} />
    </Field>
  );
};

export default SelectField;

type TProps = {
  label: string;
  name: string;
  value: string;
  errors: Array<{ message?: string } | undefined>;
  onChange: (value: string) => void;
  ariaInvalid: boolean;
  placeholder?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
};