import { PUBLIC_ROUTES } from "@/constants/routes";

export const INVITATIONS_CONST = {
  ACCEPT_FORM_ID: "accept-invitation-form",
} as const;

export const INVITATIONS_CLIENT = {
  ROLE_MANAGER: "Manager",
  ROLE_MEMBER: "Member",

  INVITE_USER_TRIGGER: "Invite user",
  INVITE_DIALOG_TITLE: "Invite a team member",
  INVITE_DIALOG_DESC: "Send an email invite so they can set up their own login.",
  ACCOUNT_DETAILS: "Invite details",
  ACCOUNT_DETAILS_DESC: "They will receive an email with a link to join.",
  ACCESS_DETAILS: "Workspace access",
  ACCESS_DETAILS_DESC: "Set their role and building access.",

  FIELD_NAME_LABEL: "Name",
  FIELD_NAME_PLACEHOLDER: "Full name",
  FIELD_EMAIL_LABEL: "Email",
  FIELD_EMAIL_PLACEHOLDER: "name@organization.com",
  FIELD_ROLE_LABEL: "Role",
  ROLE_MANAGER_DESC: "Can manage users, buildings, and every floor.",
  ROLE_MEMBER_DESC: "Can work only in assigned buildings.",
  FIELD_BUILDINGS_LABEL: "Buildings",
  FIELD_BUILDINGS_DESC: "Members only see and edit the buildings assigned here.",
  NO_BUILDINGS_AVAILABLE: "No buildings are available to assign yet.",

  SEND_INVITE: "Send invite",
  SENDING_INVITE: "Sending...",
  CANCEL: "Cancel",
  UNSAVED_INVITE_TITLE: "Discard this invitation?",
  UNSAVED_INVITE_DESC: "The invite details and access settings you entered will be lost.",
  KEEP_EDITING: "Keep editing",
  DISCARD: "Discard",

  VALIDATION_NAME_SHORT: "Name must be at least 2 characters.",
  VALIDATION_EMAIL_INVALID: "Enter a valid email address.",
  ERROR_UNAUTHORIZED: "You need to be logged in.",
  ERROR_FORBIDDEN: "You don't have permission to invite team members.",
  ERROR_INVITE_FAILED: "Could not send the invitation. Please try again.",
  ERROR_EMAIL_TAKEN: "Someone with this email is already a member of your organization.",
  ERROR_INVITE_PENDING: "There's already a pending invite for this email.",
  SUCCESS_INVITED: "Invitation sent.",

  PENDING_SECTION_TITLE: "Pending invites",
  PENDING_EXPIRES_PREFIX: "Expires",
  PENDING_EXPIRED_LABEL: "Expired",
  PENDING_INVITED_BY_PREFIX: "Invited by",
  RESEND: "Resend",
  RESENDING: "Resending...",
  REVOKE: "Revoke",
  REVOKING: "Revoking...",
  REVOKE_TITLE: "Revoke invitation?",
  REVOKE_CONFIRM_PREFIX: "Revoke the invitation for",
  REVOKE_CONFIRM_SUFFIX: "They won't be able to use this invite link anymore.",
  SUCCESS_RESENT: "Invitation resent.",
  SUCCESS_REVOKED: "Invitation revoked.",
  ERROR_RESEND_FAILED: "Could not resend the invitation.",
  ERROR_REVOKE_FAILED: "Could not revoke the invitation.",

  ACCEPT_FORM_TITLE: "Join your team",
  ACCEPT_FORM_DESC: "Confirm your details and set a password to finish joining.",
  ACCEPT_EMAIL_LABEL: "Email",
  ACCEPT_ROLE_LABEL: "Role",
  ACCEPT_NAME_LABEL: "Your name",
  ACCEPT_NAME_PLACEHOLDER: "Full name",
  ACCEPT_PASSWORD_LABEL: "Password",
  ACCEPT_PASSWORD_PLACEHOLDER: "Create a strong password",
  ACCEPT_CONFIRM_PASSWORD_LABEL: "Confirm Password",
  ACCEPT_CONFIRM_PASSWORD_PLACEHOLDER: "Repeat your password",
  ACCEPT_SUBMIT_LABEL: "Join workspace",
  ACCEPT_PENDING_LABEL: "Joining...",

  VALIDATION_PASSWORD_MIN: "The password must be at least 8 characters.",
  VALIDATION_PASSWORD_STRENGTH:
    "The password needs uppercase, lowercase, number, and special character.",
  VALIDATION_CONFIRM_REQUIRED: "Please confirm your password.",
  VALIDATION_CONFIRM_MISMATCH: "The passwords do not match.",

  INVALID_INVITE_TITLE: "This invite link isn't valid",
  INVALID_INVITE_DESC: "It may have expired, already been used, or been revoked. Ask an owner or manager to send a new one.",
  FALLBACK_SERVER_ERROR: "Could not complete your invite. Please try again.",

  SIGNIN_CTA: "Go to Sign In",
  SIGNIN_HREF: PUBLIC_ROUTES.SIGNIN,
} as const;
