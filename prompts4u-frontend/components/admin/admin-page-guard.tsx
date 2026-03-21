"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/common/auth-provider";
import { useAdmin } from "@/hooks/use-admin";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminPageGuardProps {
  children: React.ReactNode;
  redirectLogin?: string;
}

export function AdminPageGuard({ children, redirectLogin }: AdminPageGuardProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isAdmin } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?next=${redirectLogin || window.location.pathname}`);
      return;
    }
    if (!authLoading && isAuthenticated && !isAdmin) {
      router.push("/");
      return;
    }
  }, [authLoading, isAuthenticated, isAdmin, router, redirectLogin]);

  if (authLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="container flex items-center justify-center min-h-screen mx-auto px-4 py-8">
        <div className="space-y-4 text-center">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-64 w-full max-w-2xl mx-auto" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
