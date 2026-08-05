export const PROFILE_CLIENT = {
  PAGE_TITLE: "Profile",
  PAGE_DESCRIPTION: "Manage your personal details and how you appear to your organization.",
  FORM_TITLE: "Your profile",
  FORM_DESC: "Update how you appear across the dashboard.",
  EDIT: "Edit profile",
  CANCEL: "Cancel",

  DETAILS_TITLE: "Account details",
  DETAILS_DESCRIPTION: "Your account identity and organization access.",
  EDIT_TITLE: "Edit personal details",
  EDIT_DESCRIPTION: "Update your name or choose a new profile photo.",

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

  VALIDATION_NAME_SHORT: "Your name is too short.",
  VALIDATION_NAME_LONG: "Your name is too long.",
} as const;

export const PROFILE_ROLE_LABELS = {
  owner: "Owner",
  manager: "Manager",
  member: "Member",
} as const;
