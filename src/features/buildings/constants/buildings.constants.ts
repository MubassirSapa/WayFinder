import { PRIVATE_ROUTES } from "@/constants/routes";

export const BUILDINGS_CLIENT = {
  LIST_PAGE_TITLE: "Buildings",
  LIST_TITLE: "Buildings",
  LIST_DESC: "Every building in your organization.",
  LIST_DESC_MEMBER: "Buildings you have access to.",
  ADD_BUILDING: "Add building",

  COLUMN_NAME: "Name",
  COLUMN_ADDRESS: "Address",
  COLUMN_FLOORS: "Floors",
  FLOOR_SUFFIX: "floor",
  FLOORS_SUFFIX: "floors",
  EMPTY_ADDRESS: "No address set",

  EMPTY_TITLE: "No buildings yet",
  EMPTY_DESC: "Add your first building to start mapping it.",
  EMPTY_TITLE_MEMBER: "No buildings assigned",
  EMPTY_DESC_MEMBER:
    "Ask your organization's owner or a manager to assign you to a building.",

  CREATE_DIALOG_TITLE: "Add a building",
  CREATE_DIALOG_DESC:
    "You can add contact details and a logo after creating it.",
  UNSAVED_BUILDING_TITLE: "Discard building details?",
  UNSAVED_BUILDING_DESC:
    "The building name and address you entered will be lost.",
  UNSAVED_FLOOR_TITLE: "Discard floor details?",
  UNSAVED_FLOOR_DESC: "The floor information you entered will be lost.",
  KEEP_EDITING: "Keep editing",
  DISCARD: "Discard",

  EDIT_PAGE_TITLE: "Building",
  EDIT_PAGE_DESCRIPTION:
    "Manage this building's details, floors, and public visibility.",
  BACK_TO_BUILDINGS: "Back to buildings",
  FORM_TITLE: "Building info",
  FORM_DESC: "Shown to managers and members assigned to this building.",
  READ_ONLY_NOTICE:
    "You can view this building's info, but only an owner or manager can edit it.",
  EDIT: "Edit building",
  INFO_NOT_SET: "Not provided",

  FIELD_NAME_LABEL: "Building name",
  FIELD_NAME_PLACEHOLDER: "e.g. Main Campus",
  FIELD_ADDRESS_LABEL: "Address",
  FIELD_ADDRESS_PLACEHOLDER: "Street, city, region",
  FIELD_CONTACT_EMAIL_LABEL: "Contact email",
  FIELD_CONTACT_PHONE_LABEL: "Contact phone",
  FIELD_WEBSITE_LABEL: "Website",
  FIELD_LOGO_LABEL: "Logo",
  FIELD_LOGO_DESC: "PNG or JPG, up to 5MB.",
  UPLOAD_LOGO: "Upload logo",
  REPLACE_LOGO: "Replace",
  REMOVE_LOGO: "Remove",

  FLOORS_TITLE: "Floors",
  FLOORS_SUBTITLE_PREFIX: "Floors set to",
  FLOORS_SUBTITLE_STATUS: "Draft",
  FLOORS_SUBTITLE_SUFFIX: "stay hidden from the public page.",
  ADD_FLOOR: "Add floor",
  FLOOR_EDIT_INFO: "Edit info",
  FLOOR_OPEN_EDITOR: "Open editor",
  FLOOR_OPEN_QR_CODES: "View & generate QR codes",
  STATUS_PUBLISHED: "Published",
  STATUS_DRAFT: "Draft",
  ROOMS_SUFFIX: "rooms",
  POIS_SUFFIX: "POIs",
  UPDATED_PREFIX: "Updated",

  EMPTY_FLOORS_TITLE: "No floors yet",
  EMPTY_FLOORS_DESC: "Add your first floor to start mapping this building.",

  CREATE_FLOOR_DIALOG_TITLE: "Add a floor",
  CREATE_FLOOR_DIALOG_DESC: "Set the floor name, level, and visibility.",
  CREATE_FLOOR_FIELD_NAME_LABEL: "Floor name",
  CREATE_FLOOR_FIELD_NAME_PLACEHOLDER: "e.g. Outpatients & Imaging",
  FIELD_PUBLISH_TITLE: "Make public on create",
  FIELD_PUBLISH_ON: "Visible on the public page immediately.",
  FIELD_PUBLISH_OFF: "Saved as a draft - hidden from the public page.",
  CLOSE: "Close",
  CREATE_FLOOR: "Create floor",

  ERROR_CREATE_FLOOR_FAILED: "Could not create the floor. Please try again.",
  ERROR_TOGGLE_FLOOR_FAILED: "Could not update the floor. Please try again.",
  VALIDATION_FLOOR_NAME_SHORT: "The floor name is too short.",
  VALIDATION_FLOOR_NAME_LONG: "The floor name is too long.",

  FLOOR_EDIT_PAGE_TITLE: "Edit floor",
  FLOOR_FORM_TITLE: "Floor info",
  FLOOR_FORM_DESC:
    "Basic metadata for this floor. Background image and layout are edited in the map editor.",
  BACK_TO_BUILDING: "Back to building",

  FIELD_FLOOR_NAME_LABEL: "Floor name",
  FIELD_LEVEL_LABEL: "Level",
  FIELD_WIDTH_LABEL: "Width (px)",
  FIELD_HEIGHT_LABEL: "Height (px)",
  FIELD_METERS_PER_PIXEL_LABEL: "Meters per pixel",
  FIELD_STATUS_LABEL: "Status",

  SUCCESS_FLOOR_UPDATED: "Floor info updated.",
  ERROR_FLOOR_UPDATE_FAILED: "Could not save floor info. Please try again.",
  ERROR_FLOOR_LOAD_FAILED: "Could not load this floor.",

  BACK_TO_DASHBOARD: "Back to dashboard",
  CANCEL: "Cancel",
  SAVE: "Save changes",
  SAVING: "Saving...",
  CREATE: "Create building",
  CREATING: "Creating...",

  SUCCESS_CREATED: "Building created.",
  SUCCESS_FLOOR_CREATED: "Floor created.",
  SUCCESS_UPDATED: "Building info updated.",

  ERROR_UNAUTHORIZED: "You need to be signed in to do that.",
  ERROR_FORBIDDEN: "Only the owner or a manager can do that.",
  ERROR_LOAD_FAILED: "Could not load this building.",
  ERROR_CREATE_FAILED: "Could not create the building. Please try again.",
  ERROR_UPDATE_FAILED: "Could not save building info. Please try again.",
  ERROR_LOGO_TYPE: "Please choose an image file.",

  VALIDATION_NAME_SHORT: "The building name is too short.",
  VALIDATION_NAME_LONG: "The building name is too long.",
  VALIDATION_EMAIL_INVALID: "Please enter a valid email address.",
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

export function buildEditorHref(floorId: string) {
  return `${PRIVATE_ROUTES.EDITOR}/${floorId}`;
}

export function buildQrCodesHref(buildingId: string, floorId: string) {
  return `${PRIVATE_ROUTES.BUILDINGS}/${buildingId}/floors/${floorId}/qr-codes`;
}
