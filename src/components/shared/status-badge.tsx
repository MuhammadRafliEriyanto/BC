import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: string;
};

const statusMap = [
  { keywords: ["aktif", "selesai", "siap", "berlangsung", "excellent", "baru", "lunas"], variant: "success" as const },
  { keywords: ["warning", "prioritas", "pending", "verifikasi", "butuh", "hampir", "draft"], variant: "warning" as const },
  { keywords: ["nonaktif", "tertunda", "missed", "need review"], variant: "danger" as const },
  { keywords: ["info", "online", "otomatis"], variant: "info" as const },
];

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  const match = statusMap.find((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword)),
  );

  return <Badge variant={match?.variant ?? "secondary"}>{status}</Badge>;
}
