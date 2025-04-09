import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IpState {
  ip: string;
  setIp: (ip: string) => void;
}

const useIpStore = create<IpState>()(
  persist(
    (set) => ({
      ip: "0.0.0.0",
      setIp: (ip: string) => set({ ip }),
    }),
    {
      name: "ip-storage",
    }
  )
);

export default useIpStore;
