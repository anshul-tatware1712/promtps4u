"use client";

import { useAuth } from "@/components/common/auth-provider";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

export function useAdmin() {
  const { user, isAuthenticated } = useAuth();

  const isAdmin = isAuthenticated && user?.email === ADMIN_EMAIL;

  return {
    isAdmin,
    user,
    isAuthenticated,
  };
}
