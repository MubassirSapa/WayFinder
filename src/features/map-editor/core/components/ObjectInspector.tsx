'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAppStore } from "@/store";
import { deleteMapObject } from "../actions/server/object-actions";
import { assertSuccess } from "@/lib/responses";
import { defaultPolygonPoints, OBJECT_CONFIGS } from '../lib/objectDefaults';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToolboxObjectType } from '../types/editor.types';
import { EditorMapObject } from '../types/map.types';
import { isConnectorNodeRole } from '@/features/map-editor/floor-links/lib/crossFloorConnect';
import { FloorLinkPanel } from '@/features/map-editor/floor-links/components/FloorLinkPanel';
import { DeleteEntityAlertDialog } from './DeleteEntityAlertDialog';

const CONNECTOR_OBJECT_TYPES: ToolboxObjectType[] = ['stairs', 'elevator', 'escalator'];

const SHAPE_OPTIONS = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'ellipse', label: 'Round' },
  { value: 'polygon', label: 'Custom' },
] as const;

interface ObjectInspectorProps {
  objectId: string;
}

export function ObjectInspector({ objectId }: ObjectInspectorProps) {
  const { objects, nodes, updateObject, removeObject } = useAppStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const object = objects[objectId];

  if (!object) return null;

  const linkedNode = Object.values(nodes).find((candidate) => candidate.objectId === object.id) ?? null;
  const isConnectorObject = CONNECTOR_OBJECT_TYPES.includes(object.type);

  const handleFieldChange = (field: string, value: unknown) => {
    updateObject(objectId, { [field]: value } as Partial<EditorMapObject>);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      if (!objectId.startsWith('temp_')) {
        assertSuccess(await deleteMapObject(objectId));
      }
      removeObject(objectId);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting map object:', err);
      toast.error('Failed to delete map object from database.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="obj-name">Name</Label>
        <Input
          id="obj-name"
          type="text"
          value={object.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          className="bg-editor-surface border-editor-border-strong text-editor-foreground"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="obj-label">Display Label</Label>
        <Input
          id="obj-label"
          type="text"
          value={object.label}
          onChange={(e) => handleFieldChange('label', e.target.value)}
          placeholder="Optional text overlay"
          className="bg-editor-surface border-editor-border-strong text-editor-foreground"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="obj-type">Type</Label>
        <Select
          value={object.type}
          onValueChange={(val) => handleFieldChange('type', val as ToolboxObjectType)}
        >
          <SelectTrigger id="obj-type" className="w-full bg-editor-surface border-editor-border-strong text-editor-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-editor-surface border-editor-border text-editor-foreground">
            {Object.entries(OBJECT_CONFIGS).map(([key, config]) => (
              <SelectItem key={key} value={key} className="focus:bg-editor-hover">
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="obj-x">X Position</Label>
          <Input
            id="obj-x"
            type="number"
            value={object.x}
            onChange={(e) => handleFieldChange('x', Number(e.target.value))}
            className="bg-editor-surface border-editor-border-strong text-editor-foreground"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="obj-y">Y Position</Label>
          <Input
            id="obj-y"
            type="number"
            value={object.y}
            onChange={(e) => handleFieldChange('y', Number(e.target.value))}
            className="bg-editor-surface border-editor-border-strong text-editor-foreground"
          />
        </div>
      </div>

      {object.shape === 'polygon' ? (
        <p className="rounded-xl border border-editor-border bg-editor-panel/45 px-3 py-2 text-[11px] leading-relaxed text-editor-subtle-foreground">
          Drag the corner points on the canvas to reshape. Drag a small dashed point to pull out a new corner from that edge.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="obj-w">Width (px)</Label>
            <Input
              id="obj-w"
              type="number"
              value={object.width}
              onChange={(e) => handleFieldChange('width', Number(e.target.value))}
              className="bg-editor-surface border-editor-border-strong text-editor-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="obj-h">Height (px)</Label>
            <Input
              id="obj-h"
              type="number"
              value={object.height}
              onChange={(e) => handleFieldChange('height', Number(e.target.value))}
              className="bg-editor-surface border-editor-border-strong text-editor-foreground"
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="obj-rot">Rotation (degrees)</Label>
        <Input
          id="obj-rot"
          type="number"
          min="-360"
          max="360"
          value={object.rotation}
          onChange={(e) => handleFieldChange('rotation', Number(e.target.value))}
          className="bg-editor-surface border-editor-border-strong text-editor-foreground"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Shape</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {SHAPE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={object.shape === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (option.value === 'polygon' && (object.points?.length ?? 0) < 3) {
                  updateObject(objectId, {
                    shape: option.value,
                    points: defaultPolygonPoints(object.width, object.height),
                  });
                } else {
                  handleFieldChange('shape', option.value);
                }
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="obj-search"
            checked={object.isSearchable}
            onCheckedChange={(checked) => handleFieldChange('isSearchable', !!checked)}
          />
          <Label htmlFor="obj-search" className="text-xs font-normal text-editor-muted-foreground">
            Searchable (Index for guests)
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="obj-access"
            checked={object.isAccessible}
            onCheckedChange={(checked) => handleFieldChange('isAccessible', !!checked)}
          />
          <Label htmlFor="obj-access" className="text-xs font-normal text-editor-muted-foreground">
            Accessible Pathing (Wheelchair friendly)
          </Label>
        </div>
      </div>

      {isConnectorObject ? (
        <div className="pt-2">
          {linkedNode && isConnectorNodeRole(linkedNode.role) ? (
            <FloorLinkPanel node={linkedNode} />
          ) : (
            <p className="rounded-2xl border border-editor-border bg-editor-panel/45 p-3 text-[11px] leading-relaxed text-editor-subtle-foreground">
              This {object.type} has no navigation node yet. Generate one (Smart Builder → Generate Nodes, or switch to Node mode) before linking it to another floor.
            </p>
          )}
        </div>
      ) : null}

      <div className="pt-4 border-t border-editor-border flex gap-2">
        <Button
          variant="destructive"
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={isDeleting}
          className="w-full text-xs"
        >
          {isDeleting ? 'Deleting...' : 'Delete Object'}
        </Button>
      </div>

      <DeleteEntityAlertDialog
        confirmLabel="Delete"
        description="This will permanently delete this map object. This can't be undone."
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
        title="Delete this object?"
      />
    </div>
  );
}
