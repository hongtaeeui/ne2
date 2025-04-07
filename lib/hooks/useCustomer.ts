import { useQuery } from "@tanstack/react-query";
import axiosClient from "../axiosClient";

export interface Customer {
  id: number;
  name: string;
  contactName: string;
  contactInfo: string;
  createdAt: string;
  updatedAt: string;
  inUse: boolean | null;
  parentCustomerId: number | null;
  path: string;
}

interface CustomerResponse {
  customers: Customer[];
  total: number;
}

export const useGetCustomer = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["customers", page, limit],
    queryFn: async () => {
      try {
        console.log("페이지:", page);
        console.log("페이지당 항목 수:", limit);

        const response = await axiosClient.get<CustomerResponse>("/customer", {
          params: {
            page,
            limit,
          },
        });
        console.log("응답 데이터:", response.data);
        return response.data;
      } catch (error) {
        console.error("고객 데이터 조회 중 오류 발생:", error);
        throw error;
      }
    },
  });
};
