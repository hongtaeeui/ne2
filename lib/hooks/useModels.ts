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

interface Model {
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
}

interface ModelCredentials {
  inspectionId: number;
  page?: number;
  limit?: number;
}

interface ModelResponse {
  items: Model[];
  total: number;
}

export const useGetModels = ({
  inspectionId,
  page,
  limit,
}: ModelCredentials) => {
  return useQuery({
    queryKey: ["models", inspectionId, page, limit],
    queryFn: async () => {
      const response = await axiosClient.get<ModelResponse>(`/models`, {
        params: {
          inspectionId,
          page,
          limit,
        },
      });
      return response.data;
    },
    enabled: !!inspectionId, // inspectionId가 있을 때만 쿼리 실행
  });
};
