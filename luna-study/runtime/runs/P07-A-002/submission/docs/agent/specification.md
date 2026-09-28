# P07 — Priljubljena opravila in trajna shramba

## Problem in kontekst

Folio prikazuje opravila iz `/api/` v preglednici ali tabli ter odpre podrobnosti po ID-ju. Uporabnik želi označiti priljubljena opravila neodvisno od naslova, filtrirati trenutni projekt in izbiro ohraniti po osvežitvi. Osnovni prikaz, navigacija in API ostanejo nespremenjeni.

## Vhodi, dejanja in izidi

Vhod so opravila trenutnega projekta s polji iz obstoječega tipa `Task`; za priljubljene se uporablja izključno `id`. Uporabnik lahko posamezen ID preklopi, vklopi/izklopi lokalni filter ali odstrani vse ID-je trenutnega projekta. Shramba je `localStorage['folio:favorites:v1']` z obliko `{version:1,ids:string[]}`. Neveljaven zapis pomeni prazno začetno množico, brez samodejnega popravnega zapisa. Izjema shrambe prikaže opozorilo, vendar spremeni stanje v pomnilniku. Dogodek `storage` uskladi stanje brez povratnega zapisa.

## Zahteve in pravila

Naj bo `F` globalna množica nizov ID-jev, `T` seznam vseh opravil trenutnega projekta v API vrstnem redu, `f` lokalna vrednost filtra, `V = [t ∈ T | ¬f ∨ t.id ∈ F]`. ID-je pri serializaciji enkratno uredimo z nativnim leksikografskim vrstnim redom JavaScript (UTF-16). Odstranjevanje projekta uporabi `F' = F \ {t.id | t ∈ T}`. Števec je `|F ∩ IDs(T)| / |T|`, števci stolpcev pa štejejo `V`.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za vsak prikazani `t` obstaja ločen gumb z imenom, ki vsebuje `t.id`; `aria-pressed` je `t.id ∈ F`; gumb ne navigira. | Razvojni test D01; testi po ID-ju in brez dialoga. |
| R02 | Zapis vsebuje le `{version:1,ids:sort(unique(F))}` nizov. | D03 ter neposreden pregled zapisa; lasten test. |
| R03 | Ob branju se podvojeni ID-ji združijo, neznani ohranijo; brez ustvarjanja opravil. | Lasten test shrambe in osvežitve; ročni pregled. |
| R04 | Odsoten ključ, izjema ali neveljaven objekt/JSON da `F=∅`, brez začetnega zapisa. | Lastni testi neveljavnih zapisov in izjeme. |
| R05 | `f=false` ob začetku projekta; prikaz je `V` v vrstnem redu `T`. | D02 in lastni test začetne vrednosti. |
| R06 | Po odstranitvi pod filtrom se opravilo skrije; pri `V=∅` je sporočilo `Ni priljubljenih opravil.`; filter je še mogoče izklopiti. | D02 in lasten test praznega filtered prikaza. |
| R07 | Preglednica in tabla prejmeta isto `V` in `F`; povezave podrobnosti uporabljajo `t.id`. | D04, pregled obeh pogledov in regresijski testi podrobnosti. |
| R08 | `F` živi nad projektno komponento; sprememba projekta ustvari `f=false`; osvežitev prebere `F`, `f=false`. | Lasten navigacijski in osvežitveni test. |
| R09 | Gumb odstrani `F ∩ IDs(T)`; onemogočen je, ko je presek prazen. | Lasten test več projektov in neznanega ID-ja. |
| R10 | Status vedno prikazuje `Priljubljeno: |F∩IDs(T)| od |T|.`; stolpci štejejo `V`. | Lastni testi števca; pregled kode table. |
| R11 | Dogodek pravega ključa uveljavi validacijo oziroma `null → ∅`, drugi ključ se prezre, brez pisanja. Napaka branja/pisanja ne prekine UI in pokaže opozorilo s `shramba`. | Lastni testi zunanjih dogodkov in napak. |
| R12 | UI ne spreminja opravil in ne kliče zapisovalnega API-ja; Folio, nalaganje, navigacija in 390 px ostanejo uporabni. | D04 preveri API brez zapisov/širino; regresijski testi in pregled. |

**Predikati:** `toggle(F,id) = F \ {id}` če `id∈F`, sicer `F∪{id}`. `decode(x)` vrne unikatne nize iz `ids` samo, če je `x` veljaven JSON objekt z `version===1` in je vsak element `ids` niz; sicer `∅`. `visible(T,F,f)` ohrani vrstni red `T` in vsebuje ID le, če `¬f ∨ id∈F`.

## Izvedba in sledljivost

Načrtovane povezave: `src/App.tsx` za globalno stanje in shrambo; `src/TaskBoard.tsx` za filtrirane kartice; `src/components.tsx` za ponovno uporabljeni gumb; `src/styles.css` za kontrolnike in ozek prikaz; `tests/agent/` za dodatne scenarije. Vrstice in kartice ohranijo `data-task-id`, obstoječa imena pogledov/stolpcev ter oznako pregleda stanj.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Glej zgornjo tabelo; po implementaciji dodati dejanske datoteke in izide. | D01–D04, lastni testi in `npm run check`. | Dopolniti po preverjanju. | Še ni preverjeno. |

## Odprta vprašanja in omejitve

Predpostavljamo, da so API ID-ji nizi in enolični znotraj aplikacije; opis naloge to zagotavlja. Filter je namenoma samo lokalni stanju komponente projekta, ne URL-ju ali shrambi. Napako shrambe je mogoče odpraviti z naslednjim uspešnim uporabniškim zapisom. Izide in scenarije, ki jih okolje ne omogoči, bomo označili kot nepreverjene.

### Zapis popravkov specifikacije

- Začetna različica pred implementacijo; sprememb še ni.
