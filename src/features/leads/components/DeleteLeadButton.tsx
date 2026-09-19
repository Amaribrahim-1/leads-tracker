"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useDeleteLead } from "../hooks/useDeleteLead";

export function DeleteLeadButton({
  leadId,
  leadName,
}: {
  leadId: string;
  leadName: string;
}) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useDeleteLead();

  function handleConfirm() {
    mutate(leadId, {
      onSuccess: () => {
        toast.success("Lead deleted");
        setOpen(false);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isPending) setOpen(nextOpen);
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 text-sage hover:text-destructive"
            aria-label={`Delete ${leadName}`}
          />
        }
      >
        <Trash2 />
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/60 backdrop-blur-sm"
        className="gap-4 bg-card p-4 text-card-foreground ring-1 ring-cream/25 sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-lg text-cream">
            Delete this lead?
          </DialogTitle>
          <DialogDescription className="text-base text-sage">
            This cannot be undone. {leadName} will be removed from your
            pipeline.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-cream/15 bg-transparent">
          <DialogClose
            disabled={isPending}
            render={
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-10 w-full text-base text-cream sm:w-auto"
                disabled={isPending}
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            type="button"
            size="lg"
            className="h-10 w-full bg-destructive text-cream hover:bg-destructive/85 sm:w-auto"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete lead"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
