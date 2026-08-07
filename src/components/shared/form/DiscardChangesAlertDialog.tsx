"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DiscardChangesAlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  title: string;
  description: string;
  cancelLabel: string;
  discardLabel: string;
};

export function DiscardChangesAlertDialog({
  open,
  onOpenChange,
  onDiscard,
  title,
  description,
  cancelLabel,
  discardLabel,
}: DiscardChangesAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction onClick={onDiscard}>
            {discardLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
