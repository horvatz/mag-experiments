## ✅ Konstituzija ustvarjena

Sem ustvaril specifikacijski dokument `docs/agent/P04/spec.md` za pilot P04.

### 📋 Povzetek ustvarjenega:

| Naslov | Opomba |
|--------|--------|
| **Projekt** | Mag Admin Console - P04 |
| **Funkcionalnost** | Razvrščanje opravil z dvema ključema |
| **Sekundarni ključi** | title, assignee, status, dueDate |
| **Zapisovanje** | Brez API zapisovanja |
| **Prazen projekt** | Podprl |

### 📐 Algoritam razvrščanja

1. **Primarni ključ** (prioritetno):
   - Default: `original`
   - Alternativa: `title` z NFD normalizacijo, odstranitvijo diakritikov in lowercase
   - Ponovno zaporedje za: `assignee`, `status`, `dueDate`

2. **Sekundarni ključ** (primarni enak, potem druginski):
   - **Default:** `title` (NFD normalizirano)
   - Drugi: `assignee`, `status`, `dueDate`

3. **Smer**: `asc` po defaultu, `desc` obratno

4. **Stabilnost**: Enake vrednosti → `originalIndex`

### 🔄 Naslednji koraki

- `$speckit-taskstoissues` - Preveri specifikacijo
- `$speckit-implement` - Implementiraj specifikacijo
- `$speckit-converge` - Preveri sledljivost

Preveri še časovni budget: `node task/time-budget.mjs`
