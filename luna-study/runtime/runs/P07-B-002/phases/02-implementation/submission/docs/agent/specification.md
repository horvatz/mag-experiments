# Specifikacija: priljubljena opravila

## Problem in kontekst

Folio že prikazuje opravila iz trenutnega projekta v preglednici ali na tabli, omogoča navigacijo po projektih in ogled podrobnosti. Dodati je treba lokalno priljubljevanje, trajno shranjeno v brskalniku. Obstoječi prikaz, slovenska poimenovanja, nalaganje, navigacija in ozki zaslon morajo ostati uporabni. Vir opravil ostane javni `/api/`; posamezno opravilo določata njegov `id` in `projectId`, nikoli naslov. `shared/types.ts` določa `Task` s polji `id`, `projectId`, `title`, `description`, `status`, `assignee` in `dueDate`. Projekti so lahko prazni; testi lahko podajo poljubno število opravil, ID-je, vrstni red in ponovljene naslove. Besedilna polja so navadno besedilo z Unicode znaki.

## Vhodi, dejanja in izidi

Uporabnik lahko pri posameznem opravilu preklopi priljubljenost, vklopi/izklopi filter in odstrani priljubljene trenutnega projekta. Stanje priljubljenih je globalna množica nizov ID-jev; izbrani projekt, njegov izvorni vrstni red in vidni opravki izhajajo iz podatkov API-ja. Filter je lokalni prikazu in ob menjavi projekta ali osvežitvi privzeto izklopljen. Napaka localStorage ne sme preprečiti uporabe aplikacije: stanje ostane v pomnilniku in pokaže opozorilo.

## Zahteve in pravila

Naj bo `F` množica priljubljenih ID-jev, `P` trenutni projekt in `T(P)` opravila projekta `P` v vrstnem redu API-ja. `id(t)` je ID opravila. Veljavno shranjeno stanje je objekt `{version:1,ids:string[]}`; pred shranjevanjem se ID-ji enoličijo in razvrstijo po UTF-16. Neznani ID-ji ostanejo v `F`, vendar sami ne ustvarijo prikazanih opravil.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsaka vrstica in kartica ima samostojen gumb z dostopnim imenom `Priljubljeno opravilo <id>` in `aria-pressed`. Klik zamenja samo pripadnost tega ID-ja v `F`, brez odpiranja podrobnosti; enaki naslovi so neodvisni. | Klikniti gumbe pri dveh enako naslovljenih opravilih in preveriti ID, stanje ter navigacijo. |
| R02 | Vsak zapis shrani samo enolične nize ID-jev kot UTF-16-urejen `ids` v `folio:favorites:v1`, z `version:1`; opravilo-objectov ni. | Prebrati localStorage po preklopu in preveriti obliko, enoličnost, vrstni red in polja. |
| R03 | Po nalaganju obnovi ID-je; veljavni dvojniki se združijo, neznani ostanejo v stanju in ne ustvarijo vrstic/kartic. | Reload z dvojnikom in neznanim ID-jem. |
| R04 | Manjkajoč ključ, neveljaven JSON, `version` razen 1, manjkajoč `ids` ali vsaj en element `ids`, ki ni niz, dajo prazno `F`; aplikacija ostane delujoča in samo branje ne zapisuje ključa. | Preizkusiti manjkajoč ključ in vsako vrsto neveljavnega zapisa. |
| R05 | Checkbox `Prikaži le priljubljena` je privzeto izklopljen; vklop prikaže samo ID-je iz `F ∩ id(T(P))`, v izvornem vrstnem redu. | Primerjati nefiltriran in filtriran prikaz ter začetno stanje. |
| R06 | Odstranitev ID-ja iz `F` med filtrom takoj odstrani opravilo iz pogleda; prazen filtriran prikaz pokaže `Ni priljubljenih opravil.` in omogoča izklop filtra. | Odstraniti zadnjo vidno priljubljeno opravilo med vklopljenim filtrom. |
| R07 | Preglednica in tabla črpata iz istega `F` in istega filtra; menjava pogleda ohrani stanje. Podrobnosti se odprejo po pravilnem ID-ju. | Preklopiti pogled in odpreti opravilo z neunikatnim naslovom. |
| R08 | Menjava projekta ohrani globalni `F`, a filter nastavi na `false`; reload obnovi `F` in začne s filtrom `false`. | Preklop projekta in nato osvežitev. |
| R09 | `Odstrani priljubljene tega projekta` odstrani samo `{id(t) | t ∈ T(P)}` iz `F`; ob praznem preseku je onemogočen. | Preveriti ID-je drugega projekta/neznane ID-je pred in po dejanju ter onemogočeno stanje. |
| R10 | `role=status`, `aria-label=Število priljubljenih`, besedilo `Priljubljeno: X od M.` prikazuje `X=|F ∩ id(T(P))|`, `M=|T(P)|`, neodvisno od filtra. Števci stolpcev table štejejo vidna opravila. | Preveriti števca na filtriranem/nefiltiranem seznamu in števce stolpcev. |
| R11 | Dogodek `storage` za pravi ključ zamenja `F` po pravilih validacije; `newValue=null` pomeni prazno stanje. Drug ključ se prezre, dogodek ne povzroči zapisa nazaj. Napaka branja ali pisanja pusti delujoče stanje v pomnilniku in opozorilo `role=alert` z besedo `shramba`. | Sprožiti oba ključa, `null`, neveljaven JSON in izjeme get/set; spremljati zapise ter opozorilo. |
| R12 | Priljubljenje ne kliče zapisovalnega API-ja in ne spreminja polj opravil. Ohraniti `data-task-id` na vrsticah/karticah, imena pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Pri 390 px se stran ne razširi; tabela/tabla se smeta pomikati znotraj prikaza. Folio, nalaganje in navigacija ostanejo uporabni. | Spremljati API klice/polja, atribute in dostopna imena; preveriti regresije ter širino 390 px. |

## Izvedba in sledljivost

Specifikacija izhaja iz `task/instructions.md`, predloge in pregleda kode. V izhodišču so razširitvene točke: preglednica in števci v `src/App.tsx`, kartice in števci stanj v `src/TaskBoard.tsx`, pridobivanje podrobnosti po ID-ju v `src/TaskDetails.tsx`, poti v `src/navigation.ts`. Za priljubljene še ni kode; trajno stanje potrebuje namensko logiko localStorage, uporabljeno pri obeh pogledih.

| Zahteva | Koda oziroma razširitvena točka | Test/scenarij in izid v specifikacijski fazi |
| --- | --- | --- |
| R01 | `App.tsx`, `TaskBoard.tsx` | Enaka naslova, neodvisen klik; ni izvedeno. |
| R02–R04 | Nova skupna logika priljubljenih (localStorage) | Zapis, reload, neveljavni vnosi; ni izvedeno. |
| R05–R06 | `App.tsx`, filtrirani `tasks` za oba pogleda | Filter, odstranitev zadnjega rezultata; ni izvedeno. |
| R07 | `App.tsx`, `TaskBoard.tsx`, `TaskDetails.tsx`, `navigation.ts` | Preklop pogleda in pravilen ID podrobnosti; ni izvedeno. |
| R08–R09 | Stanje projekta v `App.tsx`; nalaganje prek `useResource.ts` | Menjava projekta, filter reset, čiščenje samo projekta; ni izvedeno. |
| R10 | `App.tsx`, `TaskBoard.tsx` | Števci s filtrom in brez; ni izvedeno. |
| R11 | Nova logika localStorage in opozorilo v `App.tsx` | `storage`, `null`, drug ključ in izjeme; ni izvedeno. |
| R12 | `App.tsx`, `TaskBoard.tsx`, `styles.css`, `api.ts` | Atributi, odsotnost API zapisov in širina 390 px; ni izvedeno. |

Ta agent ni spreminjal izvorne kode in ni zagnal aplikacije ali testov. Zgornji scenariji so kriteriji za implementacijo, ne dokaz uspeha; implementer naj po izvedbi zapiše imena dejansko zagnanih testov in rezultate.

## Odprta vprašanja in omejitve

Predpostavljeno je, da veljaven envelope zahteva objekt z `version === 1` in poljem `ids`, v katerem so vsi elementi nizi; drugačna oblika je neveljavna. Obseg podatkov, poljubni ID-ji in zaporedje so določeni v navodilih, zato se pogoji ne opirajo na vzorčne podatke ali fiksno število opravil. V tej specifikacijski fazi aplikacija in testi niso zagnani.
