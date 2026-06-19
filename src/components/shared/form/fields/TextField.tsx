import { Field, FieldLabel } from "@/components/ui/field";
import FormFieldError from "../FormFieldError";
import FormInputField from "../FormInputField";

const TextField = (props: TProps) => {
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

  return (
    <Field data-invalid={ariaInvalid}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <FormInputField
        id={name}
        type="text"
        name={name}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        aria-invalid={ariaInvalid}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required ?? false}
        {...rest}
      />
      <FormFieldError errors={errors} />
    </Field>
  );
};

export default TextField;

type TProps = React.ComponentPropsWithoutRef<"input"> & {
  label: string;
  name: string;
  value: string;
  errors: Array<{ message?: string } | undefined>;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  ariaInvalid: boolean;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
};
