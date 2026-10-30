# Načrt P07: Priljubljena opravila in trajna shramba

## Tehnični kontekst

- Aplikacija je React 19 + TypeScript + Vite; prisotni so `lucide-react`, Playwright, ESLint in TypeScript.
- Projekti in opravila beri prek obstoječega `/api/` (`src/useResource.ts` in `src/api.ts`). Ne spreminjaj strežnika, skupnih tipov, odvisnosti ali nastavitev.
- Ohrani potrjeni Folio iz `docs/dizajn.md` in obstoječe slogovne spremenljivke v `src/styles.css`.
- Stanje priljubljenih je lokalno v brskalniku; ni API za shranjevanje.

## Odločitve in struktura

1. **Pripomoček za shrambo — `src/useFavorites.ts`**
   - Ustvari React hook za `localStorage` ključ `folio:favorites:v1`.
   - Implementiraj `load`, `persist`, preklop ID-ja, odstranitev ID-jev trenutnega projekta, stanje napake in poslušanje dogodka `storage`.
   - Validiraj izključno `{version:1,ids:[...]}`, kjer so `ids` nizi; podvojene vrednosti obravnava kot eno, zapis pa razvrsti po UTF-16.
   - Napake branja ali pisanja zajemi z `try/catch`; aplikacija ostane uporabna v pomnilniku in prikaže dostopno opozorilo.

2. **Skupno stanje in filter — `src/App.tsx`**
   - Priljubljene hraniti globalno (na ravni `App` oz. projektnega pogleda z obstojom med projektoma), filter pa lokalno za trenutni projekt.
   - Ob menjavi projekta ali osvežitvi nastavi filter na neizklopljen (`false`).
   - Pred prikazom izračunaj vidna opravila: brez filtra vsa opravila trenutnega projekta, s filtrom samo `T_p ∩ F` v izvornem vrstnem redu.
   - Dodaj statusni element `role=status`, `aria-label=Število priljubljenih` z besedilom `Priljubljeno: X od M.`, kjer sta X in M vezana na celoten trenutni projekt.
   - Dodaj checkbox `Prikaži le priljubljena` in gumb `Odstrani priljubljene tega projekta`; slednji je onemogočen brez priljubljenih trenutnega projekta.

3. **Vrstice in kartice — `src/App.tsx`, `src/TaskBoard.tsx`**
   - Vsaka vrstica in kartica dobi ločen gumb `Priljubljeno opravilo <id>` z `aria-pressed`, postavljen izven obstoječe povezave.
   - Prenesi ID-je in preklop v `TaskBoard`; ohrani `data-task-id`, dostopna imena pogledov/stolpcev in obstoječo navigacijo.
   - Števci stolpcev table naj štejejo filtrirana, torej vidna opravila.
   - Prazen filtriran prikaz kaže `Ni priljubljenih opravil.` in omogoča izklop filtra.

4. **Sledljivost**
   - Po vsakem pomembnem delu posodeni `docs/agent/P07/spec.md` v stolpcu izvedbe, da sklicuje dejanske datoteke in teste.
   - Dokumenti ostanejo povezani in brez podvajanja vsebine.

## Testni in izvedbeni vrstni red

1. Dodaj `src/useFavorites.ts` z validacijo, kanoničnim zapisom, dogodkom `storage` in obravnavo izjem.
2. V `src/App.tsx` poveži pripomoček, filter, števec, kontrole in filtriranje.
3. V `src/TaskBoard.tsx` dodaj gumb priljubljenega na kartice in ohrani obstoječo strukturo.
4. V `src/styles.css` dopolni obstoječe gradnike: kontrola, status, opozorilo in priljubljeni gumb z vidnim fokom.
5. Dodaj lastne brskalniške teste v `tests/agent/` za R01–R12: preklop, kanonična shramba, validacija, filter, projekti, dogodek `storage`, napaka shrambe, dostopnost in odsotnost API zahtev.
6. Poženi ukaze za preverjanje in rezultate ter morebitne popravke takoj zapiši v specifikacijo.

## Meje

- Ne spreminjaj strežnika, javnih podatkovnih tipov, odvisnosti ali testne infrastrukture.
- Ne uporabljaj testnih kontrol `/__test__/` iz aplikacije.
- Ne dodajaj zunanjih meritev ali funkcij zunaj R01–R12.
- Ne širi ekrana na 390 px; dovoli notranje drsenje preglednice in table.
