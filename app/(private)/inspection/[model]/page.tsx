import Link from "next/link";
import { notFound } from "next/navigation";

import { InspectionBreadcrumb } from "@/components/inspection-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Subpart {
  name: string;
  id: string;
  description: string;
}

interface ModelData {
  name: string;
  description: string;
  subparts: Subpart[];
}

// 모델 데이터
const modelsData: Record<string, ModelData> = {
  "model-a": {
    name: "Model A",
    description: "High performance model with advanced features",
    subparts: [
      { name: "Engine", id: "engine", description: "Engine inspection and diagnostics" },
      { name: "Chassis", id: "chassis", description: "Chassis inspection and analysis" },
      { name: "Electronics", id: "electronics", description: "Electronics systems check" },
    ],
  },
  "model-b": {
    name: "Model B",
    description: "Economy model with essential features",
    subparts: [
      { name: "Engine", id: "engine", description: "Engine inspection and diagnostics" },
      { name: "Body", id: "body", description: "Body inspection and analysis" },
      { name: "Interior", id: "interior", description: "Interior components check" },
    ],
  },
  "model-c": {
    name: "Model C",
    description: "Premium model with luxury features",
    subparts: [
      { name: "Power Train", id: "powertrain", description: "Power train inspection" },
      { name: "Safety Systems", id: "safety", description: "Safety systems inspection" },
      { name: "Entertainment", id: "entertainment", description: "Entertainment systems check" },
    ],
  },
};

export default function ModelPage({ params }: { params: { model: string } }) {
  const modelId = params.model;
  const model = modelsData[modelId];

  if (!model) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <InspectionBreadcrumb model={model.name} modelId={modelId} />

      <h1 className="text-3xl font-bold mb-2">{model.name}</h1>
      <p className="text-muted-foreground mb-6">{model.description}</p>

      <h2 className="text-xl font-semibold mb-4">Select a Component for Inspection</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {model.subparts.map((subpart) => (
          <Card key={subpart.id}>
            <CardHeader>
              <CardTitle>{subpart.name}</CardTitle>
              <CardDescription>{subpart.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Select this component to begin inspection.</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/inspection/${modelId}/${subpart.id}`}>Inspect {subpart.name}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
