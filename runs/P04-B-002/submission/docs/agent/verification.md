# P04 — Implementacija in preverjanje

## Začetni zapis

Vloga: implementer. Prebrani so PROJECT_RULES.md, task/instructions.md, predloga in predana specifikacija. Obvezne so vse zahteve R01–R12. Spremembe bodo omejene na src/, tests/agent/ in ta zapis. Ohranjam obstoječi videz Folio in javni API.

## Začetni načrt preverjanj (ob ustvarjanju še niso bila izvedena)

- Pregled obstoječe kode, dizajna in razvojnih testov.
- Implementacija stabilne projekcije z dvema ključema, štirih kontrol in ponastavitev.
- Dodatni smiselni testi za Unicode, stabilnost, kombinacije smeri in robne podatke.
- `npm run check`: slog, tipi, gradnja, osnovni, razvojni in lastni testi.
- Preverjanje ohranitve identitete, pogleda, podrobnosti, števcev in odzivnosti pri 390 px.

## Stanje in omejitve

Ob začetnem zapisu testi še niso bili izvedeni; končni rezultati so spodaj. Končni skriti testi niso dostopni. Odvisnosti in infrastruktura so samo berljive, javni internet je blokiran. Za brskalnik je predpisan Chromium prek `task/browser.json` in `chromium.connect`; neposreden launch ni podprt. Uporabljena skupna Playwright konfiguracija bere ta endpoint in uporablja povezavo z obstoječim brskalnikom. Rok faze: 2026-09-25T18:35:41.963Z; zadnja minuta je namenjena predaji.

Ob prvi predaji je specifikacija zajemala R01–R12, vendar še ni imela konkretne sledljivosti na kodo/teste in zahtevanih formalnih predikatov. Dopolnitve so zapisane tukaj. Poznejši popravek avtorja specifikacije je obravnavan v razdelku nadaljevanja po pregledu.

## Izvedene spremembe

- `src/taskSorting.ts`: čista projekcija, normalizacija NFD in samo U+0300–U+036F, primerjava z `<`/`>`, določeni rangi stanj, leksikografski vrstni red veljavnih datumov YYYY-MM-DD. Smeri veljata ločeno za vsak ključ; izvorni indeks razreši popolno enakost. Vhodno polje in objekti ostanejo nespremenjeni.
- `src/TaskSortControls.tsx`: štirje označeni HTML selecti in gumb za ponastavitev vseh vrednosti.
- `src/App.tsx`: stanje v obstoječi komponenti projekta, ki ima `key={project.id}`; ista projekcija za preglednico in tablo; števci še vedno iz izvornih podatkov. Navigacija in API ostajata obstoječa.
- `src/styles.css`: kontrolniki uporabljajo obstoječe barve, robove in zaobljenost Folio; vrstice se prelomijo na ozkih zaslonih.
- `tests/agent/sorting.spec.ts`: šest lastnih testov A01–A06. Testni mehanizem ostaja samo v testih.

## Predikati in povezava z zahtevami

Naj bo T prejeto polje, i(t) izvorni indeks, S nastavitev in P(T,S) rezultat. N(x) = lowercase(remove[U+0300..U+036F](NFD(x))). Ck(a,b) je primerjava normaliziranih nizov, rangov stanj oziroma datumov. Dasc(c)=c in Ddesc(c)=-c.

- R01/R06: S.primary=original ⇒ P(T,S) ima enako zaporedje ID-jev kot T, ne glede na druge kontrole.
- R02–R06: primerjava je prva neničelna vrednost v zaporedju [Dprimary(Cprimary(a,b)), Dsecondary(Csecondary(a,b)), i(a)-i(b)]. Pri secondary=none je druga vrednost 0. Indeks se nikoli ne obrne.
- R07: za vsak status s je zaporedje kartic v stolpcu s enako filter(P(T,S), status=s); vrstni red stolpcev je todo, in_progress, done.
- R08–R10: sprememba pogleda/podrobnosti ohrani S; menjava projekta, osvežitev ali gumb nastavijo S=(original,asc,none,asc).
- R11/R12: multiset(ID(P(T,S)))=multiset(ID(T)); vsak ID je enkraten, vsak objekt v rezultatu je isti objekt kot na vhodu, T po izračunu ostane enak T pred izračunom. Sprememba S ne sproži zapisovalne zahteve API.

## Sledljivost po izvedenem preverjanju

| Zahteve | Koda | Preverjanje | Trenutni izid |
| --- | --- | --- | --- |
| R01 | defaultTaskSort, stanje ProjectView | D01, A04 | Uspešno; check.log |
| R02 | normalize, compareKey | D01, A01, A02 | Uspešno; check.log |
| R03 | statusOrder, compareKey | D02, D03, A02 | Uspešno; check.log |
| R04–R06 | sortTasks in indeks ob enakosti | D02, A01–A03 | Uspešno; check.log |
| R07 | sortedTasks v App, obstoječi filter v TaskBoard | D03, A04, A05 | Uspešno; check.log |
| R08 | stanje ProjectView | A04 | Uspešno; check.log |
| R09 | key projekta, lokalni useState | A04 | Uspešno; check.log |
| R10 | TaskSortControls, sortTasks | D04, A03, A04, A06 | Uspešno; check.log |
| R11 | kopiranje v sortTasks, nespremenjeni števci/API | D04, A03–A05 | Uspešno; check.log |
| R12 | obstoječe povezave po ID, novi prilagodljivi slogi | osnovni testi, A04–A06 | Uspešno; check.log in mobilni posnetek |

## Dejanski rezultati in dokazi

`npm run check` je zaključen z izhodno kodo 0. Celoten dnevnik je [check.log](check.log).

- ESLint: uspešno.
- TypeScript `tsc --noEmit`: uspešno.
- Vite produkcijska gradnja: uspešno.
- Playwright: **52 passed (20.6s)**; 38 osnovnih (14 API + 12 desktop + 12 mobile), 8 razvojnih P04 (4 desktop + 4 mobile), 6 lastnih testov.
- A01 preveri normalizirane enakosti, leksikografski vrstni red številk, ohranitev kombinirnega znaka izven U+036F in UTF-16 vrstni red astralnega znaka glede na U+E000.
- A02 preveri sekundarne ključe, neodvisne smeri, prestopni datum, različna leta, vrstni red stanj in enaka ključa.
- A03 preveri vseh 100 kombinacij nastavitev na zamrznjenem vhodu ter praznem in enoelementnem polju. Preveri identiteto objektov in nespremenjenost vhoda; pri original tudi točno zaporedje.
- A04 preveri stanje kontrol, vrstni red obeh pogledov, vseh pet podrobnosti z enakimi naslovi, stalne stolpce, števce, ponastavitev gumba/projekta/osvežitve in odsotnost zapisov API.
- A05 preveri 14 opravil z drugačnimi ID-ji pri širini 390 px, podrobnosti po ID, oba pogleda in `document.documentElement.scrollWidth <= innerWidth`.
- A06 preveri razpoložljivost in uporabo vseh ključev/smeri v praznem in enoelementnem projektu ter preklop obeh pogledov.
- Vizualno pregledan [mobilni posnetek](../../test-results/p04-mobile-board.png): ohranjena navigacija, barve in kartice Folio; štiri kontrole v dveh stolpcih, gumb v naslednji vrstici; vodoravno drsenje je omejeno na tablo. HTML poročilo: `playwright-report/html/index.html`.

Med zagonom so bila le okoljska opozorila npm o `http-proxy` ter Node o `NO_COLOR`/`FORCE_COLOR`; preverjanja niso odpovedala. Po uspešnem preverjanju koda in testi niso bili več spreminjani.

Dodatna omejitev okolja: `git status --short` ni uspel, ker sistemski xcrun ne najde `/Library/Developer/CommandLineTools`. Git sprememb/vej zato ne preverjam s tem orodjem; push ali PR nista del naloge. Spreminjane datoteke so navedene zgoraj.

## Predaja pregledovalcu

Implementacija je končana in vsi dostopni testi so uspešni. Ni znane neizpolnjene zahteve R01–R12. Skriti končni testi niso bili izvedeni, ročni vizualni pregled je omejen na navedeni mobilni posnetek; namizno delovanje pokrivajo avtomatizirani testi. Začasno stanje funkcionalnosti je samo v React stanju, brez shranjevanja v URL ali trajno shrambo.

Ob prvi predaji je bilo odstopanje specifikacije dokumentacijsko: njena tabela izvedbe je ostala začetna, brez konkretnih povezav in predikatov. Zgornja sledljivost in predikati so dopolnili ta del v zapisu implementerja. Implementer ni spreminjal datotek specifikatorja, pregledovalca, infrastrukture, skupnih testov, shared/ ali server/. Prva predaja je bila zaključena več kot 60 sekund pred rokom faze.

## Nadaljevanje po pregledu — začetni zapis

25. 9. 2026, rok nadaljevane faze 18:41:41.734Z. Ponovno prebrani PROJECT_RULES.md, task/instructions.md, predloga, review.json, trenutna specification.md in specification-history.md. Pregled vsebuje eno ugotovitev, namenjeno specifikaciji; `codeChangesRequired=false`. Ugotovitev sprejemam kot utemeljeno dokumentacijsko pomanjkljivost prvotnega osnutka. Trenutno specifikacijo je njen avtor že dopolnil in to zabeležil v zgodovini.

Načrt tega nadaljevanja: preveriti, ali dopolnitev vsebuje zahtevane povezave, predikate, vseh dvanajst vrstic sledljivosti ter pravilno pripisane dejanske rezultate. Preverjanje povezav in skladnosti še ni izvedeno. Sprememba kode ni zahtevana; odločitev o dodatnih funkcionalnih preverjanjih bo sledila preverjanju ugotovitve. Datoteke specifikacije, njene zgodovine in pregleda ostanejo samo berljive.

## Nadaljevanje po pregledu — obravnava in rezultat

| Ugotovitev iz review.json | Presoja | Obravnava | Končno stanje |
| --- | --- | --- | --- |
| specification, R01–R12: začetna tabela, manjkajoči predikati in povezave | Sprejeta; prvotni osnutek je bil dokumentacijsko nepopoln. | Izvirni avtor je dopolnil specification.md in specification-history.md. Implementer je preveril zahtevane povezave, predikate, ločene vrstice sledljivosti in pripis rezultatov. | Odpravljena v trenutni specifikaciji; sprememba kode ni potrebna. |

Obravnavana je edina ugotovitev pregleda; zavrnjenih ugotovitev ni. `review.json` ostaja zgodovinski zapis pregleda pred popravkom specifikacije in ni bil spremenjen.

Dejansko izvedeno preverjanje v tem nadaljevanju: lokalna Node skripta za skladnost dokumentov je zaključena z izhodno kodo 0. Dnevnik je [review-response-check.log](review-response-check.log). Uspešno potrjuje:

- vseh sedem lokalnih povezav trenutne specifikacije, vključno s tremi zahtevanimi sidri v verification.md;
- vseh dvanajst posameznih vrstic R01–R12 in odstranitev začetnih označb iz tabele;
- zahtevane povezave na predikate, sledljivost in rezultate ter pripis izvedbe testov implementerju;
- zapis sprejete ugotovitve in dopolnitve v specification-history.md;
- skladnost navedbe 52 uspešnih testov z ohranjenim check.log in obstoj navedenih datotek kode/testov.

Ponovno prebrana sta tudi modul razvrščanja in komponenta kontrol ter preverjena vključitev iste projekcije in lokalnega stanja v App.tsx. Dopolnitev specifikacije ne uvaja novega vedenja glede na že izvedene izvirne zahteve. V tem nadaljevanju koda in testi niso bili spreminjani, zato `npm run check` ni bil ponovno izveden; zgoraj navedenih 52 uspešnih testov ostaja rezultat prvotnega zagona implementerja, ne novega zagona. Novo preverjanje je omejeno na dokumentacijski popravek. Omejitve skritih testov, namiznega vizualnega pregleda in okolja ostajajo veljavne.

Končna predaja: edina ugotovitev je obravnavana in odpravljena s popravkom avtorja specifikacije; implementacija nima ugotovljenih odprtih napak. V nadaljevanju sta spremenjena samo ta zapis in dodan njegov dnevnik preverjanja. Predaja je zaključena več kot 60 sekund pred skupnim rokom 18:41:41.734Z.
