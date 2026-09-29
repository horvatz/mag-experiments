# P05 — izvedbeni načrt

2026-09-25 · [Specifikacija in sledljivost R01–R12](spec.md) · [Projektna načela](../../../.specify/memory/constitution.md)

## Tehnični kontekst

Obstoječa aplikacija uporablja React 19.3, TypeScript 6, Vite 8, CSS in `lucide-react`; preverjanje zagotavljata ESLint in Playwright 1.63. Node 24, odvisnosti ter Chromium so nameščeni. Uporabimo obstoječe skripte in Playwright konfiguracijo, vključno s projektom `agent`; novih paketov, konfiguracij, strežnikov ali API-jev ne dodajamo.

`src/App.tsx` vsebuje `ProjectView`, ki bere opravila prek `useResource` in javnega `/api/projects/:id/tasks`. `App` ga že upodablja s `key={project.id}`. Pogled in podrobnosti določa obstoječa hash navigacija; sprememba teh parametrov ne odstrani `ProjectView`. `src/TaskBoard.tsx` že razvršča prejeto polje po stanjih in šteje njegove kartice. `src/TaskDetails.tsx` pridobi zapis po ID-ju ter ob zapiranju obnovi fokus. `src/styles.css` vsebuje potrjeni Folio in notranje drsenje obeh pogledov.

## Odločitve in tok podatkov

1. **Lokalno stanje v ProjectView (R01, R04, R05, R07, R08).** Dodamo tipizirano stanje velikosti (`all | 2 | 5 | 10`), filtra (`all | TaskStatus`) in strani, privzeto `(all, all, 1)`. Menjava velikosti ali filtra v istem obdelovalcu ponastavi stran na 1. Ohranimo projektni `key`: menjava projekta in reload dobita novo začetno stanje, preklop pogleda in dialog pa obstoječe. Ne uporabljamo učinkov za ponastavljanje, URL-ja ali trajne shrambe.
2. **En izračun za oba pogleda (R02, R05, R06).** Iz celotnega `tasks` najprej izvedemo stabilni `filter`, nato `slice` po formulah specifikacije. Izpeljanih polj ne shranjujemo kot dodatno stanje in izvornega polja ne spreminjamo. Preglednica preslika samo `visibleTasks`; `TaskBoard` prejme isto polje. Njegovo obstoječe združevanje in štetje že zagotavlja pravilen rezultat.
3. **Ločeni viri števcev (R11).** `counts`, značka skupnega števila in obstoječe skupno število končanih ostanejo vezani na `tasks`. Števci stolpcev se izračunajo iz prejetega odseka. Status straničenja uporablja dolžino filtriranega polja.
4. **Kontrole in status (R03, R09, R10).** V razdelek opravil, zunaj povezav opravil, dodamo označena HTML selecta, štiri gumbe `type="button"` in status s točnim dogovorjenim imenom/besedilom. Prva/prejšnja sta omogočeni le pred veljavno predhodno stranjo, naslednja/zadnja le pred naslednjo. Pri praznem rezultatu so vsi onemogočeni, status pa ima same ničle. Obdelovalci ohranijo veljavno številko strani tudi na robu.
5. **Prazni in neuspešni prikazi (R10, R12).** Kontrole in status obstajajo tudi po uspešnem branju praznega projekta. Preglednica loči prazen projekt od filtra brez zadetkov; tabla ohrani vse tri stolpce, tudi prazne. Obstoječe veje nalaganja/napake/ponovitve ostanejo. Ne uvajamo sprememb pri navigaciji med nalaganjem.
6. **Folio in dostopnost (R12).** Kontrole uporabljajo obstoječe barvne spremenljivke, nevtralne površine, robove in vidni fokus. Vrstice kontrol se prelamljajo pri ozkem zaslonu. Ohranjeni so navigacija, velikost stranskega menija, kartice, preglednica, `data-task-id`, dostopna imena in podrobnosti. Pri 390 pikah drsita samo notranja prikaza, ne cela stran.
7. **Obstoječi javni API (R12).** Straničenje/filtriranje sta izračuna v pomnilniku. `api.ts`, `useResource.ts`, skupni tipi in strežnik ne potrebujejo sprememb. Testne kontrole in razvojne pripomočke uporablja samo testni program.

## Datoteke in obseg posega

| Datoteka | Načrtovana sprememba |
| --- | --- |
| `src/App.tsx` | Stanje v ProjectView, filter/rez, kontrole, status, podatki za oba pogleda in prazen filtrirani rezultat. |
| `src/styles.css` | Omejeni slogi novih kontrol/statusa, prelamljanje in velikost elementov znotraj obstoječega Folio. |
| `tests/agent/P05.spec.ts` | Dodatni Playwright scenariji za vrzeli razvojnih testov, z uporabo dovoljenih testnih pripomočkov. |
| `docs/agent/P05/spec.md` | Posodobitev tabele sledljivosti z dejansko kodo, testi in izidi; zapis zgodovine. |
| `docs/agent/P05/tasks.md` | Naloge naslednjega koraka in označevanje izvedbe. |
| `docs/agent/P05/verification.md` ter dnevniki v isti mapi | Jedrnata dokazila ukazov, rezultatov, vizualnega pregleda in omejitev. |

`TaskBoard`, `TaskDetails` in navigacija so odvisnosti, katerih vedenje ohranimo; za opisano rešitev njihove spremembe niso potrebne. Dodatna arhitekturna razdelitev ni zahtevana.

## Načrt preverjanja

Lastni testi preverjajo uporabniško opazno vedenje, ID-je in zahtevke; ne uvažajo implementacije izračuna straničenja.

| Skupina lastnih testov | Pokritje in podatki |
| --- | --- |
| A01 — velikosti, vrstni red in navigacija | R01–R04, R09: 13 opravil v nenumeričnem izvornem vrstnem redu; vsi odseki pri 2/5/10, vse štiri smeri, krajša zadnja stran, prehod na `all`, ponastavitev z veljavne poznejše strani. |
| A02 — filtri, tabla in števci | R05, R06, R09, R11: mešana stanja, vsi filtri, ponastavitev strani, enaki ID-ji obeh pogledov, pravilni stolpci in nespremenjeni globalni števci. |
| A03 — ohranitev in ponastavitev | R07, R08: poznejša filtrirana stran, preklop obeh pogledov, podrobnosti po ID-ju in zapiranje z gumbom/Escape, menjava projekta in vrnitev, reload, URL in shramba. |
| A04 — prazni rezultati in en zapis | R03, R09, R10: oba prazna projekta, odsotno stanje filtra, odstranitev filtra, vse onemogočene smeri ter projekt z enim opravilom. |
| A05 — regresija podatkov in mobilni prikaz | R12 in ponovna kontrola R06/R11: drugačni ID-ji, enaki naslovi, Unicode/ločila, podrobnosti pravilnega zapisa, nič zapisovalnih zahtevkov in brez prelivanja pri 390 pikah v obeh pogledih. |

Uporabimo obstoječi razvojni `mount` za nadzorovane GET odgovore; testni program sme preveriti `/__test/state`, aplikacija ne. Preverjanja odsotnosti zapisov in nespremenjenih vhodnih podatkov vključimo v interakcijske scenarije. Širina 390 pik je nastavitev posameznega testa, ne sprememba konfiguracije.

Po implementaciji izvedemo `npm run lint`, `npm run build` (vključuje TypeScript) in `npm test` (skupni API/regresijski, razvojni ter lastni testi). Ukaze, izhodne kode in izide shranimo v dokumentacijo. Posnetka obeh relevantnih pogledov pri običajni in mobilni širini omogočita kratek vizualni pregled novih kontrol v Folio. Ob napaki popravimo dovoljeno kodo/test in ponovimo prizadeto preverjanje; nedostopnih končnih testov ne označujemo kot opravljenih.

## Zaporedje in tveganja

Najprej implementiramo stanje in skupni izračun, nato kontrole/prazne prikaze in sloge, zatem lastne teste ter izvedemo preverjanja. Zadnji korak dopolni dokazila in sledljivost vseh R01–R12. Posamezne naloge pripravi naslednji izrecno sproženi korak `$speckit-tasks`; ta načrt jih ne izvaja.

Glavna tveganja so rezanje pred filtrom, ločeno straničenje stolpcev, uporaba filtriranih podatkov za globalne števce, izguba stanja ob dialogu ter prelivanje kontrol na mobilnem zaslonu. Zgornja zasnova in A01–A05 jih neposredno preverjata. Infrastrukturnih nejasnosti ali potreb po novih odvisnostih ni; dejansko delovanje testnega okolja bo potrjeno šele ob zagonu testov. V fazi načrtovanja niso bili izvedeni implementacija, build ali testi.
