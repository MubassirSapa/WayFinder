'use client';

import Image from 'next/image';
import React, { useRef, useState, useTransition } from 'react';
import { ImageUp, Loader2, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EDITOR_UI_TEXT } from '../../constants/editorUi.constants';
import { uploadFloorReferenceImage } from '../actions/server/floor-actions';
import { assertSuccess } from '@/lib/responses';
import { useAppStore } from '@/store';

export function FloorReferencePanel() {
  const { floor, updateFloor } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();

  const handleUpload = () => {
    if (!floor || !selectedFile) {
      return;
    }

    setError(null);

    startUpload(async () => {
      try {
        const formData = new FormData();
        formData.set('file', selectedFile);
        formData.set(
          'alt',
          altText.trim()
            || floor.backgroundImageAlt
            || EDITOR_UI_TEXT.referencePanel.defaultAlt(floor.name),
        );

        const uploadedImage = assertSuccess(await uploadFloorReferenceImage(formData));

        updateFloor({
          backgroundImageAlt: uploadedImage.alt,
          backgroundImageId: uploadedImage.id,
          backgroundImageName: uploadedImage.filename,
          backgroundImageUrl: uploadedImage.url,
        });

        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : EDITOR_UI_TEXT.referencePanel.error,
        );
      }
    });
  };

  const handleRemove = () => {
    setError(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    updateFloor({
      backgroundImageAlt: null,
      backgroundImageId: null,
      backgroundImageName: null,
      backgroundImageUrl: null,
    });
  };

  return (
    <div className="p-4 space-y-4">
      {floor?._dirty ? (
        <Badge
          variant="outline"
          className="border-warning/30 bg-warning/10 text-warning"
        >
          Unsaved
        </Badge>
      ) : null}
      <p className="text-[11px] leading-relaxed text-editor-subtle-foreground">
        {EDITOR_UI_TEXT.referencePanel.description}
      </p>

      {floor?.backgroundImageUrl ? (
        <div className="overflow-hidden rounded-2xl border border-editor-border bg-editor-background/70">
          <div className="relative aspect-4/3 w-full bg-editor-panel">
            <Image
              alt={floor.backgroundImageAlt ?? `${floor.name} reference image`}
              className="object-cover"
              fill
              sizes="288px"
              src={floor.backgroundImageUrl}
            />
          </div>
          <div className="flex flex-col gap-3 border-t border-editor-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium text-editor-foreground">
                {floor.backgroundImageName ?? EDITOR_UI_TEXT.referencePanel.currentImageFallback}
              </p>
              <p className="truncate text-[10px] text-editor-subtle-foreground">
                {floor.backgroundImageAlt ?? EDITOR_UI_TEXT.referencePanel.noAltFallback}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start text-editor-muted-foreground hover:bg-editor-panel hover:text-editor-foreground sm:self-auto"
              onClick={handleRemove}
            >
              <Trash2 className="h-3 w-3" />
              {EDITOR_UI_TEXT.referencePanel.remove}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3 rounded-2xl border border-editor-border bg-editor-panel/45 p-3">
        <div className="space-y-1.5">
          <Label htmlFor="floor-reference-file" className="text-[11px] text-editor-muted-foreground">
            {EDITOR_UI_TEXT.referencePanel.fileFieldLabel}
          </Label>
          <input
            ref={fileInputRef}
            id="floor-reference-file"
            type="file"
            accept="image/*"
            disabled={!floor || isUploading}
            className="h-7 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-xs/relaxed dark:bg-input/30"
            onChange={(event) => {
              setSelectedFile(event.target.files?.[0] ?? null);
              if (!altText.trim() && floor) {
                setAltText(
                  floor.backgroundImageAlt
                  ?? EDITOR_UI_TEXT.referencePanel.defaultAlt(floor.name),
                );
              }
              setError(null);
            }}
          />
          <p className="text-[10px] text-editor-subtle-foreground">
            {selectedFile
              ? `${EDITOR_UI_TEXT.referencePanel.readyToUploadPrefix} ${selectedFile.name}`
              : EDITOR_UI_TEXT.referencePanel.fileHint}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="floor-reference-alt" className="text-[11px] text-editor-muted-foreground">
            {EDITOR_UI_TEXT.referencePanel.altFieldLabel}
          </Label>
          <Input
            id="floor-reference-alt"
            type="text"
            value={altText}
            disabled={!floor || isUploading}
            onChange={(event) => setAltText(event.target.value)}
            placeholder={
              floor?.backgroundImageAlt
              ?? EDITOR_UI_TEXT.referencePanel.defaultAlt(
                floor?.name ?? EDITOR_UI_TEXT.toolbar.floorPrefix,
              )
            }
          />
        </div>

        {error ? (
          <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-[10px] text-destructive">
            {error}
          </p>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-auto w-full justify-start rounded-xl border-editor-border bg-editor-background/50 px-3 py-3 text-left text-editor-foreground hover:bg-editor-panel"
          disabled={!floor || !selectedFile || isUploading}
          onClick={handleUpload}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              {EDITOR_UI_TEXT.referencePanel.uploading}
            </>
          ) : (
            <>
              <ImageUp className="h-3 w-3" />
              {floor?.backgroundImageUrl
                ? EDITOR_UI_TEXT.referencePanel.replaceAction
                : EDITOR_UI_TEXT.referencePanel.uploadAction}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
