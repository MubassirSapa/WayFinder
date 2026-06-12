import type {
  EditorMapNode,
  EditorMapObject,
} from "@/features/map-editor/core/types/map.types";

export interface SmartObjectNodeRule {
  enabled: boolean;
  nodeRole: EditorMapNode["role"];
}

export type SmartObjectNodeRuleMap = Partial<
  Record<EditorMapObject["type"], SmartObjectNodeRule>
>;

// Single source of truth for Smart Builder object -> node generation rules.
// Edit this map to control:
// - which predefined object types should generate nodes
// - which node role each object type should create
export const SMART_OBJECT_NODE_RULES: SmartObjectNodeRuleMap = {
  room: {
    enabled: true,
    nodeRole: "entrance",
  },
  door: {
    enabled: true,
    nodeRole: "entrance",
  },
  exit: {
    enabled: true,
    nodeRole: "entrance",
  },
  stairs: {
    enabled: true,
    nodeRole: "stairs_entry",
  },
  elevator: {
    enabled: true,
    nodeRole: "elevator_entry",
  },
  shelf: {
    enabled: true,
    nodeRole: "shelf_access",
  },
  section: {
    enabled: true,
    nodeRole: "shelf_access",
  },
};

export function getSmartObjectNodeRule(
  objectType: EditorMapObject["type"],
): SmartObjectNodeRule | null {
  const rule = SMART_OBJECT_NODE_RULES[objectType];

  if (!rule || !rule.enabled) {
    return null;
  }

  return rule;
}

export function getEligibleSmartObjectTypes(): EditorMapObject["type"][] {
  return Object.entries(SMART_OBJECT_NODE_RULES)
    .filter(([, rule]) => rule?.enabled)
    .map(([objectType]) => objectType as EditorMapObject["type"]);
}
