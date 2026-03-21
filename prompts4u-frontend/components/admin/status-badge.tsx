"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; color?: string }> = {
  pending: { variant: "secondary", label: "Pending" },
  processing: { variant: "outline", label: "Processing", color: "text-blue-500 border-blue-500" },
  completed: { variant: "default", label: "Completed" },
  failed: { variant: "destructive", label: "Failed" },
  published: { variant: "default", label: "Published" },
  draft: { variant: "secondary", label: "Draft" },
  archived: { variant: "outline", label: "Archived" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || { variant: "secondary" as const, label: status };

  return (
    <Badge
      variant={config.variant}
      className={cn(config.color, className)}
    >
      {config.label}
    </Badge>
  );
}
