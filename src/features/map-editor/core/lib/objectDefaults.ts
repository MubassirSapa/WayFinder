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
    color: '#3b82f6', // blue-500
    fill: 'rgba(59, 130, 246, 0.15)',
    stroke: '#3b82f6',
    icon: Square,
  },
  wall: {
    label: 'Wall',
    defaultWidth: 200,
    defaultHeight: 20,
    color: '#64748b', // slate-500
    fill: 'rgba(100, 116, 139, 0.8)',
    stroke: '#475569',
    icon: Minus,
  },
  door: {
    label: 'Door',
    defaultWidth: 40,
    defaultHeight: 20,
    color: '#eab308', // yellow-500
    fill: 'rgba(234, 179, 8, 0.2)',
    stroke: '#eab308',
    icon: DoorOpen,
  },
  hallway: {
    label: 'Hallway',
    defaultWidth: 240,
    defaultHeight: 60,
    color: '#94a3b8', // slate-400
    fill: 'rgba(148, 163, 184, 0.1)',
    stroke: 'rgba(148, 163, 184, 0.4)',
    icon: Route,
  },
  stairs: {
    label: 'Stairs',
    defaultWidth: 80,
    defaultHeight: 80,
    color: '#f97316', // orange-500
    fill: 'rgba(249, 115, 22, 0.2)',
    stroke: '#f97316',
    icon: ArrowUpRight,
  },
  elevator: {
    label: 'Elevator',
    defaultWidth: 60,
    defaultHeight: 60,
    color: '#a855f7', // purple-500
    fill: 'rgba(168, 85, 247, 0.2)',
    stroke: '#a855f7',
    icon: ArrowUpDown,
  },
  escalator: {
    label: 'Escalator',
    defaultWidth: 100,
    defaultHeight: 60,
    color: '#0ea5e9', // sky-500
    fill: 'rgba(14, 165, 233, 0.2)',
    stroke: '#0ea5e9',
    icon: TrendingUp,
  },
  washroom: {
    label: 'Washroom',
    defaultWidth: 80,
    defaultHeight: 80,
    color: '#06b6d4', // cyan-500
    fill: 'rgba(6, 182, 212, 0.15)',
    stroke: '#06b6d4',
    icon: Bath,
  },
  exit: {
    label: 'Exit',
    defaultWidth: 40,
    defaultHeight: 40,
    color: '#ef4444', // red-500
    fill: 'rgba(239, 68, 68, 0.2)',
    stroke: '#ef4444',
    icon: LogOut,
  },
  poi: {
    label: 'POI',
    defaultWidth: 40,
    defaultHeight: 40,
    color: '#ec4899', // pink-500
    fill: 'rgba(236, 72, 153, 0.2)',
    stroke: '#ec4899',
    icon: MapPin,
  },
  aisle: {
    label: 'Aisle',
    defaultWidth: 40,
    defaultHeight: 160,
    color: '#10b981', // emerald-500
    fill: 'rgba(16, 185, 129, 0.1)',
    stroke: 'rgba(16, 185, 129, 0.4)',
    icon: Split,
  },
  shelf: {
    label: 'Shelf',
    defaultWidth: 40,
    defaultHeight: 120,
    color: '#14b8a6', // teal-500
    fill: 'rgba(20, 184, 166, 0.2)',
    stroke: '#14b8a6',
    icon: Layers,
  },
  section: {
    label: 'Section',
    defaultWidth: 160,
    defaultHeight: 160,
    color: '#6366f1', // indigo-500
    fill: 'rgba(99, 102, 241, 0.08)',
    stroke: 'rgba(99, 102, 241, 0.3)',
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

export function getObjectColor(type: ToolboxObjectType): { fill: string; stroke: string; color: string } {
  const config = OBJECT_CONFIGS[type];
  return {
    fill: config.fill,
    stroke: config.stroke,
    color: config.color,
  };
}

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
