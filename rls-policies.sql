-- ============================================================
-- Going North — Row Level Security (RLS) Policies
-- Execute este script no Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Cole e execute
-- ============================================================

-- ── 1. Habilitar RLS em todas as tabelas ──────────────────
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments  ENABLE ROW LEVEL SECURITY;

-- ── 2. Remover políticas antigas (evitar duplicatas) ──────
DROP POLICY IF EXISTS "profiles_select"     ON profiles;
DROP POLICY IF EXISTS "profiles_insert"     ON profiles;
DROP POLICY IF EXISTS "profiles_update"     ON profiles;
DROP POLICY IF EXISTS "profiles_delete"     ON profiles;

DROP POLICY IF EXISTS "transactions_select" ON transactions;
DROP POLICY IF EXISTS "transactions_insert" ON transactions;
DROP POLICY IF EXISTS "transactions_update" ON transactions;
DROP POLICY IF EXISTS "transactions_delete" ON transactions;

DROP POLICY IF EXISTS "goals_select"        ON goals;
DROP POLICY IF EXISTS "goals_insert"        ON goals;
DROP POLICY IF EXISTS "goals_update"        ON goals;
DROP POLICY IF EXISTS "goals_delete"        ON goals;

DROP POLICY IF EXISTS "installments_select" ON installments;
DROP POLICY IF EXISTS "installments_insert" ON installments;
DROP POLICY IF EXISTS "installments_update" ON installments;
DROP POLICY IF EXISTS "installments_delete" ON installments;

DROP POLICY IF EXISTS "investments_select"  ON investments;
DROP POLICY IF EXISTS "investments_insert"  ON investments;
DROP POLICY IF EXISTS "investments_update"  ON investments;
DROP POLICY IF EXISTS "investments_delete"  ON investments;

-- ── 3. PROFILES ───────────────────────────────────────────
-- Usuário lê apenas o próprio perfil
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Usuário cria apenas o próprio perfil
CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Usuário atualiza apenas o próprio perfil
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Usuário deleta apenas o próprio perfil (LGPD)
CREATE POLICY "profiles_delete" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- ── 4. TRANSACTIONS ───────────────────────────────────────
CREATE POLICY "transactions_select" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_update" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "transactions_delete" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- ── 5. GOALS ─────────────────────────────────────────────
CREATE POLICY "goals_select" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "goals_insert" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goals_update" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "goals_delete" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- ── 6. INSTALLMENTS (parcelas) ───────────────────────────
CREATE POLICY "installments_select" ON installments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "installments_insert" ON installments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "installments_update" ON installments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "installments_delete" ON installments
  FOR DELETE USING (auth.uid() = user_id);

-- ── 7. INVESTMENTS ───────────────────────────────────────
CREATE POLICY "investments_select" ON investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "investments_insert" ON investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "investments_update" ON investments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "investments_delete" ON investments
  FOR DELETE USING (auth.uid() = user_id);

-- ── 8. Verificar resultado ───────────────────────────────
-- Execute para confirmar que as políticas foram criadas:
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
