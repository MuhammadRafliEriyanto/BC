import { NextRequest } from "next/server";

import { proxyProtectedBackendRaw } from "@/lib/backend-route";

type RouteContext = {
  params: Promise<{
    classId: string;
    materialId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { classId, materialId } = await params;

  return proxyProtectedBackendRaw(
    request,
    `/api/teacher/me/classes/${encodeURIComponent(classId)}/materials/${encodeURIComponent(materialId)}/attachment`,
    {
      method: "GET",
    },
  );
}
