# Specifikacija P04: stabilno razvrščanje z dvema ključema

## Problem in kontekst

Folio že prikazuje projekte in opravila, bere javni API /api/ ter omogoča preglednico, tablo in podrobnosti. Uporabnik potrebuje preglednejši vrstni red opravil z dvema razvrščalnima ključema in neodvisnima smerema, pri čemer razvrščanje ne sme spreminjati podatkov ali izgubiti obstoječih bralnih funkcij.

## Vhodi, dejanja in izidi

- Vhod so obstoječa polja Task: id, projectId, title, description, status, assignee in dueDate.
- Dejanja so izbira primarnega ključa (original, title, assignee, status, dueDate), primarne smeri (asc, desc), sekundarnega ključa (none, title, assignee, status, dueDate) in sekundarne smeri (asc, desc) ter ponastavitev z gumbom Izvorni vrstni red.
- Izid je zaporedje istih opravil v preglednici in isti relativni vrstni red znotraj vsakega stalnega stolpca table.
- Uspešna sprememba kontrole takoj posodobi trenuten prikaz in se ohrani pri preklopu preglednica/tabla ter odpiranju/zapiranju podrobnosti.
- Menjava projekta ali osvežitev začne s privzetimi vrednostmi; stanja ne shranjujemo v trajno shrambo ali URL.
- Napake nalaganja podatkov ostanejo na obstoječem vmesniku in ne sprožijo zapisov na API.

## Zahteve in pravila

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Za nov nabor velja primary=original, primaryDir=asc, secondary=none, secondaryDir=asc; prikaz je enak prejetemu zaporedju. | UI test preveri privzete vrednosti kontrol in ID-je v izvornem zaporedju. |
| R02 | Za title in assignee velja normalize(s)=lower(removeMarks(nfd(s))), primerjava pa je normalize(a) < normalize(b) po kodnih enotah UTF-16. | Lastni unit test primera z diakritiko in primerjavo po UTF-16. |
| R03 | status ima stalni vrstni red todo < in_progress < done; dueDate se kronološko primerja po veljavnem YYYY-MM-DD. | Lastni unit testiranji razvrščanj. |
| R04 | Smer obrne samo izid primerjave izbranega ključa; ne obrne stolpcev statusa in ne spremeni zaporedja enakih elementov. | Unit test s povratno smerjo in UI test. |
| R05 | Sekundarni ključ se uporabi le, če je comparePrimary(a,b)=0, z lastno smerjo. | Unit test neodvisnih smeri in UI test. |
| R06 | Če sta obe primerjavi enaki, ostane izvorno zaporedje; enak primarni in sekundarni ključ ne povzroči dvojnega obrata; primary=original vedno vrne izvorno zaporedje. | Unit testi z enakimi vrednostmi, enakim ključem in original. |
| R07 | Stolpci table so vedno todo, in_progress, done; znotraj stolpca je zaporedje enako razvrščenemu polju. | UI test pridobi ID-je po stolpcih. |
| R08 | Preklop pogleda ne spremeni nobene od štirih nastavitev; odpiranje in zapiranje podrobnosti prav tako. | UI test prebere kontrole po preklopu in podrobnostih. |
| R09 | Menjava projekta ponastavi vse štiri kontrole; polna osvežitev začne s privzetimi vrednostmi; ni localStorage, sessionStorage ali URL parametra za razvrščanje. | UI test menave projekta; statični pregled kode za odsotnost trajnega stanja. |
| R10 | Gumb Izvorni vrstni red nastavi vse štiri vrednosti na privzete; prazen projekt in eno opravilo delujeta pri vseh ključih in smereh. | UI test reset in lastna testna primera za prazen nabor ter eno opravilo. |
| R11 | Razvrščanje je projekcija: sortedTasks so isti objekti v spremenjenem zaporedju, stanja, skupne številke in izvorno polje ostanejo nespremenjeni; sprememba vrstnega reda ne pošlje zapisov na API. | Unit test identitet objektov in UI test odsotnosti API zapisov. |
| R12 | Vsak id je v vsakem prikazu natanko enkrat, povezava pa odpre podrobnost tega ID-ja, tudi pri enakih naslovih. Ostale bralne funkcije in odzivni videz ostanejo. | UI test duplikatov naslovov, ID-jev in podrobnosti. |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R06 | sortTasks(tasks, options) izvede opisano dvonivojsko primerjavo s stabilnim vrstnim redom. | tests/agent/sorting.spec.ts | src/sorting.ts | Uspešno: unit test `sorting rules are stable and normalized` preveri prvih šest pravil. |
| R07–R12 | UI kontrole, projekcija, preklopi, menjava projekta in reset delujejo po zahtevah. | tests/agent/P04.spec.ts | src/App.tsx, src/TaskBoard.tsx, src/styles.css | Uspešno: UI testi `sorting state works in both views, details and projects` in `empty and single-task projects support every key and direction` preverita celotno UI pot. |

## Odprta vprašanja in omejitve

- Ni odprtih vprašanj; podatkovna domena je omejena na veljavne koledarske datume YYYY-MM-DD in neprazna imena, kot določa naloga.
- Končni/zaključni testi niso na voljo v tem okolju, zato ne bodo navajani kot izvedeni.
- Ne preverjamo sočasnih sprememb podatkov brez osvežitve, ker naloga te situacije ne razširi prek obstoječih regresij.

## Spremembe specifikacije

| Datum | Sprememba |
| --- | --- |
| 2026-10-30 | Prva različica specifikacije za P04. |
| 2026-10-30 | Dopolnjena sledljivost z dejanskimi izidi preverjanj. |
