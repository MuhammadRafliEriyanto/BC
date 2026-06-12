import { proxyPublicBackend } from "@/lib/backend-route";

export async function GET() {
  return proxyPublicBackend("/api/branches/public-options", {
    method: "GET",
  });
}
