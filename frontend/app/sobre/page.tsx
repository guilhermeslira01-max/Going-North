'use client';

import Link from 'next/link';
import { ChartBarIcon, AcademicCapIcon, ChartPieIcon, NewspaperIcon, ShieldCheckIcon, HeartIcon, UsersIcon, LightBulbIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

const MISSION_CARDS = [
  { icon: ChartBarIcon, title: 'Dashboard Inteligente', desc: 'Visão completa das suas finanças em um só lugar, com gráficos e análises em tempo real.' },
  { icon: AcademicCapIcon, title: 'Educação com IA', desc: 'Conteúdo educacional personalizado gerado por inteligência artificial para cada nível de conhecimento.' },
  { icon: ChartPieIcon, title: 'Gestão de Investimentos', desc: 'Ferramentas profissionais para monitorar e otimizar sua carteira de investimentos.' },
  { icon: NewspaperIcon, title: 'Notícias em Tempo Real', desc: 'Acesso às principais notícias do mercado financeiro com indicadores atualizados.' },
];

const VALUES = [
  { icon: ShieldCheckIcon, title: 'Transparência', desc: 'Somos claros em tudo que fazemos. Sem cobranças escondidas, sem letras miúdas.' },
  { icon: HeartIcon, title: 'Acessibilidade', desc: 'Educação financeira de qualidade deve ser para todos, não apenas para quem tem dinheiro.' },
  { icon: LightBulbIcon, title: 'Inovação', desc: 'Usamos a tecnologia mais avançada, incluindo IA, para oferecer a melhor experiência.' },
  { icon: UsersIcon, title: 'Comunidade', desc: 'Acreditamos que juntos chegamos mais longe. Nossa plataforma conecta pessoas com objetivos similares.' },
  { icon: RocketLaunchIcon, title: 'Resultados', desc: 'Focamos em resultados reais para nossos usuários, não apenas em métricas de vaidade.' },
];

const AUDIENCE = [
  { emoji: '🎓', title: 'Jovens adultos', desc: 'Que estão começando sua jornada financeira e querem aprender da forma certa.' },
  { emoji: '💼', title: 'Profissionais', desc: 'Que têm renda mas não sabem como otimizar seus investimentos.' },
  { emoji: '👨‍👩‍👧', title: 'Famílias', desc: 'Que precisam organizar as finanças domésticas e planejar o futuro.' },
  { emoji: '🚀', title: 'Empreendedores', desc: 'Que querem separar as finanças pessoais das empresariais.' },
];

const GOALS = [
  { label: 'Usuários ativos', current: 1200, target: 10000, color: '#368547' },
  { label: 'Artigos gerados com IA', current: 3500, target: 50000, color: '#c8a96e' },
  { label: 'Metas financeiras criadas', current: 4800, target: 100000, color: '#3b82f6' },
];

const DIFFERENTIALS = [
  { emoji: '🤖', title: 'IA integrada', desc: 'Única plataforma que usa IA para gerar conteúdo educacional financeiro personalizado.' },
  { emoji: '💰', title: 'Gratuito de verdade', desc: 'Funcionalidades completas sem custo. Sem freemium enganoso.' },
  { emoji: '🔒', title: 'Seus dados, sua privacidade', desc: 'Arquitetura segura com RLS no banco e JWT. Seus dados nunca são vendidos.' },
  { emoji: '📊', title: 'Dados reais', desc: 'Cotações B3, indicadores BCB e notícias atualizadas com cache inteligente.' },
];

export default function SobrePage() {
  return (
    <div style={{ background: '#f0f4f2', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ background: '#003333' }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <h1 className="text-4xl font-bold font-sora text-white mb-6">
                Nascemos para levar você ao{' '}
                <span style={{ color: '#4ade80' }}>norte</span>
              </h1>
              <p className="text-white/70 text-lg leading-relaxed mb-8">
                O Going North surgiu da frustração de ver tantos brasileiros sem acesso a ferramentas financeiras de qualidade. Acreditamos que organização financeira e educação não deveriam ser luxo.
              </p>
              <div className="flex gap-4">
                <Link href="/login?tab=register" className="btn-primary">Começar agora</Link>
                <Link href="/contato" className="text-white/80 hover:text-white font-semibold px-6 py-3 rounded-xl border border-white/30 hover:border-white/60 transition-colors">Falar conosco</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '1.200+', label: 'Usuários ativos' },
                { value: 'R$ 2M+', label: 'Gerenciados na plataforma' },
                { value: '3.500+', label: 'Artigos gerados com IA' },
                { value: '4.8★', label: 'Avaliação média' },
              ].map((s) => (
                <div key={s.label} className="p-5 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <p className="text-3xl font-bold font-sora text-white mb-1">{s.value}</p>
                  <p className="text-white/50 text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* Mission */}
        <section>
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">Nossa Missão</h2>
            <p className="text-brand-text2 text-lg max-w-2xl mx-auto">
              Democratizar o acesso à educação e organização financeira de qualidade para todos os brasileiros.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MISSION_CARDS.map((c) => (
              <div key={c.title} className="card-hover text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(54,133,71,0.12)' }}>
                  <c.icon className="w-7 h-7" style={{ color: '#368547' }} />
                </div>
                <h3 className="font-bold font-sora text-brand-text mb-2">{c.title}</h3>
                <p className="text-brand-text2 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section>
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">Nossos Valores</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="card-hover flex gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(200,169,110,0.15)' }}>
                  <v.icon className="w-5 h-5" style={{ color: '#c8a96e' }} />
                </div>
                <div>
                  <h3 className="font-bold font-sora text-brand-text mb-1">{v.title}</h3>
                  <p className="text-brand-text2 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Audience */}
        <section>
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">Para quem somos</h2>
            <p className="text-brand-text2 text-lg max-w-xl mx-auto">O Going North foi construído para qualquer brasileiro que quer melhorar sua relação com o dinheiro.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AUDIENCE.map((a) => (
              <div key={a.title} className="card text-center">
                <div className="text-4xl mb-4">{a.emoji}</div>
                <h3 className="font-bold font-sora text-brand-text mb-2">{a.title}</h3>
                <p className="text-brand-text2 text-sm leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Goals */}
        <section>
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">Nossas Metas</h2>
            <p className="text-brand-text2 text-lg max-w-xl mx-auto">Trabalhamos com metas claras e transparentes para nosso crescimento.</p>
          </div>
          <div className="card space-y-8">
            {GOALS.map((g) => {
              const pct = Math.min((g.current / g.target) * 100, 100);
              return (
                <div key={g.label}>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold font-sora text-brand-text">{g.label}</span>
                    <span className="text-brand-text2 text-sm">{g.current.toLocaleString('pt-BR')} / {g.target.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: '#f0f4f2' }}>
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: g.color }} />
                  </div>
                  <p className="text-brand-text3 text-xs mt-1">{pct.toFixed(1)}% da meta</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Differentials */}
        <section>
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">Por que o Going North?</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {DIFFERENTIALS.map((d) => (
              <div key={d.title} className="card-hover flex gap-4">
                <div className="text-3xl">{d.emoji}</div>
                <div>
                  <h3 className="font-bold font-sora text-brand-text mb-2">{d.title}</h3>
                  <p className="text-brand-text2 text-sm leading-relaxed">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: '#003333' }} className="rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold font-sora text-white mb-4">Faça parte da nossa história</h2>
          <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">Junte-se à comunidade Going North e comece sua jornada rumo à liberdade financeira.</p>
          <Link href="/login?tab=register" className="btn-primary text-base px-10 py-4">Criar conta gratuita</Link>
        </section>
      </div>
    </div>
  );
}
