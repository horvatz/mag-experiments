# P10 – implementacija in preverjanje

Implementacija je zaključena in pripravljena za pregled. Končni `npm run check`
je uspešen: slog, tipi, produkcijska gradnja in **53/53 testov** (38 osnovnih,
8 razvojnih P10, 7 lastnih). Dokaz: [check.log](check.log), zadnja vrstica
`53 passed (24.9s)`, izhodna koda procesa 0.

## Potek in spremembe

1. Na začetku faze je bil shranjen ta zapis z načrtovanimi, še neizvedenimi
   preverjanji. Prebrani so bili PROJECT_RULES.md, task/instructions.md,
   task/specification-template.md, predana specifikacija, dizajn, koda in testi.
2. Dodan je [useTaskOrder.ts](../../src/useTaskOrder.ts): lokalna permutacija
   ID-jev, neodvisni nemutirani posnetki, omejitev 20 razveljavitev, ponovitve
   ter razveljavljiv reset. Neveljavni premiki se ustavijo pred spremembo
   zgodovine. Nov veljaven premik in reset počistita ponovitve.
3. [App.tsx](../../src/App.tsx) uporablja skupno stanje v ProjectView, ki že
   ima ključ projekta. Prejem polja iz GET inicializira stanje; preklop pogleda
   in podrobnosti ne odstrani ProjectView. Dodani so zgodovina, gumbi ter
   stolpec Mesto. Števci še vedno izhajajo iz nespremenjenega polja API.
4. [TaskOrderControls.tsx](../../src/TaskOrderControls.tsx) vsebuje enake
   dostopne kontrole ob vrsticah in karticah, zunaj povezav. [TaskBoard.tsx](../../src/TaskBoard.tsx)
   filtrira urejeno polje po stalnih stanjih in uporablja globalna mesta.
   Dostopno ime povezave je naslov + ID prek aria-label, kar ohrani obstoječa
   imena tudi pri ID-jih s presledki ali ločili; prejšnji aria-labelledby je
   v ID vključeval surovo besedilo. [styles.css](../../src/styles.css) uporablja
   obstoječe barve, gradnike in prilagodljivo postavitev Folio.
5. Dodanih je sedem vedenjskih testov v [order.spec.ts](../../tests/agent/order.spec.ts).
   Najprej sta uspela `npm run lint` in `npm run build`. Prvi celotni zagon
   je dosegel 52/53: A04 je napačno zahteval :focus-visible takoj po programskem
   focus() po kliku. Test je popravljen na dejanski Tab/Shift+Tab in preverja
   fokus, viden obris ter aktivacijo z Enter. Koda zaradi tega ni bila spremenjena.
   Prvotni izid je ohranjen v [check-first.log](check-first.log).
6. Ponovljeni celotni `npm run check` je dosegel 53/53. Nato je bil zaključen
   zapis predaje, več kot 60 sekund pred rokom faze.

## Sledljivost R01–R12

Vsi spodnji testi so dejansko izvedeni in uspešni v končnem [dnevniku](check.log).
D01–D04 pomenijo razvojne teste v obeh projektih desktop/mobile. A01–A06
pomenijo poimenovane teste v lastni datoteki; A06 ima ločena primera 0 in 1.

| Zahteva | Pogoj in koda | Izvedeni dokaz |
| --- | --- | --- |
| R01 | `initialState` prevzame ID-je v vrstnem redu polja, `orderedTasks` preslika po ID-ju, kontrole kažejo indeks + 1. | A01: 13 opravil, drugačni ID-ji, Unicode, presledek, poševnica in ločila, isti naslovi; vsi ID-ji in vsa mesta. |
| R02 | `move` zamenja soseda v kopiji permutacije; Task objektov ne spreminja. | D01, A01: obe smeri in enakost ostalih celic po ID-ju; A04: globalni sosed na tabli. |
| R03 | `move` preveri obstoj ID-ja in globalne meje; TaskOrderControls onemogoči oba robova. | D01, A03: več native click() na obeh onemogočenih robovih ohrani P/U/R; A06-1. Neznani ID je dodatno statično pregledan. |
| R04 | `commit` shrani celotni prejšnji P; `undo` obnovi vrh sklada in shrani sedanji P v redo. | D02, A02: vseh 20 vmesnih permutacij in števcev pri razveljavljanju; A03. |
| R05 | `redo` obnovi vrh redo in prejšnji P doda v undo. | D02, A02: vseh 20 ponovitev s celotnim pričakovanim seznamom ID-jev; A05 nadaljuje redo po navigaciji. |
| R06 | `commit` počisti redo, guard in onemogočen reset ohranita stanje. | D03, A03: dva razveljavljena koraka, robni dejanji in reset ohranijo oba; veljaven premik počisti redo. |
| R07 | `remember` ohrani zadnjih 20 posnetkov; ponovitve ohranijo vse trenutno razveljavljene korake. | A02: 21 premikov, 20 undo do stanja po prvem premiku, 20 redo, nato reset pri polni zgodovini. |
| R08 | `reset` uporabi isti commit kot premik, samo kadar P ni začetni. | D04, A03: reset z nepraznim redo, undo/redo reseta, reset pri že začetnem redu; A02: meja 20 ob resetu. |
| R09 | App renderira urejeno polje; TaskBoard filtrira globalno urejeno polje in prejme skupni move. | D04, A04: premik med različnima stanjema, vsa globalna mesta in podsekvence vseh treh stolpcev; stalni števci. |
| R10 | Hook živi v ProjectView, katerega ključ je project.id; prejem novega izhodišča ponastavi stanje. | A05: oba sklada skozi tabla/preglednica, podrobnosti in oba načina zapiranja; A→B→A; reload v obeh pogledih. Osnovne navigacijske regresije. |
| R11 | App izpiše dolžini skladov in disabled pri ničli; enaki kontrolni pogoji veljajo za 0/1. | D03, A02–A06: števci in gumbi; A06-0 oba projekta prazna, A06-1 enojni in prazen projekt v obeh pogledih. |
| R12 | Permutacije vsebujejo iste ID-je; brez zapisov ali trajne shrambe, štetje in podrobnosti uporabljajo izvorne podatke. | A01: ostala polja in prave podrobnosti pri enakih naslovih; A02: vsaka celotna permutacija; A04: stanja, tipkovnica in 390 pik; A01/A02/A04/A05/A06 + D04: nič API zapisov. 38 osnovnih testov in vizualni pregled. |

## Vizualno preverjanje

Ročni ogled je uporabil `WEB_PORT=5193 API_PORT=3123 npm run dev` ter povezavo
`chromium.connect(wsEndpoint)` iz task/browser.json, ločen brskalniški kontekst.
Ogledani so vsi štirje shranjeni posnetki:

- [Preglednica 1440 × 960](desktop-table.png)
- [Tabla 1440 × 960](desktop-board.png)
- [Preglednica 390 × 844](mobile-table.png)
- [Tabla 390 × 844](mobile-board.png)

Ohranjeni so levi oziroma zgornji meni, tipografija, barve, kartice, stolpci in
notranje drsenje. Novi gumbi se na telefonu prelomijo v vrstici. Pri obeh
mobilnih pogledih velja `document.documentElement.scrollWidth = innerWidth = 390`.
Med ogledom ni bilo dogodkov `pageerror`. Meritve: [visual-check.json](visual-check.json).

## Omejitve in predaja

- Napak ali izpustov predane specifikacije glede R01–R12 ni bilo ugotovljenih.
  Specifikacija, njena zgodovina ter datoteke pregledovalca niso spremenjene.
- Končni skriti testi niso dostopni in niso navedeni kot opravljeni. Lastni
  testi ne naštevajo vseh možnih zaporedij dejanj ali vseh dovoljenih besedil.
  Kombinacija napake nalaganja podrobnosti z nepraznima skladoma ni posebej
  avtomatizirana; neodvisnost stanja je statično pregledana, napake/navigacijo
  pokrivajo obstoječe regresije.
- Aplikacija ne uvaža testnih pripomočkov in ne uporablja /__test/ ali lokalne
  shrambe. Obstoječi `updateTask` v api.ts ostaja nespremenjen in ga nova
  funkcionalnost ne kliče. Testne kontrole uporabljajo samo testi.
- Javni internet ni dovoljen. Uporabljene so bile samo lokalne storitve naloge.
  Chromium je nameščen; chromium.launch ni podprt, uporabljena je zahtevana
  povezava connect. Odvisnosti, infrastruktura, skupni tipi in skupni testi
  niso spremenjeni.
- `git status` ni bil uporaben zaradi manjkajoče poti Xcode CommandLineTools
  (`xcrun: invalid active developer path`). Vej, oddaljenih repozitorijev,
  potiskanja ali PR ni bilo. Npm opozorili glede http-proxy in barv sta iz
  okolja in nista preprečili uspešnega preverjanja.
- Pregledovalec lahko začne pri useTaskOrder.ts, nato preveri povezavo v App
  in TaskBoard ter dokazila zgoraj. Ni znane neizpolnjene zahteve ali odprte
  implementacijske napake.
