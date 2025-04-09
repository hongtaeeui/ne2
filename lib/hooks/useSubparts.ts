import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../axiosClient";
import { AxiosError } from "axios";

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSubpartsStatusRequest) => {
      try {
        const response = await axiosClient.put<UpdateSubpartsStatusResponse>(
          "/parts-history/subparts",
          data,
          {
            timeout: 30000, // 30초로 설정하여 충분한 여유 시간 제공
          }
        );
        return response.data;
      } catch (error: unknown) {
        const axiosError = error as AxiosError;
        console.error("Update Subparts Status Error:", axiosError.message);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // 저장 완료 후 자동으로 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ["subparts", variables.modelId],
      });
    },
  });
};
