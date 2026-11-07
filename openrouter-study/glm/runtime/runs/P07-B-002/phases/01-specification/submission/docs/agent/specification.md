# Specifikacija P07: Priljubljena opravila in trajna shramba

## Problem in kontekst

Uporabnik želi v Foliju označiti posamezna opravila kot priljubljena, ohraniti izbor po osvežitvi in pregledati samo priljubljena opravila trenutnega projekta. Izhodišče že omogoča nalaganje prek `/api/`, navigacijo med projekti, preklop med preglednico in tablo ter podrobnosti opravila po ID-ju. Rešitev doda lokalno stanje priljubljenih ID-jev; ne dodaja novih API-jev in ne spreminja podatkov opravil.

## Vhodi, dejanja in izidi

### Podatkovni model

- API ostane nespremenjen: `GET /api/projects`, `GET /api/projects/<projectId>/tasks` in `GET /api/tasks/<taskId>`.
- Tipi ostanejo nespremenjeni. Opravilo ima `id`, `projectId`, naslov, opis, stanje, odgovorno osebo in rok; projekt ima `id` in ime.
- Trajna shramba uporablja izključno ključ `folio:favorites:v1` z JSON obliko `{"version":1,"ids":[...]}`.
- `ids` v shrambi so enkratni nizi, razvrščeni po UTF-16. Naslovi, opisi, imena projektov ali druga polja opravil se ne shranjujejo.
- Aplikacija ohrani globalno množico priljubljenih ID-jev. Filtriranje je lokalno stanje trenutnega pogleda projekta.

### Stanje in dejanja

Naj bo `F` množica vseh priljubljenih ID-jev, `T` opravila trenutnega projekta v vrstnem redu iz API-ja in `filter` boolean.

- Privzeto: `F = ∅`, `filter = false`.
- Vidna opravila so `filter ? [task ∈ T : task.id ∈ F] : T`, ohranjeno v izvornem vrstnem redu `T`.
- Preklop priljubljenosti opravila `id` pomeni `F' = id ∈ F ? F \ {id} : F ∪ {id}`, nato poskusaj zapisati shemo v shrambo.
- `Odstrani priljubljene tega projekta` pomeni `F' = F \ {task.id : task ∈ T}`. ID-ji drugih projektov in neznani ID-ji ostanejo.
- Zamenjava projekta ali osvežitev pomenita `filter = false`; globalna množica `F` se ohrani oz. ponovno naloži iz shrambe.
- Projekti so lahko prazni; pravila ne smejo biti odvisna od števila opravil ali enakih naslovov.

### Veljavnost shrambe

Pri nalaganju in ob dogodku `storage`:

1. Preberi `localStorage["folio:favorites:v1"]`.
2. Manjkajoča vrednost ali `null` pomeni `F = ∅`.
3. Razčleni JSON. Neveljaven JSON, ne-objekt, `version !== 1`, manjkajoči `ids`, ne-seznam `ids` ali katerikoli ne-niz v `ids` pomenijo `F = ∅`.
4. Podvojene nize obravnavaj kot eno vrednost. Neznane ID-je ohrani v `F`; ne ustvarjaj opravil zanje.
5. Urejeno množico shrani v stanje, ne pa nazaj v `localStorage` ob nalaganju ali dogodku `storage`.

Ob vsaki spremembi iz uporabniškega dejanja poskusi zapisati veljaven JSON. Če branje vrže izjemo, uporabi `F = ∅`; če pisanje vrže izjemo, ohrani novo stanje v pomnilniku. V obeh primerih prikaže dostopno opozorilo z besedo `shramba`; ne odpove.

### Dostopnost in videz

- Vsako opravilo v preglednici in tabli ima lasten gumb z dostopnim imenom `Priljubljeno opravilo <id>` in `aria-pressed="true"` ali `"false"`. Gumb je zunaj povezave na opravilo; klik ne odpre podrobnosti.
- Checkbox ima dostopno ime `Prikaži le priljubljena` in privzeto vrednost `false`.
- Gumb `Odstrani priljubljene tega projekta` je onemogočen, ko trenutni projekt nima nobenega priljubljenega opravila.
- Status ima `role="status"`, `aria-label="Število priljubljenih"` in besedilo `Priljubljeno: X od M.`. `X = |{task.id : task ∈ T, task.id ∈ F}|`, `M = |T|`; obe vrednosti se nanašata na celoten trenutni projekt tudi med filtrom.
- Napaka shrambe ima `role="alert"` in vsebuje besedo `shramba`.
- Ohrani `data-task-id` na vrsticah preglednice in karticah table, dostopna imena obstoječih pogledov/stolpcev ter `aria-label="Pregled stanj opravil"`.
- Na širini 390 pik se celotna stran ne sme razširiti vodoravno; notranje drsenje preglednice in table je dovoljeno.

## Zahteve in sprejemni pogoji

| Zahteva | Sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsak prikazano opravilo ima svoj gumb po pravilu zgoraj. Klik spremeni le ID tega gumba, tudi če imata dve opravili enak naslov; dialog se ne odpre. | Dejanski test z dvema opraviloma z enakim naslovom in različnima ID-jema. |
| R02 | Zapis ima dogovorjeno shemo, ID-ji so enkratni nizi v UTF-16 vrstnem redu, opravilna polja se ne shranjujejo. | Preveri vsebino `localStorage` po več preklopih, vključno z Unicode in ločili. |
| R03 | Osvežitev obnovi veljavne shranjene ID-je. Podvojitve se prečiščijo, neznani ID-ji ostanejo globalno, ne ustvarijo pa novih kartic ali vrstic. | Seediraj shrambo z veljavnim, podvojenim in neznanim ID-jem ter osveži. |
| R04 | Vsaka neveljavna oblika ali manjkajoči ključ začne s prazno množico, ne povzroči napake aplikacije in ne sproži povratnega zapisa shrambe. | Parameterizirani primeri neveljavnega JSON/versije/`ids` ter opazovanje `setItem`. |
| R05 | Filter je privzeto izklopljen. Vklop prikaže le priljubljena opravila trenutnega projekta v izvornem API vrstnem redu. | Test z več projekti, spremenjenim vhodnim vrstnim redom in preklopom projekta. |
| R06 | Preklop priljubljenosti med filtrom takoj posodobi seznam. Brez vidnih opravil se izpiše `Ni priljubljenih opravil.`; checkbox in gumbi ostanejo uporabni. | Preklopi priljubljenost z aktivnim filtrom ter preveri prazen seznam in kontrole. |
| R07 | Preglednica in tabla uporabljata isti `F` in `filter`; preklop pogleda ju ohrani. Podrobnost se še vedno odpre po pravilnem ID-ju iz katerega koli pogleda. | Izvedi preklope, preveri obe različici in odprtje podrobnosti. |
| R08 | Zamenjava projekta ohrani globalni `F` in ponastavi `filter = false`; enako velja po osvežitvi. | Označi opravila v obeh projektih, zamenjaj projekt in osveži. |
| R09 | Gumb za odstranitev pobriše le ID-je opravil trenutnega projekta. ID-ji drugih projektov in neznani ID-ji ostanejo; gumb je onemogočen brez priljubljenih v trenutnem projektu. | Seediraj enega ID-ja iz vsakega projekta in neznanega ID-ja, izvedi odstranitev in preveri shrambo. |
| R10 | Status šteje priljubljena in vsa opravila celotnega trenutnega projekta tudi med filtrom. Števci stolpcev table štejejo le trenutno vidna opravila. | Preveri status in stolpce pred/po filtru ter po preklopu priljubljenosti. |
| R11 | `storage` za pravi ključ takoj uskladi `F` po istih validacijskih pravilih; `null` izprazni, drugi ključ se ignorira, povratnega zapisa ni. Branje/pisanje ob izjemi ne pokvari uporabnosti in prikaže opozorilo. | Dejanski testi z dogodkom `StorageEvent`, drugim ključem, `null` in žepom, ki meče izjemo. |
| R12 | Priljubljenost ne povzroči API zapisov in ne spremeni nobenega polja opravila. Nalaganje, navigacija, ozki prikaz in obstoječa dostopna imena ostanejo. | Posnetek omrežja prepoveduje nebranja API klicev; skupni in lastni testi preverijo obstoječe delovanje. |

## Izvedba in sledljivost

| Zahteva | Izhodišče za spremembo | Predlagani test | Izid |
| --- | --- | --- | --- |
| R01, R05–R10 | Seznami v `src/App.tsx` in kartice v `src/TaskBoard.tsx` dobijo skupni filter, gumb in števce. | Lastni Playwright testi v `tests/agent/` z različnimi števili in vrstnimi redi opravil. | Ni izvedeno v fazi specifikacije. |
| R02–R04, R08, R09, R11 | Nov pripomoček/hook za branje, validacijo, urejanje, pisanje in poslušanje `folio:favorites:v1` v `src/`; API v `src/api.ts` ostane bralni. | Preskusi sheme, osvežitev, zamenjavo projekta, odstranitev in `storage`. | Ni izvedeno v fazi specifikacije. |
| R12 | obstoječi `GET` klici v `src/App.tsx` in `src/TaskDetails.tsx` ostanejo; ne uporabljaj `/__test/`. | Posnetek omrežja in skupni regresijski testi. | Ni izvedeno v fazi specifikacije. |

Skupni razvojni testi `tests/development/P07.spec.ts` pokrivajo le del zahtev in niso zadostni za sprejem. Implementer naj doda ločene lastne teste za nerejena prekrivanja, zlasti validacijo, zamenjavo projekta, odstranitev projekta, števce, `storage` in napako shrambe.

## Odprta vprašanja in omejitve

- Razpored novih kontrol ni predpisan, če so dostopne in na 390 px ne razširijo strani.
- Niso dovoljene spremembe strežnika, skupnih tipov, odvisnosti, infrastrukture ali skupnih testov.
- Nepreverjeni scenariji morajo ostati označeni; rezultatov ni dovoljeno prikazati kot uspešne brez dejanskega zagona.
