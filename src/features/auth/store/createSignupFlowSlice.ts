import type { StateCreator } from "zustand";

import type { TOrganizationSchema } from "@/features/auth/validations/organization";
import type { AppStore } from "@/store/types";

export interface SignupFlowSlice {
  organization: TOrganizationSchema | null;
  setOrganization: (organization: TOrganizationSchema) => void;
  resetSignupFlow: () => void;
}

export const createSignupFlowSlice: StateCreator<AppStore, [], [], SignupFlowSlice> = (set) => ({
  organization: null,
  resetSignupFlow: () => set({ organization: null }),
  setOrganization: (organization) => set({ organization }),
});
