# P07: Priljubljena opravila in trajna shramba

## Problem in kontekst

Folio trenutno nalaga projekte in opravila prek javnega API-ja ter jih pokaže v preglednici ali na tabli. Iz obeh pogledov se odprejo podrobnosti opravila po njegovem ID-ju. Uporabnik nima načina, da bi opravila označil za priljubljena ali oznake ohranil po osvežitvi.

P07 doda označevanje priljubljenih opravil, njihovo shranjevanje med sejami, filtriranje trenutnega projekta in usklajevanje med pogledoma ter zavihki. Ohraniti je treba potrjeni videz Folio iz `docs/dizajn.md`, slovenska poimenovanja in obstoječe nalaganje, navigacijo ter odzivni prikaz.

## Vhodi, dejanja in izidi

- Vhodni podatki so projekti in urejena opravila, prejeta prek obstoječega `/api/`. Opravila se določajo po enoličnem nizu `id`; naslov ni identifikator.
- Uporabnik lahko preklopi priljubljenost posameznega opravila, vključi ali izključi filter priljubljenih in odstrani priljubljena opravila trenutnega projekta.
- Shranjena množica je pod ključem `folio:favorites:v1` kot JSON `{ "version": 1, "ids": [...] }`. Shranjuje samo nize ID-jev, brez polj opravil.
- Ob uspešnem dejanju se stanje priljubljenih posodobi v pomnilniku in, za uporabniška dejanja, v `localStorage`. Ob napaki branja ali zapisa ostane aplikacija uporabna v pomnilniku in opozori na nedostopno shrambo. Neveljaven zapis se obravnava kot prazna množica in se samo zaradi nalaganja ne prepiše.
- Filter prikaže priljubljena opravila trenutnega projekta v izvornem vrstnem redu. Zamenjava projekta ga izklopi; menjava pogleda ga ne izklopi. Po osvežitvi se ID-ji znova naložijo, filter pa začne izklopljen.
- Za odstranitev priljubljenega ni potrditvenega koraka določenega v zahtevah; uporabnik lahko stanje spremeni nazaj z istim gumbom. Ločena funkcija preklica ni zahtevana.

## Uporabniški scenariji

1. Uporabnik v preglednici ali na tabli označi opravilo kot priljubljeno. Gumb spremeni `aria-pressed`, povezava do podrobnosti se ne sproži, enak naslov drugega opravila pa ostane nespremenjen.
2. Uporabnik vključi filter, vidi samo priljubljena opravila in po odstranitvi zadnjega priljubljenega vidi prazno stanje z možnostjo izklopa filtra.
3. Uporabnik preklaplja med preglednico in tablo, odpira podrobnosti ali menja projekt. Priljubljene ostanejo globalne, projekti pa prikazujejo samo svoja opravila; ob menjavi projekta se filter ponastavi.
4. Po osvežitvi uporabnik dobi veljavne shranjene ID-je in izklopljen filter. Podvojeni ID-ji se združijo; neznani ID-ji ostanejo shranjeni, ne ustvarijo pa opravil.
5. Uporabnik odstrani vsa priljubljena opravila trenutnega projekta ali drug zavihek spremeni shrambo. Spremenijo se samo ustrezni ID-ji, podatki opravil in API ostanejo nespremenjeni.
6. Če shrambe ni mogoče brati ali vanjo pisati, uporabnik še vedno uporablja priljubljene v pomnilniku in prejme dostopno opozorilo.

## Pravila stanja

Oznake: `F` je globalna množica priljubljenih nizov ID-jev (lahko vsebuje ID-je, ki v trenutnih podatkih niso znani); `T_P` je urejen seznam vseh opravil trenutno izbranega projekta `P`; `I_P = {t.id | t ∈ T_P}`; `L` je stanje filtra; `V_P` je seznam trenutno prikazanih opravil.

- Veljavno shranjeno vrednost dekodiramo, če je JSON objekt z `version === 1`, ima polje `ids`, ki je seznam, in so vsi njegovi elementi nizi. Dekodiranje vrne množico teh nizov. Dvojniki se združijo; neznani ID-ji se ohranijo. Manjkajoč ključ, napaka pri razčlenjevanju, neveljavna različica, manjkajoč/ne-seznamski `ids` ali neniz v `ids` dekodira v prazno množico. Nalaganje ne zapisuje nazaj.
- Zapis množice `F` ustvari JSON objekt `{version: 1, ids: [...]}`, kjer so ID-ji enkratni in razvrščeni po leksikografskem vrstnem redu UTF-16. Vsebina opravila ni del zapisa.
- Preklop opravila z ID-jem `i`: `F' = F △ {i}` (simetrična razlika); spremeni se samo članstvo ID-ja `i`. Filter in podatki opravila se s tem dejanjem ne spremenijo.
- Odstranitev priljubljenih projekta: `F' = {i ∈ F | i ∉ I_P}`. ID-ji drugih projektov in neznani ID-ji ostanejo. Gumb je onemogočen, kadar `|F ∩ I_P| = 0`.
- Prikaz: če je `L = false`, `V_P = T_P`; če je `L = true`, `V_P = [t ∈ T_P | t.id ∈ F]`, pri čemer se vrstni red `T_P` ohrani. Če je filter vključen in `V_P` prazen, se pokaže `Ni priljubljenih opravil.` in uporabnik lahko filter izključi.
- Menjava pogleda ohrani `F` in `L`; menjava projekta ohrani `F` in nastavi `L = false`; osvežitev nastavi `F = decode(localStorage[key])` in `L = false`.
- Dogodek `storage` za `folio:favorites:v1` nastavi `F' = decode(event.newValue)`; `null` pomeni prazno množico. Dogodki za drug ključ ne spremenijo stanja. Uskladitev ne zapisuje nazaj.
- Števec priljubljenih prikazuje `X = |F ∩ I_P|` in `M = |T_P|`, ne glede na `L`. Števci stolpcev table štejejo prikazana opravila po stanju.
- Če dostop do `localStorage` pri branju ali pisanju vrže izjemo, inicializacija oziroma uporabniško dejanje ne prekine aplikacije; stanje v pomnilniku ostane uporabno, opozorilo ima `role="alert"` in vsebuje besedo `shramba`. Neuspešen zapis ne razveljavi spremembe v pomnilniku.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsako opravilo v preglednici in na tabli ima ločen gumb z dostopnim imenom `Priljubljeno opravilo <id>` in `aria-pressed="true/false"`. Klik izvede samo prehod `F' = F △ {id}`, ne odpre podrobnosti; enaki naslovi imajo neodvisne gumbe in stanje. Gumb je zunaj povezave opravila. | V obeh pogledih preveri stanje gumba, klik, neodpiranje podrobnosti in dve opravili z enakim naslovom ter različnima ID-jema. |
| R02 | Zapis uporablja ključ `folio:favorites:v1` in obliko `{version:1,ids:[...]}`; ID-ji so enkratni nizi, urejeni po UTF-16. Vrednosti opravil se ne zapisujejo. | Preglej točen zapis po spremembi in preveri, da vsebuje samo različico ter ID-je. |
| R03 | Po osvežitvi se veljavni ID-ji obnovijo. Podvojeni ID-ji se združijo, neznani se ohranijo, vendar ne ustvarijo elementov v uporabniškem vmesniku. | Naloži veljaven zapis z duplikati in neznanim ID-jem, osveži stran ter preveri stanje, prikazana opravila in ponovno shranjene ID-je. |
| R04 | Manjkajoč ključ, neveljaven JSON, različica, ki ni 1, manjkajoč ali neveljaven `ids`, oziroma katerikoli neniz v seznamu dajo prazno množico. Aplikacija se ne sesuje in ob začetnem branju zapisa ne prepiše. | Za vsak primer naloži stran; preveri prazen začetni nabor, delovanje aplikacije in nespremenjen surov zapis. |
| R05 | Checkbox `Prikaži le priljubljena` je privzeto izključen. Ko je vključen, sta prikazana samo priljubljena opravila projekta in njihov izvorni vrstni red se ohrani. | Preveri začetno stanje ter podmnožico in vrstni red pri vključenem filtru. |
| R06 | Odstranitev priljubljenega med filtrom takoj odstrani opravilo iz obeh pogledov. Če filter ne vrne opravil, se prikaže `Ni priljubljenih opravil.` in kontrola za izklop filtra ostane dosegljiva. | Vključi filter, odstrani zadnje prikazano priljubljeno opravilo, preveri prazno stanje in izklop filtra. |
| R07 | Preglednica in tabla uporabljata isti `F` in `L`; menjava pogleda ne izgubi sprememb. Povezave do podrobnosti še naprej odprejo opravilo po pravilnem ID-ju. | Spremeni priljubljenost v enem pogledu, preklopi pogled, preveri enako stanje ter odpri podrobnosti opravila z izbranim ID-jem. |
| R08 | Menjava projekta ohrani `F` in nastavi `L = false`. Po osvežitvi se obnovi `F`, `L` pa je false. | Preveri projektno menjavo z ID-ji iz več projektov ter osvežitev z aktivnim filtrom. |
| R09 | Gumb odstrani priljubljenost za vse `I_P`, tudi če je filter vključen; ID-ji drugih projektov in ID-ji zunaj trenutnih podatkov ostanejo. Gumb je onemogočen, če projekt nima priljubljenih opravil. | Preveri množico pred/po brisanju z znanimi in neznanimi ID-ji iz drugih projektov ter onemogočeno stanje. |
| R10 | Element `role="status"` z `aria-label="Število priljubljenih"` vedno prikazuje `Priljubljeno: X od M.` za cel projekt, ne glede na filter. Števci stolpcev table štejejo vidna opravila. | Primerjaj status z vsemi opravili projekta ob vključenem filtru; preveri števce table po filtriranju. |
| R11 | Dogodek `storage` za pravi ključ uporabi enaka pravila dekodiranja; `null` izprazni `F`, drug ključ se prezre, obdelava ne sproži zapisa. Izjema pri branju ali zapisu ne onemogoči dela v pomnilniku in pokaže `role="alert"` z besedo `shramba`. | Pošlji dogodke za pravi in napačen ključ, vključno z `null` in neveljavno vrednostjo; simuliraj izjemo pri branju in pisanju ter preveri UI, zapis in opozorilo. |
| R12 | Spremembe priljubljenih ne pošiljajo zapisov na API in ne spreminjajo nobenega polja opravila. Ohranjeni so obstoječi Folio, nalaganje, navigacija in ozki prikaz. | Preveri omrežne zapise in podatke opravila; ponovi obstoječe regresijske scenarije za nalaganje, navigacijo, podrobnosti in širino 390 px. |

### Skupni pogoji

- Podatki se berejo iz javnega `/api/`; aplikacija ne uvaža ali kliče testnih poti `/__test/`, ne dodaja API zapisov in ne spreminja strežnika, infrastrukture, odvisnosti ali skupnih tipov/testov.
- Ohranjeni so `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja ob opravilu so zunaj njegove povezave.
- Pri širini 390 px se širina strani ne poveča; dovoljeno je notranje drsenje preglednice in table. Uporabi se potrjeni dizajn Folio in vidni fokus.
- Sprejemni podatki lahko vsebujejo nič, eno ali več kot deset opravil, drugačne enolične ID-je, podvojene naslove, različen vrstni red in veljavne datume. Projekta sta lahko prazna. Besedila lahko vsebujejo Unicode in ločila. Obstoječa shema polj ostane nespremenjena.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Sprejemni pogoj R01 zgoraj. | Dva pogleda; preklop in podvojeni naslov. | Izhodiščne prikazne točke: `src/App.tsx`, `src/TaskBoard.tsx`; končno mesto izvedbe določi plan. | Še ni izvedeno; obstoječa koda gumbov priljubljenih nima. Test ni izveden. |
| R02 | Sprejemni pogoj R02 zgoraj. | Preverjanje oblike, ključa, unikatnosti in vrstnega reda. | Mesto zapisa določi plan; UI se prikazuje v `src/App.tsx` in `src/TaskBoard.tsx`. | Še ni izvedeno. Test ni izveden. |
| R03 | Sprejemni pogoj R03 zgoraj. | Osvežitev z duplikati in neznanim ID-jem. | Mesto nalaganja določi plan; prikaz v `src/App.tsx` in `src/TaskBoard.tsx`. | Še ni izvedeno. Test ni izveden. |
| R04 | Sprejemni pogoj R04 zgoraj. | Neveljavne in manjkajoče vrednosti; brez prepisa ob nalaganju. | Mesto validacije določi plan. | Še ni izvedeno. Test ni izveden. |
| R05 | Sprejemni pogoj R05 zgoraj. | Privzeti in vključeni filter z vrstnim redom. | `src/App.tsx`, `src/TaskBoard.tsx`; slogi po potrebi v `src/styles.css`. | Še ni izvedeno. Test ni izveden. |
| R06 | Sprejemni pogoj R06 zgoraj. | Odstranitev zadnjega rezultata, prazno stanje in izklop. | `src/App.tsx`, `src/TaskBoard.tsx`; slogi po potrebi v `src/styles.css`. | Še ni izvedeno. Test ni izveden. |
| R07 | Sprejemni pogoj R07 zgoraj. | Preklop pogledov in odpiranje podrobnosti po ID-ju. | `src/App.tsx`, `src/TaskBoard.tsx`, obstoječa povezava `src/TaskDetails.tsx`. | Še ni izvedeno; osnovna navigacija je v izhodišču. Test ni izveden. |
| R08 | Sprejemni pogoj R08 zgoraj. | Menjava projekta in osvežitev ob vključenem filtru. | Mesto stanja določi plan; povezovanje poti v `src/App.tsx` in `src/navigation.ts`. | Še ni izvedeno. Test ni izveden. |
| R09 | Sprejemni pogoj R09 zgoraj. | Brisanje projektnih ID-jev ob ohranitvi drugih/neznanih. | `src/App.tsx`; končno mesto izvedbe določi plan. | Še ni izvedeno. Test ni izveden. |
| R10 | Sprejemni pogoj R10 zgoraj. | Status ob filtru in števci vidnih stolpcev. | `src/App.tsx`, `src/TaskBoard.tsx`. | Še ni izvedeno. Test ni izveden. |
| R11 | Sprejemni pogoj R11 zgoraj. | `storage` dogodki, `null`, napačen ključ in nedostopna shramba. | Mesto stanja in poslušalca določi plan; opozorilo se prikaže v `src/App.tsx`. | Še ni izvedeno. Test ni izveden. |
| R12 | Sprejemni pogoj R12 in skupni pogoji zgoraj. | Brez API zapisov/sprememb opravil; regresija osnovnega UI in 390 px. | `src/App.tsx`, `src/TaskBoard.tsx`, obstoječi API v `src/api.ts`; lastni testi v `tests/agent/`. | Še ni izvedeno. Test ni izveden. |

V tej fazi je nastala specifikacija; implementacija in testi za R01–R12 še niso bili izvedeni. Tabela navaja izhodiščna mesta ter preverljive scenarije, ne pa dokazov o uspešnosti. Datoteke konkretnih testov in končna mesta kode se dopolnijo po izvedbi; skupni testi ostanejo nespremenjeni.

## Odprta vprašanja in omejitve

- Zahteve določajo obliko podatkov, prehode, besedilo in dostopnost kontrol; ne predpisujejo razporeditve novih kontrol ali notranje arhitekture. Izvedba naj uporabi najmanjšo spremembo, ki izpolni pogoje, in naj ne širi obsega.
- Pri uporabniških dejanjih, ki spreminjajo priljubljenost, je sprememba pomnilniškega stanja ohranjena tudi, če zapis v `localStorage` odpove; obvestilo o napaki sledi R11.
- Ne širi se obravnava navigacij med nedokončanim nalaganjem ali novih sočasnih sprememb podatkov prek obstoječih regresijskih zahtev. Ne dodajajo se novi zapisovalni API-ji.
- Razvojni in končni testi P07 v tej fazi niso bili zagnani. Specifikacija ne trdi, da so zahteve implementirane ali preverjene.
