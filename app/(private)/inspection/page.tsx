"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  IconCheck,
  IconEdit,
  IconFilter,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";

import { InspectionBreadcrumb } from "@/components/inspection-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  SubpartPreviewModal,
  SubpartPreviewData,
} from "@/components/subpart-preview-modal";
import { useGetCustomer } from "@/lib/hooks/useCustomer";
// 인스펙션 데이터
interface Subpart {
  id: string;
  name: string;
  status: "completed" | "in-progress" | "pending";
  lastInspection: string;
  inUse: boolean;
}

interface Model {
  id: string;
  name: string;
  type: string;
  subparts: Subpart[];
}

interface Inspection {
  id: string;
  name: string;
  status: "active" | "scheduled" | "completed";
  date: string;
  models: Model[];
}

// Mock data - expanded with more items and inUse property
const inspectionsData: Inspection[] = [
  {
    id: "inspection-1",
    name: "Annual Inspection 2023",
    status: "active",
    date: "2023-12-01",
    models: [
      {
        id: "model-a",
        name: "Model A",
        type: "High Performance",
        subparts: [
          {
            id: "engine",
            name: "Engine System",
            status: "completed",
            lastInspection: "2023-12-05",
            inUse: true,
          },
          {
            id: "chassis",
            name: "Chassis Structure",
            status: "in-progress",
            lastInspection: "2023-12-10",
            inUse: true,
          },
          {
            id: "electronics",
            name: "Electronics",
            status: "pending",
            lastInspection: "-",
            inUse: false,
          },
          {
            id: "suspension",
            name: "Suspension System",
            status: "pending",
            lastInspection: "-",
            inUse: true,
          },
          {
            id: "brakes",
            name: "Brake System",
            status: "completed",
            lastInspection: "2023-12-08",
            inUse: true,
          },
          {
            id: "cooling",
            name: "Cooling System",
            status: "in-progress",
            lastInspection: "2023-12-11",
            inUse: true,
          },
        ],
      },
      {
        id: "model-b",
        name: "Model B",
        type: "Economy",
        subparts: [
          {
            id: "engine",
            name: "Engine System",
            status: "completed",
            lastInspection: "2023-12-03",
            inUse: true,
          },
          {
            id: "body",
            name: "Body Structure",
            status: "completed",
            lastInspection: "2023-12-07",
            inUse: true,
          },
          {
            id: "interior",
            name: "Interior Components",
            status: "pending",
            lastInspection: "-",
            inUse: false,
          },
          {
            id: "transmission",
            name: "Transmission",
            status: "in-progress",
            lastInspection: "2023-12-09",
            inUse: true,
          },
          {
            id: "fuel",
            name: "Fuel System",
            status: "pending",
            lastInspection: "-",
            inUse: true,
          },
        ],
      },
      {
        id: "model-c",
        name: "Model C",
        type: "Premium",
        subparts: [
          {
            id: "powertrain",
            name: "Power Train",
            status: "completed",
            lastInspection: "2023-12-02",
            inUse: true,
          },
          {
            id: "safety",
            name: "Safety Systems",
            status: "in-progress",
            lastInspection: "2023-12-08",
            inUse: true,
          },
          {
            id: "entertainment",
            name: "Entertainment System",
            status: "pending",
            lastInspection: "-",
            inUse: false,
          },
        ],
      },
    ],
  },
  {
    id: "inspection-2",
    name: "Quarterly Check Q4",
    status: "scheduled",
    date: "2023-12-15",
    models: [
      {
        id: "model-c",
        name: "Model C",
        type: "Premium",
        subparts: [
          {
            id: "powertrain",
            name: "Power Train",
            status: "pending",
            lastInspection: "-",
            inUse: true,
          },
          {
            id: "safety",
            name: "Safety Systems",
            status: "pending",
            lastInspection: "-",
            inUse: true,
          },
          {
            id: "entertainment",
            name: "Entertainment System",
            status: "pending",
            lastInspection: "-",
            inUse: false,
          },
        ],
      },
    ],
  },
  {
    id: "inspection-3",
    name: "Maintenance Check",
    status: "completed",
    date: "2023-11-15",
    models: [
      {
        id: "model-a",
        name: "Model A",
        type: "High Performance",
        subparts: [
          {
            id: "engine",
            name: "Engine System",
            status: "completed",
            lastInspection: "2023-11-15",
            inUse: true,
          },
          {
            id: "cooling",
            name: "Cooling System",
            status: "completed",
            lastInspection: "2023-11-15",
            inUse: true,
          },
        ],
      },
      {
        id: "model-b",
        name: "Model B",
        type: "Economy",
        subparts: [
          {
            id: "engine",
            name: "Engine System",
            status: "completed",
            lastInspection: "2023-11-16",
            inUse: true,
          },
        ],
      },
    ],
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "active":
    case "completed":
      return "bg-green-500";
    case "in-progress":
      return "bg-blue-500";
    case "scheduled":
    case "pending":
      return "bg-amber-500";
    default:
      return "bg-gray-500";
  }
}

export default function InspectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedInspectionId =
    searchParams.get("inspection") || inspectionsData[0].id;
  const selectedModelId = searchParams.get("model") || "";

  const selectedInspection = inspectionsData.find(
    (inspection) => inspection.id === selectedInspectionId
  );
  const selectedModel = selectedInspection?.models.find(
    (model) => model.id === selectedModelId
  );

  const { data: customerlists } = useGetCustomer();

  console.log("customerlists", customerlists);

  // State for selected subparts (for bulk actions)
  const [selectedSubparts, setSelectedSubparts] = React.useState<string[]>([]);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false);
  const [updateReason, setUpdateReason] = React.useState("");
  const [updaterName, setUpdaterName] = React.useState("");
  const [newStatus, setNewStatus] = React.useState<boolean>(true);

  // 서브파트 모달 관련 상태
  const [selectedSubpart, setSelectedSubpart] =
    React.useState<SubpartPreviewData | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = React.useState(false);

  // Handle selecting all subparts
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allSubpartIds =
        selectedModel?.subparts.map((subpart) => subpart.id) || [];
      setSelectedSubparts(allSubpartIds);
    } else {
      setSelectedSubparts([]);
    }
  };

  // Handle selecting individual subpart
  const handleSelectSubpart = (subpartId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubparts((prev) => [...prev, subpartId]);
    } else {
      setSelectedSubparts((prev) => prev.filter((id) => id !== subpartId));
    }
  };

  // Handle updating status of selected subparts
  const handleUpdateStatus = () => {
    // In a real application, you would make an API call here
    console.log("Updating subparts:", selectedSubparts);
    console.log("New status:", newStatus);
    console.log("Updated by:", updaterName);
    console.log("Reason:", updateReason);

    setIsUpdateDialogOpen(false);
    setUpdateReason("");
    setUpdaterName("");
    setSelectedSubparts([]);
  };

  // Filter feature
  const [searchTerm, setSearchTerm] = React.useState("");
  const filteredSubparts = selectedModel?.subparts.filter((subpart) =>
    subpart.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // For custom indeterminate state
  const checkboxRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    // Using a workaround for type safety
    if (checkboxRef.current) {
      // Cast to any to access indeterminate property
      (checkboxRef.current as any).indeterminate =
        selectedSubparts.length > 0 &&
        selectedSubparts.length < (selectedModel?.subparts.length || 0);
    }
  }, [selectedSubparts, selectedModel?.subparts.length]);

  // 서브파트 클릭 시 모달 열기
  const handleSubpartClick = (subpart: Subpart, modelId: string) => {
    // 서브파트 데이터를 모달에 맞는 형식으로 변환
    const checkItems = [];

    // 임의의 체크 항목 생성 (실제로는 API에서 가져와야 함)
    const itemNames = [
      "Visual Inspection",
      "Performance Test",
      "Structural Integrity",
      "Safety Check",
    ];
    for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) {
      const status =
        Math.random() > 0.5
          ? "passed"
          : Math.random() > 0.5
          ? "pending"
          : "failed";
      checkItems.push({
        name: itemNames[i % itemNames.length],
        status: status as "passed" | "failed" | "pending",
      });
    }

    // 완료율 계산
    const completionRate =
      subpart.status === "completed"
        ? 100
        : subpart.status === "in-progress"
        ? Math.floor(Math.random() * 50) + 25
        : Math.floor(Math.random() * 20);

    const previewData: SubpartPreviewData = {
      id: subpart.id,
      modelId: modelId,
      name: subpart.name,
      description: `${subpart.name} for ${modelId.toUpperCase()} model`,
      status: subpart.status,
      specifications: [
        {
          name: "Serial Number",
          value: `SN-${modelId.toUpperCase()}-${subpart.id.toUpperCase()}-12345`,
        },
        { name: "Manufacturer", value: "NE2 Industries" },
        { name: "Weight", value: `${Math.floor(Math.random() * 100) + 50} kg` },
        {
          name: "Dimensions",
          value: `${Math.floor(Math.random() * 100) + 50}x${
            Math.floor(Math.random() * 50) + 30
          }x${Math.floor(Math.random() * 30) + 10} cm`,
        },
      ],
      completionRate,
    };

    setSelectedSubpart(previewData);
    setIsPreviewModalOpen(true);
  };

  // 서브파트 상태 변경 처리
  const handleSubpartStatusChange = (
    id: string,
    newStatus: "completed" | "in-progress" | "pending"
  ) => {
    console.log(`Changing status of subpart ${id} to ${newStatus}`);
    // 실제 앱에서는 API 호출로 상태 업데이트
  };

  return (
    <div className="p-6">
      <InspectionBreadcrumb />

      <h1 className="text-2xl font-bold mb-6">Inspection Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 첫 번째 컬럼: 인스펙션 리스트 */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Inspections</CardTitle>
          </CardHeader>
          <div className="p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspectionsData.map((inspection) => (
                  <TableRow
                    key={inspection.id}
                    className={
                      inspection.id === selectedInspectionId
                        ? "bg-muted/50"
                        : ""
                    }
                  >
                    <TableCell className="font-medium">
                      <Link
                        href={`/inspection?inspection=${inspection.id}`}
                        className="hover:underline"
                      >
                        {inspection.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(
                          inspection.status
                        )} text-white`}
                      >
                        {inspection.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{inspection.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <CardFooter className="flex justify-end pt-3">
            <Button size="sm" variant="outline">
              <IconPlus className="mr-2 h-4 w-4" />
              New Inspection
            </Button>
          </CardFooter>
        </Card>

        {/* 두 번째 컬럼: 모델 리스트 */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Models</CardTitle>
            {selectedInspection && (
              <CardDescription>
                {selectedInspection.models.length} models in this inspection
              </CardDescription>
            )}
          </CardHeader>
          <div className="p-2 max-h-[400px] overflow-auto">
            {selectedInspection ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Parts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInspection.models.map((model) => (
                    <TableRow
                      key={model.id}
                      className={
                        model.id === selectedModelId ? "bg-muted/50" : ""
                      }
                    >
                      <TableCell className="font-medium">
                        <Link
                          href={`/inspection?inspection=${selectedInspectionId}&model=${model.id}`}
                          className="hover:underline"
                        >
                          {model.name}
                        </Link>
                      </TableCell>
                      <TableCell>{model.type}</TableCell>
                      <TableCell>{model.subparts.length}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No inspection selected
              </div>
            )}
          </div>
          <CardFooter className="flex justify-end pt-3">
            <Button size="sm" variant="outline">
              <IconPlus className="mr-2 h-4 w-4" />
              Add Model
            </Button>
          </CardFooter>
        </Card>

        {/* 세 번째 컬럼: 서브파트 리스트 (체크박스 포함) */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Subparts</CardTitle>
              <div className="flex space-x-2">
                {selectedSubparts.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsUpdateDialogOpen(true)}
                  >
                    <IconEdit className="mr-2 h-4 w-4" />
                    Update Status
                  </Button>
                )}
              </div>
            </div>
            {selectedModel && (
              <CardDescription>
                {selectedModel.subparts.length} subparts in {selectedModel.name}
              </CardDescription>
            )}
          </CardHeader>

          {selectedModel ? (
            <>
              <div className="px-4 py-2 flex items-center space-x-2">
                <div className="relative flex-1">
                  <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Filter subparts..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
                  />
                </div>
                <Button size="sm" variant="ghost">
                  <IconFilter className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-2 max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          ref={checkboxRef}
                          onCheckedChange={(checked) =>
                            handleSelectAll(checked === true)
                          }
                          checked={
                            selectedSubparts.length > 0 &&
                            selectedSubparts.length ===
                              selectedModel.subparts.length
                          }
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>In Use</TableHead>
                      <TableHead>Last Inspection</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubparts?.map((subpart) => (
                      <TableRow
                        key={subpart.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          handleSubpartClick(subpart, selectedModel.id)
                        }
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedSubparts.includes(subpart.id)}
                            onCheckedChange={(checked) =>
                              handleSelectSubpart(subpart.id, checked === true)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {subpart.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`${getStatusColor(
                              subpart.status
                            )} text-white`}
                          >
                            {subpart.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={subpart.inUse ? "default" : "outline"}
                          >
                            {subpart.inUse ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{subpart.lastInspection}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <CardFooter className="flex justify-between pt-3">
                <div className="text-sm text-muted-foreground">
                  {selectedSubparts.length} of {selectedModel.subparts.length}{" "}
                  selected
                </div>
                <Button size="sm" variant="outline">
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add Subpart
                </Button>
              </CardFooter>
            </>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              {selectedInspection
                ? "Select a model to view subparts"
                : "No inspection selected"}
            </div>
          )}
        </Card>
      </div>

      {/* 상태 업데이트 다이얼로그 */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Subpart Status</DialogTitle>
            <DialogDescription>
              Update the status of {selectedSubparts.length} selected subparts.
              This change will be recorded in the system.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <Tabs
                  defaultValue={newStatus ? "active" : "inactive"}
                  className="w-full"
                  onValueChange={(v) => setNewStatus(v === "active")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Your Name
              </Label>
              <Input
                id="name"
                value={updaterName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUpdaterName(e.target.value)
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="reason"
                value={updateReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setUpdateReason(e.target.value)
                }
                className="col-span-3"
                placeholder="Why are you changing the status of these subparts?"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              onClick={handleUpdateStatus}
              disabled={!updaterName || !updateReason}
            >
              <IconCheck className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 모달 추가 */}
      <SubpartPreviewModal
        subpart={selectedSubpart}
        open={isPreviewModalOpen}
        onOpenChange={setIsPreviewModalOpen}
        onStatusChange={handleSubpartStatusChange}
      />
    </div>
  );
}
