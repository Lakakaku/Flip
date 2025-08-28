'use client';

import { useState, useEffect } from 'react';

export interface Deal {
  id: string;
  title: string;
  currentPrice: number;
  estimatedValue: number;
  profitPotential: number;
  marketplace: string;
  category: string;
  location: string;
  url: string;
  images: string[];
  confidence: number;
  postedAt: Date;
}

interface UseDealsState {
  deals: Deal[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}

interface UseDealsReturn extends UseDealsState {
  refreshDeals: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export default function useDeals(
  filters?: {
    category?: string;
    minProfit?: number;
    marketplace?: string;
  }
): UseDealsReturn {
  const [state, setState] = useState<UseDealsState>({
    deals: [],
    isLoading: true,
    error: null,
    hasMore: true
  });

  const fetchDeals = async (reset = false) => {
    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null 
      }));

      // TODO: Replace with actual API call
      // For now, return empty since price database is not complete
      const response = await fetch('/api/deals');
      
      if (!response.ok) {
        throw new Error('Failed to fetch deals');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load deals');
      }

      setState({
        deals: reset ? data.data : [...state.deals, ...data.data],
        isLoading: false,
        error: null,
        hasMore: data.hasMore || false
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  const refreshDeals = async () => {
    await fetchDeals(true);
  };

  const loadMore = async () => {
    if (!state.hasMore || state.isLoading) return;
    await fetchDeals(false);
  };

  useEffect(() => {
    fetchDeals(true);
  }, [filters?.category, filters?.minProfit, filters?.marketplace]);

  return {
    ...state,
    refreshDeals,
    loadMore
  };
}