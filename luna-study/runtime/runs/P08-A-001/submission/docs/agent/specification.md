# Specifikacija P08 — Koledarski pregled rokov

## Problem in kontekst

Folio trenutno bere opravila aktivnega projekta iz javnega API-ja ter jih prikaže v preglednici ali na tabli, razvrščena po stanju opravila. P08 doda koledarski pregled rokov, pet števcev rokov in izbiro skupine, ki deluje enako v obeh pogledih. Projekt ostane vir podatkov, obstoječa podrobna branja in potrjeni videz Folio pa ostanejo nespremenjeni.

## Vhodi, dejanja in izidi

Vhodi so `id`, `projectId`, `status` in veljavni koledarski `dueDate` (`YYYY-MM-DD`) opravila, aktivni projekt ter trenutni pogled. Ob začetku vsakega projektnega prikaza sta referenčni datum `2026-09-21` in izbrana skupina `all`. Uporabnik lahko spremeni datum, izbere `all`, `overdue`, `today`, `week`, `later` ali `done`, preklopi preglednico/tabla, zamenja projekt ali osveži stran. Datumsko polje hrani tudi trenutno vneseno besedilo; prazno polje pokaže opozorilo, vendar ne zamenja zadnjega veljavnega datuma za izračun. Uspešna sprememba datuma takoj preračuna števce in vrstice. Preklop prikaza ohrani datum, besedilo in skupino; projektna menjava in osvežitev začneta z začetnimi vrednostmi. Pregled ne spreminja opravil in ne zapisuje filtrirnega stanja v URL ali trajno shrambo.

## Zahteve in pravila

Naj bo `r` veljaven referenčni koledarski datum, `d(t)` rok opravila `t`, `s(t)` njegov status. Datumske vrednosti primerjamo kot koledarske datume brez pretvorbe v lokalni časovni pas; `+n` pomeni koledarski premik z upoštevanjem mesecev, let in prestopnih dni. Skupine so:

```
G(t,r) = done                         če s(t) = done
         overdue                      če s(t) ≠ done in d(t) < r
         today                        če s(t) ≠ done in d(t) = r
         week                         če s(t) ≠ done in r < d(t) ≤ r + 7 dni
         later                        če s(t) ≠ done in d(t) > r + 7 dni
```

Skupina `all` izbere vsa opravila. Števec `c(k) = |{t v aktivnem projektu : G(t,r)=k}|` se izračuna pred filtrom. Filter za skupino `k ≠ all` izbere natanko `t`, za katerega `G(t,r)=k`. Izbrana opravila ohranijo izvorni vrstni red. Prazno ali neveljavno (v tem vmesniku samo prazno) polje ne spremeni `r`; veljaven vnos nastavi `r` na vneseni datum in odstrani opozorilo.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ob začetku projektnega prikaza `r=2026-09-21`, filter=`all`, ne glede na uro naprave. | Razvojni test začetnega datuma/izbire; lastni test ponastavitve ob navigaciji in osvežitvi. |
| R02 | `s(t)=done ⇒ G(t,r)=done`; takšno opravilo ni v nobeni odprti skupini. | Scenarij dokončanega opravila z rokom pred datumom. |
| R03 | Za `s(t)≠done`: `d(t)<r ⇒ overdue`, `d(t)=r ⇒ today`. | Scenariji roka včeraj in na referenčni dan. |
| R04 | Odprto: `r<d(t)≤r+7 ⇒ week`, sicer po R04 `later` za `d(t)>r+7`; skupine so particija. | Meje +7/+8 in števci; ujemanje prikazanih ID-jev. |
| R05 | Primerjava koledarskih nizov oziroma celoštevilčnih UTC koledarskih dni, nikoli lokalnih časovnih razlik. | Datumi čez mesec/leto/prestopni februar in izvajanje v testnem brskalniku. |
| R06 | Pet števcev računa celoten projekt pred uporabo filtra; aria-label je `Število rokov <ključ>`. | Primerjava vseh petih števil in ponovitev po izbiri filtra. |
| R07 | Izbirnik vsebuje zahtevane vrednosti; izbere skupino brez spreminjanja nalog. | Izbira vseh filtrov ter primerjava ID-jev v tabeli/na tabli. |
| R08 | Veljaven datum takoj posodobi `r`, prikaz in števce; filter ostane isti. Prazno pokaže natančno opozorilo in ohrani `r`; naslednji veljaven datum ga odstrani. | Interakcijski scenariji vnosa datuma in brisanja. |
| R09 | Tabela in tabla prejemata isti filtrirani seznam; zamenjava pogleda ohrani `r`, besedilo polja in filter. | Preklop prikazov in primerjava naborov `data-task-id`. |
| R10 | Projektni prikaz je izoliran po projektu; nov projekt in osvežitev začneta z začetnima vrednostma. Filter ni v URL-ju ali trajni shrambi. | Navigacija, reload ter pregled URL-ja in `localStorage`. |
| R11 | Prazen projekt ima pet ničel. Prazen filter v nepraznem projektu prikaže `Ni opravil v izbrani skupini.` in kontrolniki ostanejo dosegljivi. | Prazen projekt in skupina brez zadetkov. |
| R12 | API ostane edini vir podatkov; pregled uporablja samo branje ter ne spreminja polj/podrobnosti. Folio ostane prilagodljiv, na 390 px ni vodoravnega preliva celotne strani. | API-regresijski testi, pregled omrežnih zapisov, vizualno/prelivno preverjanje. |

## Izvedba in sledljivost

Izračun skupin, lokalno stanje, kontrolniki, števci in filtriranje so v `src/App.tsx`; tabla prejme isti filtrirani seznam prek obstoječega `src/TaskBoard.tsx`; odzivna postavitev je v `src/styles.css`. Lastni sprejemni testi so v `tests/agent/P08.spec.ts`. Funkcija `calendarDayNumber` pretvori veljavni koledarski datum v ordinalni dan, `deadlineGroup` pa uporabi razlike `d-r` po predikatu zgoraj. Tabela in tabla prejmeta `visibleTasks`; števci se izračunajo iz vseh opravil pred filtrom. Izvedena preverjanja in omejitve so podrobno zabeleženi v [verification.md](verification.md).

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | `r=2026-09-21`, filter=`all`; ključ projekta ponovno ustvari stanje | D01; P08: projektna menjava in reload | `src/App.tsx:11`, `:46-49`, `:161` | Uspelo; končni `npm run check`, 50 testov. |
| R02 | `done` razvrstimo pred rokom | D04; P08: `done-past` ostane v done | `src/App.tsx:35-36` | Uspelo; končni `npm run check`. |
| R03 | Negativna razlika je overdue, ničelna today | D01; P08: pred datumom, danes | `src/App.tsx:37-40` | Uspelo; končni `npm run check`. |
| R04 | Razlika 1–7 je week; več kot 7 later | D02; P08: prestopni datum in meje leta ter +8 | `src/App.tsx:40-41` | Uspelo; končni `npm run check`. |
| R05 | Ordinalni gregorijanski koledarski dan | P08: 29. februar, mesečna in letna meja | `src/App.tsx:24-32` | Uspelo; končni `npm run check`. |
| R06 | Števci iterirajo po vseh `tasks`, pred `visibleTasks` | D02; P08: števec `week` ostane 2 med filtrom `overdue` | `src/App.tsx:50-53`, `:98-102` | Uspelo; končni `npm run check`. |
| R07 | Filter izbere v izvornem vrstnem redu | D01/D04; P08: zaporedje all/week/later/done na ID-jih | `src/App.tsx:53`, `:117-129`; `TaskBoard` prejme `visibleTasks` | Uspelo; končni `npm run check`. |
| R08 | Prazna vrednost ne spremeni `referenceDate`; veljavna jo posodobi in skrije opozorilo | D03; P08: prazno, opozorilo, zadnji izračun in obnovitev | `src/App.tsx:46-48`, `:76-98` | Uspelo; končni `npm run check`. |
| R09 | Pogleda uporabljata isti `visibleTasks`; stanje ostane v `ProjectView` | P08: filter/date ter ID-ji v tabeli in tabli | `src/App.tsx:44-53`, `:112-129` | Uspelo; končni `npm run check`. |
| R10 | Stanje je React state znotraj `ProjectView`; ni v URL/shrambi | P08: preklop projekta, reload, `localStorage`, URL | `src/App.tsx:44-49`, `:161` | Uspelo; končni `npm run check`. |
| R11 | Vsota praznega seznama je 0; prazna izbrana skupina pokaže zahtevano besedilo | P08: prazen projekt in skupina brez zadetkov | `src/App.tsx:51-53`, `:98-102`, `:117`; `src/styles.css:67` | Uspelo; končni `npm run check`. |
| R12 | Obstoječi API za branje ostane edini vir; ne dodamo zapisov, ohranimo obstoječe podrobnosti in notranje drsenje | D04 in P08: `readonly`; baseline details/mobile | `src/App.tsx:45`, `:121-133`; `src/styles.css:56-67`, `:78-100`, `:182-190` | Uspelo; končni `npm run check`; omejitve v `verification.md`. |

### Zapis popravkov specifikacije

- Začetna specifikacija P08 pred implementacijo.
- Po implementaciji sem predvidene lokacije in čakajoče izide zamenjal z dejanskimi povezavami do kode in rezultatov `npm run check`.

## Odprta vprašanja in omejitve

Navodila določajo veljavne koledarske datume kot domeno API-ja, zato aplikacija ne potrebuje poti za popravljanje neveljavnih datumov iz API-ja. Izraz »osvežitev« je zajet kot ponovni obisk/ponovni zagon strani; obstoječi vmesnik nima gumba za osvežitev podatkov. Dejanske rezultate testov in vse zaznane omejitve bo treba dopisati po izvedbi.
