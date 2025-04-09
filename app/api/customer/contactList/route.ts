import { NextRequest, NextResponse } from "next/server";
import { externalAxiosClient } from "@/lib/axiosClient";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    // Authorization 헤더 가져오기
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 }
      );
    }

    // 외부 API 호출
    const response = await externalAxiosClient.get("/customer/contactList", {
      params: {
        ...(customerId && { customerId: parseInt(customerId) }),
      },
      headers: {
        Authorization: authHeader,
      },
    });

    // 응답 데이터 검증 및 변환
    const contacts = response.data;
    if (!contacts || !Array.isArray(contacts)) {
      throw new Error("Invalid response format from external API");
    }

    return NextResponse.json({
      contacts,
    });
  } catch (error) {
    console.error("Customer Contact API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer contact data" },
      { status: 500 }
    );
  }
}
