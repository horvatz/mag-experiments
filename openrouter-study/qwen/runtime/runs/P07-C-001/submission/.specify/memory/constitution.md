# Folio — Konstitucija

**Sprejeto:** 2026-10-30

## Projekt

- **Ime:** Folio (modri znak F)
- **Rezpozitorij:** \`mag-app\`
- **Namemb:** Sledenje opravil z ločenimi projekti

## Načela

1. **API-first:** Vse podatke berem in hranim prek javnega `/api/`. Testne kontrole `/__test/` uporabljam izključno za razvojne teste.

2. **Infrastruktura stabilna:** Strežnik, odvisnosti, skupni tipi v `shared/` in skupni testi v `tests/baseline.spec.ts`/`tests/api.spec.ts` ostajajo nespremenjeni.

3. **Številčne omejitve:** Odpravljam samo vmesnik v `src/`, lastne teste v `tests/agent/` in dokumentacijo v `docs/agent/`.

4. **Dizajn Folio:** Uporabljam potrjeni vizualni slog iz `docs/dizajn.md`: sistemsko pisavo, ozadje `#fbfbfd`, bele kartice, poudarek `#2f6dcc`, modro za izbiro in aktivna stanja.

5. **Odvisnosti od ID:** Preklop stanj (priljubljena opravila, filtri) deluje v celotni aplikaciji brez nepravilnih prekrškov.

6. **Lokalno stanje:** Vse spremembe priljubljenih in filtrov so lokalne podatke ne spreminjam.

## Neodvisna pravila

- Ne dopuščaš sprememb začetnih podatkov, strežnika in skupne infrastrukture.
- Ne ustvarjaš novih zapisovalnih API-jev ali veščin.
- Vsaka naloga sicer spremeni samo dovoljena območja.
