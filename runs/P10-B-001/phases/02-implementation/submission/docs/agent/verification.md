# P10 — implementacija in preverjanje

Začetni zapis: implementer je prebral PROJECT_RULES.md, task/instructions.md,
task/specification-template.md in predano specifikacijo. Zahteve R01–R12 ostajajo
obvezne. Specifikacija in dokumenti drugih vlog ostajajo nespremenjeni.

## Začetni načrt (stanje ob prvem zapisu)

- Še neizvedeno: pregled izvorne kode in potrjenega dizajna Folio.
- Še neizvedeno: lokalna permutacija ID-jev, zgodovina do 20 korakov,
  razveljavitev, ponovitev in razveljavljiva ponastavitev (R01–R08).
- Še neizvedeno: skupne kontrole preglednice/table, globalna mesta,
  življenjska doba projektnega stanja in odziven prikaz (R09–R12).
- Še neizvedeno: lastni testi za mejo zgodovine, robne ukaze, navigacijo,
  0/1 opravil, identiteto po ID in lokalnost sprememb.
- Še neizvedeno: `npm run check` (slog, tipi, gradnja, osnovni, razvojni
  in lastni testi), po potrebi ciljani ponovni zagon ter ročni ogled.

## Omejitve

Faza se konča 2026-09-21T23:09:31.028Z; zadnja minuta je namenjena predaji.
Infrastruktura, odvisnosti, skupni testi in navodila so samo berljivi.
Javni internet je blokiran. Za lastne skripte brskalnika je dovoljen samo
`chromium.connect(wsEndpoint)` iz task/browser.json; `chromium.launch()` ne deluje.
Skriti končni testi niso dostopni. Ob začetku še noben test ni bil izveden.

## Spremembe, sledljivost in dejanski rezultati

- `src/taskOrder.ts`: čisti prehodi nad nespremenljivimi zaporedji ID-jev;
  oba sklada, omejitev 20, zaščita robnih/neznanih ukazov in ponastavitev.
- `src/App.tsx`: ProjectTasks se namesti po nalaganju; projektni ključ
  ponastavi stanje, pogled in podrobnosti pa ga ohranijo. Skupne kontrole,
  števec in urejena preglednica uporabljajo isti reducer.
- `src/TaskOrderControls.tsx`: globalno mesto in dostopna gumba zunaj povezav.
- `src/TaskBoard.tsx`: filtriranje globalnega vrstnega reda v stalne stolpce;
  dostopno ime povezave je sestavljeno neposredno iz besedila, zato tudi ID-ji
  s presledki in ločili ne pokvarijo aria-labelledby.
- `src/styles.css`: dodatne kontrole uporabljajo Folio spremenljivke,
  orodno vrstico je mogoče prelomiti; ohranjeno notranje drsenje.
- `tests/agent/order.spec.ts`: 7 lastnih testov (2 za prehode stanja,
  5 brskalniških) za scenarije S01–S08.

Prvi `npm run lint` in `npm run build` sta uspela. Prvi `npm run check`
se je ustavil pri tipih zaradi napačne možnosti `disabled` v lastnem testu;
popravljeno na podprto `toBeEnabled({ enabled })`. Dnevnik prvega poskusa je
`check-first.log`. Ponovljeni celoten `npm run check` je zaključen z izhodno
kodo 0: lint, typecheck, produkcijska gradnja in **53 uspešnih testov v 23,5 s**.
To je 38 osnovnih (14 API, 12 namiznih, 12 mobilnih), 8 razvojnih P10
(D01–D04 v obeh poglednih velikostih) in 7 lastnih. Končni dnevnik je
[`check.log`](check.log), poročilo Playwright pa
`../../playwright-report/html/index.html`. Po tem uspešnem preverjanju
izvorna koda in testi niso bili več spreminjani.

Ročni brskalniški zajem prek chromium.connect in lokalnih vrat 5193/3123
je uspel. Vizualno so pregledani vsi štirje posnetki:
[`desktop-table.png`](desktop-table.png), [`desktop-board.png`](desktop-board.png),
[`mobile-table.png`](mobile-table.png), [`mobile-board.png`](mobile-board.png).
Ohranjeni so Folio postavitev, barve, kartice in navigacija; nova orodna
vrstica se na mobilnem zaslonu prelomi. Mobilna preglednica ima
document.scrollWidth = innerWidth = 390; lastni brskalniški test preveri
isto omejitev za oba pogleda s 23 opravili. Strežnik za ročni ogled je po
zajemu ustavljen. Testni strežnik se je po preverjanju sam ustavil.

Dodatna omejitev okolja: `git diff --stat` ni izvedljiv, ker sistemski Git
zahteva manjkajoči `/Library/Developer/CommandLineTools/usr/bin/xcrun`.
Git ni bil uporabljen za spremembe, vejo, potisk ali oddaljeno storitev.
Specifikacija nima ugotovljenega vsebinskega odstopanja od R01–R12.

## Končna sledljivost R01–R12

Vsi spodnji izidi so uspešni v končnem `npm run check`; oznake S so del
dejanskih imen testov v [`tests/agent/order.spec.ts`](../../tests/agent/order.spec.ts),
oznake D pa imen nespremenjenih razvojnih testov. Dnevnik vsebuje vsako ime
in izid. S03 in prvi S04 sta testa čistega prehoda, preostali uporabljajo
pravi brskalnik in nadzorovane GET odgovore javnega API-ja.

| Zahteva | Pogoj in izvedba | Dejansko preverjanje in dokaz |
| --- | --- | --- |
| R01 | `initialOrder` kopira zaporedje ID-jev; `ProjectTasks` preslika po ID; `TaskOrderControls` kaže globalno mesto. | S01/S02/S05 preveri celotni izvorni red in vsa mesta pri enakih naslovih ter ID-jih z Unicode, presledkom, narekovaji in poševnico. Uspešno. |
| R02 | `orderReducer`/move zamenja le globalna soseda v kopiji; `TaskBoard` uporablja isti ukaz. | D01, S01/S02/S05: obe smeri in natančne permutacije; S06/S08: globalni sosedi različnih in enakih statusov. Uspešno. |
| R03 | Meje gumba temeljijo na globalnem mestu; reducer vrne isti objekt za rob in neznan ID. | D01, S03: ponovljeni neveljavni ukazi ohranijo tudi neprazen redo; S07: oba robova pri enem opravilu. Uspešno. |
| R04 | move shrani celotni prejšnji present; undo prenese trenutni present v redo. | D02, S01/S02/S05: tri različne permutacije, tri razveljavitve in števec po vsakem koraku. Uspešno. |
| R05 | redo obnovi zadnjo permutacijo in vrne prejšnjo v undo. | D02, S01/S02/S05: tri ponovitve; S04: vseh 20 ponovitev, točni posnetki in ista množica ID-jev. Uspešno. |
| R06 | move prazni redo samo po preverjeni veljavnosti. | D03, S03: razvejitev in ponovljeni robni/no-op ukazi z redo; S01/S02/S05: nova veja v UI. Uspešno. |
| R07 | `remember()` ohrani zadnjih največ 20 posnetkov pri premiku, redo in reset. | S04 (reducer): 23 ID-jev, 21 različnih premikov, 20 undo, 20 redo, reset pri polni zgodovini; S04/S08 ponovi mejo in števce v mobilnem UI. Uspešno. |
| R08 | reset na original je eno zgodovinsko dejanje; `isOriginalOrder` onemogoči no-op. | D04, S01/S02/S05: reset pri nepraznem redo, undo/redo reseta; S03: izvorni red ohrani redo; S04: reset pri kapaciteti. Uspešno. |
| R09 | `ProjectTasks` riše globalni red; `TaskBoard` filtrira ta red v stalne stolpce in posebej preslika globalna mesta. | D04, S06/S08: natančni ID-ji stolpcev, premik med statusoma spremeni globalno mesto, premik med istima statusoma spremeni stolpec, preklop nazaj v tabelo. Uspešno. |
| R10 | `ProjectTasks` ostane nameščen pri pogledu/podrobnostih; `ProjectView key={project.id}` in osvežitev inicializirata novo zgodovino. | S06/S08: oba sklada neprazna pri preklopu in podrobnostih, Escape in vrnitev fokusa, menjava projekta in vrnitev, osvežitev neposredne poti table/podrobnosti. Regresije navigacije in nalaganja prav tako uspešne. |
| R11 | Števec bere dolžini skladov, gumbi so dejansko disabled pri ničli; kontrole ostanejo prikazane pri praznem projektu. | D03, S01/S02/S05, S04/S08: natančno besedilo in enabled po korakih; oba S07: oba projekta prazna oziroma z enim opravilom, oba pogleda in tri stalne kolone. Uspešno. |
| R12 | V stanju so samo ID-ji; izris uporablja iste Task objekte; P10 ne kliče zapisovalnega API-ja ali shrambe. Folio slogi in povezave ostanejo dostopni. | D04, S01/S02/S05, S06/S08, S04/S08: nič API zapisov, nespremenjeni števci, pravilna oseba/opis/datum podrobnosti po ID, fokus/Enter, brez gumbov znotraj povezav, širina 390. 38 regresijskih testov in štirje vizualni posnetki uspešni. |

## Predaja pregledovalcu

Implementacija je zaključena. Spremenjene/dodane izvedbene datoteke so
`src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskOrderControls.tsx`,
`src/taskOrder.ts`, `src/styles.css` in `tests/agent/order.spec.ts`.
Drugih izvedbenih datotek, infrastrukture, odvisnosti ali skupnih testov
nisem spreminjal. Specifikacija, njena zgodovina in datoteki review niso
bili spremenjeni. Lastni zapisi/dokazi so v docs/agent/.

Ni znane neizpolnjene zahteve. Ostaneta običajni omejitvi dokazovanja:
skriti končni testi niso dostopni in poljubna vhodna domena ni izčrpno
enumerirana. Napaka podrobnosti ob nepraznih obeh skladih nima ločenega
lastnega testa; osnovni testi preverijo napake podrobnosti, S06 pa obstoj
obeh skladov pri podrobnostih in navigaciji. Izvorna koda ohranja ti stanji
v ločenih komponentah. Ne trdim, da so nedostopni scenariji izvedeni.

Dokument je zaključen več kot 60 sekund pred rokom faze; pregledovalec lahko
prevzame čas takoj. Za ponovitev vseh preverjanj uporabi `npm run check`.
