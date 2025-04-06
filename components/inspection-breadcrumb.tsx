"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export interface BreadcrumbItem {
  label: string;
  path: string;
  isCurrent?: boolean;
}

interface InspectionBreadcrumbProps {
  model?: string;
  modelId?: string;
  subpart?: string;
  subpartId?: string;
}

export function InspectionBreadcrumb({ model, modelId, subpart, subpartId }: InspectionBreadcrumbProps) {
  const pathname = usePathname();

  // Extract model and subpart IDs from the pathname if not provided
  const paths = pathname.split("/").filter(Boolean);
  const extractedModelId = modelId || (paths.length > 1 ? paths[1] : undefined);
  const extractedSubpartId = subpartId || (paths.length > 2 ? paths[2] : undefined);

  // Build the breadcrumb items based on the current path
  const items: BreadcrumbItem[] = React.useMemo(() => {
    const breadcrumbItems: BreadcrumbItem[] = [
      {
        label: "Inspection",
        path: "/inspection",
        isCurrent: paths.length === 1,
      },
    ];

    if (model && extractedModelId) {
      breadcrumbItems.push({
        label: model,
        path: `/inspection/${extractedModelId}`,
        isCurrent: paths.length === 2,
      });

      if (subpart && extractedSubpartId) {
        breadcrumbItems.push({
          label: subpart,
          path: `/inspection/${extractedModelId}/${extractedSubpartId}`,
          isCurrent: true,
        });
      }
    }

    return breadcrumbItems;
  }, [model, extractedModelId, subpart, extractedSubpartId, paths.length]);

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={item.path}>
            <BreadcrumbItem>
              {item.isCurrent ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.path}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
