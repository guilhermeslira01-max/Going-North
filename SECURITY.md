# Segurança — Going North

Checklist de hardening para ambiente de produção.

---

## 1. Subresource Integrity (SRI) — passo manual

Adicione o atributo `integrity` nos scripts de CDN em todos os HTMLs.
Execute os comandos abaixo no terminal para gerar os hashes:

```bash
# Chart.js 4.4.1
curl -sL https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

# Supabase JS (fixe uma versão específica antes)
curl -sL https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.X.X/dist/umd/supabase.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

Depois aplique no HTML:
```html
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"
  integrity="sha384-HASH_AQUI"
  crossorigin="anonymous">
</script>
```

**Importante:** para SRI funcionar, a versão do CDN deve ser pinada (`@2.49.1`, não `@2`).

---

## 2. Row Level Security (RLS) — rodar no Supabase SQL Editor

Acesse: **Supabase Dashboard → SQL Editor** e rode o script `rls-policies.sql`
(gerado na raiz do repositório).

Verifique também em **Authentication → Policies** que cada tabela tem:
- `SELECT` policy: `auth.uid() = user_id`
- `INSERT` policy: `auth.uid() = user_id`
- `UPDATE` policy: `auth.uid() = user_id`
- `DELETE` policy: `auth.uid() = user_id`

---

## 3. Variáveis e segredos

| Chave | Exposição | Status |
|---|---|---|
| `SUPABASE_ANON` | Pública (projetada para isso) | ✅ OK |
| `SUPABASE_URL` | Pública | ✅ OK |
| `service_role` key | **NUNCA expor no frontend** | ✅ Não está no código |

---

## 4. Revisão periódica

- Verificar CVEs das versões de CDN usadas a cada 3 meses
- Auditar as políticas de RLS após adicionar novas tabelas
- Checar se nenhum `.env` com segredos foi commitado: `git log --all --full-history -- "*.env"`
