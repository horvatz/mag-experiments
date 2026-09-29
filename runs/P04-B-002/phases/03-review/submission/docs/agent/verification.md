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

Predana specifikacija zajema R01–R12, vendar še nima konkretne sledljivosti na kodo/teste in zahtevanih formalnih predikatov. Te dopolnitve bom zapisal tukaj, brez spreminjanja datotek specifikatorja.

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

Odstopanje predane specifikacije je dokumentacijsko: njena tabela izvedbe je ostala začetna, brez konkretnih povezav in predikatov. Zgornja sledljivost in predikati dopolnijo ta del v zapisu implementerja. Datoteke specifikatorja, pregledovalca, infrastruktura, skupni testi, shared/ in server/ niso bili spreminjani. Predaja je zaključena več kot 60 sekund pred rokom faze; čas je na voljo za neodvisen pregled in morebitne popravke.
