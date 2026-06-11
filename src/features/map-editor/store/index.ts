import { create } from 'zustand';
import { EditorStore } from './types';
import { createEditorSlice } from './createEditorSlice';
import { createObjectSlice } from './createObjectSlice';
import { createNodeSlice } from './createNodeSlice';
import { createEdgeSlice } from './createEdgeSlice';

export const useEditorStore = create<EditorStore>()((...a) => ({
  ...createEditorSlice(...a),
  ...createObjectSlice(...a),
  ...createNodeSlice(...a),
  ...createEdgeSlice(...a),
}));

export * from './types';
export * from './selectors';
