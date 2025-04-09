import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useGetCustomer } from "@/lib/hooks/useCustomer";
import type { Inspection } from "@/lib/hooks/useInspection";
import useInspectionStore from "@/lib/store/inspectionStore";

interface InspectionListTableProps {
  inspections: Inspection[];
  isLoading: boolean;
  pagination: {
    total: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  };
  searchTerm: string;
}

export function InspectionListTable({
  inspections,
  isLoading,
  pagination,
  searchTerm,
}: InspectionListTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    selectedInspection,
    setSelectedInspection,
    toggleModelListVisible,
    resetModelSelection,
  } = useInspectionStore();

  // URL에서 파라미터 가져오기
  const page = Number(searchParams.get("page")) || 1;

  // 고객사 데이터 가져오기
  const { data: customerData } = useGetCustomer();

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  // 검색된 인스펙션 필터링
  const filteredInspections = inspections.filter((inspection) =>
    inspection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 인스펙션 클릭 핸들러
  const handleInspectionClick = (inspectionId: number) => {
    // 다른 인스펙션을 선택한 경우 모델 및 부품 리스트 초기화
    if (selectedInspection !== inspectionId) {
      resetModelSelection();
    }

    setSelectedInspection(inspectionId);
    toggleModelListVisible(true);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border shadow-sm bg-white">
        <div className="relative w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%] text-left whitespace-nowrap">
                  이름
                </TableHead>
                <TableHead className="w-[40%] hidden md:table-cell text-left whitespace-nowrap">
                  고객사
                </TableHead>
                <TableHead className="w-[20%] text-center whitespace-nowrap">
                  모델 수
                </TableHead>
              </TableRow>
            </TableHeader>
          </Table>
          <div className="overflow-auto h-[calc(100vh-350px)]">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner />
              </div>
            ) : (
              <Table>
                <TableBody>
                  {filteredInspections.map((inspection) => (
                    <TableRow
                      key={inspection.id}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        selectedInspection === inspection.id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleInspectionClick(inspection.id)}
                    >
                      <TableCell className="w-[40%] text-left font-medium truncate max-w-[250px]">
                        {inspection.name}
                      </TableCell>
                      <TableCell className="w-[40%] hidden md:table-cell text-left truncate max-w-[250px]">
                        {customerData?.customers.find(
                          (customer) => customer.id === inspection.customerId
                        )?.name || "알 수 없음"}
                      </TableCell>
                      <TableCell className="w-[20%] text-center">
                        <Badge variant="secondary">
                          {inspection.modelCount}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredInspections.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        검색 결과가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          총 {pagination.total || 0}개 결과 중{" "}
          {(page - 1) * pagination.itemsPerPage + 1}~
          {Math.min(page * pagination.itemsPerPage, pagination.total || 0)}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            이전
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= (pagination.totalPages || 1)}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
