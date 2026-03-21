'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useApi, usePublicApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/useToast';
import { apiPost, apiPut, apiDelete, apiGet } from '@/lib/api';
import { TickerBar } from '@/components/TickerBar';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import {
  PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { PlusIcon, PencilIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Investment {
  id: string; nome: string; tipo: string; inst: string;
  aporte: number; atual: number; taxa?: number; data: string;
}

interface StockQuote {
  symbol: string; shortName: string;
  regularMarketPrice: number; regularMarketChangePercent: number;
}

interface InvestmentSummary { totalAporte: number; totalAtual: number; rentabilidade: number; }

const TIPOS = ['acao', 'fii', 'renda_fixa', 'cripto', 'fundo', 'tesouro', 'outro'];
const TIPO_LABELS: Record<string, string> = {
  acao: 'Ação', fii: 'FII', renda_fixa: 'Renda Fixa',
  cripto: 'Cripto', fundo: 'Fundo', tesouro: 'Tesouro', outro: 'Outro',
};
const COLORS = ['#368547', '#c8a96e', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ─── Simulator ───────────────────────────────────────────────────────────────

function SimulatorTab({ cdi }: { cdi: number }) {
  const [aporte, setAporte] = useState('1000');
  const [mensal, setMensal] = useState('200');
  const [anos, setAnos] = useState('5');
  const [taxa, setTaxa] = useState(String(cdi || 13));

  const data = (() => {
    const r = parseFloat(taxa) / 100 / 12;
    const months = parseInt(anos) * 12;
    const P = parseFloat(aporte) || 0;
    const PMT = parseFloat(mensal) || 0;
    const result = [];
    let balance = P;
    for (let m = 0; m <= months; m++) {
      result.push({ mes: m === 0 ? 'Hoje' : `${m}m`, valor: Math.round(balance) });
      balance = balance * (1 + r) + PMT;
    }
    return result;
  })();

  const final = data[data.length - 1]?.valor ?? 0;
  const invested = parseFloat(aporte) + parseFloat(mensal) * parseInt(anos) * 12;
  const gain = final - invested;

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-bold font-sora text-brand-text mb-6">Simulador de Juros Compostos</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div><label className="label">Aporte inicial (R$)</label><input type="number" className="input" value={aporte} onChange={(e) => setAporte(e.target.value)} /></div>
          <div><label className="label">Aporte mensal (R$)</label><input type="number" className="input" value={mensal} onChange={(e) => setMensal(e.target.value)} /></div>
          <div><label className="label">Período (anos)</label><input type="number" className="input" value={anos} onChange={(e) => setAnos(e.target.value)} min="1" max="40" /></div>
          <div><label className="label">Taxa anual (%)</label>
            <div className="flex gap-2">
              <input type="number" className="input" value={taxa} onChange={(e) => setTaxa(e.target.value)} step="0.1" />
              <button onClick={() => setTaxa(String(cdi))} className="px-3 py-2 rounded-xl text-xs font-medium border border-brand-green text-brand-green hover:bg-brand-green hover:text-white transition-colors whitespace-nowrap">CDI</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Total investido" value={fmtBRL(invested)} color="#3b82f6" />
          <StatCard label="Rendimento" value={fmtBRL(gain)} color="#368547" />
          <StatCard label="Valor final" value={fmtBRL(final)} color="#c8a96e" />
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data.filter((_, i) => i % 6 === 0 || i === data.length - 1)}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#368547" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#368547" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f2" />
            <XAxis dataKey="mes" tick={{ fontSize: 10, fill: '#7a9585' }} />
            <YAxis tick={{ fontSize: 10, fill: '#7a9585' }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => fmtBRL(v)} />
            <Area type="monotone" dataKey="valor" name="Patrimônio" stroke="#368547" fill="url(#grad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── My Investments Tab ───────────────────────────────────────────────────────

function MyInvestmentsTab({ quotes, quotesLoading, onRefreshQuotes }: { quotes: StockQuote[]; quotesLoading: boolean; onRefreshQuotes: () => void }) {
  const toast = useToast();
  const { data, mutate } = useApi<{ data: { investments: Investment[]; summary: InvestmentSummary } }>('/investments');
  const investments = data?.data?.investments ?? [];
  const summary = data?.data?.summary;
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Investment> | null }>({ open: false, data: null });
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [canRefresh, setCanRefresh] = useState(true);

  function handleRefresh() {
    if (!canRefresh) { toast.error('Aguarde 5 minutos entre atualizações'); return; }
    onRefreshQuotes();
    setLastRefresh(new Date());
    setCanRefresh(false);
    setTimeout(() => setCanRefresh(true), 5 * 60 * 1000);
  }

  async function handleSave() {
    if (!modal.data) return;
    try {
      if (modal.data.id) {
        await apiPut(`/investments/${modal.data.id}`, modal.data);
        toast.success('Investimento atualizado');
      } else {
        await apiPost('/investments', modal.data);
        toast.success('Investimento adicionado');
      }
      mutate();
      setModal({ open: false, data: null });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este investimento?')) return;
    await apiDelete(`/investments/${id}`);
    toast.success('Investimento removido');
    mutate();
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Investido" value={fmtBRL(summary.totalAporte)} color="#3b82f6" />
          <StatCard label="Valor Atual" value={fmtBRL(summary.totalAtual)} color="#368547" />
          <StatCard label="Rentabilidade" value={`${summary.rentabilidade >= 0 ? '+' : ''}${summary.rentabilidade.toFixed(2)}%`} color={summary.rentabilidade >= 0 ? '#368547' : '#ef4444'} />
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {lastRefresh && <span className="text-xs text-brand-text3">Atualizado às {lastRefresh.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>}
          <button onClick={handleRefresh} disabled={!canRefresh} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${canRefresh ? 'text-brand-green border border-brand-green hover:bg-green-50' : 'text-brand-text3 border border-brand-text3/30 cursor-not-allowed'}`}>
            <ArrowPathIcon className={`w-3.5 h-3.5 ${quotesLoading ? 'animate-spin' : ''}`} />
            Atualizar cotações
          </button>
        </div>
        <Button size="sm" onClick={() => setModal({ open: true, data: { tipo: 'acao', data: new Date().toISOString().split('T')[0], atual: 0 } })}>
          <PlusIcon className="w-4 h-4" /> Adicionar
        </Button>
      </div>

      <div className="card overflow-x-auto">
        {investments.length === 0 ? (
          <p className="text-center text-brand-text3 py-8 text-sm">Nenhum investimento registrado</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-brand-text3 text-xs border-b border-brand-bg">
                <th className="pb-3 text-left font-semibold">Nome</th>
                <th className="pb-3 text-left font-semibold">Tipo</th>
                <th className="pb-3 text-left font-semibold">Instituição</th>
                <th className="pb-3 text-right font-semibold">Aporte</th>
                <th className="pb-3 text-right font-semibold">Atual</th>
                <th className="pb-3 text-right font-semibold">Rent.</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-bg">
              {investments.map((inv) => {
                const rent = inv.aporte > 0 ? ((inv.atual - inv.aporte) / inv.aporte) * 100 : 0;
                return (
                  <tr key={inv.id}>
                    <td className="py-3 font-medium text-brand-text">{inv.nome}</td>
                    <td className="py-3"><span className="badge-free">{TIPO_LABELS[inv.tipo]}</span></td>
                    <td className="py-3 text-brand-text2">{inv.inst}</td>
                    <td className="py-3 text-right text-brand-text2">{fmtBRL(inv.aporte)}</td>
                    <td className="py-3 text-right font-medium text-brand-text">{fmtBRL(inv.atual)}</td>
                    <td className={`py-3 text-right font-bold ${rent >= 0 ? 'text-green-600' : 'text-red-500'}`}>{rent >= 0 ? '+' : ''}{rent.toFixed(2)}%</td>
                    <td className="py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => setModal({ open: true, data: inv })} className="p-1.5 rounded-lg text-brand-text3 hover:text-brand-text hover:bg-brand-bg"><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(inv.id)} className="p-1.5 rounded-lg text-brand-text3 hover:text-red-500 hover:bg-red-50"><TrashIcon className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, data: null })} title={modal.data?.id ? 'Editar Investimento' : 'Novo Investimento'}>
        <div className="space-y-4">
          <div><label className="label">Nome</label><input className="input" value={modal.data?.nome ?? ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, nome: e.target.value } }))} placeholder="Ex: Tesouro Selic 2026" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Tipo</label>
              <select className="input" value={modal.data?.tipo ?? 'acao'} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, tipo: e.target.value } }))}>
                {TIPOS.map((t) => <option key={t} value={t}>{TIPO_LABELS[t]}</option>)}
              </select>
            </div>
            <div><label className="label">Instituição</label><input className="input" value={modal.data?.inst ?? ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, inst: e.target.value } }))} placeholder="Ex: Nubank" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Aporte (R$)</label><input type="number" step="0.01" className="input" value={modal.data?.aporte ?? ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, aporte: parseFloat(e.target.value) } }))} /></div>
            <div><label className="label">Valor atual (R$)</label><input type="number" step="0.01" className="input" value={modal.data?.atual ?? ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, atual: parseFloat(e.target.value) } }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Taxa (% a.a.)</label><input type="number" step="0.01" className="input" value={modal.data?.taxa ?? ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, taxa: parseFloat(e.target.value) } }))} /></div>
            <div><label className="label">Data</label><input type="date" className="input" value={modal.data?.data ?? ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, data: e.target.value } }))} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setModal({ open: false, data: null })}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Portfolio Tab ────────────────────────────────────────────────────────────

function PortfolioTab() {
  const { data } = useApi<{ data: { investments: Investment[] } }>('/investments');
  const investments = data?.data?.investments ?? [];

  const byType = investments.reduce<Record<string, number>>((acc, inv) => {
    acc[TIPO_LABELS[inv.tipo] || inv.tipo] = (acc[TIPO_LABELS[inv.tipo] || inv.tipo] || 0) + inv.atual;
    return acc;
  }, {});
  const pieData = Object.entries(byType).map(([name, value]) => ({ name, value }));
  const total = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-bold font-sora text-brand-text mb-4">Alocação da Carteira</h3>
        {pieData.length === 0 ? (
          <p className="text-center text-brand-text3 py-8 text-sm">Nenhum investimento registrado</p>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => fmtBRL(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-sm text-brand-text2">{d.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-brand-text">{fmtBRL(d.value)}</span>
                    <span className="text-xs text-brand-text3 ml-2">{total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Quotes Tab ──────────────────────────────────────────────────────────────

function QuotesTab({ quotes, loading }: { quotes: StockQuote[]; loading: boolean }) {
  if (loading) return <PageLoader />;

  return (
    <div className="card">
      <h3 className="font-bold font-sora text-brand-text mb-4">Cotações B3</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quotes.map((q) => (
          <div key={q.symbol} className="rounded-xl p-4" style={{ background: '#f0f4f2' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold font-sora text-brand-text">{q.symbol}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${q.regularMarketChangePercent >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {q.regularMarketChangePercent >= 0 ? '+' : ''}{q.regularMarketChangePercent?.toFixed(2)}%
              </span>
            </div>
            <p className="text-xl font-bold text-brand-text">{fmtBRL(q.regularMarketPrice)}</p>
            <p className="text-xs text-brand-text3 mt-1">{q.shortName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'my', label: 'Meus Investimentos' },
  { id: 'portfolio', label: 'Carteira' },
  { id: 'quotes', label: 'Cotações B3' },
  { id: 'simulator', label: 'Simulador' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function InvestimentosPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('my');
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const { data: indicatorsData } = usePublicApi<{ data: { cdi: { value: number } } }>('/news/indicators');

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchQuotes() {
      setQuotesLoading(true);
      try {
        const res = await apiGet<{ data: { quotes: StockQuote[] } }>('/investments/quotes');
        setQuotes(res.data.quotes ?? []);
      } catch {
        // silent fail
      } finally {
        setQuotesLoading(false);
      }
    }
    if (user) fetchQuotes();
  }, [user]);

  async function handleRefreshQuotes() {
    setQuotesLoading(true);
    try {
      const res = await apiGet<{ data: { quotes: StockQuote[] } }>('/investments/quotes/refresh');
      setQuotes(res.data.quotes ?? []);
    } catch {
      // silent fail
    } finally {
      setQuotesLoading(false);
    }
  }

  const cdi = indicatorsData?.data?.cdi?.value ?? 13;

  if (isLoading || !user) return <PageLoader />;

  return (
    <div style={{ background: '#f0f4f2', minHeight: '100vh' }}>
      <TickerBar />

      <div style={{ background: '#003333' }} className="pb-6 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold font-sora text-white mb-1">Investimentos</h1>
          <p className="text-white/60 text-sm mb-6">Acompanhe e gerencie sua carteira de investimentos</p>
          <div className="flex gap-1 overflow-x-auto scrollbar-thin">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'bg-white text-brand-text' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'my' && <MyInvestmentsTab quotes={quotes} quotesLoading={quotesLoading} onRefreshQuotes={handleRefreshQuotes} />}
        {activeTab === 'portfolio' && <PortfolioTab />}
        {activeTab === 'quotes' && <QuotesTab quotes={quotes} loading={quotesLoading} />}
        {activeTab === 'simulator' && <SimulatorTab cdi={cdi} />}
      </div>
    </div>
  );
}
