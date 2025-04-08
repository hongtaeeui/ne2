import { useQuery, useMutation } from "@tanstack/react-query";
import axiosClient from "../axiosClient";

export interface Subpart {
  id: number;
  name: string;
  customerId: number;
  modelId: number;
  yoloID: string;
  color: string;
  desc: string;
  isPositive: number;
  numObjects: number;
  createdAt: string;
  updatedAt: string;
  threshold: number;
  inUse: number;
  useHistogram: number;
  RGBKMeansClusterIds: number[];
  status?: string;
}

export interface SubpartResponse {
  items: Subpart[];
  total: number;
}

interface SubpartQueryParams {
  modelId?: number;
  page?: number;
  limit?: number;
}

export const useGetSubparts = (params?: SubpartQueryParams) => {
  return useQuery({
    queryKey: ["subparts", params?.modelId, params?.page, params?.limit],
    queryFn: async () => {
      const response = await axiosClient.get<SubpartResponse>(`/subparts`, {
        params: {
          ...(params?.modelId && { modelId: params.modelId }),
          page: params?.page || 1,
          limit: params?.limit || 10,
        },
      });

      console.log("response@@@@@@@@@@@@@@@@@@@@", response.data);

      return response.data; // API 응답을 그대로 반환
    },
    enabled: !!params?.modelId,
  });
};

interface UpdateSubpartsStatusRequest {
  customerId: number;
  modelId: number;
  userId: number;
  person: string;
  ip: string;
  reason: string;
  mailSendAddress: string[];
  subparts: {
    id: number;
    inUse: number;
  }[];
}

interface UpdateSubpartsStatusResponse {
  success: boolean;
  message: string;
}

export const useUpdateSubpartsStatus = () => {
  return useMutation({
    mutationFn: async (data: UpdateSubpartsStatusRequest) => {
      const response = await axiosClient.post<UpdateSubpartsStatusResponse>(
        "/parts-history/subparts",
        data
      );
      return response.data;
    },
  });
};
