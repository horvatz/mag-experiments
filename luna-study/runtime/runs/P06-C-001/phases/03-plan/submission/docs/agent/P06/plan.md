# P06: Načrt izvedbe

**Stanje:** načrt; izvedba in preverjanja niso del tega koraka  
**Specifikacija:** [spec.md](spec.md)

## Tehnični kontekst

Aplikacija uporablja React, TypeScript in Vite. Projekt ter opravila se že berejo prek javnega API-ja z obstoječim hookom useResource. ProjectView v src/App.tsx prejme projekt in njegov seznam opravil; TaskBoard v src/TaskBoard.tsx prikazuje isti seznam, preglednica pa je v ProjectView. Menjava pogleda spremeni route, projektni ProjectView pa se obdrži; menjava projekta zamenja komponento, ker je njena key vrednost project.id. Obstoječi tipi opravila vključujejo vsa polja, ki jih zahteva CSV.

Uporabijo se obstoječe odvisnosti in testno okolje. Strežnik, shared types, skupni testi, začetni podatki, konfiguracija, namestitve in ukazi se ne spreminjajo. Aplikacija bere samo obstoječe /api/ poti; testne kontrole ostanejo zunaj uporabniškega vmesnika.

## Odločitve in arhitektura

1. **Stanje in kontrolniki:** v ProjectView hraniti izbrane kolone, ločilo in filter. Privzete vrednosti so vse kolone, podpičje in all. Preklop Preglednica/Tabla ohrani stanje; ključ projekta poskrbi za ponastavitev ob menjavi projekta, osvežitev pa začne z začetnimi vrednostmi. Filter se uporabi samo pri pripravi vrstic za CSV, ne pri seznamu ali tabli.
2. **Serializacija:** dodati čisti modul src/csv.ts za kanonični vrstni red polj, glavo, izbor vrstic, formulo, citiranje ter zaključke CRLF. Formatter prejme trenutna opravila in nastavitve, ne spreminja vhodov ali stanja ter nima dostopa do API-ja. Vrednosti se najprej nevtralizirajo po R08, nato citirajo in ubežijo; BOM U+FEFF je na začetku vsebine.
3. **Prenos:** ProjectView omogoči gumb samo, ko so podatki naloženi ter sta izbor kolon in filtrirani seznam neprazna. Klik pripravi Blob z CSV vsebino in sproži prenos prek povezave z imenom folio-<projectId>.csv; ne odpre nove strani in ne pošlje vsebine na strežnik. Začasni URL se sprosti po uporabi.
4. **Dostopnost in videz:** kontrole dodati ob obstoječem preklopu pogledov. Ohraniti določena dostopna imena, Folio slog, vidni fokus, obstoječe task-id oznake in ločitev morebitnih dejanj od povezav opravil. Sloge dopolniti v src/styles.css; pri 390 px se lahko pomikata notranja prikaza, ne celotna stran.

## Datoteke

| Datoteka | Namen |
| --- | --- |
| src/App.tsx | Stanje kontrol, predikat omogočenosti, filtriranje samo za izvoz in sprožitev prenosa. |
| src/csv.ts | Nov čist formatter za deterministično vsebino CSV. |
| src/styles.css | Postavitev kontrol skladno s potrjenim Folio in ozkim prikazom. |
| tests/agent/P06.spec.ts | Novi ciljni brskalniški scenariji za kontrole, datoteko in regresije. |
| docs/agent/P06/spec.md | Po izvedbi povezati R01–R12 z dejanskimi deli kode, testi in rezultati. |
| docs/agent/P06/plan.md | Ta načrt. |

## Zaporedje izvedbe in preverjanja

1. Implementirati in ciljno preveriti čisti formatter: vrstni red stolpcev in opravil, BOM, citiranje, ubežanje, CRLF, formula ter Unicode.
2. Dodati kontrolnike in prehode stanja v ProjectView; preveriti prazne izbire/rezultate, filtre, ohranitev stanja ob menjavi pogleda ter reset ob projektu in osvežitvi.
3. Dodati prenos in Folio sloge. V brskalniških testih preveriti ime in bajte datoteke, odsotnost navigacije/zapisov API-ja, nespremenjene prikaze in širino 390 px.
4. Zagnati ciljne teste v tests/agent/ in skupne ukaze preverjanja, ki so že določeni v projektu. Šele po dejanskem zagonu zabeležiti izide in dokazila v spec.md; neoznačene ali nedostopne teste pustiti kot nepreverjene.

Izvedba naj ostane znotraj src/, tests/agent/ in docs/agent/. Načrt ne dodaja odvisnosti ali zahtev zunaj specifikacije P06.

