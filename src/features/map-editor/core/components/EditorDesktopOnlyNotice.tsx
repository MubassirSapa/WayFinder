'use client';

import Link from 'next/link';
import { Monitor } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EDITOR_UI_TEXT } from '../../constants/editorUi.constants';

export function EditorDesktopOnlyNotice() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-editor-background px-6 py-10 text-center text-editor-foreground lg:hidden">
      <div className="w-full max-w-sm rounded-3xl border border-editor-border bg-editor-panel/80 p-6 shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-editor-border-strong bg-editor-surface">
          <Monitor className="h-6 w-6 text-editor-foreground" />
        </div>
        <h1 className="mt-4 text-lg font-semibold">{EDITOR_UI_TEXT.desktopOnly.title}</h1>
        <p className="mt-2 text-sm leading-6 text-editor-muted-foreground">
          {EDITOR_UI_TEXT.desktopOnly.description}
        </p>
        <Button
          className="mt-5 w-full"
          nativeButton={false}
          render={<Link href="/dashboard" />}
        >
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
