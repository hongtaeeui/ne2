"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  IconMinimize,
  IconX,
  IconMaximize,
  IconRefresh,
} from "@tabler/icons-react";
import { debounce } from "lodash";
import { useCallback, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { useGetContactList, useGetCustomer } from "@/lib/hooks/useCustomer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetModels } from "@/lib/hooks/useModels";
import type { Model } from "@/lib/hooks/useModels";
import {
  useGetSubparts,
  useUpdateSubpartsStatus,
  type Subpart,
} from "@/lib/hooks/useSubparts";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { formatDate, formatDateOnly } from "@/lib/dateUtils";
import useAuthStore from "@/lib/store/authStore";
import useIpStore from "@/lib/store/ipStore";

// inUse 상태에 따른 색상 반환 함수
function getInUseStatusColor(inUse: number | undefined) {
  if (inUse === 1) {
    return "bg-green-400 text-white"; // 사용중 - 밝은 녹색
  } else {
    return "bg-gray-400 text-white"; // 미사용중 - 회색
  }
}

// 로딩 오버레이 컴포넌트
function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="animate-spin rounded-full border-t-2 border-primary h-10 w-10" />
        <p className="mt-4 text-lg font-semibold">처리 중입니다...</p>
      </div>
    </div>
  );
}

export default function InspectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user } = useAuthStore();
  const { ip } = useIpStore();

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedInspection, setSelectedInspection] = useState<number | null>(
    null
  );
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [selectedModelDetail, setSelectedModelDetail] = useState<Model | null>(
    null
  );
  const [selectedSubpartDetail, setSelectedSubpartDetail] =
    useState<Subpart | null>(null);
  const [isModelDetailOpen, setIsModelDetailOpen] = useState(false);
  const [isSubpartDetailOpen, setIsSubpartDetailOpen] = useState(false);
  const [isModelFullView, setIsModelFullView] = useState(false);
  const [isSubpartFullView, setIsSubpartFullView] = useState(false);
  const [isModelListVisible, setIsModelListVisible] = useState(true);
  const [isSubpartListVisible, setIsSubpartListVisible] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubpartDetailEditMode, setIsSubpartDetailEditMode] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [editedSubparts, setEditedSubparts] = useState<Record<number, number>>(
    {}
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { mutate: updateSubpartsStatus, isPending: isUpdating } =
    useUpdateSubpartsStatus();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [
    isSubpartDetailConfirmDialogOpen,
    setIsSubpartDetailConfirmDialogOpen,
  ] = useState(false);
  const [modificationReason, setModificationReason] =
    useState("부품 상태 수정");
  const [selectedSubpartReason, setSelectedSubpartReason] = useState("");

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

  // // console.log("subpartData", subpartData);
  // // console.log("isSubpartLoading", isSubpartLoading);

  // //  고객사 목록 조회
  // const { data: allCustomers } = useGetCustomer({ page, limit });
  // // console.log("allCustomers", allCustomers);

  // 특정 고객의 사용자 목록 조회
  // const { data: customerUsers } = useGetCustomerList({
  //   customerId,
  //   page,
  //   limit,
  // });
  // 고객 연락처 목록 조회
  const { data: customerContacts } = useGetContactList(customerId);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  // 고객사 변경 핸들러
  const handleCustomerChange = (value: string) => {
    // 선택된 고객사가 변경되면 인스펙션, 모델, 부품 리스트 초기화
    setSelectedInspection(null);
    setSelectedModel(null);
    setIsModelListVisible(false);
    setIsSubpartListVisible(false);
    setIsModelFullView(false);
    setIsSubpartFullView(false);
    setEditedSubparts({});
    setSelectedContacts([]);
    setIsEditMode(false);

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
    // 다른 인스펙션을 선택한 경우
    if (selectedInspection !== inspectionId) {
      // 이전에 선택한 모델 및 부품 리스트 초기화
      setSelectedModel(null);
      setIsSubpartListVisible(false);
      setIsSubpartFullView(false);
      setEditedSubparts({});
      setSelectedContacts([]);
    }

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
    setIsSubpartDetailEditMode(false); // 상세보기 열 때 수정 모드 초기화

    // 부품 상세보기 열 때 현재 상태로 명확하게 초기화
    // 이전 상태를 완전히 대체하는 방식으로 업데이트
    setEditedSubparts({ [subpart.id]: subpart.inUse });

    // isMain이 1인 담당자 자동 선택
    const mainContacts =
      customerContacts?.contacts
        ?.filter((contact) => contact.isMain === 1)
        .map((contact) => contact.personEmail) || [];
    setSelectedContacts(mainContacts);

    setIsSubpartDetailOpen(true);
  };

  // 부품 상세보기에서 변경 사항 저장 핸들러
  const handleSubpartDetailSave = () => {
    // 선택된 모델이 없거나 모델 데이터가 없으면 실행하지 않음
    if (!selectedModel || !modelData?.models) {
      setIsSubpartDetailEditMode(false);
      return;
    }

    // 선택된 모델의 customerId 가져오기
    const modelCustomerId = modelData.models.find(
      (model) => model.id === selectedModel
    )?.customerId;

    if (!modelCustomerId) {
      console.error("모델의 고객사 ID를 찾을 수 없습니다.");
      setIsSubpartDetailEditMode(false);
      return;
    }

    // 변경사항이 있는 경우에만 다이얼로그 표시
    if (
      selectedSubpartDetail &&
      selectedModel &&
      editedSubparts[selectedSubpartDetail.id] !== undefined &&
      editedSubparts[selectedSubpartDetail.id] !== selectedSubpartDetail.inUse
    ) {
      setIsSubpartDetailConfirmDialogOpen(true);
    } else {
      setIsSubpartDetailEditMode(false);
    }
  };

  // 부품 상세보기에서 변경 사항 최종 저장 핸들러
  const handleSubpartDetailSaveConfirm = () => {
    if (!selectedSubpartDetail || !selectedModel || !modelData?.models) return;

    // 선택된 모델의 customerId 가져오기
    const modelCustomerId = modelData.models.find(
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

    updateSubpartsStatus(
      {
        customerId: modelCustomerId,
        modelId: selectedModel,
        userId: user?.id || 0,
        person: user?.name || "",
        ip: ip || "0.0.0.0", // IP 스토어에서 가져온 IP 사용
        reason: selectedSubpartReason || "부품 상태 수정",
        mailSendAddress: selectedContacts,
        subparts: subpartsToUpdate,
      },
      {
        onSuccess: () => {
          // UI 상태 초기화
          setIsSubpartDetailEditMode(false);
          setIsSubpartDetailOpen(false);
          setIsSubpartDetailConfirmDialogOpen(false);
          setSelectedSubpartReason("");
        },
      }
    );
  };

  const handleSubpartStatusChange = (subpartId: number, inUse: number) => {
    setEditedSubparts((prev) => ({
      ...prev,
      [subpartId]: inUse,
    }));
  };

  const hasChanges = Object.entries(editedSubparts).some(
    ([id, inUse]) =>
      subpartData?.items.find((item) => item.id === parseInt(id))?.inUse !==
      inUse
  );

  const handleEditModeToggle = () => {
    if (!isEditMode) {
      // 수정 모드 진입 시 현재 상태로 초기화
      // 명확하게 새 객체를 생성하여 이전 상태를 완전히 덮어씀
      if (subpartData?.items) {
        const initialStates: Record<number, number> = {};
        // 모든 부품에 대해 확실히 초기값 설정
        subpartData.items.forEach((subpart) => {
          initialStates[subpart.id] = subpart.inUse;
        });

        setEditedSubparts(initialStates);
      }

      // isMain이 1인 담당자 자동 선택
      const mainContacts =
        customerContacts?.contacts
          ?.filter((contact) => contact.isMain === 1)
          .map((contact) => contact.personEmail) || [];
      setSelectedContacts(mainContacts);
    } else {
      // 수정 모드 종료 시 초기화
      setEditedSubparts({});
      setSelectedContacts([]);
    }
    setIsEditMode(!isEditMode);
  };

  const handleSaveClick = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleSaveConfirm = () => {
    handleSaveChanges();
    setIsConfirmDialogOpen(false);
  };

  const handleSaveChanges = () => {
    if (!selectedModel || !customerData?.customers[0]?.id) return;

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
      // UI 상태 초기화
      setIsEditMode(false);
      setSelectedContacts([]);
      setEditedSubparts({});
      return;
    }

    // 선택된 모델의 customerId 가져오기
    const modelCustomerId = modelData?.models.find(
      (model) => model.id === selectedModel
    )?.customerId;

    if (!modelCustomerId) {
      console.error("모델의 고객사 ID를 찾을 수 없습니다.");
      return;
    }

    updateSubpartsStatus(
      {
        customerId: modelCustomerId,
        modelId: selectedModel,
        userId: user?.id || 0,
        person: user?.name || "",
        ip: ip || "0.0.0.0", // IP 스토어에서 가져온 IP 사용
        reason: modificationReason,
        mailSendAddress: selectedContacts,
        subparts: subpartsToUpdate,
      },
      {
        onSuccess: () => {
          // UI 상태 초기화
          setIsEditMode(false);
          setSelectedContacts([]);
          setEditedSubparts({});
          setModificationReason("부품 상태 수정"); // 초기값으로 리셋
        },
      }
    );
  };

  // 데이터 새로고침 함수
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // 현재 URL 파라미터를 유지하면서 페이지 새로고침
    router.refresh();

    // 시각적 피드백을 위해 1초 후 리프레싱 상태 해제
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, [router]);

  // 수정 모드 상태와 편집 상태의 동기화를 위한 useEffect
  React.useEffect(() => {
    // 부품 상세보기 모달이 열리거나 수정 모드로 전환될 때
    if (
      selectedSubpartDetail &&
      (isSubpartDetailEditMode || isSubpartDetailOpen)
    ) {
      setEditedSubparts((prev) => ({
        ...prev,
        [selectedSubpartDetail.id]: selectedSubpartDetail.inUse,
      }));
    }
  }, [selectedSubpartDetail, isSubpartDetailEditMode, isSubpartDetailOpen]);

  return (
    <div className="p-6 overflow-x-auto">
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

      {/* Breadcrumb */}
      {(selectedInspection || selectedModel) && (
        <div className="mb-4 flex items-center space-x-2 text-sm text-muted-foreground overflow-x-auto bg-muted/40 p-2 rounded-md">
          <span className="font-medium">경로:</span>
          <span>인스펙션</span>
          {selectedInspection && (
            <>
              <span className="mx-1">〉</span>
              <span>
                {paginatedData?.inspections.find(
                  (inspection) => inspection.id === selectedInspection
                )?.name || selectedInspection}
              </span>
            </>
          )}
          {selectedModel && (
            <>
              <span className="mx-1">〉</span>
              <span>
                {modelData?.models.find((model) => model.id === selectedModel)
                  ?.name || selectedModel}
              </span>
            </>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col">
          <div className="flex flex-col gap-4">
            <Card className="max-w-full shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>인스펙션 대시보드</CardTitle>
                    <CardDescription>
                      {paginatedData?.pagination.total || 0} inspections found
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                    <Select
                      value={customerId}
                      onValueChange={handleCustomerChange}
                    >
                      <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="고객사 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">모든 고객사</SelectItem>
                        {customerData?.customers.map((customer) => (
                          <SelectItem
                            key={customer.id}
                            value={String(customer.id)}
                          >
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
                    <Select
                      value={String(limit)}
                      onValueChange={handleLimitChange}
                    >
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
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div
                  className={`grid gap-4 overflow-hidden ${
                    isModelFullView || isSubpartFullView
                      ? ""
                      : selectedModel && isSubpartListVisible
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      : selectedInspection && isModelListVisible
                      ? "grid-cols-1 md:grid-cols-2"
                      : "grid-cols-1"
                  }`}
                  style={{
                    display:
                      isModelFullView || isSubpartFullView ? "block" : "grid",
                  }}
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
                    <div className="rounded-md border shadow-sm bg-white max-w-full">
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
                          {isInspectionLoading ? (
                            <div className="flex justify-center items-center h-32">
                              <LoadingSpinner />
                            </div>
                          ) : (
                            <Table>
                              <TableBody>
                                {filteredInspections.map(
                                  (inspection: Inspection) => (
                                    <TableRow
                                      key={inspection.id}
                                      className={`cursor-pointer hover:bg-gray-50 ${
                                        selectedInspection === inspection.id
                                          ? "bg-blue-50"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        handleInspectionClick(inspection.id)
                                      }
                                    >
                                      <TableCell className="w-[40%] text-left font-medium truncate max-w-[250px]">
                                        {inspection.name}
                                      </TableCell>
                                      <TableCell className="w-[40%] hidden md:table-cell text-left truncate max-w-[250px]">
                                        {customerData?.customers.find(
                                          (customer) =>
                                            customer.id ===
                                            inspection.customerId
                                        )?.name || "알 수 없음"}
                                      </TableCell>
                                      <TableCell className="w-[20%] text-center">
                                        <Badge variant="secondary">
                                          {inspection.modelCount}
                                        </Badge>
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
                        총 {paginatedData?.pagination.total || 0}개 결과 중{" "}
                        {(page - 1) * limit + 1}~
                        {Math.min(
                          page * limit,
                          paginatedData?.pagination.total || 0
                        )}
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
                          disabled={
                            page >= (paginatedData?.pagination.totalPages || 1)
                          }
                        >
                          다음
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 모델 리스트 */}
                  {selectedInspection && isModelListVisible && (
                    <div
                      className={`${
                        selectedModel && !isModelFullView
                          ? "hidden lg:block"
                          : "block"
                      } overflow-hidden w-full`}
                    >
                      <Card
                        className={
                          isModelFullView
                            ? "fixed inset-0 z-50 m-4 transition-all duration-300"
                            : "transition-all duration-300 max-w-full"
                        }
                      >
                        <CardHeader className="flex flex-row items-center justify-between flex-wrap sm:flex-nowrap">
                          <div className="flex flex-row items-center space-x-4 w-full sm:w-auto">
                            <CardTitle className="whitespace-nowrap">
                              모델 리스트
                            </CardTitle>
                            <CardDescription className="whitespace-normal sm:whitespace-nowrap">
                              {selectedInspection
                                ? `선택된 인스펙션의 모델 목록 (${
                                    modelData?.models?.length || 0
                                  }개)`
                                : "인스펙션을 선택해주세요"}
                            </CardDescription>
                          </div>
                          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setIsModelFullView(!isModelFullView)
                              }
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
                                // 모바일에서는 선택된 인스펙션 초기화
                                if (window.innerWidth < 1024) {
                                  setSelectedInspection(null);
                                }
                              }}
                            >
                              <IconX className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent
                          className={
                            isModelFullView ? "h-[calc(100vh-150px)]" : ""
                          }
                        >
                          {isModelFullView && (
                            <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-500">
                                    고객사
                                  </div>
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
                                    {paginatedData?.inspections.find(
                                      (inspection) =>
                                        inspection.id === selectedInspection
                                    )?.name || "알 수 없음"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-500">
                                    모델
                                  </div>
                                  <div className="text-base overflow-hidden text-ellipsis">
                                    {modelData?.models.find(
                                      (model) => model.id === selectedModel
                                    )?.name || "알 수 없음"}
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
                                    <TableHead className="w-[40%] min-w-[200px] text-left whitespace-nowrap">
                                      모델명
                                    </TableHead>
                                    <TableHead className="w-[10%] min-w-[80px] text-center whitespace-nowrap">
                                      부품 수
                                    </TableHead>
                                    {isModelFullView && (
                                      <>
                                        <TableHead className="w-[10%] min-w-[80px] text-center hidden md:table-cell whitespace-nowrap">
                                          상태
                                        </TableHead>
                                        <TableHead className="w-[20%] min-w-[150px] text-left hidden md:table-cell whitespace-nowrap">
                                          고객사
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
                                          onClick={() =>
                                            handleModelClick(model.id)
                                          }
                                        >
                                          <TableCell className="w-[40%] min-w-[200px] text-left truncate max-w-[250px]">
                                            {model.name}
                                          </TableCell>
                                          <TableCell className="w-[10%] min-w-[80px] text-center">
                                            {model.subpartCount}
                                          </TableCell>
                                          {isModelFullView && (
                                            <>
                                              <TableCell className="w-[10%] min-w-[80px] text-center hidden md:table-cell truncate">
                                                {model.status}
                                              </TableCell>
                                              <TableCell className="w-[20%] min-w-[150px] text-left hidden md:table-cell truncate max-w-[150px]">
                                                {customerData?.customers.find(
                                                  (customer) =>
                                                    customer.id ===
                                                    model.customerId
                                                )?.name || "알 수 없음"}
                                              </TableCell>
                                              <TableCell className="w-[10%] min-w-[100px] text-center hidden md:table-cell whitespace-nowrap">
                                                {formatDateOnly(
                                                  model.createdAt
                                                )}
                                              </TableCell>
                                              <TableCell className="w-[10%] min-w-[100px] text-center hidden md:table-cell whitespace-nowrap">
                                                {formatDateOnly(
                                                  model.updatedAt
                                                )}
                                              </TableCell>
                                            </>
                                          )}
                                          <TableCell className="w-[10%] min-w-[80px] text-center">
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

                  {/* 부품 리스트 */}
                  {selectedModel && isSubpartListVisible && (
                    <div
                      className={`${
                        isModelFullView ? "hidden" : "block"
                      } overflow-hidden w-full`}
                    >
                      <Card
                        className={
                          isSubpartFullView
                            ? "fixed inset-0 z-50 m-4 transition-all duration-300 overflow-auto"
                            : "transition-all duration-300 max-w-full"
                        }
                      >
                        <CardHeader className="flex flex-row items-center justify-between flex-wrap sm:flex-nowrap">
                          <div className="flex flex-row items-center space-x-4 w-full sm:w-auto">
                            <CardTitle className="whitespace-nowrap">
                              부품 리스트
                            </CardTitle>
                            <CardDescription className="whitespace-normal sm:whitespace-nowrap">
                              {`선택된 모델의 부품 목록 (${
                                subpartData?.total || 0
                              }개)`}
                            </CardDescription>
                          </div>
                          <div className="flex items-center flex-wrap gap-2 mt-2 sm:mt-0 justify-end">
                            {isSubpartFullView && (
                              <>
                                <Button
                                  variant="outline"
                                  onClick={handleEditModeToggle}
                                  className="text-sm px-2 py-1 h-8"
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
                              onClick={() => {
                                setIsSubpartFullView(!isSubpartFullView);
                              }}
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
                                // 모바일에서는 선택된 모델 초기화
                                if (window.innerWidth < 1024) {
                                  setSelectedModel(null);
                                  // 인스펙션 리스트가 표시될 수 있도록 모델 리스트 표시
                                  setIsModelListVisible(true);
                                }
                              }}
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
                                  <div className="text-sm font-medium text-gray-500">
                                    고객사
                                  </div>
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
                                    {paginatedData?.inspections.find(
                                      (inspection) =>
                                        inspection.id === selectedInspection
                                    )?.name || "알 수 없음"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-500">
                                    모델
                                  </div>
                                  <div className="text-base overflow-hidden text-ellipsis">
                                    {modelData?.models.find(
                                      (model) => model.id === selectedModel
                                    )?.name || "알 수 없음"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
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
                                            {contact.person} (
                                            {contact.personEmail})
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
                                    <LoadingSpinner />
                                  ) : subpartData?.items &&
                                    subpartData.items.length > 0 ? (
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
                                              {isSubpartFullView &&
                                              isEditMode ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                  <Switch
                                                    checked={
                                                      editedSubparts[
                                                        subpart.id
                                                      ] !== undefined
                                                        ? editedSubparts[
                                                            subpart.id
                                                          ] === 1
                                                        : subpart.inUse === 1
                                                    }
                                                    onCheckedChange={(
                                                      checked
                                                    ) =>
                                                      handleSubpartStatusChange(
                                                        subpart.id,
                                                        checked ? 1 : 0
                                                      )
                                                    }
                                                    disabled={isUpdating}
                                                  />
                                                  <span
                                                    className={
                                                      editedSubparts[
                                                        subpart.id
                                                      ] !== undefined &&
                                                      subpart.inUse !==
                                                        editedSubparts[
                                                          subpart.id
                                                        ]
                                                        ? "text-blue-500 font-medium"
                                                        : ""
                                                    }
                                                  >
                                                    {editedSubparts[
                                                      subpart.id
                                                    ] !== undefined
                                                      ? editedSubparts[
                                                          subpart.id
                                                        ] === 1
                                                      : subpart.inUse === 1}
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
                                                  {formatDateOnly(
                                                    subpart.createdAt
                                                  )}
                                                </TableCell>
                                                <TableCell className="w-[10%] min-w-[100px] text-center hidden md:table-cell whitespace-nowrap">
                                                  {formatDateOnly(
                                                    subpart.updatedAt
                                                  )}
                                                </TableCell>
                                              </>
                                            )}
                                            <TableCell className="w-[10%] min-w-[80px] text-center">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                  handleSubpartDetailClick(
                                                    subpart
                                                  )
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
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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
                {selectedModelDetail?.customerId && customerData?.customers
                  ? customerData.customers.find(
                      (customer) =>
                        customer.id === selectedModelDetail.customerId
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

      {/* 부품 상세 모달 */}
      <Dialog
        open={isSubpartDetailOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsSubpartDetailEditMode(false);
          }
          setIsSubpartDetailOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader className="flex flex-col space-y-2 text-center sm:text-left mb-2">
            <div className="flex justify-between items-center">
              <DialogTitle>{selectedSubpartDetail?.name} 상세 정보</DialogTitle>
              {!isSubpartDetailEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // 수정 모드 진입 시 현재 부품의 상태로 초기화
                    if (selectedSubpartDetail) {
                      setEditedSubparts({
                        [selectedSubpartDetail.id]: selectedSubpartDetail.inUse,
                      });
                    }

                    // isMain이 1인 담당자 자동 선택
                    const mainContacts =
                      customerContacts?.contacts
                        ?.filter((contact) => contact.isMain === 1)
                        .map((contact) => contact.personEmail) || [];
                    setSelectedContacts(mainContacts);

                    setIsSubpartDetailEditMode(true);
                  }}
                  disabled={isUpdating}
                  className="mr-8"
                >
                  수정
                </Button>
              )}
              {isSubpartDetailEditMode && (
                <div className="flex items-center gap-2 mr-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsSubpartDetailEditMode(false);
                      // 수정 취소시 편집 상태 초기화
                      if (selectedSubpartDetail) {
                        const { id, inUse } = selectedSubpartDetail;
                        setEditedSubparts((prev) => ({
                          ...prev,
                          [id]: inUse,
                        }));
                      }
                    }}
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
                        ? editedSubparts[selectedSubpartDetail.id] ===
                            undefined ||
                          editedSubparts[selectedSubpartDetail.id] ===
                            selectedSubpartDetail.inUse
                        : true)
                    }
                  >
                    {isUpdating ? "저장 중..." : "저장"}
                  </Button>
                </div>
              )}
            </div>
            <DialogDescription>
              부품의 상세 정보를 확인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
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
                      checked={
                        selectedSubpartDetail &&
                        editedSubparts[selectedSubpartDetail.id] !== undefined
                          ? editedSubparts[selectedSubpartDetail.id] === 1
                          : selectedSubpartDetail?.inUse === 1
                      }
                      onCheckedChange={(checked) =>
                        selectedSubpartDetail &&
                        handleSubpartStatusChange(
                          selectedSubpartDetail.id,
                          checked ? 1 : 0
                        )
                      }
                      disabled={isUpdating}
                    />
                    <span
                      className={
                        selectedSubpartDetail &&
                        editedSubparts[selectedSubpartDetail.id] !==
                          undefined &&
                        selectedSubpartDetail.inUse !==
                          editedSubparts[selectedSubpartDetail.id]
                          ? "text-blue-500 font-medium"
                          : ""
                      }
                    >
                      {selectedSubpartDetail &&
                      (editedSubparts[selectedSubpartDetail.id] !== undefined
                        ? editedSubparts[selectedSubpartDetail.id] === 1
                          ? "사용중"
                          : "미사용중"
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
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (!selectedContacts.includes(value)) {
                          setSelectedContacts([...selectedContacts, value]);
                        }
                      }}
                    >
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
                    {selectedContacts.map((email) => {
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
                            onClick={() =>
                              setSelectedContacts(
                                selectedContacts.filter((e) => e !== email)
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

      {/* 수정사항 확인 다이얼로그 */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>수정사항 확인</DialogTitle>
            {isUpdating && (
              <div className="mt-2 text-blue-500 font-medium flex items-center">
                <div className="animate-spin rounded-full border-t-2 border-blue-500 h-4 w-4 mr-2" />
                처리 중입니다...
              </div>
            )}
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
                disabled={isUpdating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isUpdating}
            >
              취소
            </Button>
            <Button onClick={handleSaveConfirm} disabled={isUpdating}>
              {isUpdating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full border-t-2 border-white h-4 w-4 mr-2" />
                  <span>저장 중...</span>
                </div>
              ) : (
                "저장"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 부품 상세보기 수정사항 확인 다이얼로그 */}
      <Dialog
        open={isSubpartDetailConfirmDialogOpen}
        onOpenChange={setIsSubpartDetailConfirmDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>부품 수정사항 확인</DialogTitle>
            {isUpdating && (
              <div className="mt-2 text-blue-500 font-medium flex items-center">
                <div className="animate-spin rounded-full border-t-2 border-blue-500 h-4 w-4 mr-2" />
                처리 중입니다...
              </div>
            )}
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
                disabled={isUpdating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSubpartDetailConfirmDialogOpen(false)}
              disabled={isUpdating}
            >
              취소
            </Button>
            <Button
              onClick={handleSubpartDetailSaveConfirm}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full border-t-2 border-white h-4 w-4 mr-2" />
                  <span>저장 중...</span>
                </div>
              ) : (
                "저장"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 저장 확인 다이얼로그 */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>수정사항 저장</DialogTitle>
            <DialogDescription>
              선택한 수정사항을 저장하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSaveDialogOpen(false)}
              disabled={isUpdating}
            >
              취소
            </Button>
            <Button onClick={handleSaveConfirm} disabled={isUpdating}>
              {isUpdating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full border-t-2 border-white h-4 w-4 mr-2" />
                  <span>저장 중...</span>
                </div>
              ) : (
                "확인"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 로딩 오버레이 */}
      {isUpdating && <LoadingOverlay />}
    </div>
  );
}
