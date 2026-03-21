'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/useToast';
import { apiPost, apiPut, apiDelete } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  PlusIcon, PencilIcon, TrashIcon, FunnelIcon,
  ArrowTrendingUpIcon, ArrowTrendingDownIcon,
  WalletIcon, FlagIcon, CreditCardIcon, ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Transaction { id: string; desc: string; valor: number; tipo: string; cat: string; data: string; }
interface Goal { id: string; nome: string; total: number; atual: number; prazo: string; cor: string; }
interface Installment { id: string; desc: string; valor: number; total: number; pagas: number; venc: string; cat: string; status: string; alertVencimento: boolean; daysUntilDue: number; }
interface MonthlySummary { receitas: number; despesas: number; saldo: number; byCat: Record<string, number>; }
interface MonthlyData { mes: string; receitas: number; despesas: number; saldo: number; }

const CATS = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Salário', 'Freelance', 'Investimentos', 'Outros'];
const DONUT_COLORS = ['#368547', '#c8a96e', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

function fmtBRL(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function fmtDate(d: string) { return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR'); }

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab() {
  const { data: summaryData } = useApi<{ data: MonthlySummary }>('/transactions/summary');
  const { data: monthlyData } = useApi<{ data: MonthlyData[] }>('/transactions/monthly');
  const { data: txData } = useApi<{ data: Transaction[] }>('/transactions?limit=5');
  const summary = summaryData?.data;
  const monthly = monthlyData?.data ?? [];
  const recentTx = txData?.data ?? [];

  const donutData = summary
    ? Object.entries(summary.byCat).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Receitas" value={fmtBRL(summary?.receitas ?? 0)} icon={<ArrowTrendingUpIcon className="w-5 h-5" />} color="#368547" />
        <StatCard label="Despesas" value={fmtBRL(summary?.despesas ?? 0)} icon={<ArrowTrendingDownIcon className="w-5 h-5" />} color="#ef4444" />
        <StatCard label="Saldo" value={fmtBRL(summary?.saldo ?? 0)} icon={<WalletIcon className="w-5 h-5" />} color={(summary?.saldo ?? 0) >= 0 ? '#368547' : '#ef4444'} />
        <StatCard label="Transações" value={recentTx.length} icon={<ClockIcon className="w-5 h-5" />} color="#c8a96e" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="font-bold font-sora text-brand-text mb-4">Evolução Mensal</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f2" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#7a9585' }} />
              <YAxis tick={{ fontSize: 11, fill: '#7a9585' }} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => fmtBRL(v)} />
              <Legend />
              <Line type="monotone" dataKey="receitas" name="Receitas" stroke="#368547" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-bold font-sora text-brand-text mb-4">Despesas por Categoria</h3>
          {donutData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmtBRL(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-brand-text3 text-sm">Sem despesas neste mês</div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <h3 className="font-bold font-sora text-brand-text mb-4">Transações Recentes</h3>
        {recentTx.length === 0 ? (
          <p className="text-brand-text3 text-sm text-center py-4">Nenhuma transação registrada</p>
        ) : (
          <div className="divide-y divide-brand-bg">
            {recentTx.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-brand-text text-sm">{t.desc}</p>
                  <p className="text-brand-text3 text-xs">{t.cat} · {fmtDate(t.data)}</p>
                </div>
                <span className={`font-bold text-sm ${t.tipo === 'receita' ? 'text-green-600' : 'text-red-500'}`}>
                  {t.tipo === 'receita' ? '+' : '-'}{fmtBRL(t.valor)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Transactions Tab ─────────────────────────────────────────────────────────

function TransactionsTab() {
  const toast = useToast();
  const [filter, setFilter] = useState({ tipo: '', cat: '', busca: '' });
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Transaction> | null }>({ open: false, data: null });

  const params = new URLSearchParams();
  if (filter.tipo) params.set('tipo', filter.tipo);
  if (filter.cat) params.set('cat', filter.cat);
  if (filter.busca) params.set('busca', filter.busca);

  const { data, mutate, isLoading } = useApi<{ data: Transaction[]; meta: { total: number } }>(
    `/transactions?${params.toString()}`
  );
  const transactions = data?.data ?? [];

  async function handleSave() {
    if (!modal.data) return;
    try {
      if (modal.data.id) {
        await apiPut(`/transactions/${modal.data.id}`, modal.data);
        toast.success('Transação atualizada');
      } else {
        await apiPost('/transactions', modal.data);
        toast.success('Transação criada');
      }
      mutate();
      setModal({ open: false, data: null });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta transação?')) return;
    try {
      await apiDelete(`/transactions/${id}`);
      toast.success('Transação removida');
      mutate();
    } catch {
      toast.error('Erro ao remover');
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card flex flex-wrap gap-3 items-center">
        <FunnelIcon className="w-4 h-4 text-brand-text3" />
        <input className="input flex-1 min-w-[160px] py-2 text-sm" placeholder="Buscar..." value={filter.busca} onChange={(e) => setFilter((f) => ({ ...f, busca: e.target.value }))} />
        <select className="input py-2 text-sm w-auto" value={filter.tipo} onChange={(e) => setFilter((f) => ({ ...f, tipo: e.target.value }))}>
          <option value="">Todos tipos</option>
          <option value="receita">Receita</option>
          <option value="despesa">Despesa</option>
        </select>
        <select className="input py-2 text-sm w-auto" value={filter.cat} onChange={(e) => setFilter((f) => ({ ...f, cat: e.target.value }))}>
          <option value="">Todas cats</option>
          {CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <Button size="sm" onClick={() => setModal({ open: true, data: { tipo: 'despesa', data: new Date().toISOString().split('T')[0] } })}>
          <PlusIcon className="w-4 h-4" /> Nova
        </Button>
      </div>

      {/* List */}
      <div className="card">
        {isLoading ? (
          <PageLoader />
        ) : transactions.length === 0 ? (
          <p className="text-center text-brand-text3 py-8 text-sm">Nenhuma transação encontrada</p>
        ) : (
          <div className="divide-y divide-brand-bg">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-brand-text text-sm">{t.desc}</p>
                    <StatusBadge status={t.tipo} />
                  </div>
                  <p className="text-brand-text3 text-xs">{t.cat} · {fmtDate(t.data)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold text-sm ${t.tipo === 'receita' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.tipo === 'receita' ? '+' : '-'}{fmtBRL(t.valor)}
                  </span>
                  <button onClick={() => setModal({ open: true, data: t })} className="p-1.5 rounded-lg text-brand-text3 hover:text-brand-text hover:bg-brand-bg"><PencilIcon className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-brand-text3 hover:text-red-500 hover:bg-red-50"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, data: null })} title={modal.data?.id ? 'Editar Transação' : 'Nova Transação'}>
        <div className="space-y-4">
          <div>
            <label className="label">Descrição</label>
            <input className="input" value={modal.data?.desc ?? ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, desc: e.target.value } }))} placeholder="Ex: Conta de luz" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Valor (R$)</label>
              <input type="number" step="0.01" className="input" value={modal.data?.valor ?? ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, valor: parseFloat(e.target.value) } }))} />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={modal.data?.tipo ?? 'despesa'} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, tipo: e.target.value } }))}>
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Categoria</label>
              <select className="input" value={modal.data?.cat ?? ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, cat: e.target.value } }))}>
                <option value="">Selecione</option>
                {CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Data</label>
              <input type="date" className="input" value={modal.data?.data ?? ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, data: e.target.value } }))} />
            </div>
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

// ─── Goals Tab ────────────────────────────────────────────────────────────────

function GoalsTab() {
  const toast = useToast();
  const { data, mutate } = useApi<{ data: Goal[] }>('/goals');
  const goals = data?.data ?? [];
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Goal> | null }>({ open: false, data: null });
  const [aporteModal, setAporteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [aporteVal, setAporteVal] = useState('');

  async function handleSave() {
    if (!modal.data) return;
    try {
      if (modal.data.id) {
        await apiPut(`/goals/${modal.data.id}`, modal.data);
        toast.success('Meta atualizada');
      } else {
        await apiPost('/goals', modal.data);
        toast.success('Meta criada');
      }
      mutate();
      setModal({ open: false, data: null });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  }

  async function handleAporte() {
    if (!aporteModal.id || !aporteVal) return;
    try {
      await apiPost(`/goals/${aporteModal.id}/aporte`, { valor: parseFloat(aporteVal) });
      toast.success('Aporte realizado!');
      mutate();
      setAporteModal({ open: false, id: null });
      setAporteVal('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao realizar aporte');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta meta?')) return;
    await apiDelete(`/goals/${id}`);
    toast.success('Meta removida');
    mutate();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setModal({ open: true, data: { cor: '#368547', atual: 0 } })}>
          <PlusIcon className="w-4 h-4" /> Nova Meta
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="card text-center py-10 text-brand-text3 text-sm">Nenhuma meta criada ainda.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const pct = Math.min((g.atual / g.total) * 100, 100);
            const done = pct >= 100;
            return (
              <div key={g.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold font-sora text-brand-text">{g.nome}</h4>
                    <p className="text-brand-text3 text-xs">Prazo: {fmtDate(g.prazo)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setAporteModal({ open: true, id: g.id })} className="p-1.5 rounded-lg text-brand-text3 hover:text-brand-green hover:bg-green-50"><FlagIcon className="w-4 h-4" /></button>
                    <button onClick={() => setModal({ open: true, data: g })} className="p-1.5 rounded-lg text-brand-text3 hover:text-brand-text hover:bg-brand-bg"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(g.id)} className="p-1.5 rounded-lg text-brand-text3 hover:text-red-500 hover:bg-red-50"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-brand-text2 font-medium">{fmtBRL(g.atual)}</span>
                  <span className="text-brand-text3">{fmtBRL(g.total)}</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: '#f0f4f2' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: done ? '#c8a96e' : g.cor }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-brand-text3">{pct.toFixed(1)}% concluído</span>
                  {done && <span className="text-xs font-semibold" style={{ color: '#c8a96e' }}>✓ Concluída!</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Modal */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, data: null })} title={modal.data?.id ? 'Editar Meta' : 'Nova Meta'}>
        <div className="space-y-4">
          <div><label className="label">Nome da meta</label><input className="input" value={modal.data?.nome ?? ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, nome: e.target.value } }))} placeholder="Ex: Viagem para Europa" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Valor total (R$)</label><input type="number" step="0.01" className="input" value={modal.data?.total ?? ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, total: parseFloat(e.target.value) } }))} /></div>
            <div><label className="label">Valor atual (R$)</label><input type="number" step="0.01" className="input" value={modal.data?.atual ?? ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, atual: parseFloat(e.target.value) } }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Prazo</label><input type="date" className="input" value={modal.data?.prazo ?? ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, prazo: e.target.value } }))} /></div>
            <div><label className="label">Cor</label><input type="color" className="input h-12 p-1 cursor-pointer" value={modal.data?.cor ?? '#368547'} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, cor: e.target.value } }))} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setModal({ open: false, data: null })}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* Aporte Modal */}
      <Modal isOpen={aporteModal.open} onClose={() => setAporteModal({ open: false, id: null })} title="Registrar Aporte" size="sm">
        <div className="space-y-4">
          <div><label className="label">Valor do aporte (R$)</label><input type="number" step="0.01" className="input" value={aporteVal} onChange={(e) => setAporteVal(e.target.value)} placeholder="0,00" autoFocus /></div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setAporteModal({ open: false, id: null })}>Cancelar</Button>
            <Button className="flex-1" onClick={handleAporte}>Confirmar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Installments Tab ─────────────────────────────────────────────────────────

function InstallmentsTab() {
  const toast = useToast();
  const { data, mutate } = useApi<{ data: Installment[] }>('/installments');
  const installments = data?.data ?? [];
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Installment> | null }>({ open: false, data: null });

  const alerts = installments.filter((i) => i.alertVencimento && i.status === 'ativo');

  async function handleSave() {
    if (!modal.data) return;
    try {
      if (modal.data.id) {
        await apiPut(`/installments/${modal.data.id}`, modal.data);
        toast.success('Parcelamento atualizado');
      } else {
        await apiPost('/installments', modal.data);
        toast.success('Parcelamento criado');
      }
      mutate();
      setModal({ open: false, data: null });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  }

  async function handlePagar(id: string) {
    try {
      await apiPost(`/installments/${id}/pagar`, {});
      toast.success('Parcela marcada como paga!');
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao marcar');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este parcelamento?')) return;
    await apiDelete(`/installments/${id}`);
    toast.success('Parcelamento removido');
    mutate();
  }

  const catData = installments
    .filter((i) => i.status === 'ativo')
    .reduce<Record<string, number>>((acc, i) => {
      acc[i.cat] = (acc[i.cat] || 0) + i.valor;
      return acc;
    }, {});
  const pieData = Object.entries(catData).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-4">
      {alerts.length > 0 && (
        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-600 text-sm">Vencimentos próximos!</p>
            <p className="text-red-500 text-xs">{alerts.map((a) => `${a.desc} (${a.daysUntilDue}d)`).join(' · ')}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex gap-4 text-sm text-brand-text2">
          <span className="font-medium">{installments.filter((i) => i.status === 'ativo').length} ativo(s)</span>
        </div>
        <Button size="sm" onClick={() => setModal({ open: true, data: { status: 'ativo', pagas: 0 } })}>
          <PlusIcon className="w-4 h-4" /> Novo Parcelamento
        </Button>
      </div>

      {pieData.length > 0 && (
        <div className="card">
          <h3 className="font-bold font-sora text-brand-text mb-4 text-sm">Distribuição por Categoria</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={65} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmtBRL(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        {installments.length === 0 ? (
          <p className="text-center text-brand-text3 py-8 text-sm">Nenhum parcelamento registrado</p>
        ) : (
          <div className="divide-y divide-brand-bg">
            {installments.map((inst) => (
              <div key={inst.id} className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-brand-text text-sm">{inst.desc}</p>
                      <StatusBadge status={inst.status} />
                      {inst.alertVencimento && <span className="text-xs text-red-500 font-medium">⚠ {inst.daysUntilDue}d</span>}
                    </div>
                    <p className="text-brand-text3 text-xs">{inst.cat} · {fmtBRL(inst.valor)}/parcela · Venc: {fmtDate(inst.venc)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: '#f0f4f2' }}>
                        <div className="h-full rounded-full" style={{ width: `${(inst.pagas / inst.total) * 100}%`, background: '#368547' }} />
                      </div>
                      <span className="text-xs text-brand-text3 whitespace-nowrap">{inst.pagas}/{inst.total}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-3">
                    {inst.status === 'ativo' && inst.pagas < inst.total && (
                      <button onClick={() => handlePagar(inst.id)} className="p-1.5 rounded-lg text-brand-text3 hover:text-brand-green hover:bg-green-50 text-xs">✓</button>
                    )}
                    <button onClick={() => setModal({ open: true, data: inst })} className="p-1.5 rounded-lg text-brand-text3 hover:text-brand-text hover:bg-brand-bg"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(inst.id)} className="p-1.5 rounded-lg text-brand-text3 hover:text-red-500 hover:bg-red-50"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, data: null })} title={modal.data?.id ? 'Editar Parcelamento' : 'Novo Parcelamento'}>
        <div className="space-y-4">
          <div><label className="label">Descrição</label><input className="input" value={modal.data?.desc ?? ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, desc: e.target.value } }))} placeholder="Ex: iPhone 15" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Valor da parcela</label><input type="number" step="0.01" className="input" value={modal.data?.valor ?? ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, valor: parseFloat(e.target.value) } }))} /></div>
            <div><label className="label">Total de parcelas</label><input type="number" className="input" value={modal.data?.total ?? ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, total: parseInt(e.target.value) } }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Parcelas pagas</label><input type="number" className="input" value={modal.data?.pagas ?? 0} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, pagas: parseInt(e.target.value) } }))} /></div>
            <div><label className="label">Vencimento</label><input type="date" className="input" value={modal.data?.venc ?? ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, venc: e.target.value } }))} /></div>
          </div>
          <div><label className="label">Categoria</label>
            <select className="input" value={modal.data?.cat ?? ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, cat: e.target.value } }))}>
              <option value="">Selecione</option>{CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
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

// ─── History Tab ──────────────────────────────────────────────────────────────

function HistoryTab() {
  const { data } = useApi<{ data: MonthlyData[] }>('/transactions/monthly');
  const monthly = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-bold font-sora text-brand-text mb-4">Histórico dos Últimos 6 Meses</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f2" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#7a9585' }} />
            <YAxis tick={{ fontSize: 11, fill: '#7a9585' }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => fmtBRL(v)} />
            <Legend />
            <Bar dataKey="receitas" name="Receitas" fill="#368547" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-brand-text3 text-xs border-b border-brand-bg">
              <th className="pb-3 text-left font-semibold">Mês</th>
              <th className="pb-3 text-right font-semibold">Receitas</th>
              <th className="pb-3 text-right font-semibold">Despesas</th>
              <th className="pb-3 text-right font-semibold">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-bg">
            {monthly.map((m) => (
              <tr key={m.mes}>
                <td className="py-3 font-medium text-brand-text">{m.mes}</td>
                <td className="py-3 text-right text-green-600 font-medium">{fmtBRL(m.receitas)}</td>
                <td className="py-3 text-right text-red-500 font-medium">{fmtBRL(m.despesas)}</td>
                <td className={`py-3 text-right font-bold ${m.saldo >= 0 ? 'text-brand-green' : 'text-red-500'}`}>{fmtBRL(m.saldo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

const TABS = [
  { id: 'overview', label: 'Visão Geral', icon: WalletIcon },
  { id: 'transactions', label: 'Transações', icon: ArrowTrendingUpIcon },
  { id: 'goals', label: 'Metas', icon: FlagIcon },
  { id: 'installments', label: 'Parcelas', icon: CreditCardIcon },
  { id: 'history', label: 'Histórico', icon: ClockIcon },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  if (isLoading || !user) return <PageLoader />;

  return (
    <div style={{ background: '#f0f4f2', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#003333' }} className="pb-6 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-sora text-white">Olá, {user.name.split(' ')[0]}! 👋</h1>
              <p className="text-white/60 text-sm mt-1">Seu painel financeiro pessoal</p>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-6 overflow-x-auto scrollbar-thin">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-brand-text'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'goals' && <GoalsTab />}
        {activeTab === 'installments' && <InstallmentsTab />}
        {activeTab === 'history' && <HistoryTab />}
      </div>
    </div>
  );
}
