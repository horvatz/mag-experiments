# P04 — načrt izvedbe

2026-09-23. Podlaga: [specifikacija](spec.md), zlasti predikati in R01–R12, ter [projektna načela](../../../.specify/memory/constitution.md). Raziskovanje je bilo omejeno na lokalno kodo in priložena navodila. Ta faza določa izvedbo; kode in testov še ne spreminja.

## Tehnični kontekst

Obstoječa aplikacija uporablja React 19.3, TypeScript 6 v strogem načinu, Vite 8 in `lucide-react`. Nameščeni so Playwright 1.63, ESLint in Chromium. Uporabimo obstoječe skripte in konfiguracijo brez novih odvisnosti ali posegov v strežnik, skupne tipe in skupne teste.

`src/App.tsx` vsebuje `ProjectView`, branje opravil, povzetke, stikalo pogledov in preglednico. `ProjectView` že ima React ključ `project.id`, zato menjava projekta ustvari novo lokalno stanje. `src/TaskBoard.tsx` filtrira prejeto polje po treh stalnih stolpcih. `src/TaskDetails.tsx` in `src/navigation.ts` upravljata podrobnosti in obstoječo navigacijo prek hasha. `src/useResource.ts` bere javni API in že obravnava nalaganje, napake in ponovni poskus.

## Odločitve in pot podatkov

1. **Čista projekcija v `src/taskSorting.ts` (R01–R06, R10–R12).** Lokalni tipi `SortKey`, `SortDirection`, `SortSettings` in privzete vrednosti ne spreminjajo `shared/types.ts`. Funkcija `sortTasks(tasks: readonly Task[], settings): Task[]` vrne novo polje; opravil ne kopira ali spreminja. Pri `original` vrne plitvo kopijo v izvirnem vrstnem redu. Sicer opremi elemente z izvornim indeksom, razvrsti pomožno polje po primarnem, nato sekundarnem ključu ter nazadnje indeksu in vrne opravila. Smer pomnoži samo rezultat posameznega ključa, nikoli izvornega indeksa. Normalizacija, UTF-16 primerjava, rangi statusov in pravila sekundarnega ključa so natančno tista iz specifikacije. Veljavne datume fiksnega formata primerjamo kot nize, brez časovnih pasov. Ne uvajamo kolatorja ali številskega razvrščanja.
2. **Lokalno stanje v `ProjectView` (R01, R08–R10).** En `useState<SortSettings>` hrani vse štiri vrednosti. Posamezna sprememba ohrani druge tri; ponastavitev nastavi celoten privzeti objekt. Življenjski cikel obstoječega ključa `project.id` izvede ponastavitev ob menjavi projekta. Pogled in `taskId` ne spreminjata ključa, zato ne ponastavita stanja. Osvežitev ustvari privzeto stanje. Ni shrambe, učinka za zapisovanje ali parametrov razvrščanja v URL-ju.
3. **En izračun za oba pogleda (R07, R11, R12).** `ProjectView` iz prejetega `tasks` in nastavitev izpelje `sortedTasks`, po potrebi z `useMemo`. Preglednica preslika `sortedTasks`; `TaskBoard` prejme isto polje in ohrani obstoječi filter po statusu. Povzetki, skupno število in prazno stanje izhajajo iz izvornega `tasks`. Identiteta React elementov, `data-task-id` in povezave podrobnosti ostanejo vezani na ID. Obstoječega API-ja in navigacije ni treba spreminjati.
4. **Dostopne kontrole v `src/SortControls.tsx` (R01, R05, R06, R10, R12).** Komponenta prejme vrednosti in povratna klica za spremembo ter ponastavitev. Prikaže štiri označene HTML selecte in gumb z natančno določenimi dostopnimi imeni in vrednostmi. Kontrole so med naslovom razdelka in prikazom opravil, zunaj povezav opravil in na voljo tudi za prazno polje. Izbor istega ključa in spremembe sekundarnih nastavitev pri `original` ostanejo dovoljeni. Kontrole ne berejo podatkov ali navigacije.
5. **Majhna slogovna dopolnitev v `src/styles.css` (R12).** Uporabimo obstoječe sistemske pisave, barve, robove, zaobljenost, slog gumba in viden fokus. Skupina kontrol se prelomi glede na širino; polja imajo omejitev širine in ne povečajo širine strani pri 390 px. Ohranjeni so Folio, meni, povzetki ter notranje drsenje preglednice in table. Preoblikovanje obstoječe postavitve ni potrebno.

Tok: javni API → `useResource` → izvorni `tasks` + lokalne nastavitve → `sortTasks` → preglednica oziroma obstoječi filter stolpcev table. Podrobnosti še naprej uporabljajo svoj obstoječi GET po ID-ju.

## Datoteke in zaporedje

| Datoteka | Delo | Odvisnost |
| --- | --- | --- |
| `src/taskSorting.ts` (nova) | Tipi, privzeto stanje, primerjave in stabilna nemutirajoča projekcija | Pravila specifikacije |
| `src/SortControls.tsx` (nova) | Štiri kontrolirane izbire in ponastavitev | Lokalni tipi in privzete vrednosti |
| `src/App.tsx` | Lokalno stanje, projekcija in povezava kontrol z obema pogledoma | Projekcija in kontrole |
| `src/styles.css` | Prilagodljiva skupina kontrol v Folio | Oznake komponent |
| `tests/agent/P04.sorting.spec.ts` (nova) | Preverjanja čiste projekcije z nameščenim Playwright test runnerjem | `taskSorting.ts` |
| `tests/agent/P04.ui.spec.ts` (nova) | Integracijska preverjanja kontrol, navigacije in prikazov | Povezan uporabniški vmesnik |
| `docs/agent/P04/spec.md` | Dejanske povezave kode, testna imena, izidi in zgodovina | Izvedba in preverjanja |
| `docs/agent/P04/validation.md` in dnevniki | Jedrnati ukazi, rezultati, omejitve in dokazila brez podvajanja specifikacije | Dejanski zagoni |

`TaskBoard.tsx`, `TaskDetails.tsx`, API in navigacija po pregledu ne potrebujejo spremembe. Dovoljeni ciljni posegi bi bili potrebni le ob ugotovljeni regresiji v obsegu P04.

## Preverjanje in dokazila

Obstoječa konfiguracija že vključuje `tests/agent/**/*.spec.ts`, skupne API in bralne teste ter razvojne teste P04 na namizni in mobilni velikosti. Njene povezave s Chromiumom in strežnikom uporabimo nespremenjene. Testni pomočnik iz `tests/development/helpers.ts` smejo uvoziti lastni testi; aplikacija ga ne uvaža.

- **R01–R06, R10, R11:** čisto funkcijo preverimo z vnaprej določenimi pričakovanimi zaporedji ID-jev za Unicode, sestavljene in razstavljene naglase, številke v nizih, razpon statusov/datumov, popolna izenačenja, nasprotni smeri istega ključa in prevlado `original`. Pričakovanja ne smejo biti kopija izvedenega primerjalnika. Matrika vseh 100 kombinacij nastavitev preveri prazno in enoelementno polje, stabilnost izenačenih podatkov, ohranitev ID-jev in nemutiranje zamrznjenega vhoda.
- **R01, R05, R07–R12:** UI preverjanja uporabljajo nadzorovane javne GET odgovore z drugačnimi ID-ji, več kot desetimi opravili in podvojenimi naslovi. Preverijo štiri vrednosti, neodvisne smeri, vse stolpce glede na zaporedje preglednice, ohranitev nastavitev ob preklopu in podrobnostih, pravilne podrobnosti po ID, reset vseh kontrol, menjavo projektov in osvežitev. Na praznem in enoelementnem projektu prehodijo vse kombinacije kontrol in oba pogleda.
- **R11, R12:** zajem zahtevkov mora pokazati nič zapisov; izvorni podatki, povzetki in števila se ne spremenijo. Pri 390 px preverimo širino strani v obeh pogledih, dostopna imena in viden fokus kontrol. Vizualno pregledamo posnetek dopolnjenega Folio.
- **Regresije:** `npm run check` izvede lint, typecheck/build in vse konfigurirane teste (skupne, razvojne in lastne). Ob ciljnem odpravljanju napake uporabimo `npm test -- --project=agent` ali posamezen test; po popravku izvedemo ustrezno končno preverjanje. Ukaze in izhod shranimo v `docs/agent/P04/`, z ohranjenim izhodnim statusom. Uspeh zabeležimo šele po dejanskem zagonu.

## Skladnost, tveganja in omejitve

Načrt je znotraj dovoljenih map in uporablja obstoječo infrastrukturo. Dodatnih zahtev, odvisnosti, API-jev, git postopkov in arhitekturne prenove ni. Glavna tveganja so obrat izenačenih elementov pri `desc`, ponastavljanje pri preklopu pogleda ter razlika med zaporedjem table in preglednice; vsako ima zgoraj določeno preverjanje. Priloženi štirje razvojni testi sami ne zadoščajo za vseh dvanajst zahtev. Končni testi niso dostopni; njihov uspeh ne bo zatrjevan. Bistvenih odprtih vprašanj ni. Implementacija in vsi testni zagoni so ob nastanku tega načrta še neizvedeni.
