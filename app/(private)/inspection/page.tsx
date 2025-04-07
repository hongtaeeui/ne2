"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconPlus } from "@tabler/icons-react";
import { debounce } from "lodash";
import { useCallback, useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetInspection } from "@/lib/hooks/useInspection";
import type { SimplifiedInspection } from "@/lib/hooks/useInspection";
import { useGetCustomer } from "@/lib/hooks/useCustomer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tooltip } from "@/components/ui/tooltip";
import { useGetModels } from "@/lib/hooks/useModels";

export default function InspectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = React.useState("");

  // URL에서 파라미터 가져오기
  const customerId = searchParams.get("customerId") || "all";
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";

  // 고객사 데이터 가져오기
  const { data: customerData } = useGetCustomer();

  // 검사 데이터 가져오기
  const { data: paginatedData } = useGetInspection(
    customerId === "all"
      ? { page, limit, search: search || undefined }
      : { customerId, page, limit, search: search || undefined }
  );

  // 모델 데이터 가져오기 파라미터 INSPECTION ID, PAGE, LIMIT
  const { data: modelData } = useGetModels({
    inspectionId: 1,
    page: page,
    limit: limit,
  });

  console.log("modelData", modelData);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  // 고객사 변경 핸들러
  const handleCustomerChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("customerId", value);
    params.set("page", "1"); // 고객사가 변경되면 페이지를 1로 리셋
    router.push(`?${params.toString()}`);
  };

  // 페이지당 항목 수 변경 핸들러
  const handleLimitChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set("limit", value);
      params.set("page", "1"); // 페이지당 항목 수가 변경되면 1페이지로 리셋
      if (customerId && customerId !== "all") {
        params.set("customerId", customerId);
      }
      router.push(`?${params.toString()}`);
    },
    [searchParams, customerId, router]
  );

  // 검색어 변경 핸들러
  const handleSearchChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      // 현재 선택된 고객사 정보 유지
      if (customerId && customerId !== "all") {
        params.set("customerId", customerId);
      }
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    },
    [searchParams, customerId, router]
  );

  // debounce 적용
  const debouncedSearch = useMemo(
    () => debounce((value: string) => handleSearchChange(value), 1000),
    [handleSearchChange]
  );

  // 검색어 입력 핸들러
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  // 컴포넌트가 언마운트될 때 debounce 취소
  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // URL의 검색어와 로컬 상태 동기화
  React.useEffect(() => {
    setSearchTerm(search);
  }, [search]);

  // 검색된 인스펙션 필터링
  const filteredInspections =
    paginatedData?.inspections.filter((inspection) =>
      inspection.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Inspection Dashboard</CardTitle>
          <CardDescription>
            {paginatedData?.pagination.total || 0} inspections found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Select value={customerId} onValueChange={handleCustomerChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 고객사</SelectItem>
                    {customerData?.customers.map((customer) => (
                      <SelectItem key={customer.id} value={String(customer.id)}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search inspections..."
                  className="max-w-sm"
                  value={searchTerm}
                  onChange={handleSearchInput}
                />
                <Select value={String(limit)} onValueChange={handleLimitChange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Page Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10개씩</SelectItem>
                    <SelectItem value="20">20개씩</SelectItem>
                    <SelectItem value="50">50개씩</SelectItem>
                    <SelectItem value="100">100개씩</SelectItem>
                    <SelectItem value="200">200개씩</SelectItem>
                    <SelectItem value="500">500개씩</SelectItem>
                    <SelectItem value="1000">1000개씩</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* 비활성화 처리 */}
              {/* 툴팁 추가 */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        onClick={() => router.push("/inspection/new")}
                        disabled={true}
                        className="pointer-events-none" // 클릭은 막지만 툴팁은 가능하게 함
                      >
                        <IconPlus className="mr-2 h-4 w-4" />
                        New Inspection
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>준비중입니다.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Model Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInspections.map((inspection: SimplifiedInspection) => (
                  <TableRow key={inspection.name}>
                    <TableCell>{inspection.name}</TableCell>
                    <TableCell className="text-right">
                      {inspection.modelCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, paginatedData?.pagination.total || 0)}{" "}
                of {paginatedData?.pagination.total || 0} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= (paginatedData?.pagination.totalPages || 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
