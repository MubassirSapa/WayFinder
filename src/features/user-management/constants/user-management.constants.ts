export const USER_MANAGEMENT_CLIENT = {
  PAGE_TITLE: "Users",
  LIST_TITLE: "Users",
  LIST_DESC: "Everyone in your organization and what they can access.",
  ADD_USER: "Add user",

  COLUMN_NAME: "Name",
  COLUMN_ROLE: "Role",
  COLUMN_BUILDINGS: "Buildings",
  COLUMN_ACTIONS: "",

  ROLE_OWNER: "Owner",
  ROLE_MANAGER: "Manager",
  ROLE_MEMBER: "Member",

  NO_BUILDINGS: "No buildings assigned",
  MANAGE_BUILDINGS: "Manage buildings",
  MANAGE_BUILDINGS_TITLE: "Assign buildings",
  MANAGE_BUILDINGS_DESC: "Choose which buildings this member can access.",
  SAVE_BUILDINGS: "Save",

  REMOVE_USER: "Remove",
  REMOVE_TITLE: "Remove user?",
  REMOVE_CONFIRM_PREFIX: "Remove",
  REMOVE_CONFIRM_SUFFIX: "They will lose access to this organization. This cannot be undone.",

  CREATE_SHEET_TITLE: "Add a user",
  CREATE_SHEET_DESC: "They'll be able to sign in with this email and password right away.",
  FIELD_NAME_LABEL: "Name",
  FIELD_EMAIL_LABEL: "Email",
  FIELD_PASSWORD_LABEL: "Initial password",
  FIELD_PASSWORD_DESC: "At least 8 characters. They can change it later from their profile.",
  FIELD_ROLE_LABEL: "Role",
  FIELD_BUILDINGS_LABEL: "Buildings",
  FIELD_BUILDINGS_DESC: "Members only see and edit the buildings assigned here.",

  CANCEL: "Cancel",
  CREATE: "Add user",
  CREATING: "Adding...",
  SAVING: "Saving...",

  SUCCESS_CREATED: "User added.",
  SUCCESS_ROLE_UPDATED: "Role updated.",
  SUCCESS_BUILDINGS_UPDATED: "Buildings updated.",
  SUCCESS_REMOVED: "User removed.",

  ERROR_UNAUTHORIZED: "You need to be signed in to do that.",
  ERROR_FORBIDDEN: "Only the owner or a manager can manage users.",
  ERROR_CREATE_FAILED: "Could not add this user. The email may already be in use.",
  ERROR_UPDATE_FAILED: "Could not update this user. Please try again.",
  ERROR_REMOVE_FAILED: "Could not remove this user. Please try again.",

  VALIDATION_NAME_SHORT: "The name is too short.",
  VALIDATION_EMAIL_INVALID: "Please enter a valid email address.",
  VALIDATION_PASSWORD_SHORT: "The password must be at least 8 characters.",
} as const;
