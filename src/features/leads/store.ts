import { Lead, LeadStatus } from "./types";
import { create } from "zustand";

type LeadsUIStore = {
  filter: LeadStatus | "all";
  isModalOpen: boolean;
  modalMode: "add" | "edit";
  editingLead: Lead | null;

  setFilter: (filter: LeadStatus | "all") => void;
  openEditModal: (lead: Lead) => void;
  openAddModal: () => void;
  closeModal: () => void;
};

export const useLeadsUIStore = create<LeadsUIStore>()(
  (set): LeadsUIStore => ({
    filter: "all",
    isModalOpen: false,
    modalMode: "add",
    editingLead: null,

    setFilter: (filter) => set({ filter }),

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
