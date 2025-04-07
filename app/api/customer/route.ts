import { NextRequest, NextResponse } from "next/server";
import { externalAxiosClient } from "@/lib/axiosClient";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
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

    // 외부 API 호출
    const response = await externalAxiosClient.get("/v1/customer", {
      params: {
        page: parseInt(page),
        limit: parseInt(limit),
      },
      headers: {
        Authorization: authHeader,
      },
    });

    // console.log("response", response.data);

    // 응답 데이터 검증 및 변환
    const { customers, total } = response.data;
    if (!customers || !Array.isArray(customers)) {
      throw new Error("Invalid response format from external API");
    }

    return NextResponse.json({
      customers,
      total: total || customers.length,
    });
  } catch (error) {
    console.error("Customer API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer data" },
      { status: 500 }
    );
  }
}
