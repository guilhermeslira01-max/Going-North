'use client';

import { useState } from 'react';
import { usePublicApi, useApi } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { apiPost } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PageLoader, Spinner } from '@/components/ui/Spinner';
import { MagnifyingGlassIcon, BookOpenIcon, AcademicCapIcon, SparklesIcon } from '@heroicons/react/24/outline';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Track {
  id: string; nome: string; descricao: string; cor: string;
  topicos: { id: number; titulo: string; topic: string }[];
}

interface GlossaryTerm { termo: string; definicao: string; }

const FEATURED_ARTICLES = [
  { titulo: 'Como montar sua reserva de emergência', topic: 'reserva de emergência finanças pessoais', icon: '🛡️' },
  { titulo: 'Tesouro Direto para iniciantes', topic: 'Tesouro Direto para iniciantes', icon: '📈' },
  { titulo: 'FIIs: renda passiva imobiliária', topic: 'fundos imobiliários FIIs como investir', icon: '🏢' },
  { titulo: 'Como sair das dívidas de vez', topic: 'como quitar dívidas e sair do vermelho', icon: '💪' },
];

// ─── Article Modal ────────────────────────────────────────────────────────────

function ArticleModal({ isOpen, onClose, topic, title }: { isOpen: boolean; onClose: () => void; topic: string; title: string }) {
  const { user } = useAuth();
  const toast = useToast();
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function loadArticle() {
    if (loaded || !user) return;
    setLoading(true);
    try {
      const res = await apiPost<{ data: { html: string } }>('/education/ask', { topic });
      setHtml(res.data.html);
      setLoaded(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao gerar artigo');
    } finally {
      setLoading(false);
    }
  }

  // Load when modal opens
  if (isOpen && !loaded && !loading) {
    loadArticle();
  }

  function handleClose() {
    onClose();
    // Don't reset — cache the article in memory during session
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="xl">
      {!user ? (
        <div className="text-center py-8">
          <SparklesIcon className="w-12 h-12 mx-auto mb-4 text-brand-text3" />
          <p className="text-brand-text2 mb-4">Faça login para acessar artigos gerados por IA.</p>
          <a href="/login" className="btn-primary">Entrar</a>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Spinner size="lg" />
          <p className="text-brand-text2 text-sm animate-pulse">Gerando artigo com IA...</p>
        </div>
      ) : html ? (
        <div className="article-content" dangerouslySetInnerHTML={{ __html: html }} />
      ) : null}
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EducacaoPage() {
  const { data: tracksData, isLoading: tracksLoading } = usePublicApi<{ data: Track[] }>('/education/tracks');
  const tracks = tracksData?.data ?? [];

  const [glossarySearch, setGlossarySearch] = useState('');
  const [glossaryLetra, setGlossaryLetra] = useState('');
  const glossaryParams = new URLSearchParams();
  if (glossarySearch) glossaryParams.set('busca', glossarySearch);
  if (glossaryLetra) glossaryParams.set('letra', glossaryLetra);
  const { data: glossaryData } = usePublicApi<{ data: GlossaryTerm[] }>(`/education/glossary?${glossaryParams}`);
  const glossary = glossaryData?.data ?? [];

  const [searchTopic, setSearchTopic] = useState('');
  const [articleModal, setArticleModal] = useState<{ open: boolean; topic: string; title: string }>({ open: false, topic: '', title: '' });

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  function openArticle(topic: string, title: string) {
    setArticleModal({ open: true, topic, title });
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchTopic.trim()) return;
    openArticle(searchTopic, `Artigo: ${searchTopic}`);
  }

  return (
    <div style={{ background: '#f0f4f2', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ background: '#003333' }} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4"
              style={{ background: 'rgba(54,133,71,0.2)', color: '#4ade80' }}>
              <SparklesIcon className="w-4 h-4" />
              Educação financeira com IA
            </div>
            <h1 className="text-4xl font-bold font-sora text-white mb-4">Aprenda finanças com inteligência</h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Trilhas estruturadas, artigos gerados por IA e glossário completo para dominar o mundo financeiro.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-10">
            {[
              { value: '3', label: 'Trilhas' },
              { value: '18', label: 'Tópicos' },
              { value: '20+', label: 'Termos no glossário' },
            ].map((s) => (
              <div key={s.label} className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <p className="text-2xl font-bold font-sora text-white">{s.value}</p>
                <p className="text-white/50 text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-green"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                placeholder="Pesquise qualquer tema financeiro..."
                value={searchTopic}
                onChange={(e) => setSearchTopic(e.target.value)}
              />
            </div>
            <Button type="submit">Gerar artigo</Button>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Featured articles */}
        <section>
          <h2 className="section-title mb-6">Artigos em Destaque</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURED_ARTICLES.map((a) => (
              <button
                key={a.titulo}
                onClick={() => openArticle(a.topic, a.titulo)}
                className="card-hover text-left group"
              >
                <div className="text-3xl mb-3">{a.icon}</div>
                <h3 className="font-bold font-sora text-brand-text text-sm group-hover:text-brand-green transition-colors">{a.titulo}</h3>
                <p className="text-brand-text3 text-xs mt-2">Clique para ler →</p>
              </button>
            ))}
          </div>
        </section>

        {/* Learning tracks */}
        <section>
          <h2 className="section-title mb-6">Trilhas de Aprendizado</h2>
          {tracksLoading ? (
            <PageLoader />
          ) : (
            <div className="space-y-8">
              {tracks.map((track) => (
                <div key={track.id} className="card">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: track.cor }}>
                      <AcademicCapIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold font-sora text-brand-text text-lg">{track.nome}</h3>
                      <p className="text-brand-text3 text-sm">{track.descricao}</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {track.topicos.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => openArticle(t.topic, t.titulo)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:shadow-sm transition-all text-left"
                        style={{ background: '#f0f4f2' }}
                      >
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: track.cor }}>
                          {t.id}
                        </div>
                        <span className="text-brand-text2 text-sm font-medium">{t.titulo}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Glossary */}
        <section>
          <h2 className="section-title mb-6">Glossário Financeiro</h2>
          <div className="card">
            {/* Search + alphabet filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text3" />
                <input
                  className="input pl-9 py-2 text-sm"
                  placeholder="Buscar termo..."
                  value={glossarySearch}
                  onChange={(e) => { setGlossarySearch(e.target.value); setGlossaryLetra(''); }}
                />
              </div>
            </div>

            {/* Alphabet */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              <button
                onClick={() => setGlossaryLetra('')}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${!glossaryLetra ? 'text-white' : 'text-brand-text3 hover:bg-brand-bg'}`}
                style={!glossaryLetra ? { background: '#368547' } : {}}
              >
                Todos
              </button>
              {ALPHABET.map((l) => (
                <button
                  key={l}
                  onClick={() => { setGlossaryLetra(l === glossaryLetra ? '' : l); setGlossarySearch(''); }}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${glossaryLetra === l ? 'text-white' : 'text-brand-text3 hover:bg-brand-bg'}`}
                  style={glossaryLetra === l ? { background: '#368547' } : {}}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="divide-y divide-brand-bg">
              {glossary.map((term) => (
                <div key={term.termo} className="py-4 flex gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ background: '#368547' }}>
                    {term.termo.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold font-sora text-brand-text">{term.termo}</p>
                    <p className="text-brand-text2 text-sm mt-1">{term.definicao}</p>
                  </div>
                </div>
              ))}
              {glossary.length === 0 && (
                <p className="py-6 text-center text-brand-text3 text-sm">Nenhum termo encontrado</p>
              )}
            </div>
          </div>
        </section>
      </div>

      <ArticleModal
        isOpen={articleModal.open}
        onClose={() => setArticleModal((m) => ({ ...m, open: false }))}
        topic={articleModal.topic}
        title={articleModal.title}
      />
    </div>
  );
}
