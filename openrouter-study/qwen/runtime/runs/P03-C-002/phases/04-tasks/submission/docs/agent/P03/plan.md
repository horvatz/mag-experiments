# Načrt P03: Iskanje in sestavljeni filtri

## Tehnični kontekst

**Tehnični piling:** React 18, TypeScript, Vite, Lucide React za ikone.
**Odvisnosti:** `lucide-react`, `playwright` za teste.
**Arhitektura:** Komponenten React, globalni `shared/types.ts`, API preko `src/api.ts`.
**Javni API:** `/api/projects/*/tasks` za branje opravil.

## Odločitve

1. **Stanje filtrov**: Globalni custom hook `useSearchFilter()` za iskalni vnos, status in assignee filter, ter cleanup gumb.
2. **Komponente**: Novi `SearchFilter.tsx` za iskanje in filtri, integracija z obstoječim `App.tsx`.
3. **Logika filtriranja**: Funkcija `filterTasks()` v isti datoteki, uporabi Unicode NFD za normalizacijo po R02.
4. **Styling**: Minimalni CSS za novo strukturo v obstoječem `src/styles.css`, brez premajhnanega dizajna.
5. **Testi**: Lastni testi v `tests/agent/P03.spec.ts` za vsako zahtevo R01–R12.
6. **Navigacija**: Filtri se resetirajo ob preklopu projekta; filtri se ne shranjujejo v URL po R08.

## Arhitektura in datoteke

```
src/
├── App.tsx
├── components/
│   ├── SearchFilter.tsx        # novi: iskalnik + filtri + cleanup
│   └── (ostale komponente ostanejo nespremenjene)
├── useResource.ts
├── styles.css
└── api.ts

tests/agent/
└── P03.spec.ts                 # novi: 12 testov za R01-R12

docs/agent/P03/
├── spec.md
├── plan.md
└── tasks.md                    # ustvari za implementacijo
```

## Potek implementacije

1. Ustvari `src/components/SearchFilter.tsx`: iskalni input, dva select elementa, gumb za čiščenje.
2. Ustvari `useSearchFilter.tsx` custom hook: uporabi `searchQuery`, `statusFilter`, `assigneeFilter`, logika `filterTasks()`.
3. V `App.tsx` integriraj filter kontrol in uporabi `useSearchFilter`.
4. Uredi obseg prikaza: samo zadetki se prikažejo v tabeli ali tabli.
5. Dodaj UI za sporočilo "Ni zadetkov" po spec R10.
6. Uredi `src/styles.css` za minimalne razlike v layoutu.
7. Pripravi 12 testov v `tests/agent/P03.spec.ts` za vsako zahtevo.
8. Preveri za vsak test, da pravilno preverja zahtevo.
9. Preveri ozko širino in bralni podrobnosti po R12.
10. Končni pregled in preverjanje vseh zahtev.
