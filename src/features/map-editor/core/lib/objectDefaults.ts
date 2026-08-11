import {
  Square,
  Minus,
  DoorOpen,
  Route,
  ArrowUpRight,
  ArrowUpDown,
  TrendingUp,
  Bath,
  LogOut,
  MapPin,
  Split,
  Layers,
  LayoutGrid,
  LucideIcon,
} from 'lucide-react';
import { ToolboxObjectType } from '../types/editor.types';
import type { EditorMapObject } from '../types/map.types';

export interface ObjectConfig {
  label: string;
  defaultWidth: number;
  defaultHeight: number;
  color: string; // Tailored HSL or hex color for rendering
  fill: string; // Tailwind fill color or direct hex/HSL
  stroke: string;
  icon: LucideIcon;
}

export const OBJECT_CONFIGS: Record<ToolboxObjectType, ObjectConfig> = {
  room: {
    label: 'Room',
    defaultWidth: 120,
    defaultHeight: 100,
    color: 'var(--editor-selection)', // blue-500
    fill: 'color-mix(in oklch, var(--editor-object-room) 15%, transparent)',
    stroke: 'var(--editor-selection)',
    icon: Square,
  },
  wall: {
    label: 'Wall',
    defaultWidth: 200,
    defaultHeight: 20,
    color: 'var(--editor-object-wall)', // slate-500
    fill: 'color-mix(in oklch, var(--editor-object-wall) 80%, transparent)',
    stroke: 'color-mix(in oklch, var(--editor-object-wall) 82%, var(--editor-background))',
    icon: Minus,
  },
  door: {
    label: 'Door',
    defaultWidth: 40,
    defaultHeight: 20,
    color: 'var(--editor-object-door)', // yellow-500
    fill: 'color-mix(in oklch, var(--editor-object-door) 20%, transparent)',
    stroke: 'var(--editor-object-door)',
    icon: DoorOpen,
  },
  hallway: {
    label: 'Hallway',
    defaultWidth: 240,
    defaultHeight: 60,
    color: 'var(--editor-object-hallway)', // slate-400
    fill: 'color-mix(in oklch, var(--editor-object-hallway) 80%, transparent)',
    stroke: 'color-mix(in oklch, var(--editor-object-hallway) 82%, var(--editor-background))',
    icon: Route,
  },
  stairs: {
    label: 'Stairs',
    defaultWidth: 80,
    defaultHeight: 80,
    color: 'var(--editor-object-stairs)', // orange-500
    fill: 'color-mix(in oklch, var(--editor-object-stairs) 20%, transparent)',
    stroke: 'var(--editor-object-stairs)',
    icon: ArrowUpRight,
  },
  elevator: {
    label: 'Elevator',
    defaultWidth: 60,
    defaultHeight: 60,
    color: 'var(--editor-object-elevator)', // purple-500
    fill: 'color-mix(in oklch, var(--editor-object-elevator) 20%, transparent)',
    stroke: 'var(--editor-object-elevator)',
    icon: ArrowUpDown,
  },
  escalator: {
    label: 'Escalator',
    defaultWidth: 100,
    defaultHeight: 60,
    color: 'var(--editor-object-escalator)', // sky-500
    fill: 'color-mix(in oklch, var(--editor-object-escalator) 20%, transparent)',
    stroke: 'var(--editor-object-escalator)',
    icon: TrendingUp,
  },
  washroom: {
    label: 'Washroom',
    defaultWidth: 80,
    defaultHeight: 80,
    color: 'var(--editor-object-washroom)', // cyan-500
    fill: 'color-mix(in oklch, var(--editor-object-washroom) 15%, transparent)',
    stroke: 'var(--editor-object-washroom)',
    icon: Bath,
  },
  exit: {
    label: 'Exit',
    defaultWidth: 40,
    defaultHeight: 40,
    color: 'var(--editor-object-exit)', // red-500
    fill: 'color-mix(in oklch, var(--editor-object-exit) 20%, transparent)',
    stroke: 'var(--editor-object-exit)',
    icon: LogOut,
  },
  poi: {
    label: 'POI',
    defaultWidth: 40,
    defaultHeight: 40,
    color: 'var(--editor-object-poi)', // pink-500
    fill: 'color-mix(in oklch, var(--editor-object-poi) 20%, transparent)',
    stroke: 'var(--editor-object-poi)',
    icon: MapPin,
  },
  aisle: {
    label: 'Aisle',
    defaultWidth: 40,
    defaultHeight: 160,
    color: 'var(--editor-object-aisle)', // emerald-500
    fill: 'color-mix(in oklch, var(--editor-object-aisle) 10%, transparent)',
    stroke: 'color-mix(in oklch, var(--editor-object-aisle) 40%, transparent)',
    icon: Split,
  },
  shelf: {
    label: 'Shelf',
    defaultWidth: 40,
    defaultHeight: 120,
    color: 'var(--editor-object-shelf)', // teal-500
    fill: 'color-mix(in oklch, var(--editor-object-shelf) 20%, transparent)',
    stroke: 'var(--editor-object-shelf)',
    icon: Layers,
  },
  section: {
    label: 'Section',
    defaultWidth: 160,
    defaultHeight: 160,
    color: 'var(--editor-object-section)', // indigo-500
    fill: 'color-mix(in oklch, var(--editor-object-section) 8%, transparent)',
    stroke: 'color-mix(in oklch, var(--editor-object-section) 30%, transparent)',
    icon: LayoutGrid,
  },
};

export function getDefaultDimensions(type: ToolboxObjectType): { width: number; height: number } {
  const config = OBJECT_CONFIGS[type];
  return {
    width: config.defaultWidth,
    height: config.defaultHeight,
  };
}

// Seeds a "Custom" shape's points from the object's current bounding box, so
// it starts identical-looking to the rectangle it just was.
export function defaultPolygonPoints(width: number, height: number): { x: number; y: number }[] {
  return [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];
}

export function getObjectColor(type: ToolboxObjectType): { fill: string; stroke: string; color: string } {
  const config = OBJECT_CONFIGS[type];
  return {
    fill: config.fill,
    stroke: config.stroke,
    color: config.color,
  };
}

// Counts existing objects of the same type already on this floor (all
// already in the local editor store — no server round trip) and numbers
// the new one after them, so placing ten rooms gives "Room 1".."Room 10"
// instead of ten identical "New Room"s.
export function getDefaultObjectName(
  type: ToolboxObjectType,
  existingObjects: EditorMapObject[],
): string {
  const sameTypeCount = existingObjects.filter((object) => object.type === type).length;
  return `${OBJECT_CONFIGS[type].label} ${sameTypeCount + 1}`;
}

export interface ObjectCategory {
  id: string;
  label: string;
  types: ToolboxObjectType[];
}

// Single source of truth for how the toolbox groups object types — edit
// this list to add/move/rename a category.
export const OBJECT_CATEGORIES: ObjectCategory[] = [
  { id: 'structure', label: 'Structure', types: ['room', 'wall', 'door', 'hallway'] },
  { id: 'connectors', label: 'Connectors', types: ['stairs', 'elevator', 'escalator'] },
  { id: 'wayfinding', label: 'Wayfinding & Amenities', types: ['washroom', 'exit', 'poi'] },
  { id: 'retail', label: 'Retail & Storage', types: ['aisle', 'shelf', 'section'] },
];

export const NODE_ROLE_OPTIONS = [
  { label: 'Entrance', value: 'entrance' },
  { label: 'Exit', value: 'exit' },
  { label: 'Hallway Point', value: 'hallway_point' },
  { label: 'Stairs Entry', value: 'stairs_entry' },
  { label: 'Elevator Entry', value: 'elevator_entry' },
  { label: 'Escalator Entry', value: 'escalator_entry' },
  { label: 'Shelf Access', value: 'shelf_access' },
] as const;

export const EDGE_TYPE_OPTIONS = [
  { label: 'Walkway', value: 'walkway' },
  { label: 'Stairs', value: 'stairs' },
  { label: 'Elevator', value: 'elevator' },
  { label: 'Escalator', value: 'escalator' },
  { label: 'Ramp', value: 'ramp' },
] as const;
