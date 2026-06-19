import { PRIVATE_ROUTES } from "@/constants/routes";

export const DASHBOARD_CLIENT = {
  PAGE_TITLE: "Floors",
  BRAND_BADGE: "Admin",

  VIEW_PUBLIC: "View public page",
  PROFILE_ROLE: "Building Management",
  ORG_EDIT: "Edit",
  ORG_EDIT_FULL: "Edit organization",
  ORG_BUILDING: "One building",

  FLOORS_TITLE: "Floors",
  FLOORS_SUBTITLE_PREFIX: "Floors set to",
  FLOORS_SUBTITLE_STATUS: "Draft",
  FLOORS_SUBTITLE_SUFFIX: "stay hidden from the public page.",
  ADD_FLOOR: "Add floor",

  ROOMS_SUFFIX: "rooms",
  POIS_SUFFIX: "POIs",
  UPDATED_PREFIX: "Updated",

  STATUS_PUBLISHED: "Published",
  STATUS_DRAFT: "Draft",
  OPEN_EDITOR: "Open editor",

  EMPTY_TITLE: "No floors yet",
  EMPTY_DESC: "Add your first floor to start mapping this building.",

  SHEET_TITLE: "Add floor",
  FIELD_NAME_LABEL: "Floor name",
  FIELD_NAME_PLACEHOLDER: "e.g. Outpatients & Imaging",
  FIELD_LEVEL_LABEL: "Level",
  FIELD_PUBLISH_TITLE: "Make public on create",
  FIELD_PUBLISH_ON: "Visible on the public page immediately.",
  FIELD_PUBLISH_OFF: "Saved as a draft - hidden from the public page.",
  CANCEL: "Cancel",
  CLOSE: "Close",
  CREATE: "Create floor",
  CREATING: "Creating...",

  ORG_FALLBACK_NAME: "Your organization",

  ERROR_UNAUTHORIZED: "You need to be signed in to do that.",
  ERROR_CREATE_FAILED: "Could not create the floor. Please try again.",
  ERROR_TOGGLE_FAILED: "Could not update the floor. Please try again.",
  VALIDATION_NAME_SHORT: "The floor name is too short.",
  VALIDATION_NAME_LONG: "The floor name is too long.",
} as const;

export const LEVEL_OPTIONS = [
  { value: -1, label: "Lower Ground", badge: "LG" },
  { value: 0, label: "Ground", badge: "GF" },
  { value: 1, label: "Level 1", badge: "L1" },
  { value: 2, label: "Level 2", badge: "L2" },
  { value: 3, label: "Level 3", badge: "L3" },
  { value: 4, label: "Level 4", badge: "L4" },
  { value: 5, label: "Level 5", badge: "L5" },
] as const;

export const LEVEL_DEFAULT = 1;

export const NEW_FLOOR_DEFAULTS = {
  width: 1200,
  height: 800,
} as const;

const ADMIN_ORGANIZATIONS_PATH = "/admin/collections/organizations";

export function buildEditorHref(floorId: string) {
  return `${PRIVATE_ROUTES.EDITOR}/${floorId}`;
}

export function buildOrgAdminHref(organizationId: string) {
  return `${ADMIN_ORGANIZATIONS_PATH}/${organizationId}`;
}
