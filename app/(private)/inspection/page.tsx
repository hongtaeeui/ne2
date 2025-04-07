"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconPlus } from "@tabler/icons-react";

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
import type { SimplifiedInspection } from "@/lib/hooks/useInspection";
import { useGetCustomer } from "@/lib/hooks/useCustomer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginatedResponse {
  inspections: SimplifiedInspection[];
  pagination: {
    total: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  };
}

export default function InspectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = React.useState("");

  // URL에서 파라미터 가져오기
  const customerId = searchParams.get("customerId") || "all";
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  // 고객사 데이터 가져오기
  const { data: customerData } = useGetCustomer();

  // 검사 데이터 가져오기
  const { data: paginatedData } = useGetInspection(
    customerId === "all" ? undefined : { customerId, page, limit }
  );

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  // 고객사 변경 핸들러
  const handleCustomerChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("customerId", value);
    params.set("page", "1"); // 고객사가 변경되면 페이지를 1로 리셋
    router.push(`?${params.toString()}`);
  };

  // 검색된 인스펙션 필터링
  const filteredInspections =
    paginatedData?.inspections.filter((inspection) =>
      inspection.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Inspection Dashboard</CardTitle>
          <CardDescription>
            {filteredInspections.length} inspections found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Select value={customerId} onValueChange={handleCustomerChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 고객사</SelectItem>
                    {customerData?.customers.map((customer) => (
                      <SelectItem key={customer.id} value={String(customer.id)}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search inspections..."
                  className="max-w-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => router.push("/inspection/new")}>
                <IconPlus className="mr-2 h-4 w-4" />
                New Inspection
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Model Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInspections.map((inspection: SimplifiedInspection) => (
                  <TableRow key={inspection.name}>
                    <TableCell>{inspection.name}</TableCell>
                    <TableCell className="text-right">
                      {inspection.modelCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, paginatedData?.pagination.total || 0)}{" "}
                of {paginatedData?.pagination.total || 0} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= (paginatedData?.pagination.totalPages || 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
