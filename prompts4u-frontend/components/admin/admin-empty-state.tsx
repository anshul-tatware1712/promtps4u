"use client";

import { Card, CardContent } from "@/components/ui/card";

interface AdminEmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function AdminEmptyState({
  title,
  description = "No items found",
  action,
}: AdminEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <p className="text-lg font-medium text-muted-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  );
}
