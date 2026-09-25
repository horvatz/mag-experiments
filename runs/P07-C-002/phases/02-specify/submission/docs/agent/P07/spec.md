# P07 — Priljubljena opravila in trajna shramba

Status: specifikacija, implementacija in preverjanje še nista izvedena. Različica 1.0, 2026-09-25.

## Problem in kontekst

Uporabnik želi označiti pomembna opravila, jih hitro prikazati v preglednici ali na tabli in ohraniti izbor po osvežitvi ter med projekti. Začetni Folio že nalaga projekte in opravila iz javnega API-ja, ponuja oba pogleda in podrobnosti po ID-ju; priljubljenih še nima.

Dopolnitev ohrani potrjeni [dizajn Folio](../../dizajn.md), slovensko besedilo, obstoječe nalaganje, navigacijo, podrobnosti in prilagodljiv prikaz. Izvorno merilo je [R01–R12](../../../task/instructions.md), skupaj s [projektnimi pravili](../../../PROJECT_RULES.md) in [načeli](../../../.specify/memory/constitution.md). Ta dokument izpolnjuje [skupno predlogo](../../../task/specification-template.md).

## Vhodi, dejanja in izidi

- Vhodi: projekti in opravila iz obstoječega `/api/`. Identiteta opravila je niz `id`; `projectId`, naslov, opis, stanje, odgovorna oseba in rok ostanejo podatki opravil, brez sprememb zaradi priljubljenih. Različna opravila imajo lahko enak naslov. Podatki lahko vsebujejo Unicode in ločila, poljubno vrstni red ter nič, eno ali več kot deset opravil; vsak projekt je lahko prazen.
- Trajni vhod: vrednost ključa `folio:favorites:v1` v `localStorage` in nove vrednosti dogodka `storage` za ta ključ.
- Dejanja: preklop posameznega priljubljenega, vklop/izklop filtra, odstranitev priljubljenih celotnega projekta, menjava pogleda/projekta, odpiranje/zapiranje podrobnosti ter osvežitev.
- Uspeh: prikaz, pritisnjena stanja in števci se uskladijo z množico priljubljenih. Uporabniška sprememba množice se poskusi shraniti v predpisani obliki. Filter in navigacija ne spreminjata množice.
- Preklic: nova dejanja so neposredna in nimajo potrditvenega dialoga. Zapiranje obstoječih podrobnosti ne spremeni priljubljenih. Ponovni klik gumba obrne njegov izbor.
- Napaka: neveljavna vsebina pomeni prazno množico; izjema dostopa do shrambe poleg delovanja v pomnilniku pokaže opozorilo. Obstoječe napake nalaganja API-ja ohranijo svoje vedenje.

### Model in pravila sprememb stanja

Naj bo `p` trenutni projekt, `T_p` celoten urejeni seznam njegovih opravil iz API-ja, `I_p = {t.id | t ∈ T_p}`, `F` globalna množica priljubljenih ID-jev, `q` logična vrednost filtra in `v` izbrani pogled. Množica ne vsebuje polj opravil in lahko vsebuje trenutno neznane ID-je.

Za niz shrambe `s` določimo `D(s)`: če je `s` veljaven JSON objekt z `version === 1`, poljem `ids`, ki je tabela, in `∀ x ∈ ids: typeof x === 'string'`, je rezultat množica njegovih `ids`. Sicer, vključno z manjkajočim ključem oziroma `null`, je `D(s) = ∅`. Podvojeni nizi se združijo; neznani nizi se ohranijo. Ne uvajamo dodatnih omejitev nizov ali drugih polj vhodnega objekta.

1. **Začetek/osvežitev:** `F := D(getItem('folio:favorites:v1')); q := false`. Če branje vrže izjemo, `F := ∅` in opozorilo o shrambi je vidno. Samo branje ne sproži zapisa niti popravka vsebine.
2. **Preklop ID-ja `i`:** `F' = F △ {i}` (simetrična razlika). Drugi ID-ji ostanejo nespremenjeni. Poskus zapisa je `JSON.stringify({version: 1, ids: sortUTF16(unique(F'))})`. Primerjava sledi vrstnemu redu kodnih enot UTF-16, ne jezikovnemu razvrščanju. Ob izjemi zapisa ostane `F'` uporabno v pomnilniku in prikaže se opozorilo.
3. **Vidna opravila:** `V_p = T_p`, ko `q = false`; sicer `V_p = [t ∈ T_p | t.id ∈ F]`. Filtriranje ohrani izvorni relativni vrstni red; tabla ga ohrani znotraj skupin stanj. Neznan ID nikoli ne ustvari opravila.
4. **Filter in pogled:** sprememba `q` spremeni samo prikaz; sprememba `v` ohrani `F` in `q`. Če je `q = true ∧ |V_p| = 0`, je prikazano `Ni priljubljenih opravil.` in checkbox ostane dosegljiv. Odstranitev zadnjega vidnega priljubljenega ta izid povzroči takoj.
5. **Menjava projekta:** `p := p'; q := false; F' = F`. Filter se ne shranjuje v trajno shrambo ali URL.
6. **Odstranitev projekta:** `F' = F \ I_p`, ne glede na trenutni filter/pogled. Poskusi se enak kanoničen zapis kot ob preklopu. Gumb je onemogočen natanko, ko `F ∩ I_p = ∅`.
7. **Števci:** `X = |F ∩ I_p|`, `M = |T_p|`; globalni projektni števec ne uporablja `V_p`. Števec stolpca za stanje `s` je `|{t ∈ V_p | t.status = s}|`.
8. **Dogodek shrambe:** za `event.key = 'folio:favorites:v1'` velja `F := D(event.newValue)`, brez povratnega zapisa; `q` in `v` se ne spremenita. Druge ključe ignoriramo. `newValue = null` izprazni množico.
9. **Nespremenljivost opravil:** za vsako dejanje priljubljenih so podatki opravil pred in po dejanju enaki in ni zapisovalne zahteve na API. Odprtje podrobnosti je ločeno dejanje po ID-ju.

## Zahteve in pravila

Oznake S01–S12 določajo preverljive scenarije, ne že izvedenih testov.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsaka vrstica in kartica ima ločen gumb `Priljubljeno opravilo <id>` z `aria-pressed=true/false`. Klik spremeni samo ta ID in ne odpre podrobnosti. Gumb je zunaj povezave opravila. | S01: v obeh pogledih preklopi enega od dveh enako naslovljenih opravil; preveri oba ID-ja, stanje gumba in nespremenjeno navigacijo. |
| R02 | Zapis pod `folio:favorites:v1` je JSON `{version:1,ids:[...]}` z enkratnimi nizi, razvrščenimi po UTF-16, brez polj opravil. | S02: po več preklopih preberi shrambo ter primerjaj obliko in vrstni red, tudi pri Unicode ID-jih. |
| R03 | Osvežitev obnovi množico; podvojeni ID-ji štejejo enkrat, neznani se ohranijo in ne ustvarijo vrstic/kartic. | S03: prednastavi podvojene, znane in neznane ID-je; osveži, preveri prikaz in ohranitev neznanih po naslednjem zapisu. |
| R04 | Manjkajoč ključ, neveljaven JSON, napačna različica, odsotni/neveljavni `ids` ali en sam neniz v `ids` pomenijo prazno množico. Nalaganje ne prepisuje shrambe. | S04: preveri vsak razred vhoda, uporabnost aplikacije in nespremenjen zapis pred uporabniškim dejanjem. |
| R05 | Checkbox `Prikaži le priljubljena` je privzeto izključen; vključen prikaže samo priljubljena opravila trenutnega projekta v izvornem vrstnem redu. | S05: z mešanim vhodnim vrstnim redom primerjaj ID-je prikaza pred/po filtriranju. |
| R06 | Odstranitev priljubljenega pod filtrom ga takoj skrije. Prazen rezultat kaže `Ni priljubljenih opravil.`; filter je še mogoče izključiti. | S06: odstrani zadnji vidni ID v vsakem pogledu, preveri sporočilo in ponovno prikaži vsa opravila. |
| R07 | Preglednica in tabla uporabljata isto množico in filter. Preklop pogleda ohrani oboje; povezava še odpira podrobnosti pravega ID-ja. | S07: filtriraj, menjaj pogled, spremeni izbor in odpri/zapri podrobnosti pri enakih naslovih. |
| R08 | Menjava projekta ohrani globalno množico in izključi filter; osvežitev obnovi množico in izključi filter. | S08: označi opravili različnih projektov, menjaj projekt in osveži z aktivnim filtrom. |
| R09 | `Odstrani priljubljene tega projekta` uporabi vse ID-je trenutnega projekta, ohrani druge/neznane ID-je in je onemogočen, kadar projekt nima priljubljenih. | S09: odstrani pod aktivnim filtrom, preveri oba projekta in neznan ID v shranjeni množici, vključno s praznim projektom. |
| R10 | `role=status`, `aria-label=Število priljubljenih` vedno kaže `Priljubljeno: X od M.` za celoten projekt. Števci stolpcev štejejo vidna opravila. | S10: primerjaj števec pred filtrom/po njem in števce vseh stolpcev, tudi pri nič opravilih. |
| R11 | Dogodek pravega ključa uporabi isto validacijo in takoj zamenja množico, `null` jo izprazni; drug ključ se ignorira in povratnega zapisa ni. Izjeme branja/zapisa ne preprečijo pomnilniškega delovanja; opozorilo ima `role=alert` in vsebuje `shramba`. | S11: pošlji veljavne/neveljavne dogodke in `null`, spremljaj zapise; ločeno izzovi izjemo branja ter zapisa in nadaljuj s preklopi/filtriranjem. |
| R12 | Priljubljene ne zapisujejo na API in ne spreminjajo polj opravil. Folio, nalaganje, navigacija, obstoječe oznake in ozki prikaz so ohranjeni. | S12: spremljaj omrežje in podatke, izvedi regresijske teste ter pri širini 390 px preveri odsotnost vodoravnega razširjanja cele strani v obeh pogledih. |

### Dogovor o vmesniku in merila uspeha

Ohranijo se `data-task-id` na vrsticah in karticah, imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Nova dejanja so zunaj povezav opravil. Notranje drsenje preglednice/table je dovoljeno. Nove kontrole uporabljajo obstoječe gradnike, slogovne spremenljivke in vidni fokus Folio; razporeditev ter druga nenavedena besedila so izvedbena izbira.

Uspeh pomeni izpolnitev vsakega R01–R12 na opisani domeni, dokazano s primernimi izvedenimi preverjanji, ter ohranjeno izhodiščno delovanje. Razvojni primeri so primeri, ne celotna definicija zahtev; ne uvajamo dodatnih meritev uspešnosti.

## Izvedba in sledljivost

Ta tabela se dopolni z dejanskimi datotekami, deli kode, imeni testov in dnevniki med implementacijo. Trenutno ne trdi, da je katerakoli funkcionalnost že izvedena ali preverjena.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Neodvisen dostopen preklop po ID-ju | S01 | Še ni implementirano | Ni izvedeno |
| R02 | Kanoničen zapis ID-jev | S02 | Še ni implementirano | Ni izvedeno |
| R03 | Obnova, deduplikacija, neznani ID-ji | S03 | Še ni implementirano | Ni izvedeno |
| R04 | Stroga validacija brez začetnega zapisa | S04 | Še ni implementirano | Ni izvedeno |
| R05 | Privzeto izključen stabilni filter | S05 | Še ni implementirano | Ni izvedeno |
| R06 | Takojšnja odstranitev in prazni rezultat | S06 | Še ni implementirano | Ni izvedeno |
| R07 | Skupno stanje pogledov in pravilne podrobnosti | S07 | Še ni implementirano | Ni izvedeno |
| R08 | Globalni izbor in ponastavitev filtra | S08 | Še ni implementirano | Ni izvedeno |
| R09 | Razlika množic celotnega projekta | S09 | Še ni implementirano | Ni izvedeno |
| R10 | Celotni projektni in vidni stolpčni števci | S10 | Še ni implementirano | Ni izvedeno |
| R11 | Uskladitev dogodka, brez odmeva, odpornost shrambe | S11 | Še ni implementirano | Ni izvedeno |
| R12 | Lokalnost in regresije Folio | S12 | Še ni implementirano | Ni izvedeno |

## Odprta vprašanja in omejitve

- Bistvenih odprtih vprašanj ni. Izrecne zahteve P07 določajo izjemo splošnemu pravilu o lokalni shrambi: dovoljena je samo shramba ID-jev priljubljenih, ne kopija opravil.
- Ni novih zapisovalnih API-jev, odvisnosti ali sprememb infrastrukture, strežnika, skupnih tipov/testov, nastavitev, uradnih predlog in veščin. Dovoljene poti določa ustava z izrecno dopolnitvijo postopka C.
- Ni širjenja obsega navigacije med nedokončanim nalaganjem ali sočasnega spreminjanja podatkov opravil brez osvežitve. Zahtevana sinhronizacija priljubljenih prek dogodka `storage` ostaja v obsegu.
- Politika odstranitve opozorila po poznejšem uspešnem dostopu ni predpisana; bistveno je, da izjema prikaže opozorilo in ne ustavi pomnilniškega delovanja.
- V tej fazi testi niso izvedeni. Nedostopnih končnih testov ni mogoče potrditi; izide in morebitne preostale vrzeli bo vsebovala predaja.

## Zgodovina sprememb

- 2026-09-25, 1.0: začetna specifikacija vseh R01–R12, model stanja in načrtovani scenariji; brez implementacije.
