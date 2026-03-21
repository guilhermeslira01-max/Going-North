'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { RoleBadge } from '@/components/ui/Badge';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/investimentos', label: 'Investimentos' },
  { href: '/educacao', label: 'Educação' },
  { href: '/noticias', label: 'Notícias' },
  { href: '/sobre', label: 'Sobre' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav style={{ background: '#003333' }} className="sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#368547' }}>
              <span className="text-white font-bold font-sora text-sm">GN</span>
            </div>
            <span className="text-white font-bold font-sora text-lg">Going North</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  pathname === link.href
                    ? 'text-white bg-white/15'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth area */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                    style={{ background: '#368547' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-white text-sm font-medium leading-none">{user.name.split(' ')[0]}</span>
                    <RoleBadge role={user.role} />
                  </div>
                  <ChevronDownIcon className="w-4 h-4 text-white/60" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-modal z-20 overflow-hidden py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-brand-text">{user.name}</p>
                        <p className="text-xs text-brand-text3 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-brand-text2 hover:bg-brand-bg"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                      >
                        Sair
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white/80 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/login?tab=register"
                  className="text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all hover:opacity-90"
                  style={{ background: '#368547' }}
                >
                  Começar grátis
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10" style={{ background: '#003333' }}>
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === link.href ? 'text-white bg-white/15' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/10">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ background: '#368547' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{user.name}</p>
                      <RoleBadge role={user.role} />
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="text-center text-white/80 text-sm font-medium px-4 py-2.5 rounded-xl border border-white/20"
                    onClick={() => setMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/login?tab=register"
                    className="text-center text-white font-semibold text-sm px-4 py-2.5 rounded-xl"
                    style={{ background: '#368547' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Começar grátis
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
