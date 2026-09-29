# Specifikacija P03: Iskanje in sestavljeni filtri

## Problem in kontekst

Folio trenutno prikaže vsa opravila izbranega projekta v tabeli ali tabli. Uporabnik mora lahko poiskati opravila po besedilu, omejiti prikaz po stanju in odgovorni osebi, kombinirati pogoje ter filtre počistiti, ne da bi se spremenili podatki ali vrstni red. Podatki ostanejo brani iz javnega API-ja; podrobnosti, navigacija in odzivna postavitev ostanejo dostopni.

## Vhodi, dejanja in izidi

Vhod so opravila trenutnega projekta (`id`, `title`, `description`, `assignee`, `status`) iz `/api/projects/:id/tasks`. Iskanje bere prva štiri polja. Uporabnik lahko vnese iskalno besedilo, izbere `all|todo|in_progress|done`, izbere `all` ali osebo, počisti vse kontrole ali preklopi pogled. Ob nalaganju in po menjavi projekta so kontrole privzete; ob napaki se ohrani obstoječe stanje napake/nalaganja.

## Zahteve in pravila

Naj bo `T` urejen seznam opravil projekta, `q` iskalni vnos, `s` izbrano stanje, `a` izbrana oseba. `norm(x) = lowercase(NFD(x))` z odstranjenimi znaki U+0300–U+036F. `F(t)` je združitev `id`, `title`, `description`, `assignee`, normalizirana z `norm`. Besede `W(q)` so neprazni deli po razdelitvi po belinah. Prikazani seznam `V` je stabilni filter `T`, kjer velja `(s=all ∨ t.status=s) ∧ (a=all ∨ t.assignee=a) ∧ ∀w∈W(q): w je dobesedni podniz F(t)` po normalizaciji. Za prazne besede iskalni pogoj velja samodejno.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Začetne kontrole so prazne/vse; `V=T` v izvornem vrstnem redu. | Razvojni D01, izhodiščni testi, lastno preverjanje |
| R02 | Iskanje uporabi `norm` nad združenimi štirimi polji in poizvedbo. | D01 ter primeri diakritike in velikosti črk |
| R03 | Vsa `W(q)` so dobesedni podnizi, poljubnega vrstnega reda; ločila so literalna. | Testi iskanja z več besedami/ločili |
| R04 | Stanje, oseba in iskanje so združeni z IN; oseba se primerja natančno. | D02 in kombinirani primeri |
| R05 | Osebe so unikatna neprazna imena iz celega `T` in se preračunajo za projekt. | Preverjanje izbirnika ob iskanju/projektu |
| R06 | Tabela in tabla upodobita enake ID-je `V`; prikaz se ohrani pri menjavi pogleda; tabla razvrsti samo `V` po stanju. | D02 in primerjava pogledov |
| R07 | Menjava projekta ponastavi vse kontrole, `T` je vezan na `project.id`. | Navigacijski scenarij med projekti |
| R08 | Stanje filtrov je samo lokalno v komponenti, brez URL/trajne shrambe. | Osvežitev in pregled URL/shrambe |
| R09 | Status prikazuje `Prikazano: |V| od |T|.`; pregled stanj in števci stolpcev štejejo `V`. | D04 in preverjanje agregatov |
| R10 | Za `T≠∅, V=∅` oba pogleda pokažeta `Ni zadetkov.`; za `T=∅` ostane običajno prazno stanje in števec `0 od 0`. | D03, prazen projekt in oba pogleda |
| R11 | Gumb nastavi `q=''`, `s=all`, `a=all`; podatkovna polja in vrstni red se ne spreminjajo. | D03 ter pregled zahtev API |
| R12 | Navigacija/podrobnosti ostanejo delujoče, filtriranje ne zapisuje na `/api/`, Folio in mobilno drsenje ostaneta. | Izhodiščni testi, D04, 390 px pregled |

## Izvedba in sledljivost

Filtri in stabilno izračunani seznam `V` so v `ProjectView`; njegov `key` je ID projekta, zato se lokalno stanje ob menjavi projekta ponastavi. Seznam `V` gre v tabelo ali `TaskBoard`. Kontrole in števci so v `src/App.tsx`, slogi v `src/styles.css`, dodatni scenariji v `tests/agent/P03.spec.ts`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Začetno `q=''`, `s=a=all`; seznam ostane v API vrstnem redu. | `D01: default list...` (desktop/mobile); `filtered counts, clear, and refresh defaults` | [App.tsx](../../src/App.tsx#L13), [App.tsx](../../src/App.tsx#L20) | Uspešno; zadnji `npm run check`, 50/50. |
| R02 | NFD, odstrani U+0300–U+036F, male črke; polja id/title/description/assignee. | D01; `normalized all-word literal search reads every searchable field` | [App.tsx](../../src/App.tsx#L19), [P03.spec.ts](../../tests/agent/P03.spec.ts#L3) | Uspešno za diakritiko in velikost črk; 50/50. |
| R03 | Vse besede so literalni podnizi, vrstni red ni pomemben. | `normalized all-word literal search...` (`koncni CAS`, `=SUM(A1)`) | [App.tsx](../../src/App.tsx#L19), [App.tsx](../../src/App.tsx#L23) | Uspešno za več besed in literalna ločila; 50/50. |
| R04 | Stanje IN oseba IN vse iskalne besede; oseba natančno. | `D02: combined filters and view persistence` (desktop/mobile) | [App.tsx](../../src/App.tsx#L20) | Uspešno; 50/50. |
| R05 | Enolična neprazna imena iz celotnega trenutnega `T`. | `people include filtered-out tasks...` | [App.tsx](../../src/App.tsx#L16), [App.tsx](../../src/App.tsx#L60) | Uspešno; preverjene možnosti skritih opravil in zamenjava nabora ob menjavi projekta; 50/50. |
| R06 | Tabela in tabla prejmeta isti `V`; tabla šteje in razvršča po stanju. | D02 (desktop/mobile); `people include filtered-out tasks...`; `normalized all-word literal search...` | [App.tsx](../../src/App.tsx#L66), [App.tsx](../../src/App.tsx#L71), [TaskBoard.tsx](../../src/TaskBoard.tsx#L16) | Uspešno; ID-ji primerjani v pogledih; 50/50. |
| R07 | Menjava `project.id` remounta `ProjectView`; API poizvedba uporablja ta ID. | `people include filtered-out tasks...`; izhodiščni `switching project during loading...` | [App.tsx](../../src/App.tsx#L12), [App.tsx](../../src/App.tsx#L111) | Uspešno; vsi trije filtri privzeti in osebe preračunane za drug projekt; 50/50. |
| R08 | Filtri so lokalni React state, brez URL/trajne shrambe. | `filtered counts, clear, and refresh defaults` | [App.tsx](../../src/App.tsx#L13) | Uspešno; po `page.reload()` se obnovi privzeti seznam; 50/50. |
| R09 | Rezultat je `|V| od |T|`; povzetki in stanje stolpcev štejejo `V`. | `D04: counts and read-only behavior` (desktop/mobile); `filtered counts, clear, and refresh defaults` | [App.tsx](../../src/App.tsx#L27), [App.tsx](../../src/App.tsx#L39), [App.tsx](../../src/App.tsx#L62), [TaskBoard.tsx](../../src/TaskBoard.tsx#L17) | Uspešno; preverjena besedila 4/8 in 1/8 ter filtrirani povzetek; 50/50. |
| R10 | Za neprazen `T` in prazen `V` pokaže Ni zadetkov.; prazen `T` ohrani stanje praznega projekta. | D03 (desktop/mobile); `normalized all-word literal search...`; `empty project retains empty state...` | [App.tsx](../../src/App.tsx#L64), [App.tsx](../../src/App.tsx#L67), [App.tsx](../../src/App.tsx#L71) | Uspešno v obeh pogledih; prazen projekt 0/0; 50/50. |
| R11 | Počisti v enem dejanju nastavi `q=''`, `s=a=all`; podatki se ne spreminjajo. | D03 (desktop/mobile); `filtered counts, clear, and refresh defaults` | [App.tsx](../../src/App.tsx#L61) | Uspešno; vsi ID-ji se povrnejo; 50/50. |
| R12 | Navigacija/podrobnosti ostanejo, filtri so bralni, stran se pri 390px ne razširi. | Izhodiščna namizna/mobilna regresija; D04 preveri zapisovalne zahteve in širino strani | [App.tsx](../../src/App.tsx#L52), [App.tsx](../../src/App.tsx#L72), [styles.css](../../src/styles.css#L62), [styles.css](../../src/styles.css#L179) | Uspešno; vsi 38 izhodiščni, 8 razvojnih in 4 dodatni testi; 50/50. |

### Zapis sprememb specifikacije

- 29. 9. 2026: po izvedbi zamenjan začetni načrt s konkretnimi lokacijami kode, scenariji in izidi preverjanj; sprejemni pogoji R01–R12 ostanejo nespremenjeni.

## Odprta vprašanja in omejitve

Nobena zahteva ni nejasna. Besedilna normalizacija je omejena natanko na kombinacijsko območje U+0300–U+036F. Končni avtomatski testi morda pokrijejo več podatkovnih kombinacij kot razvojni testi; dejanski obseg preverjanja bo naveden v poročilu.
