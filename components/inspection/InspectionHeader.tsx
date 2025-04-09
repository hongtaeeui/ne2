import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { debounce } from "lodash";
import { useGetCustomer } from "@/lib/hooks/useCustomer";
import useInspectionStore from "@/lib/store/inspectionStore";

interface InspectionHeaderProps {
  totalInspections: number;
}

export function InspectionHeader({ totalInspections }: InspectionHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isRefreshing, setRefreshing } = useInspectionStore();

  const [searchTerm, setSearchTerm] = React.useState("");

  // URL에서 파라미터 가져오기
  const customerId = searchParams.get("customerId") || "all";
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";

  // 고객사 데이터 가져오기
  const { data: customerData } = useGetCustomer();

  // 페이지당 항목 수 변경 핸들러
  const handleLimitChange = React.useCallback(
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

  // 고객사 변경 핸들러
  const handleCustomerChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("customerId", value);
    params.set("page", "1"); // 고객사가 변경되면 페이지를 1로 리셋
    router.push(`?${params.toString()}`);
  };

  // 검색어 변경 핸들러
  const handleSearchChange = React.useCallback(
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
  const debouncedSearch = React.useMemo(
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

  // 데이터 새로고침 함수
  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    // 현재 URL 파라미터를 유지하면서 페이지 새로고침
    router.refresh();

    // 시각적 피드백을 위해 1초 후 리프레싱 상태 해제
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [router, setRefreshing]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">인스펙션</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <IconRefresh
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          <Select value={customerId} onValueChange={handleCustomerChange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="고객사 선택" />
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
            placeholder="검색어를 입력하세요..."
            className="w-full md:w-[200px]"
            value={searchTerm}
            onChange={handleSearchInput}
          />
          <Select value={String(limit)} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-full md:w-[120px]">
              <SelectValue placeholder="페이지 크기" />
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
        <div className="text-sm text-muted-foreground ml-auto">
          총 {totalInspections}개의 인스펙션
        </div>
      </div>
    </>
  );
}
