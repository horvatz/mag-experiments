# P07 – predaja implementacije

Implementer je prebral izvirne zahteve, pravila, predlogo in predano specifikacijo v1. Implementirane so R01–R12. Specifikacija in njena zgodovina ter pregledovalčeve datoteke niso spreminjane. Začetni in sprotni zapis preverjanj je v [verification.md](verification.md).

## Spremembe in pravila

- `src/useFavorites.ts`: parser vrne `Set<string>` samo za verzijo 1 in polje samih nizov. Začetno branje in storage dogodki ne zapisujejo. Lokalna preklop/brisanje kopirata množico in poskusita zapisati samo `{version:1,ids:[...ids].sort()}`. Napaka dostopa ohrani lokalno stanje in opozorilo. Neznani ID-ji ostanejo v globalni množici.
- `src/App.tsx`: množica živi v App; filter živi v ProjectView, katerega ključ je projektni ID. Prikaz uporablja `tasks.filter(t => !favoritesOnly || favorites.has(t.id))`; števec in projektno brisanje uporabljata celoten seznam. Prazni filtrirani pogledi ohranijo kontrole. Vrstice dobijo ločen FavoriteButton.
- `src/FavoriteButton.tsx`: dostopen gumb z natančnim imenom in aria-pressed. Zvezda je dekorativna; gumb ni znotraj povezave.
- `src/TaskBoard.tsx`: prejme isti filtrirani seznam in množico. Števci izhajajo iz vidnih kartic; vsi trije stolpci ostanejo. Gumb je sorojenec povezave. Dostopno ime povezave uporablja naslov in ID neposredno, kar podpira tudi presledke/ločila v ID-ju brez neveljavnih IDREF tokenov.
- `src/styles.css`: ohranjena Folio paleta, navigacija, kartice in notranje drsenje; dodani le slogi kontrol, zvezdice in opozorila.

Predikati iz specifikacije so ohranjeni: `toggle(i): F' = F △ {i}`, `clear(p): F' = F ∖ {t.id | t ∈ Tₚ}`, `visible = [t ∈ Tₚ | !q ∨ t.id ∈ F]`, `X = |F ∩ Iₚ|`, `M = |Tₚ|`. Projektna menjava ohrani F in ponastavi q; dogodek za pravi ključ nadomesti F po istem parserju.

## Sledljivost

Vsa navedena S-imena so v [favorites.spec.ts](../../tests/agent/favorites.spec.ts); D01–D04 so nespremenjeni razvojni testi in tečejo na namizju ter mobilno. **Končni npm run check je uspešen, izhod 0: lint, typecheck, produkcijska gradnja in 67/67 testov v 26,6 s (38 osnovnih, 8 razvojnih, 21 lastnih).** Vsi testi v spodnji tabeli so bili uspešno izvedeni; neposreden dokaz imen in rezultatov je [check.log](check.log).

| Zahteva | Pogoj in končna koda | Izvedeni test/scenarij in dokaz |
| --- | --- | --- |
| R01 | Ločen gumb po ID-ju; FavoriteButton in izris vrstic/kartic. | D01; S01 table/board: enaka naslova, ID `Ž / ?#😀`, tipka Space, brez odprtja dialoga, pravilen opis in vrnitev fokusa. |
| R02 | Samo verzija in enkratni ID-ji, sort po UTF-16; useFavorites.save. | D03; S02: točen JSON, emoji pred U+E000, odstranjeno dodatno polje ob uporabniškem zapisu. |
| R03 | Inicializacija Set, brez izmišljenih opravil; useFavorites parser, ProjectView.visibleTasks. | S02: dvojniki, ID drugega projekta, neznana ID-ja, nespremenjena shramba pred klikom, osvežitev. |
| R04 | Neveljaven zapis → prazna množica, brez zapisa ob nalaganju; parseFavorites in inicializacija. | S03, 10 primerov: manjkajoč ključ, JSON, null, skalar, polje, napačna/nizovna verzija, manjkajoči/nepolje/mešani ids; naslednji klik ostane uporaben. |
| R05 | Filter false, izvorni vrstni red; ProjectView state in visibleTasks. | D02; S04/S06: 13 opravil, drugačen vrstni red, oba pogleda; S06/S08: nič in eno opravilo. |
| R06 | Takojšnja odstranitev, prazno sporočilo in dostopne kontrole; ProjectView. | D02; S04/S06: odstranitev vseh treh v tabli, prazno stanje tudi po vrnitvi v preglednico in izklop filtra. |
| R07 | Globalna množica in projektni filter deljena med pogledi; App/ProjectView/TaskBoard. | D04; S04/S06: aktiven filter skozi preklop; S01: podrobnosti po posebnem ID-ju. |
| R08 | F ostane, q=false pri novi instanci ProjectView; App ključ projektnega ID-ja. | S05: spremembe v dveh projektih in povratek; S02: osvežitev ohrani F in ponastavi q. |
| R09 | Brisanje celotnega Tₚ, disabled pri X=0; ProjectView + useFavorites.remove. | S05: aktivni filter, drugi projekt in unknown ostanejo; S06/S08: prazni projekt in disabled. |
| R10 | Dostopni status celotnega projekta in vidni števci stolpcev; ProjectView + TaskBoard.entries. | S04/S06: 3/13, števci 2/0/1 nato 0/0/0; S06/S08: 0/0 in 0/1; S05: števca dveh projektov. |
| R11 | Parser za storage, drug ključ prezrt, brez odmeva; izjeme ostanejo uporabne; useFavorites + App alert. | S07: veljavno/neveljavno/null, zamenjava množice, ignoriran ključ, štetje setItem; trije testi za izjeme getItem/setItem/dostopa do localStorage, nadaljnji kliki in menjava projekta pri 390 px. |
| R12 | Lokalne mutacije brez API zapisov; obstoječi podatkovni tok ostane. | D04; S01/S04/S05/S06/S08 opazujejo omrežje, saveRequests in širino; osnovne regresije; vizualni posnetki obeh pogledov pri 1440 in 390 px. |

## Odstopanja in omejitve

Napake predane specifikacije niso bile ugotovljene. Med pripravo lastnih testov je bila napačno prešteta razvojna zbirka (8 spletnih opravil, ne 5); popravljeno je testno pričakovanje, brez prilagajanja pravilne aplikacije testu. Prvotni prekinjeni zagon ostane v check-initial.log, končni v check.log.

Končni skriti testi niso dostopni in niso navedeni kot opravljeni. Sintetični storage dogodki pokrivajo validacijo in odsotnost povratnega zapisa; nove sočasne spremembe podatkov in navigacija med nalaganjem niso razširjene prek zahtevanih regresij. Opozorilo o shrambi ostane vidno po zaznani izjemi v trenutni seji. Pri nalaganju projektnih podatkov je ohranjen obstoječi indikator; števec se pojavi z znanim celotnim seznamom.

Okolje: samo ta izvoz in lokalne storitve; javni internet blokiran. Browser uporablja nameščeni Chromium prek wsEndpoint iz task/browser.json. Git in Python zaradi manjkajočih sistemskih Xcode CommandLineTools nista uporabna. Dovoljene datotečne operacije so bile izvedene s patch/Node; infrastrukturnih datotek, odvisnosti, skupnih tipov ali skupnih testov nisem spreminjal. Git veja/push/PR niso del izvedbe.
