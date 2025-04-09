import { create } from "zustand";

interface UpdateState {
  isUpdating: boolean;
  setIsUpdating: (isUpdating: boolean) => void;
}

const useInspectionUpdateStore = create<UpdateState>()((set) => ({
  isUpdating: false,
  setIsUpdating: (isUpdating) => set({ isUpdating }),
}));

export default useInspectionUpdateStore;
