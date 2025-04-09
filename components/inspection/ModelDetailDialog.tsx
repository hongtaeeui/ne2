import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/dateUtils";
import useInspectionStore from "@/lib/store/inspectionStore";
import { useGetCustomer } from "@/lib/hooks/useCustomer";

export function ModelDetailDialog() {
  const { selectedModelDetail, isModelDetailOpen, toggleModelDetailOpen } =
    useInspectionStore();

  const { data: customerData } = useGetCustomer();

  return (
    <Dialog
      open={isModelDetailOpen}
      onOpenChange={(open) => toggleModelDetailOpen(open)}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{selectedModelDetail?.name} 상세 정보</DialogTitle>
          <DialogDescription>
            모델의 상세 정보를 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 font-medium">모델명</div>
            <div className="col-span-3">{selectedModelDetail?.name}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 font-medium">상태</div>
            <div className="col-span-3">{selectedModelDetail?.status}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 font-medium">부품 수</div>
            <div className="col-span-3">
              {selectedModelDetail?.subpartCount}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 font-medium">고객사</div>
            <div className="col-span-3">
              {selectedModelDetail?.customerId && customerData?.customers
                ? customerData.customers.find(
                    (customer) => customer.id === selectedModelDetail.customerId
                  )?.name || "알 수 없음"
                : "알 수 없음"}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 font-medium">생성일</div>
            <div className="col-span-3">
              {formatDate(selectedModelDetail?.createdAt)}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 font-medium">수정일</div>
            <div className="col-span-3">
              {formatDate(selectedModelDetail?.updatedAt)}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1 font-medium">검출 영역</div>
            <div className="col-span-3">
              TL: ({selectedModelDetail?.detectionRegionTL.x},{" "}
              {selectedModelDetail?.detectionRegionTL.y}) / BR: (
              {selectedModelDetail?.detectionRegionBR.x},{" "}
              {selectedModelDetail?.detectionRegionBR.y})
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
