import { NextRequest, NextResponse } from "next/server";
import { externalAxiosClient } from "@/lib/axiosClient";

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

interface ModelResponse {
  items: Model[];
  total: number;
}

// /v1/parts-history/inspection/{inspectionId}/models 관련 호출
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inspectionId = searchParams.get("inspectionId");
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    // Authorization 헤더 가져오기
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 }
      );
    }

    if (!inspectionId) {
      return NextResponse.json(
        { error: "inspectionId is required" },
        { status: 400 }
      );
    }

    // 외부 API 호출 시 Authorization 헤더 포함
    const response = await externalAxiosClient.get<ModelResponse>(
      `/parts-history/inspection/${inspectionId}/models`,
      {
        params: {
          page: parseInt(page),
          limit: parseInt(limit),
        },
        headers: {
          Authorization: authHeader,
        },
      }
    );

    const { items, total } = response.data;

    return NextResponse.json({
      models: items,
      total,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Models API Error:", error.message);
    }
    return NextResponse.json(
      { error: "Failed to fetch models data" },
      { status: 500 }
    );
  }
}
