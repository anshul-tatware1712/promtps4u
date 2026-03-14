"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/common/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const isAuthenticatingRef = useRef(false);

  useEffect(() => {
    if (isAuthenticatingRef.current) return;

    const handleCallback = async () => {
      const code = searchParams.get("code");
      // Get provider from sessionStorage (set before OAuth redirect)
      const provider = sessionStorage.getItem("oauth_provider");

      if (!code || !provider) {
        setError("Invalid callback parameters");
        return;
      }

      try {
        isAuthenticatingRef.current = true;
        toast.loading("Completing sign in...", { id: "auth-callback" });
        const response = await fetch(
          `/api/auth/${provider}/callback?code=${code}`,
        );

        if (response.ok) {
          const data = await response.json();
          login(data.token, data.user);
          // Clear the stored provider
          sessionStorage.removeItem("oauth_provider");
          toast.success("Successfully signed in!", { id: "auth-callback" });
          router.push("/marketplace");
        } else {
          setError("Authentication failed");
          toast.error("Authentication failed", { id: "auth-callback" });
          isAuthenticatingRef.current = false;
        }
      } catch {
        setError("Authentication failed");
        toast.error("Authentication failed", { id: "auth-callback" });
        isAuthenticatingRef.current = false;
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => router.push("/login")}
          className="text-primary hover:underline"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Completing sign in...</h1>
      <Skeleton className="h-4 w-64 mx-auto" />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center">
          Loading...
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
