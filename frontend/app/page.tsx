'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChartBarIcon,
  AcademicCapIcon,
  NewspaperIcon,
  ChartPieIcon,
  ShieldCheckIcon,
  BoltIcon,
  StarIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

const ALL_TESTIMONIALS = [
  { name: 'Mariana Costa', role: 'Analista de TI', text: 'Finalmente consegui organizar minhas finanças! O dashboard é incrível.' },
  { name: 'Rafael Souza', role: 'Professor', text: 'A trilha educacional mudou como vejo os investimentos. Super recomendo.' },
  { name: 'Fernanda Lima', role: 'Empreendedora', text: 'Controlo todas as minhas despesas em um único lugar. Perfeito!' },
  { name: 'Lucas Almeida', role: 'Desenvolvedor', text: 'Interface linda e funcional. Melhor plataforma financeira que já usei.' },
  { name: 'Juliana Mendes', role: 'Médica', text: 'O módulo de investimentos me ajudou a diversificar minha carteira.' },
  { name: 'Carlos Oliveira', role: 'Contador', text: 'Excelente para acompanhar metas financeiras de longo prazo.' },
  { name: 'Beatriz Santos', role: 'Advogada', text: 'Consigo planejar meus gastos mensais com muito mais clareza agora.' },
  { name: 'André Rodrigues', role: 'Engenheiro', text: 'As notícias financeiras integradas são um diferencial incrível.' },
  { name: 'Camila Ferreira', role: 'Designer', text: 'Visual muito bonito e intuitivo. Uso todo dia!' },
  { name: 'Paulo Nunes', role: 'Gestor Comercial', text: 'Finalmente uma plataforma que explica investimentos de forma simples.' },
  { name: 'Thais Barbosa', role: 'Psicóloga', text: 'Me ajudou a sair das dívidas e começar a investir. Gratidão!' },
  { name: 'Gustavo Lopes', role: 'Arquiteto', text: 'O controle de parcelas é exatamente o que eu precisava.' },
];

const STEPS = [
  { num: '01', title: 'Crie sua conta', desc: 'Cadastro gratuito em menos de 1 minuto. Sem cartão de crédito.' },
  { num: '02', title: 'Organize suas finanças', desc: 'Registre transações, metas e parcelas no seu dashboard pessoal.' },
  { num: '03', title: 'Aprenda e invista', desc: 'Trilhas educacionais e análise de investimentos com dados reais.' },
];

const FEATURES = [
  { icon: ChartBarIcon, title: 'Dashboard Completo', desc: 'Visão 360° das suas finanças com gráficos interativos, resumo mensal e histórico detalhado.' },
  { icon: AcademicCapIcon, title: 'Educação Financeira IA', desc: 'Artigos gerados por inteligência artificial sobre qualquer tema financeiro, com trilhas estruturadas.' },
  { icon: ChartPieIcon, title: 'Gestão de Investimentos', desc: 'Acompanhe sua carteira com cotações em tempo real da B3, FIIs, cripto e renda fixa.' },
  { icon: NewspaperIcon, title: 'Notícias Financeiras', desc: 'Feed atualizado com as principais notícias do mercado financeiro brasileiro.' },
  { icon: ShieldCheckIcon, title: 'Segurança Total', desc: 'Seus dados protegidos com autenticação JWT, criptografia e RLS no banco de dados.' },
  { icon: BoltIcon, title: 'Rápido e Confiável', desc: 'Cache inteligente para uma experiência fluida sem chamadas desnecessárias à API.' },
];

const PLANS = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: 'para sempre',
    features: ['Dashboard completo', 'Controle de transações', 'Metas financeiras', 'Parcelas', 'Trilhas educacionais', 'Notícias do mercado'],
    cta: 'Começar grátis',
    href: '/login?tab=register',
    featured: false,
  },
  {
    name: 'Pro',
    price: 'R$ 29',
    period: '/mês',
    badge: 'Em breve',
    features: ['Tudo do plano Gratuito', 'Relatórios exportáveis', 'Artigos ilimitados IA', 'Análise avançada de carteira', 'Suporte prioritário', 'Integração bancária'],
    cta: 'Em breve',
    href: '#',
    featured: true,
  },
];

function DashboardPreview() {
  const { user } = useAuth();
  const demoTransactions = [
    { desc: 'Salário', valor: 5800, tipo: 'receita', cat: 'Salário', data: '01/03' },
    { desc: 'Aluguel', valor: 1500, tipo: 'despesa', cat: 'Moradia', data: '05/03' },
    { desc: 'Supermercado', valor: 420, tipo: 'despesa', cat: 'Alimentação', data: '08/03' },
    { desc: 'Freelance', valor: 1200, tipo: 'receita', cat: 'Freelance', data: '12/03' },
  ];
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10" style={{ background: '#0f2318' }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <span className="ml-2 text-white/40 text-xs">going north — dashboard</span>
      </div>
      <div className="p-5">
        <p className="text-white/60 text-xs mb-3">
          {user ? `Olá, ${user.name.split(' ')[0]}! ` : 'Visualização demo — '}
          <span style={{ color: '#4ade80' }} className="font-medium">março 2025</span>
        </p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Receitas', value: 'R$ 7.000', color: '#4ade80' },
            { label: 'Despesas', value: 'R$ 2.890', color: '#f87171' },
            { label: 'Saldo', value: 'R$ 4.110', color: '#c8a96e' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <p className="text-white/50 text-xs">{s.label}</p>
              <p className="font-bold font-sora text-sm mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {demoTransactions.map((t, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div>
                <p className="text-white/80 text-xs font-medium">{t.desc}</p>
                <p className="text-white/30 text-xs">{t.cat} · {t.data}</p>
              </div>
              <span className={`text-xs font-bold ${t.tipo === 'receita' ? 'text-green-400' : 'text-red-400'}`}>
                {t.tipo === 'receita' ? '+' : '-'}R$ {t.valor.toLocaleString('pt-BR')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const testimonials = useMemo(() => {
    const shuffled = [...ALL_TESTIMONIALS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, []);

  return (
    <div style={{ background: '#f0f4f2' }}>
      {/* Hero */}
      <section style={{ background: '#003333' }} className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: '#368547' }} />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ background: '#c8a96e' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium mb-6"
                style={{ background: 'rgba(54,133,71,0.2)', color: '#4ade80' }}>
                <BoltIcon className="w-4 h-4" />
                Plataforma 100% gratuita
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-sora text-white leading-tight mb-6">
                Organize suas{' '}
                <span style={{ color: '#4ade80' }}>finanças</span>{' '}
                e invista com{' '}
                <span style={{ color: '#c8a96e' }}>inteligência</span>
              </h1>
              <p className="text-white/70 text-lg leading-relaxed mb-8">
                Dashboard completo, educação financeira com IA, gestão de investimentos e notícias do mercado — tudo em um só lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <>
                    <Link href="/dashboard" className="btn-primary text-base px-8 py-4">Ir para o Dashboard</Link>
                    <Link href="/educacao" className="text-center text-white font-semibold text-base px-8 py-4 rounded-xl border-2 border-white/30 hover:border-white/60 transition-colors">Aprender mais</Link>
                  </>
                ) : (
                  <>
                    <Link href="/login?tab=register" className="btn-primary text-base px-8 py-4">Começar gratuitamente</Link>
                    <Link href="/login" className="text-center text-white font-semibold text-base px-8 py-4 rounded-xl border-2 border-white/30 hover:border-white/60 transition-colors">Já tenho conta</Link>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-6 mt-8 text-white/50 text-sm">
                <span className="flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-green-400" /> Sem cartão</span>
                <span className="flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-green-400" /> 100% gratuito</span>
                <span className="flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-green-400" /> Setup em 1 min</span>
              </div>
            </div>
            <div><DashboardPreview /></div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Como funciona</h2>
            <p className="text-brand-text2 text-lg max-w-2xl mx-auto">Em três passos simples você começa a transformar sua vida financeira.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.num} className="card-hover relative">
                <div className="text-6xl font-bold font-sora mb-4" style={{ color: '#368547', opacity: 0.15 }}>{step.num}</div>
                <h3 className="text-xl font-bold font-sora text-brand-text mb-3">{step.title}</h3>
                <p className="text-brand-text2 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: '#e8efe9' }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Tudo que você precisa</h2>
            <p className="text-brand-text2 text-lg max-w-2xl mx-auto">Uma plataforma completa para todas as suas necessidades financeiras.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-hover flex gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(54,133,71,0.12)' }}>
                  <f.icon className="w-6 h-6" style={{ color: '#368547' }} />
                </div>
                <div>
                  <h3 className="font-bold font-sora text-brand-text mb-2">{f.title}</h3>
                  <p className="text-brand-text2 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">O que dizem nossos usuários</h2>
            <p className="text-brand-text2 text-lg">Histórias reais de quem transformou suas finanças.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card-hover">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-4 h-4" fill="#c8a96e" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  ))}
                </div>
                <p className="text-brand-text2 leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#368547' }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-text text-sm">{t.name}</p>
                    <p className="text-brand-text3 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section style={{ background: '#e8efe9' }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Planos simples e transparentes</h2>
            <p className="text-brand-text2 text-lg">Comece grátis e evolua conforme sua necessidade.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {PLANS.map((plan) => (
              <div key={plan.name} className="card relative" style={plan.featured ? { boxShadow: '0 0 0 2px #c8a96e, 0 8px 32px rgba(15,35,24,0.12)' } : {}}>
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge-admin text-xs px-3 py-1">{plan.badge}</span>
                )}
                <div className="mb-6">
                  <h3 className="font-bold font-sora text-xl text-brand-text mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold font-sora text-brand-text">{plan.price}</span>
                    <span className="text-brand-text3">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-brand-text2">
                      <CheckIcon className="w-4 h-4 flex-shrink-0" style={{ color: '#368547' }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`w-full text-center block py-3 rounded-xl font-semibold transition-all ${plan.featured ? 'cursor-not-allowed opacity-60' : 'btn-primary'}`}
                  style={plan.featured ? { background: 'rgba(200,169,110,0.15)', color: '#c8a96e' } : {}}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ background: '#003333' }} className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-sora text-white mb-4">
            Pronto para ir ao <span style={{ color: '#4ade80' }}>norte</span>?
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Junte-se a milhares de brasileiros que já estão organizando suas finanças com o Going North.
          </p>
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login?tab=register" className="btn-primary text-base px-10 py-4">Criar conta gratuita</Link>
              <Link href="/sobre" className="text-center text-white/80 hover:text-white font-semibold px-8 py-4 border-2 border-white/30 rounded-xl hover:border-white/60 transition-colors">Saber mais</Link>
            </div>
          ) : (
            <Link href="/dashboard" className="btn-primary text-base px-10 py-4">Acessar meu Dashboard</Link>
          )}
        </div>
      </section>
    </div>
  );
}
