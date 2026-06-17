"use client";

import { create } from "zustand";

import type { TOrganizationSchema } from "@/validations/auth/organization";

type TSignupFlowStore = {
  organization: TOrganizationSchema | null;
  setOrganization: (organization: TOrganizationSchema) => void;
  reset: () => void;
};

export const useSignupFlowStore = create<TSignupFlowStore>((set) => ({
  organization: null,
  setOrganization: (organization) => set({ organization }),
  reset: () => set({ organization: null }),
}));
