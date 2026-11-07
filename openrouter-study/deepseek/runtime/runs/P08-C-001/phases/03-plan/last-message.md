Korak `$speckit-plan` je zaključen.

**Ustvarjeno** — `docs/agent/P08/plan.md` (96 vrstic), po Lean veščini (prebrana `.specify/feature.json`, ustava in `spec.md`):

- **Tehnični kontekst**: React 19.3 / TS 6.0 / Vite 8.3, `lucide-react`, Node 24.11, Playwright 1.63; podatki samo prek obstoječega `GET /api/`; brez novih odvisnosti.
- **Skladnost z ustavo**: vseh pet načel izpolnjeno (Folio, obseg, `/api/`, sledljivost, resnično preverjanje).
- **Odločitve**: nov čisti modul `src/dueDates.ts` (predikati, `diffDays` z `Date.UTC`, števci, filtriranje); stanje `refDate`/`refInput`/`dueFilter` v `ProjectView`; kontrole (datum, izbirnik, `role=alert`); pet števcev `strong` z `aria-label="Število rokov <ključ>"` znotraj obstoječega `[aria-label="Pregled stanj opravil"]`; `visibleTasks` v preglednico in tablo; remount `key={project.id}` za ponastavitev ob menjavi projekta; slogi z obstoječimi spremenljivkami in odzivnimi mejami; lastni testi `tests/agent/dueDates.spec.ts` in `dueViews.spec.ts`.
- **Struktura datotek** in **tveganja**: mejni dnevi, prestopna leta, prazno polje, prepoved zapisov (`readonly` + `saveRequests`), nedostopni končni testi.

Ena uskladitev za kasneje: specifikacija v sledljivosti omenja `src/formatDate.ts` za aritmetiko, načrt pa logiko seli v novi `src/dueDates.ts`; povezavo bom popravil med implementacijo.

Čas: ~718 s od skupne omejitve še na voljo.
