export const REGISTER_ORGANIZATION_CLIENT = {
  FORM_TITLE: "Register Your Organization",
  FORM_DESC: "Start mapping your facility with Wayfinder.",

  ORG_NAME_LABEL: "Organization Name",
  ORG_NAME_PLACEHOLDER: "e.g. St. Jude General Hospital",
  ORG_TYPE_LABEL: "Organization Type",
  ORG_TYPE_PLACEHOLDER: "Select facility type",

  SUBMIT_LABEL: "Continue",
  PENDING_LABEL: "Saving...",

  SIGNIN_PROMPT: "Already have an account?",
  SIGNIN_CTA: "Sign In",

  VALIDATION_NAME_REQUIRED: "Please enter your organization name.",
  VALIDATION_NAME_TOO_SHORT: "The organization name is too short.",
  VALIDATION_NAME_TOO_LONG: "The organization name is too long.",
  VALIDATION_TYPE_REQUIRED: "Please select a facility type.",
} as const;

export const ORGANIZATION_TYPES = [
  { value: "hospital", label: "Hospital / Healthcare" },
  { value: "university", label: "University / Campus" },
  { value: "mall", label: "Shopping Mall / Retail" },
  { value: "office", label: "Office / Corporate" },
  { value: "airport", label: "Airport / Transit" },
  { value: "library", label: "Library / Museum" },
  { value: "other", label: "Other" },
] as const;
