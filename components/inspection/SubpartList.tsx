import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { IconMinimize, IconMaximize, IconX } from "@tabler/icons-react";
import { formatDateOnly } from "@/lib/dateUtils";
import useInspectionStore from "@/lib/store/inspectionStore";
import useInspectionUpdateStore from "@/lib/store/inspectionUpdateStore";
import { useGetSubparts } from "@/lib/hooks/useSubparts";
import { useGetModels } from "@/lib/hooks/useModels";
import { useGetInspection } from "@/lib/hooks/useInspection";
import { useGetCustomer } from "@/lib/hooks/useCustomer";

// inUse 상태에 따른 색상 반환 함수
function getInUseStatusColor(inUse: number | undefined) {
  if (inUse === 1) {
    return "bg-green-400 text-white"; // 사용중 - 밝은 녹색
  } else {
    return "bg-gray-400 text-white"; // 미사용중 - 회색
  }
}

interface SubpartListProps {
  modelId: number | null;
}

export function SubpartList({ modelId }: SubpartListProps) {
  const {
    selectedInspection,
    selectedModel,
    isSubpartFullView,
    isEditMode,
    editedSubparts,
    toggleSubpartFullView,
    toggleSubpartListVisible,
    toggleEditMode,
    updateSubpartStatus,
    setSelectedSubpartDetail,
    toggleSubpartDetailOpen,
    toggleConfirmDialogOpen,
    setSelectedModel,
    toggleModelListVisible,
  } = useInspectionStore();

  const { isUpdating } = useInspectionUpdateStore();

  // 선택된 모델의 부품 데이터 가져오기
  const { data: subpartData, isLoading: isSubpartLoading } = useGetSubparts(
    modelId
      ? {
          modelId,
          page: 1,
          limit: 100, // 많은 부품을 한 번에 로드
        }
      : undefined
  );

  // 고객사 및 인스펙션, 모델 데이터 가져오기
  const { data: customerData } = useGetCustomer();
  const { data: inspectionData } = useGetInspection();
  const { data: modelData } = useGetModels(
    selectedInspection
      ? {
          inspectionId: selectedInspection,
          page: 1,
          limit: 10,
        }
      : undefined
  );

  // 변경된 부품이 있는지 확인
  const hasChanges = Object.entries(editedSubparts).some(
    ([id, inUse]) =>
      subpartData?.items.find((item) => item.id === parseInt(id))?.inUse !==
      inUse
  );

  // 부품 상세보기 클릭 핸들러
  const handleSubpartDetailClick = (subpartId: number) => {
    const subpart = subpartData?.items.find((item) => item.id === subpartId);
    if (subpart) {
      setSelectedSubpartDetail(subpart);
      toggleSubpartDetailOpen(true);
    }
  };

  // 부품 상태 변경 핸들러
  const handleSubpartStatusChange = (subpartId: number, checked: boolean) => {
    updateSubpartStatus(subpartId, checked ? 1 : 0);
  };

  // 저장 클릭 핸들러
  const handleSaveClick = () => {
    if (hasChanges) {
      toggleConfirmDialogOpen(true);
    }
  };

  // 부품 리스트 닫기 핸들러
  const handleCloseSubpartList = () => {
    toggleSubpartListVisible(false);
    toggleSubpartFullView(false);
    toggleEditMode(false);

    // 모바일에서는 선택된 모델 초기화 (창 너비가 적을 경우)
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSelectedModel(null);
      // 인스펙션 리스트가 표시될 수 있도록 모델 리스트 표시
      toggleModelListVisible(true);
    }
  };

  if (!modelId) {
    return null;
  }

  return (
    <Card
      className={
        isSubpartFullView
          ? "fixed inset-0 z-50 m-4 transition-all duration-300 overflow-auto"
          : "transition-all duration-300 max-w-full"
      }
    >
      <CardHeader className="flex flex-row items-center justify-between flex-wrap sm:flex-nowrap">
        <div className="flex flex-row items-center space-x-4 w-full sm:w-auto">
          <CardTitle className="whitespace-nowrap">부품 리스트</CardTitle>
          <CardDescription className="whitespace-normal sm:whitespace-nowrap">
            {`선택된 모델의 부품 목록 (${subpartData?.total || 0}개)`}
          </CardDescription>
        </div>
        <div className="flex items-center flex-wrap gap-2 mt-2 sm:mt-0 justify-end">
          {isSubpartFullView && (
            <>
              <Button
                variant="outline"
                onClick={() => toggleEditMode()}
                className="text-sm px-2 py-1 h-8"
                disabled={isUpdating}
              >
                {isEditMode ? "수정 취소" : "수정"}
              </Button>
              {isEditMode && (
                <Button
                  variant="default"
                  onClick={handleSaveClick}
                  disabled={!hasChanges || isUpdating}
                  className="text-sm px-2 py-1 h-8"
                >
                  {isUpdating ? "저장 중..." : "저장"}
                </Button>
              )}
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleSubpartFullView()}
            disabled={isUpdating}
          >
            {isSubpartFullView ? (
              <IconMinimize className="h-4 w-4" />
            ) : (
              <IconMaximize className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCloseSubpartList}
            disabled={isUpdating}
          >
            <IconX className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent
        className={
          isSubpartFullView
            ? "h-[calc(100vh-150px)] overflow-auto"
            : "overflow-auto"
        }
      >
        {isSubpartFullView && (
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">고객사</div>
                <div className="text-base overflow-hidden text-ellipsis">
                  {customerData?.customers.find(
                    (customer) =>
                      customer.id ===
                      modelData?.models.find(
                        (model) => model.id === selectedModel
                      )?.customerId
                  )?.name || "알 수 없음"}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">
                  인스펙션
                </div>
                <div className="text-base overflow-hidden text-ellipsis">
                  {inspectionData?.inspections.find(
                    (inspection) => inspection.id === selectedInspection
                  )?.name || "알 수 없음"}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">모델</div>
                <div className="text-base overflow-hidden text-ellipsis">
                  {modelData?.models.find((model) => model.id === selectedModel)
                    ?.name || "알 수 없음"}
                </div>
              </div>
            </div>
          </div>
        )}

        {isSubpartFullView && isEditMode && hasChanges && (
          <div className="mb-4 p-4 border rounded-lg bg-blue-50">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                변경된 항목:{" "}
                {
                  Object.entries(editedSubparts).filter(
                    ([id, inUse]) =>
                      subpartData?.items.find(
                        (item) => item.id === parseInt(id)
                      )?.inUse !== inUse
                  ).length
                }
                개
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">변경된 항목</span>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-md border">
          <div className="relative w-full overflow-x-auto">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10%] min-w-[80px] text-left whitespace-nowrap">
                      부품번호
                    </TableHead>
                    <TableHead className="w-[25%] min-w-[150px] text-left whitespace-nowrap">
                      부품명
                    </TableHead>
                    <TableHead className="w-[15%] min-w-[100px] text-center whitespace-nowrap">
                      사용여부
                    </TableHead>
                    {isSubpartFullView && (
                      <>
                        <TableHead className="w-[20%] min-w-[150px] text-left hidden md:table-cell whitespace-nowrap">
                          설명
                        </TableHead>
                        <TableHead className="w-[10%] min-w-[80px] text-center hidden md:table-cell whitespace-nowrap">
                          YOLO ID
                        </TableHead>
                        <TableHead className="w-[10%] min-w-[80px] text-center hidden md:table-cell whitespace-nowrap">
                          객체 수
                        </TableHead>
                        <TableHead className="w-[10%] min-w-[80px] text-center hidden md:table-cell whitespace-nowrap">
                          임계값
                        </TableHead>
                        <TableHead className="w-[10%] min-w-[100px] text-center hidden md:table-cell whitespace-nowrap">
                          생성일
                        </TableHead>
                        <TableHead className="w-[10%] min-w-[100px] text-center hidden md:table-cell whitespace-nowrap">
                          수정일
                        </TableHead>
                      </>
                    )}
                    <TableHead className="w-[10%] min-w-[80px] text-center whitespace-nowrap">
                      상세보기
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
              <div
                className={`overflow-auto ${
                  isSubpartFullView
                    ? "h-[calc(100vh-250px)]"
                    : "h-[calc(100vh-500px)]"
                }`}
              >
                {isSubpartLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <LoadingSpinner />
                  </div>
                ) : subpartData?.items && subpartData.items.length > 0 ? (
                  <Table>
                    <TableBody>
                      {subpartData.items.map((subpart) => (
                        <TableRow key={subpart.id}>
                          <TableCell className="w-[10%] min-w-[80px] text-left">
                            {subpart.id}
                          </TableCell>
                          <TableCell className="w-[25%] min-w-[150px] text-left truncate max-w-[200px]">
                            {subpart.name}
                          </TableCell>
                          <TableCell className="w-[15%] min-w-[100px] text-center">
                            {isSubpartFullView && isEditMode ? (
                              <div className="flex items-center justify-center space-x-2">
                                <Switch
                                  checked={
                                    editedSubparts[subpart.id] !== undefined
                                      ? editedSubparts[subpart.id] === 1
                                      : subpart.inUse === 1
                                  }
                                  onCheckedChange={(checked) =>
                                    handleSubpartStatusChange(
                                      subpart.id,
                                      checked
                                    )
                                  }
                                  disabled={isUpdating}
                                />
                                <span
                                  className={
                                    editedSubparts[subpart.id] !== undefined &&
                                    subpart.inUse !== editedSubparts[subpart.id]
                                      ? "text-blue-500 font-medium"
                                      : ""
                                  }
                                >
                                  {editedSubparts[subpart.id] !== undefined
                                    ? editedSubparts[subpart.id] === 1
                                      ? "사용중"
                                      : "미사용중"
                                    : subpart.inUse === 1
                                    ? "사용중"
                                    : "미사용중"}
                                </span>
                              </div>
                            ) : (
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getInUseStatusColor(
                                  subpart.inUse
                                )}`}
                              >
                                {subpart.inUse === 1 ? "사용중" : "미사용중"}
                              </span>
                            )}
                          </TableCell>
                          {isSubpartFullView && (
                            <>
                              <TableCell className="w-[20%] min-w-[150px] text-left hidden md:table-cell truncate max-w-[200px]">
                                {subpart.desc}
                              </TableCell>
                              <TableCell className="w-[10%] min-w-[80px] text-center hidden md:table-cell">
                                {subpart.yoloID}
                              </TableCell>
                              <TableCell className="w-[10%] min-w-[80px] text-center hidden md:table-cell">
                                {subpart.numObjects}
                              </TableCell>
                              <TableCell className="w-[10%] min-w-[80px] text-center hidden md:table-cell">
                                {subpart.threshold}
                              </TableCell>
                              <TableCell className="w-[10%] min-w-[100px] text-center hidden md:table-cell whitespace-nowrap">
                                {formatDateOnly(subpart.createdAt)}
                              </TableCell>
                              <TableCell className="w-[10%] min-w-[100px] text-center hidden md:table-cell whitespace-nowrap">
                                {formatDateOnly(subpart.updatedAt)}
                              </TableCell>
                            </>
                          )}
                          <TableCell className="w-[10%] min-w-[80px] text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleSubpartDetailClick(subpart.id)
                              }
                              disabled={isUpdating}
                            >
                              상세보기
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    부품이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
