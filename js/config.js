/* ═══════════════════════════════════════════════════════════
   GOING NORTH — js/config.js
   Constantes globais de configuração.
   Inclua este arquivo antes de qualquer outro script da app.
   ═══════════════════════════════════════════════════════════ */

/* ── Supabase ── */
const SUPABASE_URL  = 'https://qesurszlqesjbtcpnjwz.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlc3Vyc3pscWVzamJ0Y3Buand6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTI4NTYsImV4cCI6MjA4ODM4ODg1Nn0.K12Lek882wI3Y4jEkZdxjKDrpeWxye_24phlc0XbsHo';

/* ── Cloudflare Worker (proxy Supabase + IA) ── */
const WORKER_URL = 'https://goingnorth.goingnorthbusiness.workers.dev';

/* ── Modo desenvolvimento (bypass de auth para preview local) ──
   TODO: remover quando houver ambiente de staging dedicado        */
const IS_DEV = location.protocol === 'file:'
  || location.hostname === 'localhost'
  || location.hostname === '127.0.0.1';
