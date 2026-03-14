'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { componentsApi } from '@/lib/api';
import { useAuth } from '@/components/common/auth-provider';
import { Component } from '@/types';

export function useCopyPrompt() {
  const [isCopying, setIsCopying] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const copyPrompt = useCallback(async (component: Component) => {
    if (!isAuthenticated) {
      window.location.href = `/login?next=/marketplace`;
      return;
    }

    if (component.tier === 'paid' && user?.subscriptionStatus !== 'active') {
      throw new Error('SUBSCRIPTION_REQUIRED');
    }

    try {
      setIsCopying(true);

      const response = await componentsApi.copy(component.id);

      await navigator.clipboard.writeText(response.promptContent);

      toast.success('Prompt copied to clipboard!', {
        description: 'Paste it in Claude Code or Cursor to generate the component.',
      });

      return response;
    } catch (error) {
      if ((error as Error).message === 'SUBSCRIPTION_REQUIRED') {
        throw error;
      }
      toast.error('Failed to copy prompt', {
        description: 'Please try again later.',
      });
      throw error;
    } finally {
      setIsCopying(false);
    }
  }, [isAuthenticated, user?.subscriptionStatus]);

  return { copyPrompt, isCopying };
}
