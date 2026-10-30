# P06: Nastavljiv izvoz CSV — razvojna specifikacija

> Izdelek postopka C (Spec Kit). Izvirne zahteve in dogovor o vmesniku so v `task/instructions.md`; ta dokument jih povezuje in izraža s pravili sprememb stanja. Zahteve R01–R12 so merilo.

## Problem in kontekst

Uporabnik v aplikaciji Folio pregleduje projekte in opravila prek javnega API-ja `/api/`. Želi izvoziti opravila trenutnega projekta kot datoteko CSV za nadaljnjo obdelavo, z izbiro stolpcev, filtrom po statusu in izbiro ločila. Folio tega izvoza še ne ponuja.

Predvidena sprememba: vmesnik se dopolni z izbiro kolon (checkboxi), izbiro ločila in filtra ter gumbom Izvozi CSV, ki prenese datoteko. Podatki se ne spreminjajo; berejo in shranjujejo se le prek javnega API-ja. Potrjeni videz Folio (`docs/dizajn.md`) se ohrani.

### Scenariji uporabe

1. Privzeti izvoz: uporabnik ne spremeni ničesar in klikne Izvozi CSV; prenese se `folio-<projectId>.csv` z vsemi dovoljenimi kolonami, vsemi opravili projekta v izvornem vrstnem redu in ločilom `;`.
2. Prilagojen izvoz: uporabnik izbere podmnožico stolpcev, filter `done` in ločilo `,`; datoteka vsebuje samo izbrane kolone v kanoničnem vrstnem redu in samo ustrezne vrstice.
3. Robni primer: uporabnik odizbere vse kolone ali izbere filter brez zadetkov; izvoz je onemogočen in se ne prenese; ponovni izbor kolone ob obstoječih vrsticah izvoz spet omogoči.

### Uspešnost

- Za vse kombinacije (C, D, F) na podatkih iz opisane domene so preneseni bajti natanko enaki kanonični serijalizaciji (spodaj); preverljivo z lastnimi testi v `tests/agent/`.
- Izvoz ne spremeni nobenega opravila, izvornega polja ali bralne funkcije in ne pošlje zapisa na API.
- Ni novih odvisnosti, sprememb infrastrukture ali zunanjih meritev.

## Vhodi, dejanja in izidi

Vhodi: opravila trenutnega projekta iz `/api/` s polji `id`, `projectId`, `title`, `status`, `assignee`, `dueDate`, `description` (tipi in polja enaki izhodišču); izbira projekta; izbor kolon; filter; ločilo; pogled Preglednica/Tabla.

Simboli in predpostavke:
- `K = {id, projectId, title, status, assignee, dueDate, description}` — dovoljene kolone; kanonični vrstni red je vrstni red, kot je naštet.
- `C ⊆ K` — izbrane kolone; vrstni red klikov ne vpliva na vrstni red glave in vrednosti.
- `F ∈ {all, todo, in_progress, done}` — filter izvoza; `all` je privzeti.
- `D ∈ {";", ","}` — ločilo; `;` je privzeto.
- `T(P)` — opravila projekta `P` v izvornem vrstnem redu.
- `R(P, F) = [t ∈ T(P) | F = all ∨ t.status = F]` — izvožene vrstice v izvornem vrstnem redu.
- `enabled ≡ C ≠ ∅ ∧ R(P, F) ≠ ∅` — izvoz je omogočen natanko tedaj.
- Privzeto stanje: `C = K`, `F = all`, `D = ";"`.

Pravila sprememb stanja:
- Izberi kolono `c ∈ K`: `C_new = C ∪ {c}`; `D`, `F` nespremenjena.
- Odizberi kolono `c`: `C_new = C \ {c}`; `D`, `F` nespremenjena.
- Nastavi filter `f`: `F_new = f`; `C`, `D` nespremenjena; prikaz projekta ostane celoten `T(P)`.
- Nastavi ločilo `d`: `D_new = d`; `C`, `F` nespremenjena.
- Preklop pogleda Preglednica/Tabla: `C`, `D`, `F` nespremenjeni; isti (`C`, `D`, `F`) v obeh pogledih dasta iste bajte datoteke.
- Zamenjava projekta ali osvežitev: `C = K`, `F = all`, `D = ";"`.
- Izvozi (samo če `enabled`): prenos datoteke `folio-<P>.csv`; brez odpiranja nove strani; vsebina se ne pošlje na strežnik.
- Zaporedna izvoza po spremembi nastavitev vedno odražata trenutne (`C`, `D`, `F`).

Kanonična serijalizacija:
- Bajti: UTF-8; prvi znak datoteke je BOM U+FEFF.
- Glava: vrednosti stolpcev iz `C` v kanoničnem vrstnem redu `K`; vsaka obdana z `"` (U+0022); notranji `"` podvojen.
- Vrstice: za vsak `t ∈ R(P, F)` v izvornem vrstnem redu.
- Polja vrstice: vrednosti izbranih stolpcev v kanoničnem vrstnem redu; vsaka obdana z `"`; notranji `"` podvojen; med polji ločilo `D`; vsaka vrstica (tudi zadnja) zaključena s CRLF (U+000D U+000A).
- Nevtralizacija formul (velja za vse podatkovne vrednosti, ne za glavo): `nevtraliziraj(s) = U+0027 + s`, če se `s` po poljubnem začetnem zaporedju znakov presledek, tabulator, CR ali LF začne z `=`, `+`, `-` ali `@`; sicer `nevtraliziraj(s) = s`. Apostrof (U+0027) se doda na sam začetek izvirnega niza; drugi nizi se ne spreminjajo.
- `status` se izvozi kot interna vrednost; `dueDate` kot izvirni `YYYY-MM-DD`; šumniki, drugi Unicode znaki, presledki in vsebina opisov ostanejo ohranjeni, razen izrecne nevtralizacije.

Izidi:
- Uspeh: prenesena datoteka z zgornjo vsebino; stanje aplikacije in podatki nespremenjeni.
- Preklic/neuspeh: če `enabled` ne velja, klik ne ustvari prenosa; napake branja uporabljajo obstoječe vedenje aplikacije. Izvoz ne odpre nove strani in ne pošlje vsebine na strežnik.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Privzeto `C = K`, `F = all`, `D = ";"`; izvoz zajame `R(P, all) = T(P)` v izvornem vrstnem redu. | Lastni test: nadzorovani GET odgovor, primerjava bajtov datoteke. |
| R02 | `C ⊆ K`; glava in vrednosti sledijo kanoničnemu vrstnemu redu `K` ne glede na vrstni red klikov. | Lastni test: izbor kolon v različnih vrstnih redih, enaki bajti. |
| R03 | `¬enabled` pomeni, da klik ne ustvari prenosa; ponovni izbor kolone ob `R(P, F) ≠ ∅` izvoz omogoči. | Lastni test: odizberi vse kolone, preveri onemogočenost in odsotnost prenosa. |
| R04 | `F` omeji samo `R(P, F)`; prikaz projekta ostane `T(P)`; `T(P) = ∅ ∨ R(P, F) = ∅` pomeni `¬enabled`. | Lastni test: filter z in brez zadetkov, prazen projekt. |
| R05 | Prenos datoteke `folio-<P>.csv` z BOM U+FEFF na začetku; brez nove strani; vsebina se ne pošlje na strežnik. | Lastni test: prenos, ime datoteke, prvi bajti, nadzor omrežnih zahtev. |
| R06 | `D ∈ {";", ","}`; vsaka glava in vsaka vrednost obdana z `"`; notranji `"` podvojen. | Lastni test: obe ločili, vrednosti z narekovaji. |
| R07 | Vrstice ločene s CRLF; tudi zadnja vrstica se konča s CRLF; ločila in prelomi v vrednostih ostanejo znotraj navedene vrednosti. | Lastni test: primerjava bajtov, vrednost s prelomom in ločilom. |
| R08 | `nevtraliziraj` iz zgornje definicije za vse podatkovne vrednosti, ne za glavo; drugi nizi nespremenjeni. | Lastni test: vsi začetni znaki in vsi štirje znaki formule; kontrolni nizi. |
| R09 | Šumniki, Unicode, presledki in opisi ohranjeni razen nevtralizacije; `status` kot interna vrednost; `dueDate` kot `YYYY-MM-DD`. | Lastni test: podatki z Unicode znaki, primerjava bajtov. |
| R10 | Preklop pogleda ohrani `C`, `D`, `F`; isti (`C`, `D`, `F`) v obeh pogledih dasta iste bajte. | Lastni test: preklop pogleda, primerjava bajtov. |
| R11 | Zamenjava projekta ali osvežitev ponastavi `C = K`, `F = all`, `D = ";"`; zaporedna izvoza odražata trenutne nastavitve. | Lastni test: spremeni nastavitve, zamenjaj projekt/osveži, primerjaj. |
| R12 | Izvoz in kontrole ne spreminjajo opravil, izvornih polj ali bralnih funkcij; brez zapisov na API; videz Folio ostane prilagodljiv. | Skupni regresijski testi in lastni test: stanje pred/po izvozu, nadzor zahtev. |

Dogovor o vmesniku (iz izvirnih zahtev, brez širjenja):
- Checkbox za vsako kolono ima dostopno ime `Stolpec <ime>` (npr. `Stolpec title`).
- HTML select `Ločilo CSV` z vrednostma `;` in `,`; HTML select `Filter izvoza` z vrednostmi `all/todo/in_progress/done`; gumb `Izvozi CSV`.
- Ohranijo se `data-task-id` na vrsticah in karticah, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`.
- Nova dejanja ob opravilu so zunaj njegove povezave. Na širini 390 pik se cela stran ne razširi; notranje drsenje preglednice in table je dovoljeno. Besedilo in razporeditev novih kontrol nista predpisana.

## Izvedba in sledljivost

Tabela se izpolni med izvedbo z dejanskimi dokazi. Prazna polja (—) pomenijo, da preverjanje še ni izvedeno in se ne šteje kot uspešno; izvor rezultata bo določljiv z imenom testa in dnevnikom zagona.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | — | — | — | — |
| R02 | — | — | — | — |
| R03 | — | — | — | — |
| R04 | — | — | — | — |
| R05 | — | — | — | — |
| R06 | — | — | — | — |
| R07 | — | — | — | — |
| R08 | — | — | — | — |
| R09 | — | — | — | — |
| R10 | — | — | — | — |
| R11 | — | — | — | — |
| R12 | — | — | — | — |

## Odprta vprašanja in omejitve

- Navigacija med nezaključenim nalaganjem in nove sočasne spremembe podatkov brez osvežitve niso v obsegu obstoječih regresijskih zahtev.
- Brez trajne shrambe ali URL-ja: stanje nastavitev izvoza je lokalno trenutnemu projektu in se ob menjavi projekta ali osvežitvi ponastavi.
- Javni pripomoček razvojnih testov (nadzorovani GET odgovori) je testni mehanizem; vmesnik ga ne uvaža in ne uporablja. Končni testi niso dostopni; preverjanje se opre na opisano domeno in lastne teste v `tests/agent/`.
- Dokumentov ne podvajamo: izvirne zahteve in dogovor o vmesniku ostajajo v `task/instructions.md`; ta specifikacija jih povezuje in izraža s pravili.

## Zgodovina sprememb

- 2026-10-30, v1: prva različica specifikacije (korak speckit-specify); zajete zahteve R01–R12, pravila sprememb stanja in kanonična serijalizacija.
