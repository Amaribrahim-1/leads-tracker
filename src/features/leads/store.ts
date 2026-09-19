import { create } from "zustand";
import { Lead } from "./types";

type LeadsUIStore = {
  isModalOpen: boolean;
  modalMode: "add" | "edit";
  editingLead: Lead | null;

  openEditModal: (lead: Lead) => void;
  openAddModal: () => void;
  closeModal: () => void;
};

export const useLeadsUIStore = create<LeadsUIStore>()(
  (set): LeadsUIStore => ({
    isModalOpen: false,
    modalMode: "add",
    editingLead: null,

    openEditModal: (lead) =>
      set({
        isModalOpen: true,
        modalMode: "edit",
        editingLead: lead,
      }),

    openAddModal: () =>
      set({ isModalOpen: true, modalMode: "add", editingLead: null }),

    closeModal: () =>
      set({ isModalOpen: false, modalMode: "add", editingLead: null }),
  }),
);
