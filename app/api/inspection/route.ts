import { NextRequest, NextResponse } from "next/server";
import { externalAxiosClient } from "@/lib/axiosClient";

interface Inspection {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  customerId: number;
  desc: string;
  inspectionType: string;
  productNumber: string;
  productName: string;
  specification: string;
  displayCustomerName: string;
  modelCount: number;
  // 기타 필요한 필드들...
}

interface InspectionResponse {
  items: Inspection[];
  total: number;
}

// /v1/parts-history 인스펙션 목록 조회 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const search = searchParams.get("search");

    // Authorization 헤더 가져오기
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 }
      );
    }

    // API 요청 파라미터 구성
    const params: {
      page: number;
      limit: number;
      customerId?: string;
      search?: string;
    } = {
      page: parseInt(page),
      limit: parseInt(limit),
    };

    // customerId가 있는 경우에만 파라미터에 추가
    if (customerId) {
      params.customerId = customerId;
    }

    // search가 있는 경우에만 파라미터에 추가
    if (search) {
      params.search = search;
    }

    // 외부 API 호출 시 Authorization 헤더 포함
    const response = await externalAxiosClient.get<InspectionResponse>(
      `http://localhost:3005/v1/parts-history`,
      {
        params,
        headers: {
          Authorization: authHeader,
        },
      }
    );

    const { items, total } = response.data;

    return NextResponse.json({
      inspections: items,
      total,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Inspection API Error:", error.message);
    }
    return NextResponse.json(
      { error: "Failed to fetch inspection data" },
      { status: 500 }
    );
  }
}
