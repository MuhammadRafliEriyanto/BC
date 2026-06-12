import { NextRequest } from "next/server";

import { proxyProtectedBackendRaw } from "@/lib/backend-route";

type RouteContext = {
  params: Promise<{
    materialId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { materialId } = await params;

  return proxyProtectedBackendRaw(
    request,
    `/api/student/me/learning/materials/${encodeURIComponent(materialId)}/attachment`,
    {
      method: "GET",
    },
  );
}
