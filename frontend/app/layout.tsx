import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Going North — Educação e Organização Financeira',
  description:
    'Plataforma completa de educação e organização financeira pessoal. Dashboard, investimentos, metas, parcelas e mais.',
  keywords: ['finanças pessoais', 'investimentos', 'educação financeira', 'going north'],
  openGraph: {
    title: 'Going North',
    description: 'Sua plataforma de educação financeira pessoal',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: '12px',
                background: '#fff',
                color: '#0f2318',
                boxShadow: '0 4px 20px rgba(15,35,24,0.12)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
