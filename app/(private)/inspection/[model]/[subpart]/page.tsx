import Link from "next/link";
import { notFound } from "next/navigation";

import { InspectionBreadcrumb } from "@/components/inspection-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Subpart {
  name: string;
  description: string;
  details: string;
}

interface ModelData {
  name: string;
  description: string;
  subparts: Record<string, Subpart>;
}

// 모델 데이터
const modelsData: Record<string, ModelData> = {
  "model-a": {
    name: "Model A",
    description: "High performance model with advanced features",
    subparts: {
      engine: {
        name: "Engine",
        description: "Engine inspection and diagnostics",
        details: "Advanced 2.0L Turbo Engine with direct injection",
      },
      chassis: {
        name: "Chassis",
        description: "Chassis inspection and analysis",
        details: "Reinforced aluminum chassis with multi-point safety structure",
      },
      electronics: {
        name: "Electronics",
        description: "Electronics systems check",
        details: "Digital control unit with advanced diagnostics capabilities",
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
      },
      body: {
        name: "Body",
        description: "Body inspection and analysis",
        details: "Steel body with corrosion resistant coating",
      },
      interior: {
        name: "Interior",
        description: "Interior components check",
        details: "Comfort-oriented interior with durable materials",
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
      },
      safety: {
        name: "Safety Systems",
        description: "Safety systems inspection",
        details: "Advanced driver assistance with emergency braking",
      },
      entertainment: {
        name: "Entertainment",
        description: "Entertainment systems check",
        details: "Premium sound system with digital connectivity",
      },
    },
  },
};

export default function SubpartPage({ params }: { params: { model: string; subpart: string } }) {
  const { model: modelId, subpart: subpartId } = params;

  // 모델 데이터 가져오기
  const modelData = modelsData[modelId];
  if (!modelData) {
    notFound();
  }

  // 서브파트 데이터 가져오기
  const subpartData = modelData.subparts[subpartId];
  if (!subpartData) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <InspectionBreadcrumb model={modelData.name} modelId={modelId} subpart={subpartData.name} subpartId={subpartId} />

      <h1 className="text-3xl font-bold mb-2">{subpartData.name}</h1>
      <p className="text-muted-foreground mb-6">{subpartData.description}</p>

      <Tabs defaultValue="details" className="w-full mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="inspection">Inspection</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{subpartData.details}</p>
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="text-lg font-medium mb-2">Specifications</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Manufacturing Date: January 2023</li>
                  <li>
                    Serial Number: SN-{modelId.toUpperCase()}-{subpartId.toUpperCase()}-12345
                  </li>
                  <li>Compliance: ISO 9001:2015</li>
                  <li>Warranty Status: Active</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inspection">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="font-medium">Visual Inspection</span>
                  <span className="text-green-600 font-medium">Passed</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="font-medium">Performance Test</span>
                  <span className="text-green-600 font-medium">Passed</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="font-medium">Stress Test</span>
                  <span className="text-amber-600 font-medium">Pending</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="font-medium">Longevity Assessment</span>
                  <span className="text-amber-600 font-medium">Pending</span>
                </div>
              </div>

              <Button className="mt-6">Start New Inspection</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Inspection History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border rounded-md">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">Routine Inspection</h4>
                    <span className="text-sm text-muted-foreground">2023-06-15</span>
                  </div>
                  <p className="text-sm text-muted-foreground">All tests passed. No issues detected.</p>
                </div>

                <div className="p-3 border rounded-md">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">Warranty Evaluation</h4>
                    <span className="text-sm text-muted-foreground">2023-03-22</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Minor adjustments made. Performance optimized.</p>
                </div>

                <div className="p-3 border rounded-md">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">Initial Quality Check</h4>
                    <span className="text-sm text-muted-foreground">2023-01-10</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Factory quality assessment complete. All parameters within specification.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex space-x-4">
        <Button variant="outline" asChild>
          <Link href={`/inspection/${modelId}`}>Back to {modelData.name}</Link>
        </Button>
        <Button variant="outline">Generate Report</Button>
        <Button>Schedule Maintenance</Button>
      </div>
    </div>
  );
}
