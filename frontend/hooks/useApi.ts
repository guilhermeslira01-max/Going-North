import useSWR, { SWRConfiguration } from 'swr';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('gn_token');
}

async function authedFetcher(url: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('gn_token');
    localStorage.removeItem('gn_user');
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Fetch error');
  return data;
}

async function publicFetcher(url: string) {
  const res = await fetch(`${API_URL}${url}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Fetch error');
  return data;
}

// Hook for authenticated endpoints
export function useApi<T>(path: string | null, config?: SWRConfiguration) {
  return useSWR<T>(path, authedFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000, // 5 minutes
    ...config,
  });
}

// Hook for public endpoints (indicators, news)
export function usePublicApi<T>(path: string | null, config?: SWRConfiguration) {
  return useSWR<T>(path, publicFetcher, {
    revalidateOnFocus: false,
    ...config,
  });
}

// Transactions — refresh every 5 minutes
export function useTransactions(params = '') {
  return useApi<{ data: unknown[]; meta: { total: number } }>(
    `/transactions${params}`,
    { refreshInterval: 5 * 60 * 1000 }
  );
}

// Goals — refresh every 5 minutes
export function useGoals() {
  return useApi<{ data: unknown[] }>('/goals', { refreshInterval: 5 * 60 * 1000 });
}

// Indicators — refresh every 10 minutes, never on focus
export function useIndicators() {
  return usePublicApi<{ data: unknown }>('/news/indicators', {
    refreshInterval: 10 * 60 * 1000,
    revalidateOnFocus: false,
  });
}

// News — refresh every 30 minutes
export function useNews() {
  return usePublicApi<{ data: { articles: unknown[]; cachedAt: string | null } }>('/news', {
    refreshInterval: 30 * 60 * 1000,
    revalidateOnFocus: false,
  });
}
