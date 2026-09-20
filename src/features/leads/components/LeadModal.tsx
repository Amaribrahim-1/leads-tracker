"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLeadsUIStore } from "../store";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { blockIfOffline } from "@/lib/isBrowserOffline";
import { useCreateLead } from "../hooks/useCreateLead";
import { useUpdateLead } from "../hooks/useUpdateLead";
import { LeadFormType, leadSchema } from "../schema";
import { LEAD_STATUSES, STATUS_LABELS } from "../statusLabels";

function toDateInputValue(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function LeadModal() {
  const isModalOpen = useLeadsUIStore((state) => state.isModalOpen);
  const closeModal = useLeadsUIStore((state) => state.closeModal);
  const modalMode = useLeadsUIStore((state) => state.modalMode);
  const editingLead = useLeadsUIStore((state) => state.editingLead);
  const isAdd = modalMode === "add";
  const defaultEditingLead = editingLead && {
    name: editingLead.name,
    source: editingLead.source ?? "",
    status: editingLead.status,
    notes: editingLead.notes ?? "",
    next_follow_up: toDateInputValue(editingLead.next_follow_up),
  };
  const {
    mutate: updateLead,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateLead();
  const {
    mutate: createLead,
    isPending: isCreating,
    error: createError,
  } = useCreateLead();

  const isSubmitting = isCreating || isUpdating;
  const submitError = createError ?? updateError;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<LeadFormType>({
    defaultValues: editingLead ? { ...defaultEditingLead } : { status: "idea" },
    resolver: zodResolver(leadSchema),
  });

  function handleClose() {
    reset();
    closeModal();
  }

  function onSubmit(data: LeadFormType) {
    if (blockIfOffline()) return;

    if (isAdd) {
      createLead(data, {
        onSuccess: () => {
          toast.success("Lead added");
          handleClose();
        },
      });
      return;
    }

    if (!editingLead) return;

    updateLead(
      { id: editingLead.id, values: data },
      {
        onSuccess: () => {
          toast.success("Lead updated");
          handleClose();
        },
      },
    );
  }

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) handleClose();
      }}
    >
      <DialogContent
        className="flex max-h-[min(92dvh,42rem)] w-[calc(100%-1.5rem)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={!isSubmitting}
      >
        <DialogHeader className="shrink-0 gap-1 px-4 pt-4 pr-12 pb-3">
          <DialogTitle className="text-lg">
            {isAdd ? "Add lead" : "Edit lead"}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {isAdd
              ? "Add a new lead to your pipeline."
              : "Update this lead and save your changes."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-1">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="lead-name"
                className="text-sage text-sm sm:text-base"
              >
                Name
              </Label>
              <Input
                id="lead-name"
                {...register("name")}
                type="text"
                autoComplete="name"
                placeholder="Client or company"
                aria-invalid={Boolean(errors.name)}
                className="h-9 text-base md:text-base"
              />
              {errors.name ? (
                <p role="alert" className="text-destructive text-sm">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="lead-source"
                className="text-sage text-sm sm:text-base"
              >
                Source
              </Label>
              <Input
                id="lead-source"
                {...register("source")}
                type="text"
                autoComplete="off"
                placeholder="Referral, Upwork, …"
                className="h-9 text-base md:text-base"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="lead-status"
                className="text-sage text-sm sm:text-base"
              >
                Status
              </Label>

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="lead-status"
                      className="h-9 w-full text-base md:text-base"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="lead-follow-up"
                className="text-sage text-sm sm:text-base"
              >
                Next follow-up
              </Label>
              <Input
                id="lead-follow-up"
                {...register("next_follow_up")}
                type="date"
                className="h-9 w-full min-w-0 text-base md:text-base"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="lead-notes"
                className="text-sage text-sm sm:text-base"
              >
                Notes
              </Label>
              <Textarea
                id="lead-notes"
                {...register("notes")}
                rows={3}
                placeholder="Context, last conversation, …"
                className="min-h-20 text-base md:text-base"
              />
            </div>

            {submitError ? (
              <p role="alert" className="text-destructive text-sm">
                {submitError.message}
              </p>
            ) : null}
          </div>

          <DialogFooter className="mx-0 mb-0 w-full shrink-0 sm:justify-end">
            <Button
              onClick={handleClose}
              type="button"
              variant="outline"
              size="lg"
              className="h-10 w-full text-base sm:w-auto"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              className="h-10 w-full text-base sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Saving…
                </>
              ) : isAdd ? (
                "Add lead"
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
