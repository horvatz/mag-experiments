# P10 — izvedeno preverjanje

Postopek A, en agent, 22. september 2026 po lokalnem času. Specifikacija je
bila zapisana pred implementacijo v [specification.md](specification.md).
Izvedba je zaključena znotraj omejitve 20 minut. Spremenjena izvorna koda,
lastni testi in dokumentacija so samo v `src/`, `tests/agent/`, `docs/agent/`.
Običajne izhodne datoteke preverjanj je ustvarila nespremenjena infrastruktura.

## Rezultat

Implementirane so R01–R12: globalna permutacija po ID-jih, sosednja premika,
20 razveljavitev, ponovitve, razveljavljiv začetni vrstni red, globalna mesta
v obeh pogledih in lokalna življenjska doba stanja trenutnega projekta.
Gumbi in števec se ujemajo z zgodovino. Objekti opravil se ne spreminjajo;
nova funkcionalnost nima zapisov na API ali trajne shrambe.

Končni `npm run check` je končal z izhodno kodo **0**:

- ESLint: uspešno.
- TypeScript (`tsc --noEmit`): uspešno.
- Produkcijska gradnja Vite: uspešno.
- Playwright: **55 uspešnih, 0 neuspešnih, 0 preskočenih** (27,8 s).
  To je 38 preverjanj izhodišča, 8 razvojnih preverjanj P10 in 9 lastnih
  preverjanj (A06 se izvede za prazni in enoopravilni projekt).

Dokaz celotnega zagona: [check-final.log](check-final.log).
Testna koda: [order.spec.ts](../../tests/agent/order.spec.ts).
Skupni razvojni testi: [P10.spec.ts](../../tests/development/P10.spec.ts).

## Sledljivost zahtev, izvedbe in dokazov

Vsi spodnji testi so bili dejansko izvedeni v končnem uspešnem zagonu.
D01–D04 so bili izvedeni vsak v namiznem in mobilnem projektu.

| Zahteva | Preverjeni pogoj | Koda | Izvedeni testi in izid |
| --- | --- | --- | --- |
| R01 | Prejeto zaporedje, mesta 1..N, enaki naslovi in ID s presledki, Unicode ter ločili. | [taskOrder.ts](../../src/taskOrder.ts) `createOrder`; [TaskList.tsx](../../src/TaskList.tsx) projekcija po ID; [TaskOrderControls.tsx](../../src/TaskOrderControls.tsx). | D01, A01: uspešno; A01 ima 26 opravil (25 ustvarjenih + posebno). |
| R02 | Gor/dol zamenjata natanko globalna soseda; polja ostanejo enaka. | `orderReducer` veja `move`; TaskList ohrani izvorne objekte. | D01, A01, A04, A08: uspešno. |
| R03 | Prvi gor/zadnji dol sta disabled, ponovljeni robni in neznani premiki ohranijo tudi zgodovino. | `orderReducer` varovala; TaskOrderControls `disabled`. | D01, A02, A06, A08: uspešno. A08 preveri identiteto stanja tudi pri nepraznem skladu ponovitev. |
| R04 | Undo obnovi celotno permutacijo, prejšnji trenutni red prenese med ponovitve. | `orderReducer` veja `undo`. | D02, A02, A03, A08: uspešno; A03 preveri vsako od 20 obnovljenih zaporedij. |
| R05 | Več ponovitev v pravilnem zaporedju, brez izgubljenih ali podvojenih ID-jev. | `orderReducer` veja `redo`. | D02, A03, A08: uspešno; A08 preveri vse shranjene permutacije v 600 korakih. |
| R06 | Novo veljavno dejanje zavrže vse ponovitve; robno dejanje jih ohrani. | `commit`, varovala `move`. | D03, A02, A08: uspešno. |
| R07 | 21 različnih premikov ohrani samo zadnjih 20 korakov; vseh 20 je mogoče ponoviti. | `historyLimit`, `commit`, `redo`. | A03: uspešno, preverjeni vsi vmesni vrstni redi in števci. A08: uspešen invariant meje. |
| R08 | Reset ustvari natanko eno razveljavljivo dejanje, počisti R; že začetni red ne spremeni zgodovine. | `isInitialOrder`, veja `reset`, gumb v TaskList. | D04, A02, A03, A08: uspešno; preverjen reset tudi pri polnem U in nepraznem R. |
| R09 | Tabla filtrira globalni vrstni red po nespremenjenih stanjih, prikazana mesta in premiki ostanejo globalni. | [TaskBoard.tsx](../../src/TaskBoard.tsx) `positions`, filtriranje stolpcev; TaskList. | D04, A04: uspešno; preverjen premik med različnima stanjema in sprememba relativnega reda v istem stolpcu. |
| R10 | Oba sklada in red preživijo oba pogleda ter podrobnosti; projekt/reload jih ponastavita. | [App.tsx](../../src/App.tsx) `ProjectView key={project.id}`; TaskList `useReducer`. | A05: uspešno z obema nepraznima skladoma, vrnitvijo na projekt in osvežitvijo v podrobnostih table; navigacijske regresije izhodišča uspešne. |
| R11 | Točno besedilo števca, disabled pri ničli, uporabnost projektov z 0/1 opravili. | TaskList orodna vrstica; TaskOrderControls. | D03, A02, A03, oba A06: uspešno; preverjena tudi dva prazna projekta. |
| R12 | Podatki/števci/podrobnosti nespremenjeni, brez zapisov in trajne shrambe, stran pri 390 pikah ne preliva. | Permutacije v taskOrder; projekcija v TaskList; TaskBoard; [styles.css](../../src/styles.css) kontrole in obstoječe drsenje. | D04, A01, A03–A07, A08 ter izhodišče: uspešno. A07 preveri tipkovnico, fokus, lokalno/sejno shrambo in odsotnost zahtev UI na `/__test/`. Ročni pregled opisan spodaj. |

## Dodatna preverjanja in pregled videza

Zagnan je bil lokalni strežnik z ukazom
`WEB_PORT=5193 API_PORT=3123 npm run dev`; dnevnik je
[manual-server.log](manual-server.log). Lastna skripta je prebrala
`wsEndpoint` iz `task/browser.json` in uporabila `chromium.connect`, brez
zaganjanja novega Chromiuma in brez javnega interneta.

Na izhodiščnih podatkih sem odprl preglednico, premaknil `web-02` gor in
odprl tablo. Pri širinah 1440 in 390 pik je bil števec po premiku
`Razveljavitve: 1. Ponovitve: 0.`; širina dokumenta je bila natanko 1440
oziroma 390. Dogodkov `pageerror` ni bilo. Meritve:
[manual-browser.json](manual-browser.json).

Vsi štirje zajeti posnetki so bili tudi vizualno pregledani. Ohranjen je
Folio z navigacijo, povzetkom stanj in nevtralnimi površinami; kontrolna
vrstica se na telefonu prelomi, tabela in tabla se pomikata znotraj prikaza:

- [Preglednica 1440](table-1440.png), [tabla 1440](board-1440.png).
- [Preglednica 390](table-390.png), [tabla 390](board-390.png).

Pregled `src/` z `rg` ni pokazal testnih kontrol ali lokalne/sejne shrambe.
Obstoječi `updateTask` v `src/api.ts` je ostal nespremenjen in nima klicev;
nova funkcionalnost uporablja samo že prebrane podatke. Za javne GET
odgovore v lastnih testih se uporablja obstoječi testni pripomoček, ki ni
uvožen v aplikacijo.

## Vmesni rezultati in odpravljene težave

1. Prvi `npm run check`, pred dodanimi lastnimi testi: **46 uspešnih**,
   izhod 0; [check-initial.log](check-initial.log).
2. Naslednji `npm run check` je opravil lint, nato obstal pri TypeScriptu
   v novem testnem oraklju (tri napake TS2339 pri zoženju unije dejanj).
   Razcep tipa `OrderAction` na ločene diskriminirane različice je odpravil
   težavo. Testi v tem neuspešnem zagonu niso bili izvedeni.
   Dokaz: [check-types-failed.log](check-types-failed.log).
3. Ponovni celotni pregled: **55 uspešnih**, izhod 0, naveden zgoraj.
4. Pomožni ukaz `python3` za preureditev datoteke ni mogel steči, ker
   okolju manjka `/Library/Developer/CommandLineTools/usr/bin/xcrun`.
   Brez sprememb infrastrukture sem isti korak uspešno izvedel z Node.js.
5. Kartice zdaj uporabljajo neposredno dostopno ime povezave namesto
   sestavljenih DOM ID-jev. Tako tudi ID s presledki/ločili pravilno odpre
   podrobnosti; obstoječa dostopna imena ostanejo enaka (A01 in izhodišče).
6. Okolje je zavrnilo neposredni `kill -TERM` za ročni strežnik
   (`operation not permitted`). Strežnik sem nato uspešno zaprl s Ctrl+C
   prek njegove izvorne terminalske seje (izhod 0).

Npm je izpisal opozorilo o nastavitvi `http-proxy`, Node pa o barvnih
nastavitvah izhodišča. Opozorili nista preprečili nobenega preverjanja.

## Omejitve in neizpolnjene zahteve

Ni znanih neizpolnjenih zahtev R01–R12. Skriti končni testi niso dostopni
in niso bili izvedeni. Brskalniško preverjanje je omejeno na nameščeni
Chromium (tudi mobilna emulacija); drugih brskalnikov in bralnikov zaslona
nisem preverjal. Naključni modelni test ima fiksno seme in 600 korakov;
ne predstavlja izčrpnega dokaza za vsa možna zaporedja. Zelo velikih
podatkovnih zbirk nisem zmogljivostno meril. Sočasne spremembe podatkov
brez osvežitve so zunaj dogovorjenega obsega.
