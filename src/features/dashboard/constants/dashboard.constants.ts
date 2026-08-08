// BuildingNavigator caps its list to this many buildings before showing a
// "View all" link to the full /dashboard/buildings page instead.
export const MAX_BUILDINGS_SHOWN = 3;

export const DASHBOARD_CLIENT = {
  PAGE_TITLE: "Dashboard",
  PAGE_DESCRIPTION: "Your maps, buildings, and access in one place.",
  INVITE_PEOPLE: "Invite people",
  ADD_FLOOR: "Add a floor",
  WORKSPACE_SUMMARY: "Workspace summary",
  RECENT_TITLE: "Pick up where you left off",
  RECENT_DESCRIPTION: "Your most recently edited floor maps.",
  VIEW_BUILDINGS: "View buildings",
  UPDATED: "Updated",
  PUBLISHED: "Published",
  DRAFT: "Draft",
  NO_FLOORS_TITLE: "No floor maps yet",
  NO_FLOORS_DESCRIPTION: "Choose a building and add its first floor to begin mapping.",
  OPEN_BUILDINGS: "Open buildings",
  ATTENTION_TITLE: "Needs attention",
  ATTENTION_DESCRIPTION: "Draft floors and maps without content.",
  NO_MAP_CONTENT: "No map content yet",
  NOT_PUBLIC: "Not visible to visitors",
  ATTENTION_CLEAR_TITLE: "Everything is ready",
  ATTENTION_CLEAR_DESCRIPTION: "There are no draft or empty floor maps to review.",
  BUILDINGS_TITLE: "Buildings",
  BUILDINGS_DESCRIPTION: "Open a building to manage its floors.",
  VIEW_ALL: "View all",
  FLOOR: "floor",
  FLOORS: "floors",
  NO_BUILDINGS: "No buildings have been added yet.",
  MEMBER_ACCESS_NOTE: "Your building access is managed by an organization owner or manager.",

  NAV_ORGANIZATION: "Organization",
  NAV_DASHBOARD: "Overview",
  NAV_BUILDINGS: "Buildings",
  NAV_USERS: "Team",
  NAV_PROFILE: "Profile",
  LOG_OUT: "Log out",
  LOG_OUT_TITLE: "Log out of Wayfinder?",
  LOG_OUT_DESCRIPTION: "You will need to sign in again to access your dashboard.",
  CANCEL: "Cancel",

  ORG_FALLBACK_NAME: "Your organization",

  ERROR_UNAUTHORIZED: "You need to be signed in to do that.",
} as const;
