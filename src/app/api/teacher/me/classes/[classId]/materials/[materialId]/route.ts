import { NextRequest } from "next/server";

import { proxyProtectedBackend, readRequestBody } from "@/lib/backend-route";

type RouteContext = {
  params: Promise<{
    classId: string;
    materialId: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { classId, materialId } = await params;
  const body = await readRequestBody(request);

  return proxyProtectedBackend(
    request,
    `/api/teacher/me/classes/${encodeURIComponent(classId)}/materials/${encodeURIComponent(materialId)}`,
    {
      method: "PATCH",
      body,
    },
  );
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { classId, materialId } = await params;

  return proxyProtectedBackend(
    request,
    `/api/teacher/me/classes/${encodeURIComponent(classId)}/materials/${encodeURIComponent(materialId)}`,
    {
      method: "DELETE",
    },
  );
}
