"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/components/common/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const provider = searchParams.get('provider');

      if (!code || !provider) {
        setError('Invalid callback parameters');
        return;
      }

      try {
        const response = await fetch(`/api/auth/${provider}/callback?code=${code}`);

        if (response.ok) {
          const data = await response.json();
          login(data.token, data.user);
          router.push('/dashboard');
        } else {
          setError('Authentication failed');
        }
      } catch {
        setError('Authentication failed');
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
          onClick={() => router.push('/login')}
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
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center">Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
