"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { InspectionBreadcrumb } from "@/components/inspection-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCustomer } from "@/lib/hooks/useCustomer";

// 데이터 정의 (원래는 실제 데이터나 API에서 가져와야 함)
interface SubpartDetail {
  id: string;
  name: string;
  description: string;
  status: "completed" | "in-progress" | "pending";
  lastInspection: string;
  notes: string;
  specifications: {
    manufacturer: string;
    serialNumber: string;
    manufactureDate: string;
    weight: string;
    dimensions: string;
  };
  history: {
    date: string;
    action: string;
    technician: string;
    notes: string;
  }[];
  issues: {
    id: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    reportedDate: string;
    status: "open" | "in-progress" | "resolved";
  }[];
}

// 샘플 데이터
const subpartsDetails: Record<string, SubpartDetail> = {
  engine: {
    id: "engine",
    name: "Engine System",
    description:
      "The primary power generation unit responsible for converting fuel into mechanical energy.",
    status: "completed",
    lastInspection: "2023-12-05",
    notes:
      "Engine is in excellent condition. Regular maintenance has been performed according to schedule.",
    specifications: {
      manufacturer: "PowerTech Industries",
      serialNumber: "PT-2023-11456",
      manufactureDate: "2023-01-15",
      weight: "320 kg",
      dimensions: "75 x 60 x 65 cm",
    },
    history: [
      {
        date: "2023-12-05",
        action: "Full Inspection",
        technician: "John Smith",
        notes: "All systems operating within normal parameters",
      },
      {
        date: "2023-09-15",
        action: "Oil Change",
        technician: "Maria Rodriguez",
        notes: "Replaced with synthetic oil, filter replaced",
      },
      {
        date: "2023-06-22",
        action: "Performance Test",
        technician: "David Chen",
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
    description:
      "The framework that supports all components of the vehicle and provides structural integrity.",
    status: "in-progress",
    lastInspection: "2023-12-10",
    notes:
      "Inspection in progress. Initial assessment shows normal wear patterns.",
    specifications: {
      manufacturer: "FrameWorks Inc",
      serialNumber: "FW-CH-9823",
      manufactureDate: "2023-01-10",
      weight: "450 kg",
      dimensions: "450 x 180 x 120 cm",
    },
    history: [
      {
        date: "2023-12-10",
        action: "Structural Inspection",
        technician: "Sarah Johnson",
        notes: "In progress, checking for stress points and deformation",
      },
      {
        date: "2023-08-02",
        action: "Rust Prevention Treatment",
        technician: "Michael Brown",
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
};

function getSeverityColor(severity: string) {
  switch (severity) {
    case "low":
      return "text-green-500";
    case "medium":
      return "text-amber-500";
    case "high":
      return "text-orange-500";
    case "critical":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
    case "resolved":
      return "text-green-500";
    case "in-progress":
      return "text-blue-500";
    case "pending":
    case "open":
      return "text-amber-500";
    default:
      return "text-gray-500";
  }
}

export default function SubpartDetailsPage() {
  const searchParams = useSearchParams();
  const inspectionId = searchParams.get("inspection") || "";
  const modelId = searchParams.get("model") || "";
  const subpartId = searchParams.get("subpart") || "";

  // 데이터 가져오기 (실제로는 API 호출 등으로 대체)
  const subpartDetails = subpartsDetails[subpartId];

  // 데이터가 없으면 빈 메시지 표시
  if (!subpartDetails) {
    return (
      <div className="p-6">
        <InspectionBreadcrumb />
        <Card>
          <CardHeader>
            <CardTitle>Subpart Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              The requested subpart could not be found. Please check the URL and
              try again.
            </p>
            <Button asChild className="mt-4">
              <Link href="/inspection">Back to Inspection Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <InspectionBreadcrumb />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{subpartDetails.name}</h1>
          <p className="text-muted-foreground">{subpartDetails.description}</p>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`font-medium ${getStatusColor(subpartDetails.status)}`}
          >
            Status: {subpartDetails.status}
          </span>
          <Button asChild variant="outline">
            <Link
              href={`/inspection?inspection=${inspectionId}&model=${modelId}`}
            >
              Back to Inspection
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">Inspection History</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="font-medium">Manufacturer:</dt>
                    <dd>{subpartDetails.specifications.manufacturer}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Serial Number:</dt>
                    <dd>{subpartDetails.specifications.serialNumber}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Manufacture Date:</dt>
                    <dd>{subpartDetails.specifications.manufactureDate}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Weight:</dt>
                    <dd>{subpartDetails.specifications.weight}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Dimensions:</dt>
                    <dd>{subpartDetails.specifications.dimensions}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inspection Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{subpartDetails.notes}</p>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Last Inspection:</span>
                    <span>{subpartDetails.lastInspection}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">Images</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="aspect-square bg-muted rounded flex items-center justify-center">
                      Image 1
                    </div>
                    <div className="aspect-square bg-muted rounded flex items-center justify-center">
                      Image 2
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Inspection History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {subpartDetails.history.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">{item.action}</h3>
                      <span className="text-muted-foreground">{item.date}</span>
                    </div>
                    <p className="text-sm mb-1">
                      Technician: {item.technician}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.notes}
                    </p>
                    {index < subpartDetails.history.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle>Reported Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {subpartDetails.issues.length > 0 ? (
                <div className="space-y-6">
                  {subpartDetails.issues.map((issue) => (
                    <div key={issue.id} className="border rounded-md p-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">{issue.description}</h3>
                        <span className={`${getSeverityColor(issue.severity)}`}>
                          {issue.severity.charAt(0).toUpperCase() +
                            issue.severity.slice(1)}{" "}
                          Severity
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Reported: {issue.reportedDate}</span>
                        <span className={`${getStatusColor(issue.status)}`}>
                          Status: {issue.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No issues reported for this subpart.</p>
              )}

              <Button className="mt-6">Report New Issue</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline">Print Report</Button>
        <Button>Schedule Maintenance</Button>
      </div>
    </div>
  );
}
