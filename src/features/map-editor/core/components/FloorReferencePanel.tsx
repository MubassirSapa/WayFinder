'use client';

import Image from 'next/image';
import React, { useRef, useState, useTransition } from 'react';
import { ImagePlus, ImageUp, Loader2, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadFloorReferenceImage } from '../actions/floorEditorActions';
import { useEditorStore } from '@/store';

export function FloorReferencePanel() {
  const { floor, updateFloor } = useEditorStore();
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
            || `${floor.name} reference image`,
        );

        const uploadedImage = await uploadFloorReferenceImage(formData);

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
            : 'Failed to upload reference image.',
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
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-zinc-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10">
              <ImagePlus className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.22em]">
                Reference Image
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Builder overlay
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-zinc-700 bg-zinc-950/60 text-zinc-300">
              {floor?.backgroundImageUrl ? 'Attached' : 'Empty'}
            </Badge>
            {floor?._dirty ? (
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300">
                Unsaved
              </Badge>
            ) : null}
          </div>
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-500">
          Upload a floor plan or sketch to trace against the canvas, then save the floor.
        </p>
      </div>

      {floor?.backgroundImageUrl ? (
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70">
          <div className="relative aspect-[4/3] w-full bg-zinc-900">
            <Image
              alt={floor.backgroundImageAlt ?? `${floor.name} reference image`}
              className="object-cover"
              fill
              sizes="288px"
              src={floor.backgroundImageUrl}
            />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-zinc-800 px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium text-zinc-200">
                {floor.backgroundImageName ?? 'Current reference image'}
              </p>
              <p className="truncate text-[10px] text-zinc-500">
                {floor.backgroundImageAlt ?? 'No alt text provided'}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              onClick={handleRemove}
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/45 p-3">
        <div className="space-y-1.5">
          <Label htmlFor="floor-reference-file" className="text-[11px] text-zinc-300">
            Image File
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
                setAltText(floor.backgroundImageAlt ?? `${floor.name} reference image`);
              }
              setError(null);
            }}
          />
          <p className="text-[10px] text-zinc-500">
            {selectedFile ? `Ready to upload: ${selectedFile.name}` : 'Choose a PNG, JPG, or similar floor reference image.'}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="floor-reference-alt" className="text-[11px] text-zinc-300">
            Alt Text
          </Label>
          <Input
            id="floor-reference-alt"
            type="text"
            value={altText}
            disabled={!floor || isUploading}
            onChange={(event) => setAltText(event.target.value)}
            placeholder={floor?.backgroundImageAlt ?? `${floor?.name ?? 'Floor'} reference image`}
          />
        </div>

        {error ? (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[10px] text-red-300">
            {error}
          </p>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-auto w-full justify-start rounded-xl border-zinc-800 bg-zinc-950/50 px-3 py-3 text-left text-zinc-200 hover:bg-zinc-900"
          disabled={!floor || !selectedFile || isUploading}
          onClick={handleUpload}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Uploading Reference
            </>
          ) : (
            <>
              <ImageUp className="h-3 w-3" />
              {floor?.backgroundImageUrl ? 'Replace Reference Image' : 'Upload Reference Image'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
