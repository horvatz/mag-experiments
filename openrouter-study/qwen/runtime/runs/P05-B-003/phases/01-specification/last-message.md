## Zaključek faze: Priprava specifikacije

**Specifikacija je pripravljena in shranjena v:** `docs/agent/specification.md`

**Najpomembnejši dokumenti:**
- `docs/agent/specification.md` – 96 vrstic, vsebuje zahteve R01–R12 z definicijami vmesnika, pogoji in načini preverjanja.

**Ključni pogoji:**
- `page_size`: "all" | "2" | "5" | "10", privzeto "all" (R01, R04)
- `filter_status`: "all" | "todo" | "in_progress" | "done", privzeto "all" (R05)
- Status element z `aria-label="Stanje straničenja"` in tekst "Stran X od Y. Prikazano A–B od N." (R09, R10)
- Status se resetira na stran 1 ob spremembi velikosti ali filtra
- Pregled stanj šteje vse opravila, tabela pa le prikazana

**Predpostavke:**
- API le bere `/api/projects/{id}/tasks` (ne uvažajo testnega `/__test/`)
- Stanje ni v `localStorage` ali URL, projekti ne shranjujo
- Filtriranje ne sortira, uporablja vrstni red iz API-ja

**Naslednja dejanja:**
Za implementerja (sedaj je tvoja vrsta):
1. Implementiraj straničenje in filtriranje po specifikaciji
2. Dodaj lastne teste v `tests/agent/` (obvezno preverjanje)
3. Razširi pregled `docs/agent/review.md` in `review.json`
4. Pripravite predajo implementacije za pregled
