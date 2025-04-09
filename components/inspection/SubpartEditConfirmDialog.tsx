import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import useInspectionStore from "@/lib/store/inspectionStore";
import useInspectionUpdateStore from "@/lib/store/inspectionUpdateStore";
import { useGetContactList } from "@/lib/hooks/useCustomer";
import { useGetModels } from "@/lib/hooks/useModels";
import {
  useGetSubparts,
  useUpdateSubpartsStatus,
} from "@/lib/hooks/useSubparts";
import { LoadingOverlay } from "@/components/inspection/LoadingOverlay";

interface SubpartEditConfirmDialogProps {
  user: {
    id: number;
    name: string;
  } | null;
  ip: string;
}

export function SubpartEditConfirmDialog({
  user,
  ip,
}: SubpartEditConfirmDialogProps) {
  const {
    selectedModel,
    selectedInspection,
    selectedSubpartDetail,
    isConfirmDialogOpen,
    isSubpartDetailConfirmDialogOpen,
    editedSubparts,
    selectedContacts,
    modificationReason,
    selectedSubpartReason,
    toggleConfirmDialogOpen,
    toggleSubpartDetailConfirmDialogOpen,
    toggleSubpartDetailOpen,
    toggleSubpartDetailEditMode,
    setModificationReason,
    setSelectedSubpartReason,
    resetEditState,
  } = useInspectionStore();

  const { setIsUpdating } = useInspectionUpdateStore();
  const { isUpdating } = useInspectionUpdateStore();

  // API 호출 관련 훅스
  const { mutate: updateSubpartsStatus } = useUpdateSubpartsStatus();
  const { data: modelsData } = useGetModels(
    selectedModel && selectedInspection
      ? {
          inspectionId: selectedInspection,
          modelId: selectedModel,
          page: 1,
          limit: 10,
        }
      : undefined
  );
  const { data: subpartData } = useGetSubparts(
    selectedModel
      ? {
          modelId: selectedModel,
          page: 1,
          limit: 100,
        }
      : undefined
  );
  const { data: customerContacts } = useGetContactList(
    selectedModel ? selectedModel.toString() : undefined
  );

  // 일반 부품 리스트 수정 사항 확인 핸들러
  const handleSaveConfirm = () => {
    if (!selectedModel) return;

    // 실제로 변경된 부품만 필터링
    const subpartsToUpdate = Object.entries(editedSubparts)
      .filter(
        ([id, inUse]) =>
          subpartData?.items.find((item) => item.id === parseInt(id))?.inUse !==
          inUse
      )
      .map(([id, inUse]) => ({
        id: parseInt(id),
        inUse,
      }));

    // 변경된 부품이 없으면 처리하지 않음
    if (subpartsToUpdate.length === 0) {
      toggleConfirmDialogOpen(false);
      resetEditState();
      return;
    }

    // 선택된 모델의 customerId 가져오기
    const modelCustomerId = modelsData?.models?.find(
      (model) => model.id === selectedModel
    )?.customerId;

    if (!modelCustomerId) {
      console.error("모델의 고객사 ID를 찾을 수 없습니다.");
      return;
    }

    setIsUpdating(true);

    updateSubpartsStatus(
      {
        customerId: modelCustomerId,
        modelId: selectedModel,
        userId: user?.id || 0,
        person: user?.name || "",
        ip: ip || "0.0.0.0",
        reason: modificationReason,
        mailSendAddress: selectedContacts,
        subparts: subpartsToUpdate,
      },
      {
        onSuccess: () => {
          // UI 상태 초기화
          resetEditState();
          toggleConfirmDialogOpen(false);
          setIsUpdating(false);
        },
        onError: () => {
          setIsUpdating(false);
        },
      }
    );
  };

  // 부품 상세보기 수정 사항 확인 핸들러
  const handleSubpartDetailSaveConfirm = () => {
    if (!selectedSubpartDetail || !selectedModel || !modelsData?.models) return;

    // 선택된 모델의 customerId 가져오기
    const modelCustomerId = modelsData.models.find(
      (model) => model.id === selectedModel
    )?.customerId;

    if (!modelCustomerId) {
      console.error("모델의 고객사 ID를 찾을 수 없습니다.");
      return;
    }

    const subpartsToUpdate = [
      {
        id: selectedSubpartDetail.id,
        inUse: editedSubparts[selectedSubpartDetail.id],
      },
    ];

    setIsUpdating(true);

    updateSubpartsStatus(
      {
        customerId: modelCustomerId,
        modelId: selectedModel,
        userId: user?.id || 0,
        person: user?.name || "",
        ip: ip || "0.0.0.0",
        reason: selectedSubpartReason || "부품 상태 수정",
        mailSendAddress: selectedContacts,
        subparts: subpartsToUpdate,
      },
      {
        onSuccess: () => {
          // UI 상태 초기화
          toggleSubpartDetailEditMode(false);
          toggleSubpartDetailOpen(false);
          toggleSubpartDetailConfirmDialogOpen(false);
          setSelectedSubpartReason("");
          setIsUpdating(false);
        },
        onError: () => {
          setIsUpdating(false);
        },
      }
    );
  };

  return (
    <>
      {/* 일반 수정사항 확인 다이얼로그 */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={toggleConfirmDialogOpen}>
        <DialogContent>
          {isUpdating && <LoadingOverlay />}
          <DialogHeader>
            <DialogTitle>수정사항 확인</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">수정된 부품 목록:</h4>
              <ul className="list-disc pl-4 space-y-1">
                {Object.entries(editedSubparts)
                  .filter(
                    ([id, inUse]) =>
                      subpartData?.items.find(
                        (item) => item.id === parseInt(id)
                      )?.inUse !== inUse
                  )
                  .map(([id, inUse]) => {
                    const subpart = subpartData?.items.find(
                      (item) => item.id === parseInt(id)
                    );
                    return (
                      <li key={id}>
                        {subpart?.name}:{" "}
                        {subpart?.inUse === 1 ? "사용중" : "미사용중"} →{" "}
                        {inUse === 1 ? "사용중" : "미사용중"}
                      </li>
                    );
                  })}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">알림 받을 담당자:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedContacts.map((email) => {
                  const contact = customerContacts?.contacts?.find(
                    (c) => c.personEmail === email
                  );
                  return (
                    <Badge key={email} variant="secondary">
                      {contact?.person} ({email})
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">수정 사유:</h4>
              <Input
                value={modificationReason}
                onChange={(e) => setModificationReason(e.target.value)}
                placeholder="수정 사유를 입력하세요"
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => toggleConfirmDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleSaveConfirm}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 부품 상세보기 수정사항 확인 다이얼로그 */}
      <Dialog
        open={isSubpartDetailConfirmDialogOpen}
        onOpenChange={toggleSubpartDetailConfirmDialogOpen}
      >
        <DialogContent>
          {isUpdating && <LoadingOverlay />}
          <DialogHeader>
            <DialogTitle>부품 수정사항 확인</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">수정사항:</h4>
              {selectedSubpartDetail && (
                <div className="p-2 bg-gray-50 rounded-md">
                  <p>
                    {selectedSubpartDetail.name}:{" "}
                    {selectedSubpartDetail.inUse === 1 ? "사용중" : "미사용중"}{" "}
                    →{" "}
                    {editedSubparts[selectedSubpartDetail.id] === 1
                      ? "사용중"
                      : "미사용중"}
                  </p>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium mb-2">알림 받을 담당자:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedContacts.map((email) => {
                  const contact = customerContacts?.contacts?.find(
                    (c) => c.personEmail === email
                  );
                  return (
                    <Badge key={email} variant="secondary">
                      {contact?.person} ({email})
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">수정 사유:</h4>
              <Input
                value={selectedSubpartReason}
                onChange={(e) => setSelectedSubpartReason(e.target.value)}
                placeholder="수정 사유를 입력하세요"
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => toggleSubpartDetailConfirmDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleSubpartDetailSaveConfirm}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
