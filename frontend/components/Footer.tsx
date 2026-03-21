import Link from 'next/link';

export function Footer() {
  return (
    <footer style={{ background: '#003333' }} className="text-white/70 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#368547' }}>
                <span className="text-white font-bold font-sora text-sm">GN</span>
              </div>
              <span className="text-white font-bold font-sora text-lg">Going North</span>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              Sua plataforma completa de educação e organização financeira pessoal.
            </p>
          </div>

          {/* Plataforma */}
          <div>
            <h4 className="text-white font-semibold font-sora text-sm mb-4">Plataforma</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/investimentos', label: 'Investimentos' },
                { href: '/educacao', label: 'Educação' },
                { href: '/noticias', label: 'Notícias' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="text-white font-semibold font-sora text-sm mb-4">Empresa</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/sobre', label: 'Sobre nós' },
                { href: '/contato', label: 'Contato' },
                { href: '/login', label: 'Criar conta' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-white font-semibold font-sora text-sm mb-4">Contato</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="mailto:suporte@goingnorth.com.br" className="hover:text-white transition-colors">
                  suporte@goingnorth.com.br
                </a>
              </li>
              <li>
                <a href="https://wa.me/5511999999999" className="hover:text-white transition-colors">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href="https://instagram.com/goingnorth" className="hover:text-white transition-colors">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Going North. Todos os direitos reservados.</p>
          <p>Educação financeira para todos os brasileiros 🇧🇷</p>
        </div>
      </div>
    </footer>
  );
}
