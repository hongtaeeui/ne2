import React from "react";
import useInspectionStore from "@/lib/store/inspectionStore";
import { useGetInspection } from "@/lib/hooks/useInspection";
import { useGetModels } from "@/lib/hooks/useModels";

export function BreadcrumbNav() {
  const { selectedInspection, selectedModel } = useInspectionStore();

  const { data: inspectionData } = useGetInspection();
  const { data: modelData } = useGetModels(
    selectedInspection
      ? {
          inspectionId: selectedInspection,
          page: 1,
          limit: 10,
        }
      : undefined
  );

  if (!selectedInspection && !selectedModel) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center space-x-2 text-sm text-muted-foreground overflow-x-auto bg-muted/40 p-2 rounded-md">
      <span className="font-medium">경로:</span>
      <span>인스펙션</span>
      {selectedInspection && (
        <>
          <span className="mx-1">〉</span>
          <span>
            {inspectionData?.inspections.find(
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
  );
}
