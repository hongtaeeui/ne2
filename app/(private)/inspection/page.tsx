"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetInspection } from "@/lib/hooks/useInspection";
import useAuthStore from "@/lib/store/authStore";
import useIpStore from "@/lib/store/ipStore";
import useInspectionStore from "@/lib/store/inspectionStore";
import useInspectionUpdateStore from "@/lib/store/inspectionUpdateStore";
import { Suspense } from "react";

// 컴포넌트 임포트
import { InspectionHeader } from "@/components/inspection/InspectionHeader";
import { BreadcrumbNav } from "@/components/inspection/BreadcrumbNav";
import { InspectionListTable } from "@/components/inspection/InspectionListTable";
import { ModelList } from "@/components/inspection/ModelList";
import { ModelDetailDialog } from "@/components/inspection/ModelDetailDialog";
import { SubpartList } from "@/components/inspection/SubpartList";
import { SubpartDetailDialog } from "@/components/inspection/SubpartDetailDialog";
import { SubpartEditConfirmDialog } from "@/components/inspection/SubpartEditConfirmDialog";
import { LoadingOverlay } from "@/components/inspection/LoadingOverlay";

// inUse 상태에 따른 색상 반환 함수
function getInUseStatusColor(inUse: number | undefined) {
  if (inUse === 1) {
    return "bg-green-400 text-white"; // 사용중 - 밝은 녹색
  } else {
    return "bg-gray-400 text-white"; // 미사용중 - 회색
  }
}

export default function InspectionPage() {
  return (
    <Suspense fallback={<div>로딩중...</div>}>
      <InspectionPageContent />
    </Suspense>
  );
}

function InspectionPageContent() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { ip } = useIpStore();
  const {
    selectedInspection,
    selectedModel,
    isModelListVisible,
    isSubpartListVisible,
  } = useInspectionStore();
  const { isUpdating } = useInspectionUpdateStore();

  // URL에서 파라미터 가져오기
  const customerId = searchParams.get("customerId") || "all";
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";

  // 검사 데이터 가져오기
  const { data: paginatedData, isLoading: isInspectionLoading } =
    useGetInspection(
      customerId === "all"
        ? { page, limit, search: search || undefined }
        : { customerId, page, limit, search: search || undefined }
    );

  const [searchTerm, setSearchTerm] = React.useState(search || "");

  // URL의 검색어와 로컬 상태 동기화
  React.useEffect(() => {
    setSearchTerm(search);
  }, [search]);

  return (
    <div className="p-2 sm:p-6 overflow-x-auto">
      <InspectionHeader
        totalInspections={paginatedData?.pagination.total || 0}
      />

      {/* Breadcrumb */}
      <BreadcrumbNav />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col">
          <div className="flex flex-col gap-1 sm:gap-4">
            <Card className="max-w-full shadow-sm">
              <CardHeader className="pb-2 p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle>인스펙션 대시보드</CardTitle>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500 text-white">
                    Production DB
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 ">
                <div
                  className={`grid gap-1 sm:gap-4 overflow-hidden ${
                    selectedModel && isSubpartListVisible
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      : selectedInspection && isModelListVisible
                      ? "grid-cols-1 md:grid-cols-2"
                      : "grid-cols-1"
                  }`}
                >
                  {/* 인스펙션 리스트 */}
                  <div
                    className={`${
                      selectedInspection && selectedModel
                        ? "hidden lg:block"
                        : selectedInspection &&
                          !isModelListVisible &&
                          !selectedModel
                        ? "block"
                        : selectedInspection
                        ? "hidden lg:block"
                        : "block"
                    } overflow-hidden`}
                  >
                    <InspectionListTable
                      inspections={paginatedData?.inspections || []}
                      isLoading={isInspectionLoading}
                      pagination={
                        paginatedData?.pagination || {
                          total: 0,
                          currentPage: 1,
                          itemsPerPage: 10,
                          totalPages: 1,
                        }
                      }
                      searchTerm={searchTerm}
                    />
                  </div>

                  {/* 모델 리스트 */}
                  {selectedInspection && isModelListVisible && (
                    <div
                      className={`${
                        selectedModel ? "hidden lg:block" : "block"
                      } overflow-hidden w-full`}
                    >
                      <ModelList inspectionId={selectedInspection} />
                    </div>
                  )}

                  {/* 부품 리스트 */}
                  {selectedModel && isSubpartListVisible && (
                    <div className="overflow-hidden w-full">
                      <SubpartList modelId={selectedModel} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 다이얼로그 컴포넌트들 */}
      <ModelDetailDialog />
      <SubpartDetailDialog
        getInUseStatusColor={getInUseStatusColor}
        user={user}
        ip={ip}
      />
      <SubpartEditConfirmDialog user={user} ip={ip} />

      {/* 로딩 오버레이 */}
      {isUpdating && <LoadingOverlay />}
    </div>
  );
}
