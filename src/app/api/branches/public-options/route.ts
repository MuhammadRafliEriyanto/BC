import { proxyPublicBackend } from "@/lib/backend-route";

export const dynamic = "force-dynamic";

export async function GET() {
  return proxyPublicBackend("/api/branches/public-options", {
    method: "GET",
  });
}
