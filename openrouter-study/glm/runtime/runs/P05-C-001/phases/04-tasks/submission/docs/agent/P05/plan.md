# Načrt P05 — Straničenje in filter stanja

**Različica:** 1.0.0 | **Datum načrta:** 2026-10-09

## Tehnični kontekst

Aplikacija je React 19, TypeScript in Vite z nameščenimi odvisnostmi. Strežnik, javni `/api/` vmesnik, skupni tipi, Playwright nastavitev in odvisnosti ostanejo nespremenjeni. Uporabniški vmesnik trenutno bere opravila v `src/App.tsx`, tabla je v `src/TaskBoard.tsx`, skupne gradnike pa v `src/components.tsx`; obstoječi izgled je v `src/styles.css`. Stanja `ProjectView` se zaradi `key={project.id}` že ponastavijo ob menjavi projekta, kar je primeren izhodiščni mehanizem za zahtevano resetiranje. Zahteve so v [`task/instructions.md`](../../../task/instructions.md), specifikacija pa v [`spec.md`](./spec.md).

## Odločitve in arhitektura

1. Uvedi označevalna tipa za velikost strani in filter v novi datoteki `src/pagination.ts`: `PageSize = 'all' | '2' | '5' | '10'` ter `StatusFilter = 'all' | TaskStatus`. Hkrati dodaj čiste izpeljene funkcije, ki iz izvirnega polja, filtra in velikosti izračunajo filtrirano polje, število strani, veljavno trenutno stran in odsek. `all` obravnavaj kot eno stran pri nepraznem rezultatu; prazen rezultat ima stran `0`.

2. Stanja `filter`, `pageSize` in `page` hrani v `ProjectView` (`src/App.tsx`) z `useState`. Pri menjava projekta komponenta dobi nov `key`, zato se stanja ponastavijo na privzete vrednosti `all`, `all` in prvo stran. Stanja ne zapisuj v URL ali trajno shrambo in jih ne dviguj v globalni stanje.

3. Izpeljevanje izvedi vedno v istem vrstnem redu: najprej filtriraj po statusu in ohrani izvirno zaporedje, nato izračunaj število strani, nato izberi trenutni odsek. Sprememba filtra ali velikosti nastavi stran na prvo stran novega rezultata. Preklop pogleda in podrobnosti ne spremeni nobenega od treh stanj.

4. Nadzore postavi v obstoječi razdelih `Opravila`: HTML selecta `Velikost strani` in `Filter strani` ter štiri gumbi `Prva stran`, `Prejšnja stran`, `Naslednja stran` in `Zadnja stran`. Neveljavna premika onemogoči z `disabled`; ob praznem rezultatu so onemogočeni vsi štirje. Status z `role="status"` in `aria-label="Stanje straničenja"` izpiše natančno zahtevano besedilo.

5. Enak trenutni odsek posreduj tako preglednici kot tabli. Preglednica dobi novo spremenljivko namesto neposrednega `tasks.map`. `TaskBoard` dobi odsek kot obstoječi prop `tasks` in ga razdeli v obstoječe stolpce po stanju; stolpci se ne straničijo ločeno. Pregled stanj ostane izračunan iz celotnega nefiltriranega polja.

6. Dizajn dopolni z obstoječimi gradniki Folio in spremenljivkami v `src/styles.css`: pripeti razpored, kontrolke na ožjem zaslonu, viden fokus, notranje drsenje obstoječih prikazov in širina, ki ne razširi strani pri 390 pik. Ne dodajaj ikon, razporednih sprememb ali novega oblikovnega jezika, ki niso nujni za funkcionalnost.

## Datoteke in meje sprememb

| Pot | Načrtovana sprememba |
| --- | --- |
| `src/pagination.ts` | Nov modul z označevalnimi tipi in čistimi izpeljevalnimi funkcijami. |
| `src/App.tsx` | Stanja straničenja, nadzori, status, enoten odsek za oba prikaza in uporaba celotnega polja za pregled stanj. |
| `src/TaskBoard.tsx` | Uporaba že izbranega odseka; ohranjena obstoječa razdelitev po stanjih in števci stolpcev. |
| `src/styles.css` | Minimalni Folio slogi za nove nadzore, odzivnost in dostopnost. |
| `tests/agent/p05.spec.ts` | Lastni Playwright testi za R01–R12 z javnim API-jem in nadzorovanimi odzivi. |
| `docs/agent/P05/spec.md` | Po izvedbi posodabljanje sledljivosti in rezultatov testov, brez podvajanja zahtev. |

Ne spreminjaj strežnika, `shared/types.ts`, skupnih testov, nastavitev, odvisnosti, uradnih predlog, testnih kontrol ali API-jev. Testi ne smejo uvesti aplikacijskih uvozov iz `/__test/`; nadzorovane odzive uporabljajo izključno testi prek strežniških konfiguracij.

## Preverjanje in predaja

1. Najprej izvedi ciljne `tests/agent/p05.spec.ts`, nato `npm run build` in skupne teste z `npm run check`.
2. Preveri izvorne zahteve z vsemi velikostmi (`all`, `2`, `5`, `10`), vsemi filtri, praznim projektom, praznim filtrom, enim opravilom in več kot desetimi opravili.
3. Zagotovi, da straničenje ne sproži `PATCH` ali drugega zapisovalnega klica, da stanje ni v URL-ju ali trajni shrambi ter da ostanejo delujoči obstoječi projekti, povezave, podrobnosti in ozki prikaz.
4. Rezultate dejanskih zagonov, vir izida, morebitne neuspehe in neizvedene dele zapiši v sledljivost specifikacije ter v končno predajo. Neizvedenih testov ne navajaj kot uspešnih.

## Izključitve

Ta načrt ne dodaja novih odvisnosti, globalnega upravljanja stanja, trajne shrambe, URL-parametrov straničenja, zapisovalnih API-jev ali sprememb skupne infrastrukture. Ne obravnava vedenja med nezaključenim nalaganjem ali sočasnimi spremembami podatkov, ker zahteve P05 tega ne razširjajo.

