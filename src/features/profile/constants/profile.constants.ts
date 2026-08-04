export const PROFILE_CLIENT = {
  PAGE_TITLE: "Profile",
  FORM_TITLE: "Your profile",
  FORM_DESC: "Update how you appear across the dashboard.",
  EDIT: "Edit profile",
  CANCEL: "Cancel",

  FIELD_AVATAR_LABEL: "Photo",
  FIELD_AVATAR_DESC: "PNG or JPG, up to 5MB.",
  UPLOAD_AVATAR: "Upload photo",
  REPLACE_AVATAR: "Replace",
  REMOVE_AVATAR: "Remove",

  FIELD_NAME_LABEL: "Name",
  FIELD_EMAIL_LABEL: "Email",
  FIELD_ROLE_LABEL: "Role",
  FIELD_PASSWORD_LABEL: "Password",
  BACK_TO_DASHBOARD: "Back to dashboard",
  SAVE: "Save changes",
  SAVING: "Saving...",

  SUCCESS_UPDATED: "Profile updated.",

  ERROR_UNAUTHORIZED: "You need to be signed in to do that.",
  ERROR_UPDATE_FAILED: "Could not save your profile. Please try again.",
  ERROR_LOAD_FAILED: "Could not load your profile.",
  ERROR_AVATAR_TYPE: "Please choose an image file.",
  ERROR_AVATAR_SIZE: "Photo must be 5MB or smaller.",

  VALIDATION_NAME_SHORT: "Your name is too short.",
  VALIDATION_NAME_LONG: "Your name is too long.",
} as const;

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
