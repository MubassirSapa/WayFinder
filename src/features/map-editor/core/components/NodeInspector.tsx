'use client';

import React, { useState } from 'react';
import { useEditorStore } from "@/store";
import { deleteMapNode } from "../actions/floorEditorActions";
import { NODE_ROLE_OPTIONS } from '../lib/objectDefaults';
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

interface NodeInspectorProps {
  nodeId: string;
}

export function NodeInspector({ nodeId }: NodeInspectorProps) {
  const { nodes, objects, updateNode, removeNode } = useEditorStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const node = nodes[nodeId];
  const objectsList = Object.values(objects);

  if (!node) return null;

  const handleFieldChange = (field: string, value: any) => {
    updateNode(nodeId, { [field]: value });
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this navigation node? This will also delete all connected path edges.')) {
      try {
        setIsDeleting(true);
        if (!nodeId.startsWith('temp_')) {
          await deleteMapNode(nodeId);
        }
        removeNode(nodeId);
      } catch (err) {
        console.error('Error deleting map node:', err);
        alert('Failed to delete map node.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="p-4 space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="node-label">Label</Label>
        <Input
          id="node-label"
          type="text"
          value={node.label}
          onChange={(e) => handleFieldChange('label', e.target.value)}
          className="bg-zinc-800 border-zinc-700 text-zinc-100"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="node-role">Role / Type</Label>
        <Select
          value={node.role}
          onValueChange={(val) => handleFieldChange('role', val)}
        >
          <SelectTrigger id="node-role" className="bg-zinc-800 border-zinc-700 text-zinc-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-850 border-zinc-800 text-zinc-100">
            {NODE_ROLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="focus:bg-zinc-700">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="node-object">Linked Map Object</Label>
        <Select
          value={node.objectId || 'none'}
          onValueChange={(val) => handleFieldChange('objectId', val === 'none' ? null : val)}
        >
          <SelectTrigger id="node-object" className="bg-zinc-800 border-zinc-700 text-zinc-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-850 border-zinc-800 text-zinc-100">
            <SelectItem value="none" className="focus:bg-zinc-700">None / Unlinked</SelectItem>
            {objectsList
              .filter(o => o.type !== 'wall') // Don't link nodes to walls
              .map((obj) => (
                <SelectItem key={obj.id} value={obj.id} className="focus:bg-zinc-700">
                  {obj.name} ({obj.type})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="node-x">X Position</Label>
          <Input
            id="node-x"
            type="number"
            value={node.x}
            onChange={(e) => handleFieldChange('x', Number(e.target.value))}
            className="bg-zinc-800 border-zinc-700 text-zinc-100"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="node-y">Y Position</Label>
          <Input
            id="node-y"
            type="number"
            value={node.y}
            onChange={(e) => handleFieldChange('y', Number(e.target.value))}
            className="bg-zinc-800 border-zinc-700 text-zinc-100"
          />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="node-access"
            checked={node.isAccessible}
            onCheckedChange={(checked) => handleFieldChange('isAccessible', !!checked)}
          />
          <Label htmlFor="node-access" className="text-xs font-normal text-zinc-300">
            Accessible (Wheelchair friendly)
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
          {isDeleting ? 'Deleting...' : 'Delete Node'}
        </Button>
      </div>
    </div>
  );
}
