# Razvojna specifikacija: nastavljiv izvoz CSV

## Problem in kontekst

Folio prikazuje opravila izbranega projekta v pogledih Preglednica in Tabla.
Uporabnik želi izvoziti trenuten projekt v CSV in pri tem sam določiti filter,
izbrane stolpce in ločilo. Obstoječa nalaganja, prikaz, navigacija in bralna
zahtevana dejanja ostanejo nespremenjeni; izvoz je dodatno, lokalno delujoče
dejanje nad podatki, ki jih aplikacija že prebere prek javnega API-ja.

Izhodišče:

- `shared/types.ts` določa `Project` (`id`, `name`) in `Task` (`id`,
  `projectId`, `title`, `description`, `status`, `assignee`, `dueDate`).
- `src/App.tsx` v komponenti `ProjectView` bere `/api/projects/<projectId>/tasks`
  prek `useResource<Task[]>`; opravila prikaže v izvornem vrstnem redu.
- `src/navigation.ts` preklopa pogled z URL-hashom in ohranja trenuten projekt.

## Vhodi, dejanja in izidi

Podatkovni vir je izključno obstoječi javni API `/api/`. Za izvoz se uporabijo
naložena opravila trenutnega projekta; dodatna bralna zahteva ni obvezna, testne
kontrole `/__test/` pa so prepovedane. Uporabniški vmesnik dobi tri skupine
nastavitev:

- Checkboxi z dostopnimi imeni `Stolpec <ime>` za dovoljene stolpce v
  nespremenljivem zaporedju `id`, `projectId`, `title`, `status`, `assignee`,
  `dueDate`, `description`.
- Select `Filter izvoza` z vrednostmi `all`, `todo`, `in_progress`, `done`.
- Select `Ločilo CSV` z vrednostmi `;` in `,`.

Privzeto stanje pri odprtju projekta oz. po osvežitvi je:

```text
izbrani_stolpci = {id, projectId, title, status, assignee, dueDate, description}
filter = all
ločilo = ;
```

Uspešno dejanje `Izvozi CSV` ustvari prenos `folio-<projectId>.csv`, ne odpre
nove strani in ne pošlje vsebine na strežnik. Neuspešna dejanja niso možna: gumb
je onemogočen, kadar izdelek ne bi vseboval podatkovne vrstice oz. ko ni izbran
noben stolpec. Napaka nalaganja obstoječega API-ja ostane prikazana z obstoječim
mehanizmom `LoadError`; izvoz v tem primeru ni na voljo.

## Zahteve in pravila

Simboli: `selected(key)` pomeni, da je stolpec izbran; `visible(task)` pomeni,
da opravilo zadošča trenutnemu filtru; `raw(field)` je izvirna nizovna ali
statusna vrednost polja. Vsaka podatkovna vrstica ustreza enemu opravilu.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Izvozi vsa opravila trenutnega projekta v izvornem zaporedju API-odgovora. Privzeto so `filter = all`, vsi dovoljeni stolpci izbrani in `ločilo = ;`. | Test z nedvoumno določenim zaporedjem in več kot desetimi opravili. |
| R02 | Glava in vrednosti sledijo nespremenljivemu zaporedju stolpcev: `id,projectId,title,status,assignee,dueDate,description`, ne glede na zaporedje klikov. Izpuščeni stolpci se izpustijo, preostali pa ohranijo relativni vrstni red. | Preveri izvoz pred in po izbiri/izključitvi v različnem zaporedju. |
| R03 | `enabled(Izvozi) ⇔ ∃ selected(key) ∧ ∃ visible(task)`. Če ni izbran noben stolpec, klik ne sme ustvariti prenosa; ponovna izbira kogarkoli stolpca omogoči izvoz, če obstajajo ustrezne vrstice. | Preveri atribut `disabled` in potek prenosa v mejnih primerih. |
| R04 | `visible(task) ⇔ task.projectId = trenutni.projectId ∧ (filter = all ∨ task.status = filter)`. Filter spremeni samo izvožene vrstice, ne prikaza celotnega projekta. Prazen projekt ali prazen filtrirani rezultat onemogoči izvoz. | Primerjaj prikazane in izvožene ID-je za vse štiri filtre, vključno s praznimi projekti. |
| R05 | Ime prenosa je `folio-<projectId>.csv`. Vsebina se začne z UTF-8 BOM `U+FEFF`. Izvoz deluje v trenutnem oknu, ne odpre nove strani in ne povzroči zapisovalne API-zahteve. | Playwright `download`; preveri bajte začetka, URL in omrežne zahteve. |
| R06 | Dovoljeni sta samo ločili `;` in `,`. Vsaka glava in vsaka vrednost sta obdani z `"`; vsak notranji `"` je podvojen kot `""`. | Enoski testi izgradnje CSV-ja in parsanje z zunanjim CSV parserjem. |
| R07 | Zapisi se ločujejo s CRLF; zadnji zapis se prav tako konča s CRLF. Ločila ter CR/LF v vrednostih ostanejo znotraj navedenih vrednosti in se ne razdelijo na polja oz. vrstice. | Preveri celotne bajte datoteke in parsnje pri obeh ločilih. |
| R08 | Za vsako vrednost velja: če se izvirni niz po nič ali več začetnih znakih `U+0020`, `U+0009`, `U+000D` ali `U+000A` začne z `=`, `+`, `-` ali `@`, je izvorna vrednost `'<izvorni niz>`. Pravilo ne velja za glavo in ne spreminja vrednosti brez takega začetka. | Enoski testi za vse štiri nevarne znake in kombinacije vodilnih presledkov, tabulatorjev ter CR/LF. |
| R09 | Kodiranje je UTF-8; Unicode, presledki, šumniki in opisi ostanejo enaki, razen izrecne nevtralizacije formul. `status` se izvozi kot interna vrednost (`todo`, `in_progress`, `done`), `dueDate` pa kot izvirni `YYYY-MM-DD`, brez lokalnega formatiranja iz `formatDate`. | Test s Unicode, presledki, večvrstičnimi opisi in veljavnimi datumi. |
| R10 | Preklop Preglednica/Tabla ne ponastavi izbire stolpcev, filtra ali ločila. Enake nastavitve ustvarijo bajtno enak izvoz v obeh pogledih. | Nastavi stanje, preklopi pogled in primerjaj izvoza. |
| R11 | Menjava projekta ali osvežitev ponastavi vse tri nastavitve na privzete vrednosti. Vsak zaporedni izvoz odraža trenutne nastavitve in trenuten projekt. | Spremeni nastavitve, izvozi, zamenjaj projekt oz. osveži, izvozi in primerjaj. |
| R12 | Izvozna dejanja in kontrole ne spreminjajo podatkov, izvornih polj, obstoječih bralnih poti ali testnega stanja in ne pošiljejo `POST`, `PUT`, `PATCH` ali `DELETE` na `/api/`. | Regresijski testi obstoječih funkcij ter omrežni test brez zapisovalnih zahtev. |

## Natančen izdelovalni algoritem

1. Izvozni del določi zaporedje dovoljenih stolpcev kot konstantni seznam. Ta
   seznam je vir v zaporedju glave in vrednosti; stanje izbire sme biti množica,
   ne pa zaporedje klikov.
2. Določi izvožene vrstice kot opravila trenutnega projekta, ki ustrezajo
   izbrani vrednosti filtra, v izvornem zaporedju `tasks`.
3. Vsako celico izpiši iz izvira: `id`, `projectId`, `title`, `status`,
   `assignee`, `dueDate` ali `description`. Stolpcev ne pretvori v prikazna
   besedila ali lokalno oblikovane datume.
4. Za podatkovne vrednosti uporabi nevtralizacijo formul iz R08. Za glavo ne
   dodaj apostrofa.
5. Vsako glavo oz. vrednost CSV-navedi: v nizu podvoji `"` in obdaj z `"`.
   Vrstice loči in zaključi s `\r\n`.
6. Ustvari niz `'\uFEFF' + zapisi` in `Blob` z MIME
   `text/csv;charset=utf-8`. Prek dinamične povezave oz. enakovrednega lokalnega
   prenosca prenesi ime `folio-${project.id}.csv`, po uporabi sprosti lokalni vir
   in ne spreminjaj `window.location`.

Stanja naj bodo lokalna v komponenti trenutnega projekta (na primer
`src/App.tsx` ali ločen izvozni modul v `src/`). Ker je obstoječi `ProjectView`
ključen po `project.id`, menjava projekta ponastavi stanje, preklop pogleda pa ga
ohrani. Nobenega dela ni dovoljeno shranjevati v `localStorage` ali v URL.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01, R05 | Privzet okvir, ime in BOM | `tests/development/P06.spec.ts`, test `D01: default file framing` | Izvozna komponenta/modul v `src/`; `src/App.tsx` trenuten projekt in naložena opravila | Ni izvedeno; implementacija še sledi. |
| R02, R04, R06 | Izbrani stolpci, filtri in ločilo | `tests/development/P06.spec.ts`, test `D02: selected fields and separator` | Izvozni izdelovalnik stolpcev, filtrov in CSV | Ni izvedeno; implementacija še sledi. |
| R06–R09 | Navedbe, CRLF, nevtralizacija formul in Unicode | `tests/development/P06.spec.ts`, test `D03: escaped quotes and neutralized formula` | Izvozni izdelovalnik CSV v `src/` | Ni izvedeno; implementacija še sledi. |
| R04, R10, R12 | Enakost pogledov in brez zapisov | `tests/development/P06.spec.ts`, test `D04: view parity and no writes` | Izvozno stanje v `ProjectView` oz. sorodnem modulu | Ni izvedeno; implementacija še sledi. |
| R01–R12 | Celoten obseg | Razvojni testi pokrivajo del obsega; implementer naj doda lastne teste za nepokrite pogoje (R02 klikalno zaporedje, R03 prazna izbira, R04 vsi filtri/prazni projekti, R07 celoten zapis, R08 vse formule, R09 Unicode/datumi, R11 ponastavitev). | Lastni testi v `tests/agent/` | Ni izvedeno; specifikacijska faza ne zaganja aplikacije ali testov. |

## Odprta vprašanja in omejitve

- Ni dodatnih nejasnosti: vsa polja so v izhodišču nizi, statusi so tipizirani,
  datumi pa veljavni `YYYY-MM-DD`.
- Projekta sta lahko prazna in lahko vsebujeta nič, eno ali več kot deset
  opravil; ID-ji so lahko enkratni, naslovi enaki, zaporedje poljubno.
- Obseg ne vključuje strežnika, skupnih tipov, odvisnosti, URL-trajenja
  nastavitev ali shrambe med projekti.
- Izidi testov niso uspešno dokazani, dokler implementer dejavno ne izvede
  svojih preverjanj; ta specifikacija navaja samo načrte in obstoječe razvojne
  teste.
