"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  IconPlus,
  IconX,
  IconMaximize,
  IconMinimize,
} from "@tabler/icons-react";
import { debounce } from "lodash";
import { useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
import type { Inspection } from "@/lib/hooks/useInspection";
import {
  useGetContactList,
  useGetCustomer,
  useGetCustomerList,
  CustomerContact,
} from "@/lib/hooks/useCustomer";
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
import type { Model } from "@/lib/hooks/useModels";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  useGetSubparts,
  useUpdateSubpartsStatus,
  Subpart,
} from "@/lib/hooks/useSubparts";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// inUse 상태에 따른 색상 반환 함수
function getInUseStatusColor(inUse: number | undefined) {
  if (inUse === 1) {
    return "bg-green-400 text-white"; // 사용중 - 밝은 녹색
  } else {
    return "bg-gray-400 text-white"; // 미사용중 - 회색
  }
}

export default function InspectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedInspection, setSelectedInspection] = React.useState<
    number | null
  >(null);
  const [selectedModel, setSelectedModel] = React.useState<number | null>(null);
  const [selectedModelDetail, setSelectedModelDetail] =
    React.useState<Model | null>(null);
  const [selectedSubpartDetail, setSelectedSubpartDetail] =
    React.useState<Subpart | null>(null);
  const [isModelDetailOpen, setIsModelDetailOpen] = React.useState(false);
  const [isSubpartDetailOpen, setIsSubpartDetailOpen] = React.useState(false);
  const [isModelFullView, setIsModelFullView] = React.useState(false);
  const [isSubpartFullView, setIsSubpartFullView] = React.useState(false);
  const [isModelListVisible, setIsModelListVisible] = React.useState(true);
  const [isSubpartListVisible, setIsSubpartListVisible] = React.useState(true);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [selectedContacts, setSelectedContacts] = React.useState<string[]>([]);
  const [editedSubparts, setEditedSubparts] = React.useState<
    Record<number, number>
  >({});
  const { mutate: updateSubpartsStatus, isPending: isUpdating } =
    useUpdateSubpartsStatus();

  // URL에서 파라미터 가져오기
  const customerId = searchParams.get("customerId") || "all";
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";

  // 고객사 데이터 가져오기
  const { data: customerData } = useGetCustomer();

  // 검사 데이터 가져오기
  const { data: paginatedData, isLoading: isInspectionLoading } =
    useGetInspection(
      customerId === "all"
        ? { page, limit, search: search || undefined }
        : { customerId, page, limit, search: search || undefined }
    );

  // 선택된 인스펙션의 모델 데이터 가져오기
  const { data: modelData, isLoading: isModelLoading } = useGetModels(
    selectedInspection
      ? {
          inspectionId: selectedInspection,
          page: 1,
          limit: 10,
        }
      : undefined
  );

  // 선택된 모델의 부품 데이터 가져오기
  const { data: subpartData, isLoading: isSubpartLoading } = useGetSubparts(
    selectedModel
      ? {
          modelId: selectedModel,
          page: 1,
          limit: 10,
        }
      : undefined
  );

  console.log("subpartData", subpartData);
  console.log("isSubpartLoading", isSubpartLoading);

  //  고객사 목록 조회
  const { data: allCustomers } = useGetCustomer({ page, limit });
  console.log("allCustomers", allCustomers);

  // 특정 고객의 사용자 목록 조회
  const { data: customerUsers } = useGetCustomerList({
    customerId,
    page,
    limit,
  });
  console.log("customerUsers", customerUsers);
  // 고객 연락처 목록 조회
  const { data: customerContacts } = useGetContactList(customerId);
  console.log("customerContacts", customerContacts);

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
    paginatedData?.inspections.filter((inspection: Inspection) =>
      inspection.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // 인스펙션 클릭 핸들러
  const handleInspectionClick = (inspectionId: number) => {
    setSelectedInspection(inspectionId);
    setIsModelListVisible(true);
    setIsModelFullView(false);
  };

  // 모델 클릭 핸들러
  const handleModelClick = (modelId: number) => {
    setSelectedModel(modelId);
    setIsSubpartListVisible(true);
    setIsSubpartFullView(false);
  };

  // 모델 상세보기 핸들러
  const handleModelDetailClick = (model: Model) => {
    setSelectedModelDetail(model);
    setIsModelDetailOpen(true);
  };

  // 부품 상세보기 핸들러
  const handleSubpartDetailClick = (subpart: Subpart) => {
    setSelectedSubpartDetail(subpart);
    setIsSubpartDetailOpen(true);
  };

  const handleSubpartStatusChange = (subpartId: number, inUse: number) => {
    setEditedSubparts((prev) => ({
      ...prev,
      [subpartId]: inUse,
    }));
  };

  const handleContactSelect = (email: string) => {
    console.log("Selected email:", email);
    setSelectedContacts((prev) => {
      const newContacts = prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email];
      console.log("Updated contacts:", newContacts);
      return newContacts;
    });
  };

  const handleSaveChanges = () => {
    if (!selectedModel || !customerData?.customers[0]?.id) return;

    const subpartsToUpdate = Object.entries(editedSubparts).map(
      ([id, inUse]) => ({
        id: parseInt(id),
        inUse,
      })
    );

    updateSubpartsStatus(
      {
        customerId: customerData.customers[0].id,
        modelId: selectedModel,
        userId: 5, // 실제 사용자 ID로 변경 필요
        person: "홍길동", // 실제 사용자 이름으로 변경 필요
        ip: "192.168.0.1", // 실제 IP로 변경 필요
        reason: "부품 상태 수정",
        mailSendAddress: selectedContacts,
        subparts: subpartsToUpdate,
      },
      {
        onSuccess: () => {
          setIsEditMode(false);
          setSelectedContacts([]);
          setEditedSubparts({});
        },
      }
    );
  };

  // 수정 모드 진입 시 현재 상태 초기화
  const handleEditModeToggle = () => {
    if (!isEditMode) {
      // 수정 모드 진입 시 현재 상태로 초기화
      const initialStates =
        subpartData?.items.reduce((acc, subpart) => {
          acc[subpart.id] = subpart.inUse;
          return acc;
        }, {} as Record<number, number>) || {};
      setEditedSubparts(initialStates);
    } else {
      // 수정 모드 종료 시 초기화
      setEditedSubparts({});
      setSelectedContacts([]);
    }
    setIsEditMode(!isEditMode);
  };

  return (
    <div className="container mx-auto pt-6">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center space-x-2 text-sm text-muted-foreground">
        <span>인스펙션</span>
        {selectedInspection && (
          <>
            <span>/</span>
            <span>{selectedInspection}</span>
          </>
        )}
        {selectedModel && (
          <>
            <span>/</span>
            <span>{selectedModel}</span>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inspection Dashboard</CardTitle>
          <CardDescription>
            {paginatedData?.pagination.total || 0} inspections found
          </CardDescription>
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
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div
              className={`grid ${
                isModelFullView || isSubpartFullView
                  ? "grid-cols-1"
                  : selectedModel && isSubpartListVisible
                  ? "lg:grid-cols-3"
                  : selectedInspection && isModelListVisible
                  ? "lg:grid-cols-2"
                  : "grid-cols-1"
              } gap-4`}
            >
              <div
                className={`${
                  selectedInspection ? "hidden lg:block" : "block"
                }`}
              >
                <div className="rounded-md border">
                  <div className="relative w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead className="hidden md:table-cell">
                            고객사
                          </TableHead>
                          <TableHead className="text-right">
                            Model Count
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                    </Table>
                    <div className="overflow-auto h-[calc(100vh-400px)]">
                      {isInspectionLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <Table>
                          <TableBody>
                            {filteredInspections.map(
                              (inspection: Inspection) => (
                                <TableRow
                                  key={inspection.id}
                                  className={`cursor-pointer hover:bg-gray-100 ${
                                    selectedInspection === inspection.id
                                      ? "bg-gray-100"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleInspectionClick(inspection.id)
                                  }
                                >
                                  <TableCell>{inspection.name}</TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    {customerData?.customers.find(
                                      (customer) =>
                                        customer.id === inspection.customerId
                                    )?.name || "알 수 없음"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {inspection.modelCount}
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {(page - 1) * limit + 1} to{" "}
                    {Math.min(
                      page * limit,
                      paginatedData?.pagination.total || 0
                    )}{" "}
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
                      disabled={
                        page >= (paginatedData?.pagination.totalPages || 1)
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>

              {selectedInspection && isModelListVisible && (
                <div
                  className={`lg:block ${
                    selectedModel && !isModelFullView
                      ? "hidden lg:block"
                      : "block"
                  }`}
                >
                  <Card
                    className={
                      isModelFullView
                        ? "fixed inset-0 z-50 m-4 transition-all duration-300"
                        : "transition-all duration-300"
                    }
                  >
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <CardTitle>모델 리스트</CardTitle>
                        <CardDescription>
                          {selectedInspection
                            ? `선택된 인스펙션의 모델 목록 (${
                                modelData?.models?.length || 0
                              }개)`
                            : "인스펙션을 선택해주세요"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsModelFullView(!isModelFullView)}
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
                          onClick={() => {
                            setIsModelListVisible(false);
                            setIsModelFullView(false);
                          }}
                        >
                          <IconX className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent
                      className={isModelFullView ? "h-[calc(100vh-150px)]" : ""}
                    >
                      <div className="rounded-md border">
                        <div className="relative w-full">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>모델명</TableHead>
                                <TableHead>부품 수</TableHead>
                                <TableHead>상세보기</TableHead>
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
                              <LoadingSpinner />
                            ) : modelData?.models &&
                              modelData.models.length > 0 ? (
                              <Table>
                                <TableBody>
                                  {modelData.models.map((model: Model) => (
                                    <TableRow
                                      key={model.id}
                                      className={`cursor-pointer hover:bg-gray-100 ${
                                        selectedModel === model.id
                                          ? "bg-gray-100"
                                          : ""
                                      }`}
                                      onClick={() => handleModelClick(model.id)}
                                    >
                                      <TableCell>{model.name}</TableCell>
                                      <TableCell>
                                        {model.subpartCount}
                                      </TableCell>
                                      <TableCell>
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
                </div>
              )}

              {selectedModel && isSubpartListVisible && (
                <div
                  className={`lg:block ${isModelFullView ? "hidden" : "block"}`}
                >
                  <Card
                    className={
                      isSubpartFullView
                        ? "fixed inset-0 z-50 m-4 transition-all duration-300"
                        : "transition-all duration-300"
                    }
                  >
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <CardTitle>부품 리스트</CardTitle>
                        <CardDescription>
                          {`선택된 모델의 부품 목록 (${
                            subpartData?.total || 0
                          }개)`}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isSubpartFullView && (
                          <>
                            <Button
                              variant="outline"
                              onClick={handleEditModeToggle}
                            >
                              {isEditMode ? "수정 취소" : "수정"}
                            </Button>
                            {isEditMode && (
                              <Button
                                variant="default"
                                onClick={handleSaveChanges}
                                disabled={isUpdating}
                              >
                                {isUpdating ? "저장 중..." : "저장"}
                              </Button>
                            )}
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setIsSubpartFullView(!isSubpartFullView)
                          }
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
                          onClick={() => {
                            setIsSubpartListVisible(false);
                            setIsSubpartFullView(false);
                            setIsEditMode(false);
                            setEditedSubparts({});
                            setSelectedContacts([]);
                          }}
                        >
                          <IconX className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent
                      className={
                        isSubpartFullView ? "h-[calc(100vh-150px)]" : ""
                      }
                    >
                      {isSubpartFullView && isEditMode && (
                        <div className="mb-4 p-4 border rounded-lg">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">담당자 선택</h3>
                              <Select
                                value=""
                                onValueChange={(value) => {
                                  if (!selectedContacts.includes(value)) {
                                    setSelectedContacts([
                                      ...selectedContacts,
                                      value,
                                    ]);
                                  }
                                }}
                              >
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="담당자 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                  {customerContacts?.contacts?.map(
                                    (contact) => (
                                      <SelectItem
                                        key={contact.id}
                                        value={contact.personEmail}
                                        disabled={selectedContacts.includes(
                                          contact.personEmail
                                        )}
                                      >
                                        {contact.person} ({contact.personEmail})
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedContacts.map((email) => {
                                const contact =
                                  customerContacts?.contacts?.find(
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
                                      onClick={() =>
                                        setSelectedContacts(
                                          selectedContacts.filter(
                                            (e) => e !== email
                                          )
                                        )
                                      }
                                      className="ml-1 hover:text-red-500"
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
                      {isSubpartFullView && isEditMode && (
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
                        <div className="relative w-full">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>부품명</TableHead>
                                <TableHead>사용여부</TableHead>
                                <TableHead>상세보기</TableHead>
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
                              <LoadingSpinner />
                            ) : subpartData?.items &&
                              subpartData.items.length > 0 ? (
                              <Table>
                                <TableBody>
                                  {subpartData.items.map((subpart) => (
                                    <TableRow key={subpart.id}>
                                      <TableCell>{subpart.name}</TableCell>
                                      <TableCell>
                                        {isSubpartFullView && isEditMode ? (
                                          <div className="flex items-center space-x-2">
                                            <Switch
                                              checked={
                                                editedSubparts[subpart.id] === 1
                                              }
                                              onCheckedChange={(checked) =>
                                                handleSubpartStatusChange(
                                                  subpart.id,
                                                  checked ? 1 : 0
                                                )
                                              }
                                            />
                                            <span
                                              className={`${
                                                editedSubparts[subpart.id] !==
                                                  undefined &&
                                                subpart.inUse !==
                                                  editedSubparts[subpart.id]
                                                  ? "text-blue-500 font-medium"
                                                  : ""
                                              }`}
                                            >
                                              {editedSubparts[subpart.id] === 1
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
                                            {subpart.inUse === 1
                                              ? "사용중"
                                              : "미사용중"}
                                          </span>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleSubpartDetailClick(subpart)
                                          }
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
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 모델 상세 모달 */}
      <Dialog open={isModelDetailOpen} onOpenChange={setIsModelDetailOpen}>
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
                {customerData?.customers.find(
                  (customer) => customer.id === selectedModelDetail?.customerId
                )?.name || "알 수 없음"}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1 font-medium">생성일</div>
              <div className="col-span-3">{selectedModelDetail?.createdAt}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1 font-medium">수정일</div>
              <div className="col-span-3">{selectedModelDetail?.updatedAt}</div>
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

      {/* 부품 상세 모달 */}
      <Dialog open={isSubpartDetailOpen} onOpenChange={setIsSubpartDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedSubpartDetail?.name} 상세 정보</DialogTitle>
            <DialogDescription>
              부품의 상세 정보를 확인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1 font-medium">부품명</div>
              <div className="col-span-3">{selectedSubpartDetail?.name}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1 font-medium">사용 상태</div>
              <div className="col-span-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getInUseStatusColor(
                    selectedSubpartDetail?.inUse
                  )}`}
                >
                  {selectedSubpartDetail?.inUse === 1 ? "사용중" : "미사용중"}
                </span>
              </div>
            </div>
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
              <div className="col-span-3">
                {selectedSubpartDetail?.threshold}
              </div>
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
                {selectedSubpartDetail?.createdAt}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1 font-medium">수정일</div>
              <div className="col-span-3">
                {selectedSubpartDetail?.updatedAt}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
