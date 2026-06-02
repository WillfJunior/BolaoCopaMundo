import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GroupState {
  activeGroupId: string | null;
  activeGroupName: string | null;
  setActiveGroup: (id: string, name: string) => void;
  clearActiveGroup: () => void;
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set) => ({
      activeGroupId: null,
      activeGroupName: null,
      setActiveGroup: (id, name) => set({ activeGroupId: id, activeGroupName: name }),
      clearActiveGroup: () => set({ activeGroupId: null, activeGroupName: null }),
    }),
    { name: 'active-group' }
  )
);
