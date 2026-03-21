'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { CheckIcon, EyeIcon, EyeSlashIcon, ChartBarIcon, AcademicCapIcon, ChartPieIcon, NewspaperIcon } from '@heroicons/react/24/outline';

const FEATURES = [
  { icon: ChartBarIcon, text: 'Dashboard financeiro completo' },
  { icon: AcademicCapIcon, text: 'Educação financeira com IA' },
  { icon: ChartPieIcon, text: 'Gestão de investimentos' },
  { icon: NewspaperIcon, text: 'Notícias do mercado em tempo real' },
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Mínimo 8 caracteres', ok: password.length >= 8 },
    { label: 'Letra maiúscula', ok: /[A-Z]/.test(password) },
    { label: 'Número', ok: /\d/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ['bg-red-400', 'bg-yellow-400', 'bg-green-400'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score - 1] : 'bg-gray-200'}`} />
        ))}
      </div>
      <div className="space-y-1">
        {checks.map((c) => (
          <div key={c.label} className={`flex items-center gap-1.5 text-xs ${c.ok ? 'text-green-600' : 'text-brand-text3'}`}>
            <CheckIcon className={`w-3 h-3 ${c.ok ? 'text-green-500' : 'text-gray-300'}`} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, user } = useAuth();
  const toast = useToast();

  const [tab, setTab] = useState<'login' | 'register'>(
    searchParams.get('tab') === 'register' ? 'register' : 'login'
  );
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Forgot password
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success('Bem-vindo de volta!');
      router.push('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (regPassword.length < 8) {
      toast.error('Senha deve ter no mínimo 8 caracteres');
      return;
    }
    setLoading(true);
    try {
      await register(regEmail, regPassword, regName);
      toast.success('Conta criada! Verifique seu email para confirmar.');
      setTab('login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Email de recuperação enviado!');
      setShowForgot(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: '#003333' }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#368547' }}>
            <span className="text-white font-bold font-sora">GN</span>
          </div>
          <span className="text-white font-bold font-sora text-xl">Going North</span>
        </Link>

        <div>
          <h2 className="text-4xl font-bold font-sora text-white leading-tight mb-6">
            Transforme sua relação com o dinheiro
          </h2>
          <p className="text-white/60 text-lg leading-relaxed mb-10">
            Dashboard inteligente, educação financeira com IA e controle total das suas finanças.
          </p>
          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(54,133,71,0.25)' }}>
                  <f.icon className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-white/80 font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-sm">© 2025 Going North. Todos os direitos reservados.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12" style={{ background: '#f0f4f2' }}>
        <div className="w-full max-w-md">
          <Link href="/" className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#368547' }}>
              <span className="text-white font-bold font-sora text-sm">GN</span>
            </div>
            <span className="font-bold font-sora text-brand-text text-lg">Going North</span>
          </Link>

          {showForgot ? (
            <div>
              <h1 className="text-2xl font-bold font-sora text-brand-text mb-2">Recuperar senha</h1>
              <p className="text-brand-text2 text-sm mb-6">Informe seu email para receber as instruções.</p>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="seu@email.com" required />
                </div>
                <Button type="submit" loading={loading} className="w-full">Enviar instruções</Button>
                <button type="button" onClick={() => setShowForgot(false)} className="w-full text-center text-sm text-brand-text3 hover:text-brand-text2">
                  Voltar ao login
                </button>
              </form>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold font-sora text-brand-text mb-6">
                {tab === 'login' ? 'Entrar na sua conta' : 'Criar conta gratuita'}
              </h1>

              {/* Tabs */}
              <div className="flex rounded-xl p-1 mb-8" style={{ background: 'rgba(0,0,0,0.05)' }}>
                {(['login', 'register'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                      tab === t ? 'bg-white text-brand-text shadow-sm' : 'text-brand-text3 hover:text-brand-text2'
                    }`}
                  >
                    {t === 'login' ? 'Entrar' : 'Criar conta'}
                  </button>
                ))}
              </div>

              {/* Login */}
              {tab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="label">Email</label>
                    <input type="email" className="input" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="seu@email.com" required />
                  </div>
                  <div>
                    <label className="label">Senha</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        className="input pr-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Sua senha"
                        required
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text3">
                        {showPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-brand-green hover:underline">
                    Esqueci minha senha
                  </button>
                  <Button type="submit" loading={loading} className="w-full" size="lg">Entrar</Button>
                </form>
              )}

              {/* Register */}
              {tab === 'register' && (
                <form onSubmit={handleRegister} className="space-y-5">
                  <div>
                    <label className="label">Nome completo</label>
                    <input type="text" className="input" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Seu nome" required minLength={2} />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input type="email" className="input" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="seu@email.com" required />
                  </div>
                  <div>
                    <label className="label">Senha</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        className="input pr-10"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Crie uma senha forte"
                        required
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text3">
                        {showPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                    <PasswordStrength password={regPassword} />
                  </div>
                  <p className="text-xs text-brand-text3">
                    Ao criar uma conta você concorda com nossos Termos de Uso e Política de Privacidade.
                  </p>
                  <Button type="submit" loading={loading} className="w-full" size="lg">Criar conta grátis</Button>
                </form>
              )}

              <p className="text-center text-sm text-brand-text3 mt-6">
                {tab === 'login' ? (
                  <>Não tem conta?{' '}<button onClick={() => setTab('register')} className="text-brand-green font-semibold hover:underline">Criar gratuitamente</button></>
                ) : (
                  <>Já tem conta?{' '}<button onClick={() => setTab('login')} className="text-brand-green font-semibold hover:underline">Entrar</button></>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
