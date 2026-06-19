'use client';

import Link from 'next/link';
import { Monitor } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EDITOR_UI_TEXT } from '../../constants/editorUi.constants';

export function EditorDesktopOnlyNotice() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-950 px-6 py-10 text-center text-zinc-100 lg:hidden">
      <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800">
          <Monitor className="h-6 w-6 text-zinc-200" />
        </div>
        <h1 className="mt-4 text-lg font-semibold">{EDITOR_UI_TEXT.desktopOnly.title}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
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
