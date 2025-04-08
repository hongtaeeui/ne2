import { useQuery } from "@tanstack/react-query";
import axiosClient from "../axiosClient";

// {
//   "id": 9,
//   "name": "RG3Back",
//   "customerId": 2,
//   "seq": null,
//   "status": "CREATED",
//   "desc": null,
//   "createdAt": "2020-05-05T15:00:00.000Z",
//   "updatedAt": "2020-07-02T15:27:53.000Z",
//   "detectionRegionTL": {
//     "x": 0,
//     "y": 0
//   },
//   "detectionRegionBR": {
//     "x": 1920,
//     "y": 1200
//   },
//   "RGBKMeansClusterWeightFile": null
// }

export interface Model {
  id: number;
  name: string;
  customerId: number;
  seq: number | null;
  status: string;
  desc: string | null;
  createdAt: string;
  updatedAt: string;
  detectionRegionTL: {
    x: number;
    y: number;
  };
  detectionRegionBR: {
    x: number;
    y: number;
  };
  RGBKMeansClusterWeightFile: string | null;
  subpartCount: number;
}

export interface ModelResponse {
  models: Model[];
  total: number;
}

interface ModelQueryParams {
  inspectionId?: number;
  page?: number;
  limit?: number;
}

export const useGetModels = (params?: ModelQueryParams) => {
  return useQuery({
    queryKey: ["models", params?.inspectionId, params?.page, params?.limit],
    queryFn: async () => {
      const response = await axiosClient.get<ModelResponse>(`/models`, {
        params: {
          ...(params?.inspectionId && { inspectionId: params.inspectionId }),
          page: params?.page || 1,
          limit: params?.limit || 10,
        },
      });

      const { models, total } = response.data;
      const currentPage = params?.page || 1;
      const itemsPerPage = params?.limit || 10;
      const totalPages = Math.ceil(total / itemsPerPage);

      return {
        models,
        pagination: {
          total,
          currentPage,
          itemsPerPage,
          totalPages,
        },
      };
    },
    enabled: !!params?.inspectionId,
  });
};
