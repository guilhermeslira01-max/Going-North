/* ═══════════════════════════════════════════════════════════
   GOING NORTH — js/shared.js
   Funções utilitárias compartilhadas entre todas as páginas.
   Depende de: js/config.js (SUPABASE_URL, SUPABASE_ANON, WORKER_URL, IS_DEV)
               e de `sb` (cliente Supabase auth) definido em cada página.
   ═══════════════════════════════════════════════════════════ */

/* ── Usuário atual (preenchido por initAuth em cada página) ── */
window.currentUser = null;

/* ═══════════════════════════════════════════════════════════
   ROLES
   ═══════════════════════════════════════════════════════════ */
function isAdmin() { return window.currentUser?.role === 'admin'; }
function isPro()   { return ['admin','pro'].includes(window.currentUser?.role); }
function isFree()  { return window.currentUser?.role === 'free'; }

function applyRoleBadge() {
  const badge = document.getElementById('nav-role-badge');
  if (!badge) return;
  if (isAdmin()) {
    badge.textContent = 'Admin';
    badge.className = 'nav-role-badge badge-admin';
    badge.style.display = 'inline-flex';
  } else if (isPro()) {
    badge.textContent = 'Pro';
    badge.className = 'nav-role-badge badge-pro';
    badge.style.display = 'inline-flex';
  }
}

/* ═══════════════════════════════════════════════════════════
   LOGOUT
   ═══════════════════════════════════════════════════════════ */
async function doLogout() {
  cacheClearAll();
  if (!IS_DEV) {
    try { await sb.auth.signOut(); } catch(e) { /* ignora erros de rede */ }
  }
  window.location.href = 'login.html';
}

/* ═══════════════════════════════════════════════════════════
   FORMATAÇÃO DE MOEDA
   ═══════════════════════════════════════════════════════════ */
function fmt(v) {
  const safe = isNaN(parseFloat(v)) ? 0 : parseFloat(v);
  return 'R$ ' + Math.abs(safe).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtSigned(v) {
  const safe = isNaN(parseFloat(v)) ? 0 : parseFloat(v);
  return (safe >= 0 ? '+ R$ ' : '− R$ ') + Math.abs(safe).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

/* ═══════════════════════════════════════════════════════════
   SANITIZAÇÃO HTML (previne XSS)
   ═══════════════════════════════════════════════════════════ */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ═══════════════════════════════════════════════════════════
   TOAST
   ═══════════════════════════════════════════════════════════ */
function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  if (!t) return;
  document.getElementById('toast-msg').textContent = msg;
  const icon = t.querySelector('.toast-icon');
  if (icon) {
    icon.textContent = isError ? '✕' : '✓';
    icon.style.color = isError ? 'var(--red)' : 'var(--green)';
  }
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ═══════════════════════════════════════════════════════════
   MODAIS
   ═══════════════════════════════════════════════════════════ */
function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

/* Fecha modal ao clicar no overlay — chame após o DOM estar pronto */
function initModalOverlays() {
  document.querySelectorAll('.modal-overlay').forEach(o =>
    o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); })
  );
}

/* ═══════════════════════════════════════════════════════════
   CACHE LOCAL — 24h por user_id
   ═══════════════════════════════════════════════════════════ */
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas em ms

function cacheKey(name) {
  const uid = window.currentUser?.id || 'anon';
  return `gn_cache_${uid}_${name}`;
}
function cacheSet(name, data) {
  try {
    localStorage.setItem(cacheKey(name), JSON.stringify({ data, ts: Date.now() }));
  } catch(e) { /* quota excedida */ }
}
function cacheGet(name) {
  try {
    const raw = localStorage.getItem(cacheKey(name));
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(cacheKey(name)); return null; }
    return data;
  } catch(e) { return null; }
}
function cacheInvalidate(...names) {
  names.forEach(n => { try { localStorage.removeItem(cacheKey(n)); } catch(e) {} });
}
function cacheClearAll() {
  const uid = window.currentUser?.id || 'anon';
  Object.keys(localStorage)
    .filter(k => k.startsWith(`gn_cache_${uid}_`))
    .forEach(k => localStorage.removeItem(k));
}
