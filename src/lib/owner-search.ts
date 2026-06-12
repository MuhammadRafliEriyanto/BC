import { requestAdminApi } from "@/lib/admin-api";

export type OwnerSearchResultItem = {
  id: string;
  referenceId: string | null;
  title: string;
  subtitle: string;
  meta: string | null;
};

export type OwnerSearchResults = {
  query: string;
  branches: OwnerSearchResultItem[];
  branchAdmins: OwnerSearchResultItem[];
  payments: OwnerSearchResultItem[];
  expenses: OwnerSearchResultItem[];
  activations: OwnerSearchResultItem[];
};

type OwnerSearchApiPayload = Partial<OwnerSearchResults>;

export const emptyOwnerSearchResults: OwnerSearchResults = {
  query: "",
  branches: [],
  branchAdmins: [],
  payments: [],
  expenses: [],
  activations: [],
};

function normalizeItems(value: OwnerSearchApiPayload[keyof OwnerSearchApiPayload]) {
  return Array.isArray(value) ? value : [];
}

export async function fetchOwnerGlobalSearch(query: string, signal?: AbortSignal) {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return {
      ...emptyOwnerSearchResults,
      query: normalizedQuery,
    } satisfies OwnerSearchResults;
  }

  const payload = await requestAdminApi<OwnerSearchApiPayload>(
    `/api/owner/search?q=${encodeURIComponent(normalizedQuery)}`,
    {
      method: "GET",
      signal,
    },
  );

  return {
    query: payload.data?.query ?? normalizedQuery,
    branches: normalizeItems(payload.data?.branches),
    branchAdmins: normalizeItems(payload.data?.branchAdmins),
    payments: normalizeItems(payload.data?.payments),
    expenses: normalizeItems(payload.data?.expenses),
    activations: normalizeItems(payload.data?.activations),
  } satisfies OwnerSearchResults;
}
