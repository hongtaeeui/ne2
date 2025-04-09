import { create } from "zustand";
import type { Model } from "@/lib/hooks/useModels";
import type { Subpart } from "@/lib/hooks/useSubparts";

interface InspectionState {
  // 선택 상태 관리
  selectedInspection: number | null;
  selectedModel: number | null;
  selectedModelDetail: Model | null;
  selectedSubpartDetail: Subpart | null;

  // 뷰 상태 관리
  isModelDetailOpen: boolean;
  isSubpartDetailOpen: boolean;
  isModelFullView: boolean;
  isSubpartFullView: boolean;
  isModelListVisible: boolean;
  isSubpartListVisible: boolean;

  // 편집 모드 관리
  isEditMode: boolean;
  isSubpartDetailEditMode: boolean;
  editedSubparts: Record<number, number>;
  selectedContacts: string[];
  modificationReason: string;
  selectedSubpartReason: string;

  // 다이얼로그 상태 관리
  isSaveDialogOpen: boolean;
  isConfirmDialogOpen: boolean;
  isSubpartDetailConfirmDialogOpen: boolean;

  // 리프레시 상태
  isRefreshing: boolean;

  // 액션
  setSelectedInspection: (id: number | null) => void;
  setSelectedModel: (id: number | null) => void;
  setSelectedModelDetail: (model: Model | null) => void;
  setSelectedSubpartDetail: (subpart: Subpart | null) => void;

  toggleModelDetailOpen: (isOpen?: boolean) => void;
  toggleSubpartDetailOpen: (isOpen?: boolean) => void;
  toggleModelFullView: (isFullView?: boolean) => void;
  toggleSubpartFullView: (isFullView?: boolean) => void;
  toggleModelListVisible: (isVisible?: boolean) => void;
  toggleSubpartListVisible: (isVisible?: boolean) => void;

  toggleEditMode: (isEdit?: boolean) => void;
  toggleSubpartDetailEditMode: (isEdit?: boolean) => void;

  setEditedSubparts: (subparts: Record<number, number>) => void;
  updateSubpartStatus: (subpartId: number, inUse: number) => void;

  setSelectedContacts: (contacts: string[]) => void;
  addSelectedContact: (contact: string) => void;
  removeSelectedContact: (contact: string) => void;

  setModificationReason: (reason: string) => void;
  setSelectedSubpartReason: (reason: string) => void;

  toggleSaveDialogOpen: (isOpen?: boolean) => void;
  toggleConfirmDialogOpen: (isOpen?: boolean) => void;
  toggleSubpartDetailConfirmDialogOpen: (isOpen?: boolean) => void;

  setRefreshing: (isRefreshing: boolean) => void;

  resetModelSelection: () => void;
  resetSubpartSelection: () => void;
  resetEditState: () => void;
}

const useInspectionStore = create<InspectionState>()((set) => ({
  // 초기 상태
  selectedInspection: null,
  selectedModel: null,
  selectedModelDetail: null,
  selectedSubpartDetail: null,

  isModelDetailOpen: false,
  isSubpartDetailOpen: false,
  isModelFullView: false,
  isSubpartFullView: false,
  isModelListVisible: true,
  isSubpartListVisible: true,

  isEditMode: false,
  isSubpartDetailEditMode: false,
  editedSubparts: {},
  selectedContacts: [],
  modificationReason: "부품 상태 수정",
  selectedSubpartReason: "",

  isSaveDialogOpen: false,
  isConfirmDialogOpen: false,
  isSubpartDetailConfirmDialogOpen: false,

  isRefreshing: false,

  // 액션
  setSelectedInspection: (id) => set({ selectedInspection: id }),
  setSelectedModel: (id) => set({ selectedModel: id }),
  setSelectedModelDetail: (model) => set({ selectedModelDetail: model }),
  setSelectedSubpartDetail: (subpart) =>
    set({ selectedSubpartDetail: subpart }),

  toggleModelDetailOpen: (isOpen) =>
    set((state) => ({
      isModelDetailOpen:
        isOpen !== undefined ? isOpen : !state.isModelDetailOpen,
    })),
  toggleSubpartDetailOpen: (isOpen) =>
    set((state) => ({
      isSubpartDetailOpen:
        isOpen !== undefined ? isOpen : !state.isSubpartDetailOpen,
    })),
  toggleModelFullView: (isFullView) =>
    set((state) => ({
      isModelFullView:
        isFullView !== undefined ? isFullView : !state.isModelFullView,
    })),
  toggleSubpartFullView: (isFullView) =>
    set((state) => ({
      isSubpartFullView:
        isFullView !== undefined ? isFullView : !state.isSubpartFullView,
    })),
  toggleModelListVisible: (isVisible) =>
    set((state) => ({
      isModelListVisible:
        isVisible !== undefined ? isVisible : !state.isModelListVisible,
    })),
  toggleSubpartListVisible: (isVisible) =>
    set((state) => ({
      isSubpartListVisible:
        isVisible !== undefined ? isVisible : !state.isSubpartListVisible,
    })),

  toggleEditMode: (isEdit) =>
    set((state) => ({
      isEditMode: isEdit !== undefined ? isEdit : !state.isEditMode,
    })),
  toggleSubpartDetailEditMode: (isEdit) =>
    set((state) => ({
      isSubpartDetailEditMode:
        isEdit !== undefined ? isEdit : !state.isSubpartDetailEditMode,
    })),

  setEditedSubparts: (subparts) => set({ editedSubparts: subparts }),
  updateSubpartStatus: (subpartId, inUse) =>
    set((state) => ({
      editedSubparts: { ...state.editedSubparts, [subpartId]: inUse },
    })),

  setSelectedContacts: (contacts) => set({ selectedContacts: contacts }),
  addSelectedContact: (contact) =>
    set((state) => ({
      selectedContacts: [...state.selectedContacts, contact],
    })),
  removeSelectedContact: (contact) =>
    set((state) => ({
      selectedContacts: state.selectedContacts.filter((c) => c !== contact),
    })),

  setModificationReason: (reason) => set({ modificationReason: reason }),
  setSelectedSubpartReason: (reason) => set({ selectedSubpartReason: reason }),

  toggleSaveDialogOpen: (isOpen) =>
    set((state) => ({
      isSaveDialogOpen: isOpen !== undefined ? isOpen : !state.isSaveDialogOpen,
    })),
  toggleConfirmDialogOpen: (isOpen) =>
    set((state) => ({
      isConfirmDialogOpen:
        isOpen !== undefined ? isOpen : !state.isConfirmDialogOpen,
    })),
  toggleSubpartDetailConfirmDialogOpen: (isOpen) =>
    set((state) => ({
      isSubpartDetailConfirmDialogOpen:
        isOpen !== undefined ? isOpen : !state.isSubpartDetailConfirmDialogOpen,
    })),

  setRefreshing: (isRefreshing) => set({ isRefreshing }),

  resetModelSelection: () =>
    set({
      selectedModel: null,
      isSubpartListVisible: false,
      isSubpartFullView: false,
      editedSubparts: {},
      selectedContacts: [],
      isEditMode: false,
    }),

  resetSubpartSelection: () =>
    set({
      isSubpartListVisible: false,
      isSubpartFullView: false,
      isEditMode: false,
      editedSubparts: {},
      selectedContacts: [],
    }),

  resetEditState: () =>
    set({
      isEditMode: false,
      isSubpartDetailEditMode: false,
      editedSubparts: {},
      selectedContacts: [],
      modificationReason: "부품 상태 수정",
      selectedSubpartReason: "",
    }),
}));

export default useInspectionStore;
