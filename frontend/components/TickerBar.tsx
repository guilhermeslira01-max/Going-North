'use client';

import { usePublicApi } from '@/hooks/useApi';

interface IndicatorData {
  name: string;
  value: number;
  unit: string;
}

interface IndicatorsResponse {
  data: {
    cdi: IndicatorData;
    selic: IndicatorData;
    ipca: IndicatorData;
    dolar: IndicatorData;
    bitcoin: IndicatorData;
    ethereum: IndicatorData;
    cachedAt: string | null;
  };
}

function fmt(value: number, unit: string): string {
  if (unit === 'BRL') {
    if (value >= 100000) return `R$ ${(value / 1000).toFixed(1)}k`;
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  return `${value.toFixed(2)}${unit}`;
}

const FALLBACK_ITEMS = [
  { name: 'CDI', value: '13.65% a.a.' },
  { name: 'Selic', value: '13.75% a.a.' },
  { name: 'IPCA', value: '4.62% a.a.' },
  { name: 'Dólar', value: 'R$ 5,15' },
  { name: 'Bitcoin', value: 'R$ 312.000' },
  { name: 'Ethereum', value: 'R$ 15.800' },
];

export function TickerBar() {
  const { data, isLoading } = usePublicApi<IndicatorsResponse>('/news/indicators', {
    refreshInterval: 10 * 60 * 1000,
    revalidateOnFocus: false,
  });

  const items = data?.data
    ? [
        { name: 'CDI', value: fmt(data.data.cdi.value, data.data.cdi.unit) },
        { name: 'Selic', value: fmt(data.data.selic.value, data.data.selic.unit) },
        { name: 'IPCA', value: fmt(data.data.ipca.value, data.data.ipca.unit) },
        { name: 'Dólar', value: fmt(data.data.dolar.value, data.data.dolar.unit) },
        { name: 'Bitcoin', value: fmt(data.data.bitcoin.value, data.data.bitcoin.unit) },
        { name: 'Ethereum', value: fmt(data.data.ethereum.value, data.data.ethereum.unit) },
      ]
    : FALLBACK_ITEMS;

  const doubled = [...items, ...items]; // for seamless loop

  return (
    <div className="overflow-hidden py-2.5" style={{ background: '#0f2318' }}>
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-6 whitespace-nowrap">
            <span className="text-white/50 text-xs font-medium">{item.name}</span>
            <span className="text-green-400 text-xs font-bold">{isLoading ? '...' : item.value}</span>
            <span className="text-white/20 text-xs">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
