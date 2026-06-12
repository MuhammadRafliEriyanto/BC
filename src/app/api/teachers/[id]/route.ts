import { NextRequest } from "next/server";

import { proxyProtectedBackend, readRequestBody } from "@/lib/backend-route";

type TeacherRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: TeacherRouteContext) {
  const { id } = await context.params;

  return proxyProtectedBackend(request, `/api/teachers/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function PUT(request: NextRequest, context: TeacherRouteContext) {
  const { id } = await context.params;
  const body = await readRequestBody(request);

  return proxyProtectedBackend(request, `/api/teachers/${encodeURIComponent(id)}`, {
    method: "PUT",
    body,
  });
}

export async function DELETE(request: NextRequest, context: TeacherRouteContext) {
  const { id } = await context.params;

  return proxyProtectedBackend(request, `/api/teachers/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
