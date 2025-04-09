import { NextRequest, NextResponse } from "next/server";
import { externalAxiosClient } from "@/lib/axiosClient";

interface items {
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

interface SubpartResponse {
  items: items[];
  total: number;
}

// /v1/parts-history/inspection/{inspectionId}/models 관련 호출
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get("modelId");
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

    if (!modelId) {
      return NextResponse.json(
        { error: "modelId is required" },
        { status: 400 }
      );
    }

    // 외부 API 호출 시 Authorization 헤더 포함
    const response = await externalAxiosClient.get<SubpartResponse>(
      `http://localhost:3005/v1/parts-history/model/${modelId}/subparts`,
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
      items,
      total,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Subparts API Error:", error.message);
    }
    return NextResponse.json(
      { error: "Failed to fetch subparts data" },
      { status: 500 }
    );
  }
}
