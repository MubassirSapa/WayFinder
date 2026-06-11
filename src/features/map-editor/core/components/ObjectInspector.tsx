'use client';

import React, { useState } from 'react';
import { useEditorStore } from "@/store";
import { deleteMapObject } from "../actions/floorEditorActions";
import { OBJECT_CONFIGS } from '../lib/objectDefaults';
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

interface ObjectInspectorProps {
  objectId: string;
}

export function ObjectInspector({ objectId }: ObjectInspectorProps) {
  const { objects, updateObject, removeObject } = useEditorStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const object = objects[objectId];

  if (!object) return null;

  const handleFieldChange = (field: string, value: any) => {
    updateObject(objectId, { [field]: value });
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this map object?')) {
      try {
        setIsDeleting(true);
        if (!objectId.startsWith('temp_')) {
          await deleteMapObject(objectId);
        }
        removeObject(objectId);
      } catch (err) {
        console.error('Error deleting map object:', err);
        alert('Failed to delete map object from database.');
      } finally {
        setIsDeleting(false);
      }
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
          className="bg-zinc-800 border-zinc-700 text-zinc-100"
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
          className="bg-zinc-800 border-zinc-700 text-zinc-100"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="obj-type">Type</Label>
        <Select
          value={object.type}
          onValueChange={(val) => handleFieldChange('type', val as ToolboxObjectType)}
        >
          <SelectTrigger id="obj-type" className="bg-zinc-800 border-zinc-700 text-zinc-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-850 border-zinc-800 text-zinc-100">
            {Object.entries(OBJECT_CONFIGS).map(([key, config]) => (
              <SelectItem key={key} value={key} className="focus:bg-zinc-700">
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
            className="bg-zinc-800 border-zinc-700 text-zinc-100"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="obj-y">Y Position</Label>
          <Input
            id="obj-y"
            type="number"
            value={object.y}
            onChange={(e) => handleFieldChange('y', Number(e.target.value))}
            className="bg-zinc-800 border-zinc-700 text-zinc-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="obj-w">Width (px)</Label>
          <Input
            id="obj-w"
            type="number"
            value={object.width}
            onChange={(e) => handleFieldChange('width', Number(e.target.value))}
            className="bg-zinc-800 border-zinc-700 text-zinc-100"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="obj-h">Height (px)</Label>
          <Input
            id="obj-h"
            type="number"
            value={object.height}
            onChange={(e) => handleFieldChange('y', Number(e.target.value))}
            className="bg-zinc-800 border-zinc-700 text-zinc-100"
            style={{ display: 'none' }} // we'll use actual input below
          />
          <Input
            id="obj-h-actual"
            type="number"
            value={object.height}
            onChange={(e) => handleFieldChange('height', Number(e.target.value))}
            className="bg-zinc-800 border-zinc-700 text-zinc-100"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="obj-rot">Rotation (degrees)</Label>
        <Input
          id="obj-rot"
          type="number"
          min="-360"
          max="360"
          value={object.rotation}
          onChange={(e) => handleFieldChange('rotation', Number(e.target.value))}
          className="bg-zinc-800 border-zinc-700 text-zinc-100"
        />
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="obj-search"
            checked={object.isSearchable}
            onCheckedChange={(checked) => handleFieldChange('isSearchable', !!checked)}
          />
          <Label htmlFor="obj-search" className="text-xs font-normal text-zinc-300">
            Searchable (Index for guests)
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="obj-access"
            checked={object.isAccessible}
            onCheckedChange={(checked) => handleFieldChange('isAccessible', !!checked)}
          />
          <Label htmlFor="obj-access" className="text-xs font-normal text-zinc-300">
            Accessible Pathing (Wheelchair friendly)
          </Label>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800 flex gap-2">
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-full text-xs"
        >
          {isDeleting ? 'Deleting...' : 'Delete Object'}
        </Button>
      </div>
    </div>
  );
}
