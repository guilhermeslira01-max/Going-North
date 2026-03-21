'use client';

import { useState } from 'react';
import { usePublicApi } from '@/hooks/useApi';
import { TickerBar } from '@/components/TickerBar';
import { PageLoader } from '@/components/ui/Spinner';
import { ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Article {
  title: string; description: string; url: string;
  image: string | null; publishedAt: string;
  source: { name: string; url: string };
}

interface IndicatorData { name: string; value: number; unit: string; cachedAt: string | null; }
interface IndicatorsResponse {
  data: {
    cdi: IndicatorData; selic: IndicatorData; ipca: IndicatorData;
    dolar: IndicatorData; bitcoin: IndicatorData; ethereum: IndicatorData;
    cachedAt: string | null;
  };
}

const FILTERS = ['Todos', 'Economia', 'Investimentos', 'Bolsa', 'Cripto', 'Renda Fixa'];

function filterArticles(articles: Article[], filter: string): Article[] {
  if (filter === 'Todos') return articles;
  const keywords: Record<string, string[]> = {
    Economia: ['economia', 'pib', 'inflação', 'desemprego', 'banco central'],
    Investimentos: ['invest', 'fundo', 'rendimento'],
    Bolsa: ['bolsa', 'ibovespa', 'ação', 'b3', 'petr', 'vale'],
    Cripto: ['bitcoin', 'crypto', 'ethereum', 'criptomoeda'],
    'Renda Fixa': ['cdi', 'selic', 'tesouro', 'cdb', 'lci', 'lca'],
  };
  const kws = keywords[filter] ?? [];
  return articles.filter((a) =>
    kws.some((kw) =>
      a.title.toLowerCase().includes(kw) || (a.description ?? '').toLowerCase().includes(kw)
    )
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function fmtIndicator(value: number, unit: string) {
  if (unit === 'BRL') {
    if (value > 100000) return `R$ ${(value / 1000).toFixed(1)}k`;
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  return `${value.toFixed(2)}%`;
}

// ─── Indicators Sidebar ───────────────────────────────────────────────────────

function IndicatorsSidebar() {
  const { data, mutate } = usePublicApi<IndicatorsResponse>('/news/indicators', {
    refreshInterval: 10 * 60 * 1000,
    revalidateOnFocus: false,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [lastManual, setLastManual] = useState<Date | null>(null);

  const indicators = data?.data;

  async function handleRefresh() {
    if (lastManual && Date.now() - lastManual.getTime() < 5 * 60 * 1000) {
      return;
    }
    setRefreshing(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news/indicators/refresh`);
      mutate();
      setLastManual(new Date());
    } finally {
      setRefreshing(false);
    }
  }

  const items = indicators
    ? [
        { name: 'CDI', value: fmtIndicator(indicators.cdi.value, '% a.a.') },
        { name: 'Selic', value: fmtIndicator(indicators.selic.value, '% a.a.') },
        { name: 'IPCA', value: fmtIndicator(indicators.ipca.value, '% a.a.') },
        { name: 'Dólar', value: fmtIndicator(indicators.dolar.value, 'BRL') },
        { name: 'Bitcoin', value: fmtIndicator(indicators.bitcoin.value, 'BRL') },
        { name: 'Ethereum', value: fmtIndicator(indicators.ethereum.value, 'BRL') },
      ]
    : [];

  return (
    <div className="card sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold font-sora text-brand-text text-sm">Indicadores</h3>
        <button onClick={handleRefresh} className="p-1 rounded-lg text-brand-text3 hover:text-brand-green transition-colors">
          <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      {indicators?.cachedAt && (
        <p className="text-xs text-brand-text3 mb-3 flex items-center gap-1">
          <ClockIcon className="w-3 h-3" /> Atualizado às {indicators.cachedAt}
        </p>
      )}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.name} className="flex items-center justify-between py-2 border-b border-brand-bg last:border-0">
            <span className="text-brand-text2 text-sm">{item.name}</span>
            <span className="font-bold text-brand-text text-sm">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 9;

export default function NoticiasPage() {
  const [filter, setFilter] = useState('Todos');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [lastManual, setLastManual] = useState<Date | null>(null);

  const { data, mutate, isLoading } = usePublicApi<{ data: { articles: Article[]; cachedAt: string | null } }>('/news', {
    refreshInterval: 30 * 60 * 1000,
    revalidateOnFocus: false,
  });

  const allArticles = data?.data?.articles ?? [];
  const filtered = filterArticles(allArticles, filter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const featured = paged[0];
  const rest = paged.slice(1);

  async function handleRefresh() {
    if (lastManual && Date.now() - lastManual.getTime() < 5 * 60 * 1000) return;
    setRefreshing(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news/refresh`);
      mutate();
      setLastManual(new Date());
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div style={{ background: '#f0f4f2', minHeight: '100vh' }}>
      <TickerBar />

      {/* Header */}
      <section style={{ background: '#003333' }} className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold font-sora text-white mb-2">Notícias Financeiras</h1>
              <p className="text-white/60">As principais notícias do mercado financeiro brasileiro</p>
            </div>
            <div className="flex items-center gap-3">
              {data?.data?.cachedAt && (
                <span className="text-white/40 text-xs flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" /> {data.data.cachedAt}
                </span>
              )}
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/50 text-sm transition-colors"
              >
                <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  filter === f ? 'bg-white text-brand-text' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <PageLoader />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Featured */}
              {featured && (
                <a href={featured.url} target="_blank" rel="noopener noreferrer" className="block card-hover overflow-hidden group">
                  {featured.image && (
                    <div className="h-52 overflow-hidden rounded-xl mb-4">
                      <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full mb-3 inline-block" style={{ background: 'rgba(54,133,71,0.15)', color: '#368547' }}>
                    Destaque
                  </span>
                  <h2 className="font-bold font-sora text-brand-text text-xl mb-2 group-hover:text-brand-green transition-colors">{featured.title}</h2>
                  {featured.description && <p className="text-brand-text2 text-sm leading-relaxed line-clamp-2">{featured.description}</p>}
                  <div className="flex items-center gap-2 mt-3 text-brand-text3 text-xs">
                    <span>{featured.source.name}</span>
                    <span>·</span>
                    <span>{fmtDate(featured.publishedAt)}</span>
                  </div>
                </a>
              )}

              {/* Article grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {rest.map((article, i) => (
                  <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="card-hover overflow-hidden group flex flex-col">
                    {article.image && (
                      <div className="h-36 overflow-hidden rounded-xl mb-3">
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <h3 className="font-semibold font-sora text-brand-text text-sm line-clamp-2 mb-2 group-hover:text-brand-green transition-colors flex-1">{article.title}</h3>
                    <div className="flex items-center gap-2 text-brand-text3 text-xs mt-auto">
                      <span className="truncate">{article.source.name}</span>
                      <span>·</span>
                      <span className="whitespace-nowrap">{fmtDate(article.publishedAt)}</span>
                    </div>
                  </a>
                ))}
              </div>

              {paged.length === 0 && (
                <div className="card text-center py-10 text-brand-text3 text-sm">
                  Nenhuma notícia nesta categoria.
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl text-sm font-medium border border-brand-text3/30 disabled:opacity-40 hover:border-brand-green hover:text-brand-green transition-colors">← Anterior</button>
                  <span className="text-brand-text3 text-sm">{page} / {totalPages}</span>
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-xl text-sm font-medium border border-brand-text3/30 disabled:opacity-40 hover:border-brand-green hover:text-brand-green transition-colors">Próxima →</button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <IndicatorsSidebar />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
