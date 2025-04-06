"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { InspectionBreadcrumb } from "@/components/inspection-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// 인스펙션 데이터
interface Subpart {
  id: string;
  name: string;
  status: "completed" | "in-progress" | "pending";
  lastInspection: string;
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
          },
          {
            id: "chassis",
            name: "Chassis Structure",
            status: "in-progress",
            lastInspection: "2023-12-10",
          },
          {
            id: "electronics",
            name: "Electronics",
            status: "pending",
            lastInspection: "-",
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
          },
          {
            id: "body",
            name: "Body Structure",
            status: "completed",
            lastInspection: "2023-12-07",
          },
          {
            id: "interior",
            name: "Interior Components",
            status: "pending",
            lastInspection: "-",
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
          },
          {
            id: "safety",
            name: "Safety Systems",
            status: "pending",
            lastInspection: "-",
          },
          {
            id: "entertainment",
            name: "Entertainment System",
            status: "pending",
            lastInspection: "-",
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
          },
          {
            id: "cooling",
            name: "Cooling System",
            status: "completed",
            lastInspection: "2023-11-15",
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
  const searchParams = useSearchParams();
  const selectedInspectionId = searchParams.get("inspection") || inspectionsData[0].id;
  const selectedModelId = searchParams.get("model") || "";

  const selectedInspection = inspectionsData.find((inspection) => inspection.id === selectedInspectionId);

  const selectedModel = selectedInspection?.models.find((model) => model.id === selectedModelId);

  return (
    <div className="p-6">
      <InspectionBreadcrumb />

      <h1 className="text-2xl font-bold mb-6">Inspection Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 첫 번째 컬럼: 인스펙션 리스트 */}
        <Card className="md:col-span-1">
          <CardHeader>
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
                  <TableRow key={inspection.id} className={inspection.id === selectedInspectionId ? "bg-muted/50" : ""}>
                    <TableCell className="font-medium">
                      <Link href={`/inspection?inspection=${inspection.id}`} className="hover:underline">
                        {inspection.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${getStatusColor(inspection.status)} text-white`}>
                        {inspection.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{inspection.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* 두 번째 컬럼: 모델 리스트 */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Models</CardTitle>
          </CardHeader>
          <div className="p-2">
            {selectedInspection ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInspection.models.map((model) => (
                    <TableRow key={model.id} className={model.id === selectedModelId ? "bg-muted/50" : ""}>
                      <TableCell className="font-medium">
                        <Link href={`/inspection?inspection=${selectedInspectionId}&model=${model.id}`} className="hover:underline">
                          {model.name}
                        </Link>
                      </TableCell>
                      <TableCell>{model.type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-4 text-center text-muted-foreground">No inspection selected</div>
            )}
          </div>
        </Card>

        {/* 세 번째 컬럼: 서브파트 리스트 */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Subparts</CardTitle>
          </CardHeader>
          <div className="p-2">
            {selectedModel ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Check</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedModel.subparts.map((subpart) => (
                    <TableRow key={subpart.id}>
                      <TableCell className="font-medium">
                        <Link href={`/inspection/details?inspection=${selectedInspectionId}&model=${selectedModelId}&subpart=${subpart.id}`} className="hover:underline">
                          {subpart.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${getStatusColor(subpart.status)} text-white`}>
                          {subpart.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{subpart.lastInspection}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-4 text-center text-muted-foreground">No model selected</div>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline">Export Data</Button>
        <Button>Create New Inspection</Button>
      </div>
    </div>
  );
}
