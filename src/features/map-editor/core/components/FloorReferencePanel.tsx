'use client';

import Image from 'next/image';
import React, { useEffect, useRef, useState, useTransition } from 'react';
import { ImageOff, ImageUp, Loader2, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { EDITOR_UI_TEXT } from '../../constants/editorUi.constants';
import {
  EDITOR_IMAGE_MAX_ZOOM_PERCENT,
  EDITOR_IMAGE_MIN_ZOOM_PERCENT,
  EDITOR_IMAGE_ZOOM_STEP_PERCENT,
} from '../constants/referenceImage.constants';
import { MEDIA_RESOURCE_FOLDER } from '@/constants/media';
import { uploadMediaClientSide } from '@/lib/uploads/uploadMediaClientSide';
import { useAppStore } from '@/store';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const FIT_OPTIONS = [
  { value: 'fill', label: EDITOR_UI_TEXT.referencePanel.adjust.fitFill },
  { value: 'cover', label: EDITOR_UI_TEXT.referencePanel.adjust.fitCover },
  { value: 'contain', label: EDITOR_UI_TEXT.referencePanel.adjust.fitContain },
] as const;

export function FloorReferencePanel() {
  const { floor, objects, nodes, edges, updateFloor } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stagedPreviewUrl, setStagedPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();

  const isLocked = floor?.backgroundImageLocked ?? false;
  const isVisible = floor?.backgroundImageVisible ?? true;
  const previewUrl = stagedPreviewUrl ?? floor?.backgroundImageUrl ?? null;
  // Nothing placed yet on this floor - safe to resize the canvas to match an
  // uploaded image's own dimensions, since no object/node x/y would end up
  // stranded outside the new bounds.
  const isFloorEmpty = Object.keys(objects).length === 0
    && Object.keys(nodes).length === 0
    && Object.keys(edges).length === 0;

  // Revoke a staged blob preview whenever it's replaced or the panel unmounts.
  useEffect(() => {
    return () => {
      if (stagedPreviewUrl) URL.revokeObjectURL(stagedPreviewUrl);
    };
  }, [stagedPreviewUrl]);

  const clearStagedFile = () => {
    setSelectedFile(null);
    setStagedPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = () => {
    if (!floor || !selectedFile) {
      return;
    }

    setError(null);

    startUpload(async () => {
      try {
        const alt = altText.trim()
          || floor.backgroundImageAlt
          || EDITOR_UI_TEXT.referencePanel.defaultAlt(floor.name);

        const uploadedImage = await uploadMediaClientSide({
          data: { alt },
          docPrefix: MEDIA_RESOURCE_FOLDER.FLOORS,
          file: selectedFile,
        });

        updateFloor({
          backgroundImageAlt: uploadedImage.alt,
          backgroundImageId: String(uploadedImage.id),
          backgroundImageName: uploadedImage.filename ?? null,
          backgroundImageUrl: uploadedImage.url ?? null,
          backgroundImageNaturalWidth: uploadedImage.width ?? null,
          backgroundImageNaturalHeight: uploadedImage.height ?? null,
          backgroundImageRotation: 0,
          backgroundImageScale: 1,
          backgroundImageOpacity: 0.3,
          backgroundImageOffsetX: 0,
          backgroundImageOffsetY: 0,
          backgroundImageFit: 'fill',
          backgroundImageVisible: true,
          ...(isFloorEmpty && uploadedImage.width && uploadedImage.height
            ? { width: uploadedImage.width, height: uploadedImage.height }
            : {}),
        });

        clearStagedFile();
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
    clearStagedFile();

    updateFloor({
      backgroundImageAlt: null,
      backgroundImageId: null,
      backgroundImageName: null,
      backgroundImageUrl: null,
      backgroundImageNaturalWidth: null,
      backgroundImageNaturalHeight: null,
      backgroundImageRotation: 0,
      backgroundImageScale: 1,
      backgroundImageOpacity: 0.3,
      backgroundImageLocked: false,
      backgroundImageOffsetX: 0,
      backgroundImageOffsetY: 0,
      backgroundImageFit: 'fill',
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

      <div className="overflow-hidden rounded-2xl border border-editor-border bg-editor-background/70">
        <div className="relative aspect-4/3 w-full bg-editor-panel">
          {previewUrl ? (
            <Image
              alt={floor?.backgroundImageAlt ?? `${floor?.name ?? EDITOR_UI_TEXT.toolbar.floorPrefix} reference image`}
              className="object-cover"
              fill
              sizes="288px"
              src={previewUrl}
              unoptimized
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1.5 text-editor-subtle-foreground">
              <ImageOff className="h-5 w-5" />
              <p className="text-[10px]">{EDITOR_UI_TEXT.referencePanel.emptyStatus}</p>
            </div>
          )}
        </div>
        {selectedFile ? (
          <div className="flex flex-col gap-3 border-t border-editor-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0 truncate text-[11px] font-medium text-editor-foreground">
              {EDITOR_UI_TEXT.referencePanel.readyToUploadPrefix} {selectedFile.name}
            </p>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="self-start sm:self-auto"
              disabled={isUploading}
              onClick={clearStagedFile}
            >
              <Trash2 className="h-3 w-3" />
              {EDITOR_UI_TEXT.referencePanel.cancelStaged}
            </Button>
          </div>
        ) : floor?.backgroundImageUrl ? (
          <div className="flex flex-col gap-3 border-t border-editor-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium text-editor-foreground">
                {floor.backgroundImageAlt ?? EDITOR_UI_TEXT.referencePanel.currentImageFallback}
              </p>
              <p className="truncate text-[10px] text-editor-subtle-foreground">
                {floor.backgroundImageName ?? EDITOR_UI_TEXT.referencePanel.noAltFallback}
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="self-start sm:self-auto"
              disabled={isLocked}
              onClick={handleRemove}
            >
              <Trash2 className="h-3 w-3" />
              {EDITOR_UI_TEXT.referencePanel.remove}
            </Button>
          </div>
        ) : null}
      </div>

      {floor?.backgroundImageUrl ? (
        <div className="space-y-4 rounded-2xl border border-editor-border bg-editor-panel/45 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-editor-foreground">
                {EDITOR_UI_TEXT.referencePanel.adjust.title}
              </p>
              <p className="mt-0.5 text-[10px] text-editor-subtle-foreground">
                {EDITOR_UI_TEXT.referencePanel.adjust.lockDescription}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="floor-reference-visible" className="text-[10px] text-editor-muted-foreground">
                  {EDITOR_UI_TEXT.referencePanel.adjust.visible}
                </Label>
                <Switch
                  id="floor-reference-visible"
                  checked={isVisible}
                  className="data-unchecked:bg-editor-disabled-foreground dark:data-unchecked:bg-editor-disabled-foreground"
                  onCheckedChange={(checked) => updateFloor({ backgroundImageVisible: checked })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="floor-reference-lock" className="text-[10px] text-editor-muted-foreground">
                  {EDITOR_UI_TEXT.referencePanel.adjust.lock}
                </Label>
                <Switch
                  id="floor-reference-lock"
                  checked={isLocked}
                  className="data-unchecked:bg-editor-disabled-foreground dark:data-unchecked:bg-editor-disabled-foreground"
                  onCheckedChange={(checked) => updateFloor({ backgroundImageLocked: checked })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-[11px] text-editor-muted-foreground">
                {EDITOR_UI_TEXT.referencePanel.adjust.positionX}
              </Label>
              <Input
                type="number"
                step={5}
                disabled={isLocked}
                value={Math.round(floor.backgroundImageOffsetX ?? 0)}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (Number.isNaN(value)) return;
                  updateFloor({ backgroundImageOffsetX: value });
                }}
                className="h-6 w-16 px-1.5 text-right text-[10px]"
              />
            </div>
            <Slider
              disabled={isLocked}
              min={-floor.width}
              max={floor.width}
              step={5}
              value={[floor.backgroundImageOffsetX ?? 0]}
              onValueChange={(next) => {
                const value = Array.isArray(next) ? next[0] : next;
                updateFloor({ backgroundImageOffsetX: value });
              }}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-[11px] text-editor-muted-foreground">
                {EDITOR_UI_TEXT.referencePanel.adjust.positionY}
              </Label>
              <Input
                type="number"
                step={5}
                disabled={isLocked}
                value={Math.round(floor.backgroundImageOffsetY ?? 0)}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (Number.isNaN(value)) return;
                  updateFloor({ backgroundImageOffsetY: value });
                }}
                className="h-6 w-16 px-1.5 text-right text-[10px]"
              />
            </div>
            <Slider
              disabled={isLocked}
              min={-floor.height}
              max={floor.height}
              step={5}
              value={[floor.backgroundImageOffsetY ?? 0]}
              onValueChange={(next) => {
                const value = Array.isArray(next) ? next[0] : next;
                updateFloor({ backgroundImageOffsetY: value });
              }}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-[11px] text-editor-muted-foreground">
                {EDITOR_UI_TEXT.referencePanel.adjust.rotation}
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={360}
                  step={1}
                  disabled={isLocked}
                  value={Math.round(floor.backgroundImageRotation ?? 0)}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (Number.isNaN(value)) return;
                    updateFloor({ backgroundImageRotation: clamp(value, 0, 360) });
                  }}
                  className="h-6 w-14 px-1.5 text-right text-[10px]"
                />
                <span className="text-[10px] text-editor-subtle-foreground">°</span>
              </div>
            </div>
            <Slider
              disabled={isLocked}
              min={0}
              max={360}
              step={1}
              value={[floor.backgroundImageRotation ?? 0]}
              onValueChange={(next) => {
                const value = Array.isArray(next) ? next[0] : next;
                updateFloor({ backgroundImageRotation: value });
              }}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-[11px] text-editor-muted-foreground">
                {EDITOR_UI_TEXT.referencePanel.adjust.zoom}
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={EDITOR_IMAGE_MIN_ZOOM_PERCENT}
                  max={EDITOR_IMAGE_MAX_ZOOM_PERCENT}
                  step={EDITOR_IMAGE_ZOOM_STEP_PERCENT}
                  disabled={isLocked}
                  value={Math.round((floor.backgroundImageScale ?? 1) * 100)}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (Number.isNaN(value)) return;
                    updateFloor({
                      backgroundImageScale:
                        clamp(value, EDITOR_IMAGE_MIN_ZOOM_PERCENT, EDITOR_IMAGE_MAX_ZOOM_PERCENT) / 100,
                    });
                  }}
                  className="h-6 w-14 px-1.5 text-right text-[10px]"
                />
                <span className="text-[10px] text-editor-subtle-foreground">%</span>
              </div>
            </div>
            <Slider
              disabled={isLocked}
              min={EDITOR_IMAGE_MIN_ZOOM_PERCENT}
              max={EDITOR_IMAGE_MAX_ZOOM_PERCENT}
              step={EDITOR_IMAGE_ZOOM_STEP_PERCENT}
              value={[(floor.backgroundImageScale ?? 1) * 100]}
              onValueChange={(next) => {
                const value = Array.isArray(next) ? next[0] : next;
                updateFloor({ backgroundImageScale: value / 100 });
              }}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-[11px] text-editor-muted-foreground">
                {EDITOR_UI_TEXT.referencePanel.adjust.opacity}
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  disabled={isLocked}
                  value={Math.round((floor.backgroundImageOpacity ?? 0.3) * 100)}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (Number.isNaN(value)) return;
                    updateFloor({ backgroundImageOpacity: clamp(value, 0, 100) / 100 });
                  }}
                  className="h-6 w-14 px-1.5 text-right text-[10px]"
                />
                <span className="text-[10px] text-editor-subtle-foreground">%</span>
              </div>
            </div>
            <Slider
              disabled={isLocked}
              min={0}
              max={100}
              step={5}
              value={[(floor.backgroundImageOpacity ?? 0.3) * 100]}
              onValueChange={(next) => {
                const value = Array.isArray(next) ? next[0] : next;
                updateFloor({ backgroundImageOpacity: value / 100 });
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] text-editor-muted-foreground">
              {EDITOR_UI_TEXT.referencePanel.adjust.fit}
            </Label>
            <div className="grid grid-cols-3 gap-1.5">
              {FIT_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={(floor.backgroundImageFit ?? 'fill') === option.value ? 'default' : 'outline'}
                  size="sm"
                  disabled={isLocked}
                  onClick={() => updateFloor({ backgroundImageFit: option.value })}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-editor-subtle-foreground">
            {EDITOR_UI_TEXT.referencePanel.adjust.moveHint}
          </p>
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
            disabled={!floor || isUploading || isLocked}
            className="h-7 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-xs/relaxed dark:bg-input/30"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setSelectedFile(file);
              setStagedPreviewUrl((current) => {
                if (current) URL.revokeObjectURL(current);
                return file ? URL.createObjectURL(file) : null;
              });
              if (!altText.trim() && floor) {
                setAltText(
                  floor.backgroundImageAlt
                  ?? EDITOR_UI_TEXT.referencePanel.defaultAlt(floor.name),
                );
              }
              setError(null);
            }}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="floor-reference-alt" className="text-[11px] text-editor-muted-foreground">
            {EDITOR_UI_TEXT.referencePanel.imageNameFieldLabel}
          </Label>
          <Input
            id="floor-reference-alt"
            type="text"
            value={altText}
            disabled={!floor || isUploading || isLocked}
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

        {isFloorEmpty ? (
          <p className="rounded-xl border border-editor-border bg-editor-background/50 px-3 py-2 text-[10px] leading-relaxed text-editor-subtle-foreground">
            {EDITOR_UI_TEXT.referencePanel.autoFitHint}
          </p>
        ) : null}

        <Button
          type="button"
          variant="default"
          size="sm"
          className="h-auto w-full justify-start rounded-xl px-3 py-3 text-left"
          disabled={!floor || !selectedFile || isUploading || isLocked}
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
