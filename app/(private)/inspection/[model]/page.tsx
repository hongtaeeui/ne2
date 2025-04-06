"use client";

import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft, IconCheck, IconClipboardCheck, IconDeviceFloppy, IconRefresh } from "@tabler/icons-react";

import { InspectionBreadcrumb } from "@/components/inspection-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SubpartPreviewModal, SubpartPreviewData } from "@/components/subpart-preview-modal";

interface Subpart {
  id: string;
  name: string;
  description: string;
  status: "completed" | "in-progress" | "pending";
  lastInspection: string;
  inUse: boolean;
  completionRate: number;
}

interface ModelData {
  id: string;
  name: string;
  description: string;
  type: string;
  specifications: {
    manufacturer: string;
    serialNumber: string;
    manufactureDate: string;
    weight: string;
    dimensions: string;
  };
  totalSubparts: number;
  completedSubparts: number;
  subparts: Subpart[];
}

// 임시 데이터 - 실제로는 API에서 가져와야 함
const modelsData: Record<string, ModelData> = {
  "model-a": {
    id: "model-a",
    name: "Model A",
    description: "고성능 모델로 선진 기능을 탑재한 프리미엄 제품입니다.",
    type: "High Performance",
    specifications: {
      manufacturer: "NE2 Industries",
      serialNumber: "MA-2023-12345",
      manufactureDate: "2023-01-15",
      weight: "1,250 kg",
      dimensions: "450 x 200 x 150 cm",
    },
    totalSubparts: 6,
    completedSubparts: 3,
    subparts: [
      {
        id: "engine",
        name: "Engine System",
        description: "The primary power generation unit",
        status: "completed",
        lastInspection: "2023-12-05",
        inUse: true,
        completionRate: 100,
      },
      {
        id: "chassis",
        name: "Chassis Structure",
        description: "Main body structure and frame",
        status: "in-progress",
        lastInspection: "2023-12-10",
        inUse: true,
        completionRate: 65,
      },
      {
        id: "electronics",
        name: "Electronics",
        description: "Control and entertainment systems",
        status: "pending",
        lastInspection: "-",
        inUse: false,
        completionRate: 0,
      },
      {
        id: "suspension",
        name: "Suspension System",
        description: "Shock absorption and road handling",
        status: "pending",
        lastInspection: "-",
        inUse: true,
        completionRate: 15,
      },
      {
        id: "brakes",
        name: "Brake System",
        description: "Safety-critical stopping mechanism",
        status: "completed",
        lastInspection: "2023-12-08",
        inUse: true,
        completionRate: 100,
      },
      {
        id: "cooling",
        name: "Cooling System",
        description: "Temperature regulation systems",
        status: "in-progress",
        lastInspection: "2023-12-11",
        inUse: true,
        completionRate: 45,
      },
    ],
  },
  "model-b": {
    id: "model-b",
    name: "Model B",
    description: "경제적인 운영 비용과 필수 기능을 갖춘 실용적인 모델입니다.",
    type: "Economy",
    specifications: {
      manufacturer: "NE2 Industries",
      serialNumber: "MB-2023-67890",
      manufactureDate: "2023-02-20",
      weight: "950 kg",
      dimensions: "420 x 180 x 140 cm",
    },
    totalSubparts: 5,
    completedSubparts: 2,
    subparts: [
      {
        id: "engine",
        name: "Engine System",
        description: "Fuel-efficient power unit",
        status: "completed",
        lastInspection: "2023-12-03",
        inUse: true,
        completionRate: 100,
      },
      {
        id: "body",
        name: "Body Structure",
        description: "Outer shell and frame",
        status: "completed",
        lastInspection: "2023-12-07",
        inUse: true,
        completionRate: 100,
      },
      {
        id: "interior",
        name: "Interior Components",
        description: "Cabin design and comfort features",
        status: "pending",
        lastInspection: "-",
        inUse: false,
        completionRate: 10,
      },
      {
        id: "transmission",
        name: "Transmission",
        description: "Power delivery system",
        status: "in-progress",
        lastInspection: "2023-12-09",
        inUse: true,
        completionRate: 70,
      },
      {
        id: "fuel",
        name: "Fuel System",
        description: "Fuel storage and delivery",
        status: "pending",
        lastInspection: "-",
        inUse: true,
        completionRate: 5,
      },
    ],
  },
  "model-c": {
    id: "model-c",
    name: "Model C",
    description: "최고급 재료와 혁신적인 기술이 결합된 럭셔리 모델입니다.",
    type: "Premium",
    specifications: {
      manufacturer: "NE2 Industries",
      serialNumber: "MC-2023-54321",
      manufactureDate: "2023-03-10",
      weight: "1,350 kg",
      dimensions: "470 x 210 x 155 cm",
    },
    totalSubparts: 3,
    completedSubparts: 1,
    subparts: [
      {
        id: "powertrain",
        name: "Power Train",
        description: "Advanced power delivery system",
        status: "completed",
        lastInspection: "2023-12-02",
        inUse: true,
        completionRate: 100,
      },
      {
        id: "safety",
        name: "Safety Systems",
        description: "Passive and active safety features",
        status: "in-progress",
        lastInspection: "2023-12-08",
        inUse: true,
        completionRate: 60,
      },
      {
        id: "entertainment",
        name: "Entertainment System",
        description: "Premium audio and connectivity",
        status: "pending",
        lastInspection: "-",
        inUse: false,
        completionRate: 0,
      },
    ],
  },
};

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "in-progress":
      return "bg-blue-500";
    case "pending":
      return "bg-amber-500";
    default:
      return "bg-gray-500";
  }
}

export default function ModelPage({ params }: { params: { model: string } }) {
  const { model: modelId } = params;

  // 모델 데이터 가져오기
  const model = modelsData[modelId];
  if (!model) {
    notFound();
  }

  // 선택된 서브파트 상태 관리
  const [selectedSubparts, setSelectedSubparts] = React.useState<string[]>([]);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false);
  const [updateReason, setUpdateReason] = React.useState("");
  const [updaterName, setUpdaterName] = React.useState("");

  // 서브파트 모달 상태
  const [selectedSubpart, setSelectedSubpart] = React.useState<SubpartPreviewData | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = React.useState(false);

  // 모든 서브파트 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubparts(model.subparts.map((subpart) => subpart.id));
    } else {
      setSelectedSubparts([]);
    }
  };

  // 개별 서브파트 선택/해제
  const handleSelectSubpart = (subpartId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubparts((prev) => [...prev, subpartId]);
    } else {
      setSelectedSubparts((prev) => prev.filter((id) => id !== subpartId));
    }
  };

  // 서브파트 상태 업데이트
  const handleUpdateStatus = () => {
    console.log("Updating subparts:", selectedSubparts);
    console.log("Updated by:", updaterName);
    console.log("Reason:", updateReason);

    // 실제로는 API 호출로 처리

    setIsUpdateDialogOpen(false);
    setSelectedSubparts([]);
    setUpdaterName("");
    setUpdateReason("");
  };

  // 서브파트 클릭 시 모달 열기
  const handleSubpartClick = (subpart: Subpart) => {
    // 모달 데이터 준비
    const checkItems = [];

    // 임의의 체크 항목 생성 (실제로는 API에서 가져와야 함)
    const itemNames = ["Visual Inspection", "Performance Test", "Structural Integrity", "Safety Check"];
    for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) {
      const status = Math.random() > 0.5 ? "passed" : Math.random() > 0.5 ? "pending" : "failed";
      checkItems.push({
        name: itemNames[i % itemNames.length],
        status: status as "passed" | "failed" | "pending",
      });
    }

    const previewData: SubpartPreviewData = {
      id: subpart.id,
      modelId: modelId,
      name: subpart.name,
      description: subpart.description,
      status: subpart.status,
      specifications: [
        { name: "Serial Number", value: `SN-${modelId.toUpperCase()}-${subpart.id.toUpperCase()}-12345` },
        { name: "Manufacturer", value: model.specifications.manufacturer },
        { name: "Part of", value: model.name },
        { name: "Weight", value: `${Math.floor(Math.random() * 100) + 20} kg` },
      ],
      completionRate: subpart.completionRate,
    };

    setSelectedSubpart(previewData);
    setIsPreviewModalOpen(true);
  };

  // 체크박스 ref (indeterminate 상태 처리용)
  const checkboxRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (checkboxRef.current) {
      (checkboxRef.current as any).indeterminate = selectedSubparts.length > 0 && selectedSubparts.length < model.subparts.length;
    }
  }, [selectedSubparts, model.subparts.length]);

  // 전체 진행률 계산
  const overallProgress = Math.round((model.completedSubparts / model.totalSubparts) * 100);

  return (
    <div className="container p-6">
      <div className="flex items-center justify-between mb-6">
        <InspectionBreadcrumb model={model.name} modelId={modelId} />
        <Button variant="outline" size="sm" asChild>
          <Link href="/inspection">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            인스펙션 목록으로
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{model.name}</CardTitle>
                <CardDescription className="mt-2">{model.description}</CardDescription>
              </div>
              <Badge className="text-white" variant="secondary">
                {model.type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">사양 정보</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between py-1 border-b">
                    <dt className="font-medium">제조사</dt>
                    <dd>{model.specifications.manufacturer}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <dt className="font-medium">일련번호</dt>
                    <dd>{model.specifications.serialNumber}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <dt className="font-medium">제조일</dt>
                    <dd>{model.specifications.manufactureDate}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <dt className="font-medium">무게</dt>
                    <dd>{model.specifications.weight}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <dt className="font-medium">크기</dt>
                    <dd>{model.specifications.dimensions}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">검사 진행 상황</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">전체 진행률</span>
                      <span className="text-sm">{overallProgress}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                  </div>

                  <div className="flex justify-between text-sm border-t pt-3 mt-3">
                    <span>완료된 부품</span>
                    <span className="font-medium">
                      {model.completedSubparts} / {model.totalSubparts}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="bg-muted p-2 rounded text-center">
                      <div className="text-lg font-bold">{model.subparts.filter((s) => s.status === "completed").length}</div>
                      <div className="text-xs text-muted-foreground">완료됨</div>
                    </div>
                    <div className="bg-muted p-2 rounded text-center">
                      <div className="text-lg font-bold">{model.subparts.filter((s) => s.status === "in-progress").length}</div>
                      <div className="text-xs text-muted-foreground">진행 중</div>
                    </div>
                    <div className="bg-muted p-2 rounded text-center">
                      <div className="text-lg font-bold">{model.subparts.filter((s) => s.status === "pending").length}</div>
                      <div className="text-xs text-muted-foreground">대기 중</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>주요 작업</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full flex justify-start" asChild>
              <Link href={`/inspection/${modelId}/reports`}>
                <IconClipboardCheck className="mr-2 h-5 w-5" />
                검사 보고서 생성
              </Link>
            </Button>

            <Button variant="outline" className="w-full flex justify-start">
              <IconRefresh className="mr-2 h-5 w-5" />
              재검사 예약
            </Button>

            <Button variant="secondary" className="w-full flex justify-start">
              <IconDeviceFloppy className="mr-2 h-5 w-5" />
              이력 내보내기
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>부품 목록</CardTitle>
          {selectedSubparts.length > 0 && (
            <Button size="sm" onClick={() => setIsUpdateDialogOpen(true)}>
              일괄 상태 변경
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center space-x-2">
            <Checkbox
              ref={checkboxRef}
              id="select-all"
              onCheckedChange={(checked) => handleSelectAll(checked === true)}
              checked={selectedSubparts.length > 0 && selectedSubparts.length === model.subparts.length}
            />
            <Label htmlFor="select-all">모든 부품 선택</Label>
            <span className="text-muted-foreground text-sm ml-auto">
              {selectedSubparts.length} / {model.subparts.length} 선택됨
            </span>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>부품명</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>사용중</TableHead>
                  <TableHead>진행률</TableHead>
                  <TableHead>최근 검사일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {model.subparts.map((subpart) => (
                  <TableRow key={subpart.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleSubpartClick(subpart)}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selectedSubparts.includes(subpart.id)} onCheckedChange={(checked) => handleSelectSubpart(subpart.id, checked === true)} />
                    </TableCell>
                    <TableCell className="font-medium">{subpart.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${getStatusColor(subpart.status)} text-white`}>
                        {subpart.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={subpart.inUse ? "default" : "outline"}>{subpart.inUse ? "사용중" : "미사용"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={subpart.completionRate} className="w-[60px] h-2" />
                        <span className="text-xs">{subpart.completionRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{subpart.lastInspection}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 상태 업데이트 다이얼로그 */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>부품 상태 업데이트</DialogTitle>
            <DialogDescription>선택한 {selectedSubparts.length}개 부품의 상태를 변경합니다. 이 작업은 시스템에 기록됩니다.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                작업자 이름
              </Label>
              <Input id="name" value={updaterName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUpdaterName(e.target.value)} className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                변경 사유
              </Label>
              <Textarea
                id="reason"
                value={updateReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUpdateReason(e.target.value)}
                className="col-span-3"
                placeholder="상태를 변경하는 이유를 입력하세요."
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button type="submit" onClick={handleUpdateStatus} disabled={!updaterName || !updateReason}>
              <IconCheck className="mr-2 h-4 w-4" />
              변경 사항 저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 서브파트 미리보기 모달 */}
      <SubpartPreviewModal subpart={selectedSubpart} open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen} />
    </div>
  );
}
