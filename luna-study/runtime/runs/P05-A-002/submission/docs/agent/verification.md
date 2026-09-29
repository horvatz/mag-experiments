# Preverjanje P05

Datum: 27. 9. 2026. Preverjanje je bilo izvedeno v lokalnem okolju projekta.

## Izvedeni ukazi in rezultati

- `npm run check` — uspešno. ESLint in TypeScript sta zaključila brez napak;
  Vite je zgradil produkcijski paket (1875 modulov). Playwright: **52/52
  testov uspešnih**: 14 API, 24 izhodiščnih namiznih/mobilnih, 8 P05 razvojnih
  namiznih/mobilnih in 6 agentnih.
- `npx playwright test --project=development-desktop --project=development-mobile`
  — uspešno, 8/8 razvojnih testov. Ta ciljni zagon je bil izveden pred polnim
  `npm run check`; polni zagon je nato ponovno preveril iste teste.

## Sledljivost zahtev

| Zahteva | Izvedeni dokaz |
| --- | --- |
| R01 | Agent `first, previous, 10 and all page boundaries` preverja začetni `all/all/1`, vse ID-je in status. |
| R02 | D01/D02 preverjata velikosti 2/5 in zadnji krajši odsek; agentni prehod čez vse strani preveri vrstni red in unikatnost 8 ID-jev, dodaten scenarij preveri 13 opravil pri velikosti 10. |
| R03 | D02 in agentni test preverita navigacijo ter onemogočene gumbe na robovih. |
| R04 | D04 preveri ponastavitev po spremembi velikosti; agentni scenarij preveri 10 in `all`. |
| R05 | D03 preveri filtriranje pred straničenjem; agentni prazen filter preveri `0/0` in vrnitev na prvo stran po odstranitvi filtra. |
| R06 | D03 primerja ID-je v preglednici in tabli; agentni testi preverijo isti odsek ob preklopu in njegovo razvrstitev v tablo. |
| R07 | Izhodiščni testi preverijo podrobnosti po ID; agentni test odpre/zapre podrobnosti na strani 2 in preveri ohranitev strani ter pogleda. |
| R08 | Agentni test potrdi, da filter/velikost ne spreminjata URL-ja, nato spremeni projekt in osveži stran po izbiri strani 2; preveri ponastavitev velikosti, filtra in strani. |
| R09 | D02 preveri zadnji krajši odsek in natančno besedilo statusa; agentni testi preverijo eno stran in zadnjo stran od 13 opravil. |
| R10 | Agentni testi preverijo prazen filter in prazen projekt, status `Stran 0 od 0. Prikazano 0–0 od 0.`, onemogočeno navigacijo ter povratek po odstranitvi filtra. |
| R11 | Agentni test preveri projektne števce 4/2/2, nespremenjen števec 8 in števce table za trenutno stran 1/1/0. |
| R12 | D04 preveri, da straničenje ne pošlje zapisov; izhodiščni API/UI testi ter celoten polni sklop so uspešni. |

Implementacijske povezave in sprejemni pogoji za vsako zahtevo so v
[specifikaciji](specification.md). Lastni scenariji so v
[P05-edge.spec.ts](../../tests/agent/P05-edge.spec.ts); skupni P05 scenariji
so v `tests/development/P05.spec.ts`.

## Omejitve

Lastni podatki so zajeli prazen projekt, prazen filter, dva opravila, osem
opravil in seznam 13 opravil z enkratnimi ID-ji. Primer z natanko enim
opravilom ni bil ločeno izveden. Končnih, nedostopnih testov ni mogoče
potrditi; večje sezname od 13 opravil podpirata isto splošno filtriranje in
rezanje polja, vendar niso bili posebej preizkušeni. Širino 390 pik in
odsotnost vodoravnega prelivanja preverja skupni mobilni razvojni test.

Vsi zahtevani ukazi za kodo in teste so se izvedli lokalno; okoljska omejitev
ni preprečila preverjanja. Dodatni `git status --short` ni deloval, ker se je
sistemski `git` ustavil z napako `xcrun: invalid active developer path`.
Izvoz nima zgodovine Git; obseg sprememb sem zato preveril z ogledom dovoljenih
map, v katerih so [App.tsx](../../src/App.tsx), [styles.css](../../src/styles.css),
[agentni testi](../../tests/agent/P05-edge.spec.ts) ter ta dva dokumenta.
