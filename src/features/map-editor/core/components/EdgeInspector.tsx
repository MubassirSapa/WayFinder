'use client';

import  { useState } from 'react';
import { toast } from 'sonner';
import { useAppStore } from "@/store";
import { deletePathEdge } from "../actions/server/edge-actions";
import { assertSuccess } from "@/lib/responses";
import { EDGE_TYPE_OPTIONS } from '../lib/objectDefaults';
import { EditorPathEdge } from '../types/map.types';
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
import { DeleteEntityAlertDialog } from './DeleteEntityAlertDialog';

interface EdgeInspectorProps {
  edgeId: string;
}

export function EdgeInspector({ edgeId }: EdgeInspectorProps) {
  const { edges, nodes, updateEdge, removeEdge } = useAppStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const edge = edges[edgeId];

  if (!edge) return null;

  const fromNode = nodes[edge.fromNodeId];
  const toNode = nodes[edge.toNodeId];

  const handleFieldChange = (field: string, value: unknown) => {
    updateEdge(edgeId, { [field]: value } as Partial<EditorPathEdge>);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      if (!edgeId.startsWith('temp_')) {
        assertSuccess(await deletePathEdge(edgeId));
      }
      removeEdge(edgeId);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting path edge:', err);
      toast.error('Failed to delete path edge.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 space-y-5">
      <div className="p-3 bg-editor-surface/40 border border-editor-border rounded-lg space-y-1.5 text-xs text-editor-muted-foreground">
        <div>
          <span className="text-editor-subtle-foreground font-semibold uppercase tracking-wider text-[10px] block">Connection Source</span>
          <span className="text-editor-foreground font-medium">{fromNode ? `${fromNode.label} (${fromNode.role})` : 'Unknown Node'}</span>
        </div>
        <div className="pt-2 border-t border-editor-border/80">
          <span className="text-editor-subtle-foreground font-semibold uppercase tracking-wider text-[10px] block">Connection Target</span>
          <span className="text-editor-foreground font-medium">{toNode ? `${toNode.label} (${toNode.role})` : 'Unknown Node'}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edge-type">Edge Type</Label>
        <Select
          value={edge.type}
          onValueChange={(val) => handleFieldChange('type', val)}
        >
          <SelectTrigger id="edge-type" className="w-full bg-editor-surface border-editor-border-strong text-editor-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-editor-surface border-editor-border text-editor-foreground">
            {EDGE_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="focus:bg-editor-hover">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edge-distance">Distance (Meters)</Label>
        <Input
          id="edge-distance"
          type="number"
          step="0.05"
          min="0"
          value={edge.distanceMeters}
          onChange={(e) => handleFieldChange('distanceMeters', Number(e.target.value))}
          className="bg-editor-surface border-editor-border-strong text-editor-foreground"
        />
        <p className="text-[10px] text-editor-subtle-foreground leading-normal mt-1">
          Auto-calculated on creation. Feel free to adjust manually.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="edge-bidirectional"
            checked={edge.bidirectional}
            onCheckedChange={(checked) => handleFieldChange('bidirectional', !!checked)}
          />
          <Label htmlFor="edge-bidirectional" className="text-xs font-normal text-editor-muted-foreground">
            Bidirectional (Two-way travel)
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="edge-access"
            checked={edge.isAccessible}
            onCheckedChange={(checked) => handleFieldChange('isAccessible', !!checked)}
          />
          <Label htmlFor="edge-access" className="text-xs font-normal text-editor-muted-foreground">
            Accessible Pathing (Wheelchair friendly)
          </Label>
        </div>
      </div>

      <div className="pt-4 border-t border-editor-border flex gap-2">
        <Button
          variant="destructive"
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={isDeleting}
          className="w-full text-xs"
        >
          {isDeleting ? 'Deleting...' : 'Delete Edge'}
        </Button>
      </div>

      <DeleteEntityAlertDialog
        confirmLabel="Delete"
        description="This will permanently delete this path connection. This can't be undone."
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
        title="Delete this path edge?"
      />
    </div>
  );
}
