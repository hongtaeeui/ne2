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

export interface CustomerUser {
  id: number;
  email: string;
  pw: string;
  name: string;
  tel: string;
  isAdmin: number;
  customerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerContact {
  id: number;
  customerId: number;
  personEmail: string;
  person: string;
  isMain: number;
  createdAt: string;
  updatedAt: string;
}

interface CustomerResponse {
  customers: Customer[];
  total: number;
}

interface CustomerUserResponse {
  customers: CustomerUser[];
  total: number;
}

interface CustomerContactResponse {
  contacts: CustomerContact[];
}

interface GetCustomerParams {
  page?: number;
  limit?: number;
}

interface GetCustomerListParams extends GetCustomerParams {
  customerId?: string | number;
}

export const useGetCustomer = ({
  page = 1,
  limit = 10,
}: GetCustomerParams = {}) => {
  return useQuery({
    queryKey: ["customers", page, limit],
    queryFn: async () => {
      try {
        const response = await axiosClient.get<CustomerResponse>("/customer", {
          params: {
            page,
            limit,
          },
        });
        return response.data;
      } catch (error) {
        console.error("고객 데이터 조회 중 오류 발생:", error);
        throw error;
      }
    },
  });
};

export const useGetCustomerList = ({
  customerId,
  page = 1,
  limit = 10,
}: GetCustomerListParams = {}) => {
  const parsedCustomerId =
    customerId === "all"
      ? undefined
      : customerId
      ? Number(customerId)
      : undefined;

  return useQuery({
    queryKey: ["customerList", parsedCustomerId, page, limit],
    queryFn: async () => {
      try {
        const response = await axiosClient.get<CustomerUserResponse>(
          "/customer/customer",
          {
            params: {
              customerId: parsedCustomerId,
              page,
              limit,
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error("고객 리스트 조회 중 오류 발생:", error);
        throw error;
      }
    },
  });
};

export const useGetContactList = (customerId?: string | number) => {
  const parsedCustomerId =
    customerId === "all"
      ? undefined
      : customerId
      ? Number(customerId)
      : undefined;

  return useQuery({
    queryKey: ["contactList", parsedCustomerId],
    queryFn: async () => {
      try {
        const response = await axiosClient.get<CustomerContactResponse>(
          "/customer/contactList",
          {
            params: {
              customerId: parsedCustomerId,
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error("연락처 리스트 조회 중 오류 발생:", error);
        throw error;
      }
    },
  });
};
