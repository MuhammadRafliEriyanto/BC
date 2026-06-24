import { NextRequest } from "next/server";

import { proxyProtectedBackend, readRequestBody } from "@/lib/backend-route";

type BranchIncomeRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: BranchIncomeRouteContext,
) {
  const { id } = await context.params;

  return proxyProtectedBackend(
    request,
    `/api/branch-incomes/${encodeURIComponent(id)}`,
    {
      method: "GET",
    },
  );
}

export async function PUT(
  request: NextRequest,
  context: BranchIncomeRouteContext,
) {
  const { id } = await context.params;
  const body = await readRequestBody(request);

  return proxyProtectedBackend(
    request,
    `/api/branch-incomes/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body,
    },
  );
}

export async function DELETE(
  request: NextRequest,
  context: BranchIncomeRouteContext,
) {
  const { id } = await context.params;

  return proxyProtectedBackend(
    request,
    `/api/branch-incomes/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}
