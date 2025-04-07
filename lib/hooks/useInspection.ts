import { useQuery } from "@tanstack/react-query";
import axiosClient from "../axiosClient";

export interface SimplifiedInspection {
  name: string;
  modelCount: number;
  id: number;
}

export interface Inspection extends SimplifiedInspection {
  createdAt: string;
  updatedAt: string;
  ZPLString: string | null;
  customerId: number;
  desc: string;
  inspectionType: string;
  nextInspection: number | null;
  destIP: string | null;
  sourceIP: string | null;
  prevInspection: number | null;
  printerIP: string | null;
  printerPort: number | null;
  dailySeq: number | null;
  currentDate: string | null;
  nOfInspections: number;
  LotType: string;
  initialLot: string | null;
  startDate: string | null;
  endDate: string | null;
  useBarcode: boolean | null;
  PostProcessorName: string | null;
  inspectionMode: number;
  ALC: string;
  ZPLMode: string;
  productNumber: string;
  specificationNumber: string | null;
  mode: number;
  useZPL: number;
  detectionMode: number;
  carType: string;
  productName: string;
  textureInspection: number;
  nOfZPL: number;
  colorClusterName: string | null;
  showOmittedSubpartCanvas: number;
  colorCode: string;
  displayCustomerName: string;
  specification: string;
}

interface InspectionResponse {
  inspections: Inspection[];
  total: number;
}

interface InspectionQueryParams {
  customerId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const useGetInspection = (params?: InspectionQueryParams) => {
  return useQuery({
    queryKey: [
      "inspections",
      params?.customerId,
      params?.page,
      params?.limit,
      params?.search,
    ],
    queryFn: async () => {
      const response = await axiosClient.get<InspectionResponse>(
        `/inspection`,
        {
          params: {
            ...(params?.customerId && { customerId: params.customerId }),
            ...(params?.search && { search: params.search }),
            page: params?.page || 1,
            limit: params?.limit || 10,
          },
        }
      );

      const { inspections, total } = response.data;
      const currentPage = params?.page || 1;
      const itemsPerPage = params?.limit || 10;
      const totalPages = Math.ceil(total / itemsPerPage);

      return {
        inspections,
        pagination: {
          total,
          currentPage,
          itemsPerPage,
          totalPages,
        },
      };
    },
  });
};
