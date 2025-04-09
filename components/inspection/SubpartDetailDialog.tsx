import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/dateUtils";
import useInspectionStore from "@/lib/store/inspectionStore";
import useInspectionUpdateStore from "@/lib/store/inspectionUpdateStore";
import { useGetContactList, useGetCustomer } from "@/lib/hooks/useCustomer";
import { X } from "lucide-react";
import { useGetModels } from "@/lib/hooks/useModels";
import { useGetInspection } from "@/lib/hooks/useInspection";

interface SubpartDetailDialogProps {
  getInUseStatusColor: (inUse: number | undefined) => string;
  user: {
    id: number;
    name: string;
  } | null;
  ip: string;
}

export function SubpartDetailDialog({
  getInUseStatusColor,
}: SubpartDetailDialogProps) {
  const {
    isSubpartDetailOpen,
    isSubpartDetailEditMode,
    selectedModel,
    selectedSubpartDetail,
    selectedContacts,
    editedSubparts,
    setSelectedContacts,
    toggleSubpartDetailConfirmDialogOpen,
    toggleSubpartDetailEditMode,
    updateSubpartStatus,
    selectedInspection,
    toggleSubpartDetailOpen,
  } = useInspectionStore();

  const { isUpdating } = useInspectionUpdateStore();

  // 선택된 모델에 해당하는 모델 데이터 조회
  const { data: modelData } = useGetModels(
    selectedInspection && selectedModel
      ? {
          inspectionId: selectedInspection,
          modelId: selectedModel,
          page: 1,
          limit: 10,
        }
      : undefined
  );

  // 고객사 데이터 조회
  const { data: customerData } = useGetCustomer();

  // 인스펙션 데이터 조회
  const { data: inspectionData } = useGetInspection();

  // 선택된 모델의 고객사 ID에 해당하는 연락처 목록 조회
  const customerId = modelData?.models.find(
    (model) => model.id === selectedModel
  )?.customerId;
  const { data: customerContacts } = useGetContactList(customerId?.toString());

  // 고객사명, 인스펙션명, 모델명 가져오기
  const customerName = customerData?.customers.find(
    (customer) => customer.id === customerId
  )?.name;

  const inspectionName = inspectionData?.inspections.find(
    (inspection) => inspection.id === selectedInspection
  )?.name;

  const modelName = modelData?.models.find(
    (model) => model.id === selectedModel
  )?.name;

  // 부품 상세보기에서 변경 사항 저장 핸들러
  const handleSubpartDetailSave = () => {
    if (!selectedSubpartDetail) return;

    // 변경사항이 있는 경우에만 다이얼로그 표시
    if (
      editedSubparts[selectedSubpartDetail.id] !== undefined &&
      editedSubparts[selectedSubpartDetail.id] !== selectedSubpartDetail.inUse
    ) {
      toggleSubpartDetailConfirmDialogOpen(true);
    } else {
      toggleSubpartDetailEditMode(false);
    }
  };

  // 다이얼로그가 닫힐 때 편집 모드 초기화
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      toggleSubpartDetailEditMode(false);
      toggleSubpartDetailOpen(false);
    }
  };

  // 수정 모드 진입 핸들러
  const handleEditModeToggle = () => {
    // 수정 모드 진입 시 현재 부품의 상태로 초기화
    if (!isSubpartDetailEditMode && selectedSubpartDetail) {
      updateSubpartStatus(
        selectedSubpartDetail.id,
        selectedSubpartDetail.inUse
      );

      // isMain이 1인 담당자 자동 선택
      const mainContacts =
        customerContacts?.contacts
          ?.filter((contact) => contact.isMain === 1)
          .map((contact) => contact.personEmail) || [];
      setSelectedContacts(mainContacts);
    }

    toggleSubpartDetailEditMode();
  };

  // 수정 취소 핸들러
  const handleEditCancel = () => {
    // 수정 취소시 편집 상태 초기화
    if (selectedSubpartDetail) {
      updateSubpartStatus(
        selectedSubpartDetail.id,
        selectedSubpartDetail.inUse
      );
    }
    toggleSubpartDetailEditMode(false);
  };

  const handleClose = () => {
    toggleSubpartDetailOpen(false);
  };

  // 상태 변경 핸들러
  const handleStatusChange = (checked: boolean) => {
    if (selectedSubpartDetail) {
      updateSubpartStatus(selectedSubpartDetail.id, checked ? 1 : 0);
    }
  };

  // 담당자 추가 핸들러
  const handleAddContact = (value: string) => {
    if (!selectedContacts.includes(value)) {
      setSelectedContacts([...selectedContacts, value]);
    }
  };

  // 담당자 제거 핸들러
  const handleRemoveContact = (email: string) => {
    setSelectedContacts(selectedContacts.filter((e: string) => e !== email));
  };

  // 부품이 선택된 경우 상태 확인 (Switch 컴포넌트용)
  const getSubpartStatus = (): boolean => {
    if (!selectedSubpartDetail) return false;

    if (editedSubparts[selectedSubpartDetail.id] !== undefined) {
      return editedSubparts[selectedSubpartDetail.id] === 1;
    }

    return selectedSubpartDetail.inUse === 1;
  };

  return (
    <Dialog open={isSubpartDetailOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto py-0 [&>button[aria-label='Close']]:hidden">
        <DialogHeader className="flex flex-col space-y-2 text-center sm:text-left mb-2 sticky top-0 bg-white pb-2 py-3 z-10">
          <div className="flex justify-between items-center">
            <DialogTitle>{selectedSubpartDetail?.name} 상세 정보</DialogTitle>
            <div className="flex items-center gap-2">
              {!isSubpartDetailEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditModeToggle}
                  disabled={isUpdating}
                  className="mr-2"
                >
                  수정
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogDescription>
            부품의 상세 정보를 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {/* 업체, 인스펙션, 모델 정보 */}
        <div className="bg-gray-50 rounded-md p-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">고객사</div>
              <div className="text-sm font-medium">
                {customerName || "정보 없음"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">인스펙션</div>
              <div className="text-sm font-medium">
                {inspectionName || "정보 없음"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">모델</div>
              <div className="text-sm font-medium">
                {modelName || "정보 없음"}
              </div>
            </div>
          </div>
        </div>

        {isSubpartDetailEditMode && (
          <div className="flex items-center gap-2 justify-end sticky top-[80px] bg-white z-10 pb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditCancel}
              disabled={isUpdating}
            >
              취소
            </Button>
            <Button
              size="sm"
              onClick={handleSubpartDetailSave}
              disabled={
                isUpdating ||
                (selectedSubpartDetail
                  ? editedSubparts[selectedSubpartDetail.id] === undefined ||
                    editedSubparts[selectedSubpartDetail.id] ===
                      selectedSubpartDetail.inUse
                  : true)
              }
            >
              {isUpdating ? "저장 중..." : "저장"}
            </Button>
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 font-medium">부품번호</div>
            <div className="col-span-3">{selectedSubpartDetail?.id}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 font-medium">부품명</div>
            <div className="col-span-3">{selectedSubpartDetail?.name}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 font-medium">사용 상태</div>
            <div className="col-span-3">
              {isSubpartDetailEditMode ? (
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={getSubpartStatus()}
                    onCheckedChange={handleStatusChange}
                    disabled={isUpdating}
                  />
                  <span
                    className={
                      selectedSubpartDetail &&
                      editedSubparts[selectedSubpartDetail.id] !== undefined &&
                      selectedSubpartDetail.inUse !==
                        editedSubparts[selectedSubpartDetail.id]
                        ? "text-blue-500 font-medium"
                        : ""
                    }
                  >
                    {selectedSubpartDetail &&
                    (editedSubparts[selectedSubpartDetail.id] !== undefined
                      ? editedSubparts[selectedSubpartDetail.id] === 1
                      : selectedSubpartDetail.inUse === 1)
                      ? "사용중"
                      : "미사용중"}
                  </span>
                </div>
              ) : (
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getInUseStatusColor(
                    selectedSubpartDetail?.inUse
                  )}`}
                >
                  {selectedSubpartDetail?.inUse === 1 ? "사용중" : "미사용중"}
                </span>
              )}
            </div>
          </div>

          {/* 수정 모드일 때만 담당자 선택 UI 표시 */}
          {isSubpartDetailEditMode && (
            <div className="grid grid-cols-4 items-start gap-4">
              <div className="col-span-1 font-medium">담당자 선택</div>
              <div className="col-span-3 space-y-4">
                <div className="flex items-center gap-2">
                  <Select value="" onValueChange={handleAddContact}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="담당자 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {customerContacts?.contacts?.map((contact) => (
                        <SelectItem
                          key={contact.id}
                          value={contact.personEmail}
                          disabled={selectedContacts.includes(
                            contact.personEmail
                          )}
                        >
                          {contact.person} ({contact.personEmail})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedContacts.map((email: string) => {
                    const contact = customerContacts?.contacts?.find(
                      (c) => c.personEmail === email
                    );
                    return (
                      <Badge
                        key={email}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {contact?.person} ({email})
                        <button
                          onClick={() => handleRemoveContact(email)}
                          className="ml-1 hover:text-red-500"
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 font-medium">설명</div>
            <div className="col-span-3">{selectedSubpartDetail?.desc}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 font-medium">YOLO ID</div>
            <div className="col-span-3">{selectedSubpartDetail?.yoloID}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 font-medium">색상</div>
            <div className="col-span-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedSubpartDetail?.color }}
                />
                <span>{selectedSubpartDetail?.color}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 font-medium">객체 수</div>
            <div className="col-span-3">
              {selectedSubpartDetail?.numObjects}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 font-medium">임계값</div>
            <div className="col-span-3">{selectedSubpartDetail?.threshold}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 font-medium">히스토그램 사용</div>
            <div className="col-span-3">
              {selectedSubpartDetail?.useHistogram === 1 ? "사용" : "미사용"}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 font-medium">생성일</div>
            <div className="col-span-3">
              {formatDate(selectedSubpartDetail?.createdAt)}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 font-medium">수정일</div>
            <div className="col-span-3">
              {formatDate(selectedSubpartDetail?.updatedAt)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
