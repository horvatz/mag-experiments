# P01 — razvojna specifikacija

## Problem in kontekst

Uporabnik želi popraviti naslov in stanje obstoječega opravila iz podrobnosti.
Izhodiščni Folio prikazuje projekte, preglednico, tablo, števce in podrobnosti;
API že podpira atomsko spremembo naslova in stanja. Dodamo urejanje v obstoječi
stranski dialog, z uporabo slovenskih oznak in slogov iz `docs/dizajn.md`.
Postopek A izvaja en agent. Spremembe so omejene na `src/`, `tests/agent/` in
`docs/agent/`; strežnik, skupni tipi, infrastruktura in skupni testi ostanejo isti.

## Vhodi, dejanja in izidi

- Identiteta je `Task.id`; `projectId` določa projekt. Naslov ni identifikator.
- Uredi odpre svež začasni naslov in stanje iz shranjenega opravila.
- Naslov je besedilno polje z oznako »Naslov«; za ohranitev notranjih prelomov
  uporabimo `textarea`. Stanje je HTML `select` z oznako »Stanje« in tremi
  možnostmi: Pripravljeno (`todo`), V delu (`in_progress`), Končano (`done`).
- Shrani preveri naslov in pošlje samo `{title, status}` prek obstoječega
  `updateTask(id, values)` oziroma `PATCH /api/tasks/:id`.
- Uspeh zapre obrazec in pusti odprte podrobnosti s potrjenimi podatki API-ja.
  Iz istega potrjenega stanja izhajajo seznam, tabla in števci.
- Prekliči odstrani obrazec, začasni vnos in napake brez zahteve PATCH.
- Zavrnitev ohrani obrazec in vnos, prikaže napako ter omogoči nov poskus.
- Med shranjevanjem so polji in oba gumba onemogočeni; prikazan je status.
  Med urejanjem zaključek poteka z gumboma Shrani in Prekliči; zapiranje
  podrobnosti z X ali Escape takrat ne zavrže obrazca.
- Opis, oseba, rok, projekt in identifikator so samo za branje.

## Zahteve in pravila

Naj bo `S` shranjeni zemljevid opravil po ID, `i` izbrani ID, `D` začasni vnos,
`P` število zahtev tega obrazca v čakanju in `Q` stanje obrazca
(`zaprt`, `urejanje`, `shranjevanje`, `napaka`). `C(s)` odstrani samo robne
U+0020, U+0009, U+000A in U+000D. Notranji znaki in drugi Unicode presledki
ostanejo. Veljaven naslov pomeni `C(D.title).length > 0`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Uredi: `D := (S[i].title, S[i].status)`; identiteta se prenaša po ID. | D01; A01, A04: podvojeni naslovi, različni projekti. |
| R02 | Sprememba D, validacija in čakanje ohranijo S ter prikaze iz S. | D03; A01, A03, A04: posnetki podatkov, vrstice/kartice in števci. |
| R03 | Neveljaven naslov ⇒ napaka ob polju, brez PATCH. Veljaven popravek odstrani napako. PATCH vsebuje C(D.title). | D04; A02: prazen naslov, štirje robni beli znaki, notranji znaki, NBSP. |
| R04 | `D.status ∈ {todo, in_progress, done}`; vsi prehodi so dovoljeni. | A05: vseh šest prehodov in nespremenjeno stanje. |
| R05 | Uspeh: `S'[i] := odgovor API`, oba podatka skupaj, Q := zaprt; števci so število opravil posameznega stanja. | D02; A01, A03, A05: podrobnosti, oba pogleda, števci, osvežitev; A06: pozni začetni seznam. |
| R06 | Prekliči: Q := zaprt, D in napake se zavržejo, S ostane, brez PATCH. | D03; A04: preklic po vnosni in strežniški napaki ter ponovno odprtje. |
| R07 | Za vsak `j ≠ i` velja `S'[j] = S[j]`; ostala polja `S[i]` se ne spreminjajo. | A01, A05: primerjava vseh polj vseh opravil ter telesa PATCH. |
| R08 | Zavrnitev: S ostane, D ostane, Q := napaka; alert opiše neuspeh; nov poskus lahko uspe. | A03, A04: nadzorovan odgovor in primerjava podatkov; A07 dodatno preveri napako povezave. |
| R09 | `0 ≤ P ≤ 1`; pred pošiljanjem sinhrona zapora, med P=1 disabled in role=status; po zavrnitvi omogočeno. | A03: zadržan odgovor, hitri kliki/oddaje, zavrnitev in ponovni uspeh. |
| R10 | Po zaključku urejanja navigacija deluje; novo odprtje nima starega D ali napak. | Skupni testi; A01, A04, A05: projekt, pogled, drugo opravilo. |

Napaka polja ima `role="alert"`, polje `aria-invalid="true"` in
`aria-describedby` na napako. Strežniška napaka ima `role="alert"`;
čakanje `role="status"`. Ohranijo se `data-task-id`, imena stolpcev in
`aria-label="Pregled stanj opravil"`. Fokus v obrazcu in po zaključku ostane smiseln.

## Izvedba in sledljivost

Začetni načrt je po implementaciji dopolnjen z dejanskimi rezultati. Končni
`npm run check` je uspešen (60/60). Ukazi, dnevniki in omejitve so v
[verification.md](verification.md). A01–A07 so v
[lastnih testih](../../tests/agent/P01.spec.ts); D01–D04 v nespremenjenih
[razvojnih testih](../../tests/development/P01.spec.ts).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01, R06, R10 | Svež obrazec po ID, zaključek in navigacija | D01, D03, A01, A04 | [TaskDetails](../../src/TaskDetails.tsx): `editing`, `key={taskId}` v App; [TaskEditForm](../../src/TaskEditForm.tsx): začetni useState in odstranitev obrazca | Uspešno; imenovani testi v [check.log](check.log). |
| R02, R05, R07 | Samo potrjene vrednosti; skupni podatki vseh prikazov | D02, A01, A03, A05, A06 | [App](../../src/App.tsx): `savedTasks` Map, `taskSaved`, izpeljani `tasks` in `counts`; TaskEditForm: `onSaved` šele po odgovoru | Uspešno; [check.log](check.log). |
| R03 | Natančno obrezovanje in dostopna validacija | D04, A02 | [TaskEditForm](../../src/TaskEditForm.tsx): `cleanTitle`, `submit`, `aria-describedby`, onChange | Uspešno; [check.log](check.log). |
| R04 | Tri stanja in vsi prehodi | A05 | [TaskEditForm](../../src/TaskEditForm.tsx): select in tri možnosti | Uspešno, vseh devet parov stanj; [check.log](check.log). |
| R08, R09 | Zapora oddaje, zavrnitev, ponovni poskus | A03, A04, A07 | [TaskEditForm](../../src/TaskEditForm.tsx): `pending`, `saving`, try/catch/finally, disabled, status in alert; obstoječi `src/api.ts` | Uspešno; [check.log](check.log). |
| R01–R10 | Namizje, ozki zaslon, ohranitev Folio videza | Skupni testi, A01–A05 pri 1440 in 390 px; skripta za ogled pri 1440, 390 in 320 px | [Slogi](../../src/styles.css): `.task-edit-form`, `.form-field`, `.form-error`, `.save-status`; zgornje komponente | Uspešno; [check.log](check.log), [visual-check.log](visual-check.log), posnetki v [verification.md](verification.md). |

## Odprta vprašanja in omejitve

- Nejasnosti, ki bi zahtevale uporabnikov odgovor, ni. Uporabljena so navodila 0.2.
- Sočasne spremembe drugih uporabnikov so izključene. Uspeh API-ja je dokončen;
  zavrnitev ne zapisuje podatkov. Potrjene odgovore hranimo le v React stanju,
  brez lokalne kopije storitve ali localStorage. Pozni začetni GET seznama ne sme
  prepisati že potrjene spremembe.
- Escape, klik zunaj, navigacija med urejanjem, opozorilo ob zapustitvi in prijava
  niso zahtevani. Osvežitev preverja podatke znotraj istega zagona strežnika.
- Časovna omejitev: največ 20 minut od začetka (22:28:59 UTC, 15. 9. 2026).
  Dodatne teste izvajamo v `tests/agent/`, testne kontrole uporablja samo test.
- Pri končnem preverjanju ni ugotovljenih neizpolnjenih zahtev R01–R10.
  Meje dokazov (Chromium, simulirani mobilni pogled, izključeni scenariji)
  so zapisane v [verification.md](verification.md).

## Zgodovina sprememb

- v1, pred implementacijo: določena pravila R01–R10, zasnova, scenariji in
  začetna sledljivost. Rezultati preverjanj še niso znani.
- v2, po implementaciji in preverjanju: dopolnjene dejanske povezave na kodo
  in rezultati 60/60. Dodana dokazna scenarija A06 (pozni začetni GET) in A07
  (napaka povezave). Potrjene odgovore predstavlja Map po ID. Popravljeno
  podvojeno besedilo strežniške napake, dodano slovensko sporočilo povezave.
  Sprejemni pogoji R01–R10 in obseg naloge ostajajo enaki.
