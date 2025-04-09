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
import { IconMinimize, IconMaximize, IconX } from "@tabler/icons-react";
import useInspectionStore from "@/lib/store/inspectionStore";
import { useGetModels, type Model } from "@/lib/hooks/useModels";
import { useGetCustomer } from "@/lib/hooks/useCustomer";
import { useGetInspection } from "@/lib/hooks/useInspection";

interface ModelListProps {
  inspectionId: number | null;
}

export function ModelList({ inspectionId }: ModelListProps) {
  const {
    selectedModel,
    selectedInspection,
    isModelFullView,
    isModelListVisible,
    toggleModelFullView,
    toggleModelListVisible,
    setSelectedModel,
    setSelectedModelDetail,
    toggleModelDetailOpen,
    toggleSubpartListVisible,
  } = useInspectionStore();

  // 선택된 인스펙션의 모델 데이터 가져오기
  const { data: modelData, isLoading: isModelLoading } = useGetModels(
    inspectionId
      ? {
          inspectionId,
          page: 1,
          limit: 10,
        }
      : undefined
  );

  // 고객사 및 인스펙션 데이터 가져오기
  const { data: customerData } = useGetCustomer();
  const { data: inspectionData } = useGetInspection();

  // 모델 클릭 핸들러
  const handleModelClick = (modelId: number) => {
    setSelectedModel(modelId);
    toggleSubpartListVisible(true);
  };

  // 모델 상세보기 핸들러
  const handleModelDetailClick = (model: Model) => {
    setSelectedModelDetail(model);
    toggleModelDetailOpen(true);
  };

  // 모델 리스트 닫기 핸들러
  const handleCloseModelList = () => {
    toggleModelListVisible(false);
    toggleModelFullView(false);

    // 모바일에서는 선택된 인스펙션 초기화 (창 너비가 적을 경우)
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSelectedModel(null);
    }
  };

  if (!inspectionId || !isModelListVisible) {
    return null;
  }

  return (
    <Card
      className={
        isModelFullView
          ? "fixed inset-0 z-50 sm:m-4 transition-all duration-300"
          : "transition-all duration-300 max-w-full rounded-none"
      }
    >
      <CardHeader className="flex flex-row items-center justify-between flex-wrap sm:flex-nowrap p-2 sm:p-6">
        <div className="flex flex-row items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          <CardTitle className="whitespace-nowrap text-base sm:text-lg">
            모델 리스트
          </CardTitle>
          <CardDescription className="whitespace-normal sm:whitespace-nowrap text-xs sm:text-sm">
            {inspectionId
              ? `선택된 인스펙션의 모델 목록 (${
                  modelData?.models?.length || 0
                }개)`
              : "인스펙션을 선택해주세요"}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 mt-2 sm:mt-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleModelFullView()}
            className="h-8 w-8"
          >
            {isModelFullView ? (
              <IconMinimize className="h-4 w-4" />
            ) : (
              <IconMaximize className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCloseModelList}
            className="h-8 w-8"
          >
            <IconX className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent
        className={`p-2 sm:p-6 ${
          isModelFullView ? "h-[calc(100vh-150px)]" : ""
        }`}
      >
        {isModelFullView && selectedModel && (
          <div className="mb-2 sm:mb-4 p-2 sm:p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">고객사</div>
                <div className="text-base overflow-hidden text-ellipsis">
                  {customerData?.customers.find(
                    (customer) =>
                      customer.id ===
                      (modelData?.models.find(
                        (model) => model.id === selectedModel
                      )?.customerId || 0)
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
        <div className="rounded-md border">
          <div className="relative w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%] min-w-[120px] text-left whitespace-nowrap">
                    모델명
                  </TableHead>
                  <TableHead className="w-[30%] min-w-[60px] text-center whitespace-nowrap">
                    부품 수
                  </TableHead>
                  <TableHead className="w-[20%] min-w-[70px] text-center whitespace-nowrap">
                    상세보기
                  </TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <div
              className={`overflow-auto ${
                isModelFullView
                  ? "h-[calc(100vh-250px)]"
                  : "h-[calc(100vh-500px)]"
              }`}
            >
              {isModelLoading ? (
                <div className="flex justify-center items-center h-32">
                  <LoadingSpinner />
                </div>
              ) : modelData?.models && modelData.models.length > 0 ? (
                <Table>
                  <TableBody>
                    {modelData.models.map((model: Model) => (
                      <TableRow
                        key={model.id}
                        className={`cursor-pointer hover:bg-gray-100 ${
                          selectedModel === model.id ? "bg-gray-100" : ""
                        }`}
                        onClick={() => handleModelClick(model.id)}
                      >
                        <TableCell className="w-[50%] min-w-[120px] text-left truncate max-w-[250px]">
                          {model.name}
                        </TableCell>
                        <TableCell className="w-[30%] min-w-[60px] text-center">
                          {model.subpartCount}
                        </TableCell>
                        <TableCell className="w-[20%] min-w-[70px] text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleModelDetailClick(model);
                            }}
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
                  모델이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
