export const ORGANIZATION_SETTINGS_CLIENT = {
  PAGE_TITLE: "Organization",
  PAGE_DESCRIPTION: "Manage your organization identity and buildings.",

  FORM_TITLE: "Organization info",
  FORM_DESC: "This information is shown across your dashboard and public pages.",
  EDIT: "Edit organization",
  CANCEL: "Cancel",

  FIELD_NAME_LABEL: "Organization name",
  FIELD_NAME_PLACEHOLDER: "e.g. St. Jude General Hospital",
  FIELD_TYPE_LABEL: "Organization type",
  FIELD_LOGO_LABEL: "Logo",
  FIELD_LOGO_DESC: "PNG or JPG, up to 5MB.",
  UPLOAD_LOGO: "Upload logo",
  REPLACE_LOGO: "Replace",
  REMOVE_LOGO: "Remove",

  SAVE: "Save changes",
  SAVING: "Saving...",
  BACK_TO_DASHBOARD: "Back to dashboard",

  SUCCESS_UPDATED: "Organization info updated.",

  ERROR_UNAUTHORIZED: "You need to be signed in to do that.",
  ERROR_FORBIDDEN: "Only the owner or a manager can edit organization info.",
  ERROR_UPDATE_FAILED: "Could not save organization info. Please try again.",
  ERROR_LOAD_FAILED: "Could not load organization info.",
  ERROR_LOGO_TYPE: "Please choose an image file.",
  ERROR_LOGO_SIZE: "That image is too large. Please choose a file under 5MB.",

  VALIDATION_NAME_SHORT: "The organization name is too short.",
  VALIDATION_NAME_LONG: "The organization name is too long.",
  VALIDATION_TYPE_REQUIRED: "Please select an organization type.",
} as const;
