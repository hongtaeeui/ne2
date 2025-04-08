import { NextRequest, NextResponse } from "next/server";
import { externalAxiosClient } from "@/lib/axiosClient";

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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 }
      );
    }

    const body: UpdateSubpartsStatusRequest = await request.json();

    const response = await externalAxiosClient.post(
      "http://localhost:3005/v1/parts-history/subparts",
      body,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Update Subparts Status Error:", error.message);
    }
    return NextResponse.json(
      { error: "Failed to update subparts status" },
      { status: 500 }
    );
  }
}
