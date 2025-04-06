"use client";

import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft, IconCheck, IconClipboard, IconDeviceFloppy, IconHistory, IconInfoCircle, IconRefresh } from "@tabler/icons-react";

import { InspectionBreadcrumb } from "@/components/inspection-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface ChecklistItem {
  id: string;
  name: string;
  status: "passed" | "failed" | "pending" | "in-progress";
  checked: boolean;
}

interface Specification {
  name: string;
  value: string;
}

interface HistoryItem {
  date: string;
  action: string;
  technician: string;
  notes: string;
}

interface Issue {
  id: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  reportedDate: string;
  status: "open" | "in-progress" | "resolved";
}

interface Subpart {
  id: string;
  name: string;
  description: string;
  details: string;
  inUse: boolean;
  status: "completed" | "in-progress" | "pending";
  lastUpdate?: {
    date: string;
    by: string;
    reason: string;
  };
  specifications: Specification[];
  checklistItems: ChecklistItem[];
  history: HistoryItem[];
  issues: Issue[];
  completionRate: number;
}

interface ModelData {
  name: string;
  description: string;
  subparts: Record<string, Subpart>;
}

// 모델 데이터 정의
const modelsData: Record<string, ModelData> = {
  "model-a": {
    name: "Model A",
    description: "High performance model with advanced features",
    subparts: {
      engine: {
        id: "engine",
        name: "Engine System",
        description: "Engine inspection and diagnostics",
        details: "Advanced 2.0L Turbo Engine with direct injection",
        inUse: true,
        status: "completed",
        completionRate: 100,
        lastUpdate: {
          date: "2023-12-05",
          by: "Kim Technician",
          reason: "Regular maintenance check",
        },
        specifications: [
          { name: "Manufacturer", value: "NE2 Industries" },
          { name: "Serial Number", value: "SN-MODEL-A-ENGINE-12345" },
          { name: "Manufacturing Date", value: "January 2023" },
          { name: "Weight", value: "120 kg" },
          { name: "Dimensions", value: "75 x 60 x 65 cm" },
          { name: "Capacity", value: "2.0L" },
          { name: "Power Output", value: "240 HP" },
          { name: "Fuel Type", value: "Premium Unleaded" },
        ],
        checklistItems: [
          { id: "visual", name: "Visual Inspection", status: "passed", checked: true },
          { id: "performance", name: "Performance Test", status: "passed", checked: true },
          { id: "stress", name: "Stress Test", status: "passed", checked: true },
          { id: "longevity", name: "Longevity Assessment", status: "passed", checked: true },
          { id: "emission", name: "Emission Control", status: "passed", checked: true },
          { id: "noise", name: "Noise Level", status: "passed", checked: true },
          { id: "temperature", name: "Temperature Regulation", status: "passed", checked: true },
          { id: "fuel", name: "Fuel Efficiency", status: "passed", checked: true },
        ],
        history: [
          {
            date: "2023-12-05",
            action: "Full Inspection",
            technician: "Kim Technician",
            notes: "All systems operating within normal parameters",
          },
          {
            date: "2023-09-15",
            action: "Oil Change",
            technician: "Lee Engineer",
            notes: "Replaced with synthetic oil, filter replaced",
          },
          {
            date: "2023-06-22",
            action: "Performance Test",
            technician: "Park Mechanic",
            notes: "Engine output meets specifications, no anomalies detected",
          },
        ],
        issues: [
          {
            id: "issue-1",
            description: "Minor oil leak detected at rear gasket",
            severity: "low",
            reportedDate: "2023-11-28",
            status: "resolved",
          },
        ],
      },
      chassis: {
        id: "chassis",
        name: "Chassis Structure",
        description: "Chassis inspection and analysis",
        details: "Reinforced aluminum chassis with multi-point safety structure",
        inUse: true,
        status: "in-progress",
        completionRate: 65,
        lastUpdate: {
          date: "2023-12-10",
          by: "Park Engineer",
          reason: "Periodic evaluation",
        },
        specifications: [
          { name: "Manufacturer", value: "NE2 Industries" },
          { name: "Serial Number", value: "SN-MODEL-A-CHASSIS-78901" },
          { name: "Manufacturing Date", value: "January 2023" },
          { name: "Material", value: "Reinforced Aluminum Alloy" },
          { name: "Weight", value: "180 kg" },
          { name: "Dimensions", value: "450 x 180 x 120 cm" },
          { name: "Safety Rating", value: "A+" },
        ],
        checklistItems: [
          { id: "visual", name: "Visual Inspection", status: "passed", checked: true },
          { id: "integrity", name: "Structural Integrity", status: "passed", checked: true },
          { id: "weight", name: "Weight Distribution", status: "pending", checked: false },
          { id: "alignment", name: "Alignment Check", status: "pending", checked: false },
          { id: "rust", name: "Corrosion Assessment", status: "passed", checked: true },
          { id: "safety", name: "Safety Structure Test", status: "in-progress", checked: false },
        ],
        history: [
          {
            date: "2023-12-10",
            action: "Structural Inspection",
            technician: "Park Engineer",
            notes: "In progress, checking for stress points and deformation",
          },
          {
            date: "2023-08-02",
            action: "Rust Prevention Treatment",
            technician: "Choi Specialist",
            notes: "Applied protective coating to undercarriage",
          },
        ],
        issues: [
          {
            id: "issue-1",
            description: "Small dent in rear cross-member",
            severity: "low",
            reportedDate: "2023-09-05",
            status: "open",
          },
          {
            id: "issue-2",
            description: "Surface rust on mounting bracket",
            severity: "medium",
            reportedDate: "2023-11-15",
            status: "in-progress",
          },
        ],
      },
      electronics: {
        id: "electronics",
        name: "Electronics",
        description: "Electronics systems check",
        details: "Digital control unit with advanced diagnostics capabilities",
        inUse: false,
        status: "pending",
        completionRate: 0,
        specifications: [
          { name: "Manufacturer", value: "NE2 Industries" },
          { name: "Serial Number", value: "SN-MODEL-A-ELEC-56789" },
          { name: "Manufacturing Date", value: "January 2023" },
          { name: "Voltage", value: "12V" },
          { name: "Control Unit", value: "Advanced Digital System" },
          { name: "Battery Type", value: "Lithium-Ion" },
        ],
        checklistItems: [
          { id: "visual", name: "Visual Inspection", status: "pending", checked: false },
          { id: "circuitry", name: "Circuitry Test", status: "pending", checked: false },
          { id: "software", name: "Software Verification", status: "pending", checked: false },
          { id: "battery", name: "Battery Performance", status: "pending", checked: false },
          { id: "sensor", name: "Sensor Calibration", status: "pending", checked: false },
        ],
        history: [],
        issues: [],
      },
    },
  },
  "model-b": {
    name: "Model B",
    description: "Economy model with essential features",
    subparts: {
      engine: {
        name: "Engine",
        description: "Engine inspection and diagnostics",
        details: "Efficient 1.6L Engine with eco-friendly emissions",
        inUse: true,
        checklistItems: [
          { id: "visual", name: "Visual Inspection", status: "passed", checked: true },
          { id: "performance", name: "Performance Test", status: "passed", checked: true },
          { id: "oil", name: "Oil System", status: "passed", checked: true },
          { id: "cooling", name: "Cooling System", status: "pending", checked: false },
        ],
        lastUpdate: {
          date: "2023-12-03",
          by: "Lee Mechanic",
          reason: "Standard inspection",
        },
      },
      body: {
        name: "Body",
        description: "Body inspection and analysis",
        details: "Steel body with corrosion resistant coating",
        inUse: true,
        checklistItems: [
          { id: "visual", name: "Visual Inspection", status: "passed", checked: true },
          { id: "paint", name: "Paint Integrity", status: "passed", checked: true },
          { id: "rust", name: "Rust Prevention", status: "passed", checked: true },
          { id: "seals", name: "Seals and Gaskets", status: "passed", checked: true },
        ],
        lastUpdate: {
          date: "2023-12-07",
          by: "Choi Specialist",
          reason: "Quality assurance check",
        },
      },
      interior: {
        name: "Interior",
        description: "Interior components check",
        details: "Comfort-oriented interior with durable materials",
        inUse: false,
        checklistItems: [
          { id: "visual", name: "Visual Inspection", status: "pending", checked: false },
          { id: "comfort", name: "Comfort Assessment", status: "pending", checked: false },
          { id: "durability", name: "Material Durability", status: "pending", checked: false },
          { id: "safety", name: "Safety Features", status: "pending", checked: false },
        ],
      },
    },
  },
  "model-c": {
    name: "Model C",
    description: "Premium model with luxury features",
    subparts: {
      powertrain: {
        name: "Power Train",
        description: "Power train inspection",
        details: "High-end 3.0L V6 Engine with 8-speed transmission",
        inUse: true,
        checklistItems: [
          { id: "visual", name: "Visual Inspection", status: "passed", checked: true },
          { id: "transmission", name: "Transmission Test", status: "passed", checked: true },
          { id: "calibration", name: "Calibration Check", status: "pending", checked: false },
          { id: "fluid", name: "Fluid Analysis", status: "pending", checked: false },
        ],
        lastUpdate: {
          date: "2023-12-02",
          by: "Jung Expert",
          reason: "Luxury model verification",
        },
      },
      safety: {
        name: "Safety Systems",
        description: "Safety systems inspection",
        details: "Advanced driver assistance with emergency braking",
        inUse: true,
        checklistItems: [
          { id: "visual", name: "Visual Inspection", status: "passed", checked: true },
          { id: "sensors", name: "Sensor Calibration", status: "pending", checked: false },
          { id: "braking", name: "Emergency Braking", status: "pending", checked: false },
          { id: "airbags", name: "Airbag System", status: "pending", checked: false },
        ],
        lastUpdate: {
          date: "2023-12-08",
          by: "Han Inspector",
          reason: "Safety compliance check",
        },
      },
      entertainment: {
        name: "Entertainment",
        description: "Entertainment systems check",
        details: "Premium sound system with digital connectivity",
        inUse: false,
        checklistItems: [
          { id: "visual", name: "Visual Inspection", status: "pending", checked: false },
          { id: "audio", name: "Audio Quality", status: "pending", checked: false },
          { id: "connectivity", name: "Connectivity Test", status: "pending", checked: false },
          { id: "interface", name: "User Interface", status: "pending", checked: false },
        ],
      },
    },
  },
};

// 상태 색상 유틸리티 함수
function getStatusColor(status: string) {
  switch (status) {
    case "completed":
    case "passed":
    case "resolved":
      return "bg-green-500 text-white";
    case "in-progress":
      return "bg-blue-500 text-white";
    case "pending":
    case "open":
      return "bg-amber-500 text-white";
    case "failed":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "low":
      return "bg-green-500 text-white";
    case "medium":
      return "bg-amber-500 text-white";
    case "high":
      return "bg-orange-500 text-white";
    case "critical":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

export default function SubpartPage({ params }: { params: { model: string; subpart: string } }) {
  const { model: modelId, subpart: subpartId } = params;

  // 모델 및 서브파트 데이터 가져오기
  const modelData = modelsData[modelId];
  if (!modelData) {
    notFound();
  }

  const subpartData = modelData.subparts[subpartId];
  if (!subpartData) {
    notFound();
  }

  // 체크박스 상태 관리
  const [checklist, setChecklist] = React.useState(subpartData.checklistItems);
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [inUseStatus, setInUseStatus] = React.useState(subpartData.inUse);

  // 모달 상태
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false);
  const [newStatus, setNewStatus] = React.useState<"passed" | "failed" | "pending" | "in-progress">("passed");
  const [updaterName, setUpdaterName] = React.useState("");
  const [updateReason, setUpdateReason] = React.useState("");

  // 모든 항목 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(checklist.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // 개별 항목 선택/해제
  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, itemId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    }
  };

  // 선택한 항목 상태 업데이트
  const handleUpdateStatus = () => {
    // 실제 애플리케이션에서는 API 호출로 처리
    const updatedChecklist = checklist.map((item) => {
      if (selectedItems.includes(item.id)) {
        return { ...item, status: newStatus as "passed" | "failed" | "pending" | "in-progress", checked: newStatus === "passed" };
      }
      return item;
    });

    setChecklist(updatedChecklist);
    setIsUpdateDialogOpen(false);
    setSelectedItems([]);
    setUpdaterName("");
    setUpdateReason("");
  };

  // 체크박스 ref (indeterminate 상태 처리용)
  const checkboxRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (checkboxRef.current) {
      (checkboxRef.current as any).indeterminate = selectedItems.length > 0 && selectedItems.length < checklist.length;
    }
  }, [selectedItems, checklist.length]);

  return (
    <div className="container p-6">
      <div className="flex items-center justify-between mb-6">
        <InspectionBreadcrumb model={modelData.name} modelId={modelId} subpart={subpartData.name} subpartId={subpartId} />
        <Button variant="outline" size="sm" asChild>
          <Link href={`/inspection/${modelId}`}>
            <IconArrowLeft className="mr-2 h-4 w-4" />
            {modelData.name}으로 돌아가기
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{subpartData.name}</CardTitle>
                <div className="text-muted-foreground mt-2">{subpartData.description}</div>
              </div>
              <Badge className={getStatusColor(subpartData.status)}>{subpartData.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>{subpartData.details}</p>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">완료율</h3>
                  <div className="flex items-center gap-2">
                    <Progress value={subpartData.completionRate} className="w-full h-2" />
                    <span className="text-sm font-medium">{subpartData.completionRate}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-medium mb-2">최근 업데이트</h3>
                  <p className="text-sm">{subpartData.lastUpdate?.date || "없음"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>사용 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">활성화 상태</h3>
                <p className="text-sm text-muted-foreground mt-1">이 부품이 현재 사용 중인지 여부</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={inUseStatus} onCheckedChange={setInUseStatus} />
                <Badge variant={inUseStatus ? "default" : "outline"}>{inUseStatus ? "사용중" : "미사용"}</Badge>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <Button className="w-full flex justify-start" size="sm">
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
                변경사항 저장
              </Button>

              <Button variant="outline" className="w-full flex justify-start" size="sm">
                <IconRefresh className="mr-2 h-4 w-4" />
                재검사 예약
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inspection" className="w-full mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="specifications" className="flex items-center">
            <IconInfoCircle className="mr-2 h-4 w-4" />
            사양 정보
          </TabsTrigger>
          <TabsTrigger value="inspection" className="flex items-center">
            <IconClipboard className="mr-2 h-4 w-4" />
            검사 항목
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <IconHistory className="mr-2 h-4 w-4" />
            이력
          </TabsTrigger>
        </TabsList>

        <TabsContent value="specifications">
          <Card>
            <CardHeader>
              <CardTitle>상세 사양</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">기본 정보</h3>
                  <dl className="space-y-2">
                    {subpartData.specifications.slice(0, 4).map((spec, index) => (
                      <div key={index} className="flex justify-between py-1 border-b">
                        <dt className="font-medium">{spec.name}</dt>
                        <dd>{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {subpartData.specifications.length > 4 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">추가 정보</h3>
                    <dl className="space-y-2">
                      {subpartData.specifications.slice(4).map((spec, index) => (
                        <div key={index} className="flex justify-between py-1 border-b">
                          <dt className="font-medium">{spec.name}</dt>
                          <dd>{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspection">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>검사 체크리스트</CardTitle>
              {selectedItems.length > 0 && (
                <Button size="sm" onClick={() => setIsUpdateDialogOpen(true)}>
                  상태 변경
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center space-x-2">
                <Checkbox
                  ref={checkboxRef}
                  id="select-all"
                  onCheckedChange={(checked) => handleSelectAll(checked === true)}
                  checked={selectedItems.length > 0 && selectedItems.length === checklist.length}
                />
                <Label htmlFor="select-all">모든 항목 선택</Label>
                <span className="text-muted-foreground text-sm ml-auto">
                  {selectedItems.length} / {checklist.length} 선택됨
                </span>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center justify-between pb-2 border-b">
                    <div className="flex items-center space-x-2">
                      <Checkbox id={item.id} checked={selectedItems.includes(item.id)} onCheckedChange={(checked) => handleSelectItem(item.id, checked === true)} />
                      <Label htmlFor={item.id} className="font-medium">
                        {item.name}
                      </Label>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(item.status)}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <Button variant="outline" className="mr-2">
                  초기화
                </Button>
                <Button>검사결과 저장</Button>
              </div>
              <div className="text-sm text-muted-foreground">마지막 업데이트: {subpartData.lastUpdate?.date || "없음"}</div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>검사 이력</CardTitle>
              </CardHeader>
              <CardContent>
                {subpartData.history.length > 0 ? (
                  <div className="space-y-4">
                    {subpartData.history.map((item, index) => (
                      <div key={index} className="p-4 border rounded-md">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">{item.action}</h4>
                          <span className="text-sm text-muted-foreground">{item.date}</span>
                        </div>
                        <p className="text-sm mb-1">
                          작업자: <span className="font-medium">{item.technician}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">{item.notes}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">검사 이력이 없습니다</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>이슈 목록</CardTitle>
              </CardHeader>
              <CardContent>
                {subpartData.issues.length > 0 ? (
                  <div className="space-y-3">
                    {subpartData.issues.map((issue) => (
                      <div key={issue.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-sm">{issue.description}</div>
                          <Badge className={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>보고일: {issue.reportedDate}</span>
                          <Badge variant="outline" className={getStatusColor(issue.status)}>
                            {issue.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">보고된 이슈가 없습니다</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 상태 업데이트 다이얼로그 */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>검사 항목 상태 업데이트</DialogTitle>
            <DialogDescription>선택한 {selectedItems.length}개 항목의 상태를 변경합니다. 이 작업은 시스템에 기록됩니다.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                상태
              </Label>
              <div className="col-span-3">
                <Tabs defaultValue={newStatus} className="w-full" onValueChange={(v) => setNewStatus(v as "passed" | "failed" | "pending" | "in-progress")}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="passed">통과</TabsTrigger>
                    <TabsTrigger value="failed">실패</TabsTrigger>
                    <TabsTrigger value="pending">보류</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                작업자
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
                placeholder="상태를 변경하는 이유를 입력하세요"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button type="submit" onClick={handleUpdateStatus} disabled={!updaterName || !updateReason}>
              <IconCheck className="mr-2 h-4 w-4" />
              변경사항 저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
