"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/common/auth-provider";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { componentsApi } from "@/lib/api";
import { Component } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [recentCopies, setRecentCopies] = useState<Component[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?next=/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    // Load recent copies (in production, fetch from API)
    componentsApi
      .getAll({ limit: 3 })
      .then((res) => {
        setRecentCopies(res.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (authLoading || !isAuthenticated) {
    return <DashboardSkeleton />;
  }

  const isPro = user?.subscriptionStatus === "active";

  return (
    <div className="container min-h-screen mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your account and saved prompts
          </p>
        </div>
        <Badge variant={isPro ? "default" : "secondary"} className="text-sm">
          {isPro ? "Pro Plan" : "Free Plan"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Account Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Subscription</p>
              <p className="font-medium capitalize">
                {user?.subscriptionStatus}
              </p>
            </div>
            {!isPro && (
              <Button
                className="w-full"
                onClick={() => router.push("/marketplace")}
              >
                Upgrade to Pro
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>Your prompt usage statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Copy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Prompts Copied</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">Unlimited</p>
                <p className="text-sm text-muted-foreground">Free Prompts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Copies Card */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Recently Copied</CardTitle>
            <CardDescription>Your recent prompt copies</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : recentCopies.length > 0 ? (
              <div className="space-y-3">
                {recentCopies.map((component) => (
                  <div
                    key={component.id}
                    className="flex items-center justify-between p-2 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-sm">{component.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {component.category}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {component.tier}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent copies
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-8" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
