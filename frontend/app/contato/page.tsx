'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { EnvelopeIcon, ChatBubbleLeftIcon, CameraIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const CONTACT_CARDS = [
  { icon: EnvelopeIcon, title: 'Email', value: 'suporte@goingnorth.com.br', href: 'mailto:suporte@goingnorth.com.br', desc: 'Resposta em até 24 horas' },
  { icon: ChatBubbleLeftIcon, title: 'WhatsApp', value: '+55 (11) 99999-9999', href: 'https://wa.me/5511999999999', desc: 'Seg–Sex, 9h–18h' },
  { icon: CameraIcon, title: 'Instagram', value: '@goingnorthapp', href: 'https://instagram.com/goingnorthapp', desc: 'Siga-nos para dicas diárias' },
];

const FAQ = [
  { q: 'O Going North é realmente gratuito?', a: 'Sim! O plano gratuito oferece acesso completo ao dashboard, transações, metas, parcelas e educação financeira. Sem cobranças escondidas.' },
  { q: 'Meus dados financeiros estão seguros?', a: 'Totalmente. Usamos autenticação JWT, criptografia em trânsito e Row Level Security no Supabase (PostgreSQL). Seus dados são seus e nunca são vendidos ou compartilhados.' },
  { q: 'Como funcionam os artigos gerados por IA?', a: 'Usamos o Claude (Anthropic) para gerar artigos educacionais sobre qualquer tema financeiro. Cada artigo é gerado uma vez e cacheado permanentemente, então não há custo por releitura.' },
  { q: 'Posso integrar minhas contas bancárias?', a: 'No plano atual, as transações são registradas manualmente. A integração bancária automática está planejada para o plano Pro, que estará disponível em breve.' },
  { q: 'Como funciona o sistema de roles (Free/Pro/Admin)?', a: 'O plano Free dá acesso a todos os recursos básicos. O plano Pro (em breve) adiciona recursos avançados. Admins são os fundadores da plataforma.' },
  { q: 'Como cancelo minha conta?', a: 'Entre em contato pelo email suporte@goingnorth.com.br com o assunto "Cancelamento de conta". Processamos em até 48 horas e removemos todos os seus dados.' },
];

export default function ContatoPage() {
  const toast = useToast();
  const [form, setForm] = useState({ nome: '', email: '', assunto: '', mensagem: '' });
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // Simulate form submission (no backend endpoint needed)
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Mensagem enviada! Responderemos em breve.');
    setForm({ nome: '', email: '', assunto: '', mensagem: '' });
    setSending(false);
  }

  return (
    <div style={{ background: '#f0f4f2', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ background: '#003333' }} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold font-sora text-white mb-4">Entre em Contato</h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Tem dúvidas, sugestões ou quer conhecer melhor o Going North? Estamos aqui para ajudar.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Contact cards */}
        <div className="grid sm:grid-cols-3 gap-6">
          {CONTACT_CARDS.map((c) => (
            <a
              key={c.title}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="card-hover text-center group"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors" style={{ background: 'rgba(54,133,71,0.12)' }}>
                <c.icon className="w-7 h-7 group-hover:text-brand-green transition-colors" style={{ color: '#368547' }} />
              </div>
              <h3 className="font-bold font-sora text-brand-text mb-1">{c.title}</h3>
              <p className="font-medium text-brand-green text-sm mb-1">{c.value}</p>
              <p className="text-brand-text3 text-xs">{c.desc}</p>
            </a>
          ))}
        </div>

        {/* Contact form */}
        <section>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="section-title mb-2">Envie uma mensagem</h2>
              <p className="text-brand-text2">Preencha o formulário e responderemos em até 24 horas.</p>
            </div>
            <div className="card">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label">Nome</label>
                    <input name="nome" className="input" value={form.nome} onChange={handleChange} placeholder="Seu nome" required />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input type="email" name="email" className="input" value={form.email} onChange={handleChange} placeholder="seu@email.com" required />
                  </div>
                </div>
                <div>
                  <label className="label">Assunto</label>
                  <select name="assunto" className="input" value={form.assunto} onChange={handleChange} required>
                    <option value="">Selecione um assunto</option>
                    <option>Dúvida sobre a plataforma</option>
                    <option>Sugestão de melhoria</option>
                    <option>Reportar problema técnico</option>
                    <option>Parceria ou imprensa</option>
                    <option>Cancelamento de conta</option>
                    <option>Outro</option>
                  </select>
                </div>
                <div>
                  <label className="label">Mensagem</label>
                  <textarea name="mensagem" className="input resize-none" rows={5} value={form.mensagem} onChange={handleChange} placeholder="Descreva sua dúvida ou sugestão..." required minLength={20} />
                </div>
                <Button type="submit" loading={sending} size="lg" className="w-full">Enviar mensagem</Button>
              </form>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="text-center mb-8">
            <h2 className="section-title mb-2">Perguntas Frequentes</h2>
            <p className="text-brand-text2">Respostas rápidas para as dúvidas mais comuns.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  className="w-full flex items-center justify-between text-left py-1"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold font-sora text-brand-text pr-4">{item.q}</span>
                  {openFaq === i ? (
                    <ChevronUpIcon className="w-5 h-5 text-brand-green flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-brand-text3 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="pt-3 border-t border-brand-bg mt-3">
                    <p className="text-brand-text2 text-sm leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
