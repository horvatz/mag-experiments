# Straničenje in filter stanja

## Problem in kontekst
Folio aplikacija za gestijo opravil trenutno prikazuje vso zbirko opravil projekta brez možnosti straničenja ali filtriranja. Dodajam funkcionalnost za naključni prikaz opravil zmožnostjo straničenja (velikosti strani: all/2/5/10) in filtriranja po stanju (all/todo/in_progress/done).

## Ključne zahteve
- Straničenje deluje na trenutno filtrirano zbirko opravil
- Sprememba velikosti strani ali filtra resetira na prvo stran
- Preglednica (table) in tabla (board) prikazujeta iste ID-je na trenutni strani
- Stanje je dosegljivo prek role=status
- Straničenje ne spremeni podatkov

## Zahteve in pravila

| Zahteva
| Pravilo ali sprejemni pogoj
| Način preverjanja
| ---| ---| ---
| R01| Privzeto je velikost strani \`all\` in filter \`all\`; vidna so vsa opravila v izvornem vrstnem redu.| Preverjanje privzetega stanja po začetnem nalaganju |
| R02| Velikosti 2, 5 in 10 razdelijo trenutno filtrirano polje na zaporedne, neprekrivajoče se odseke. Zadnja stran je lahko krajša; noben ID se ne izgubi ali podvoji.| Preverjanje ID-jev na vsaki strani |
| R03| Prva stran, Prejšnja stran, Naslednja stran in Zadnja stran vodijo na ustrezno stran. Na robu je neveljavno dejanje onemogočeno in ne spremeni stanja.| Preverjanje stanja gumbov na robovih |
| R04| Sprememba velikosti strani vedno vrne na prvo stran nove velikosti, tudi če bi bila prejšnja številka še veljavna. \`all\` pomeni eno stran pri nepraznem rezultatu.| Preverjanje resetiranja strani ob spremembi velikosti |
| R05| Filter \`all/todo/in_progress/done\` se uporabi pred straničenjem; njegova sprememba vrne na prvo stran. Ne vpliva na vrstni red ujemajočih se opravil.| Preverjanje filtriranja in ohranjanja vrstnega reda |
| R06| Preglednica in tabla kažeta iste ID-je trenutne strani. Tabla združi šele ta odsek v stolpce; ne straniči vsakega stolpca ločeno.| Primerjava ID-jev med pogledoma |
| R07| Preklop pogleda ter odpiranje in zapiranje podrobnosti ohranijo stran, velikost in filter.| Preverjanje ohranjenega stanja po preklopach |
| R08| Menjava projekta in osvežitev ponastavita velikost na \`all\`, filter na \`all\` ter stran na prvo. Stanje se ne hrani v trajni shrambi ali URL-ju.| Preverjanje resetiranja pri menjavi in osvežitvi |
| R09| Za neprazen rezultat status vsebuje \`Stran X od Y\`. Prikazano \`A–B od N.\`, kjer sta A/B indeksa z začetkom 1 in N velikost filtriranega polja.| Preverjanje vsebine elementa \`role=status\` |
| R10| Za prazen projekt ali prazen rezultat filtra status vsebuje \`Stran 0 od 0\`. Prikazano \`0–0 od 0.\` in vsi štirje gumbi za premik so onemogočeni.| Preverjanje ob stanju brez opravil |
| R11| Pregled stanj šteje celoten nefiltrirani projekt; števci stolpcev table štejejo prikazana opravila trenutne strani. Število vseh opravil se zaradi straničenja ne spremeni.| Preverjanje celostnih in stolpčnih števil |
| R12| Straničenje ne spreminja podatkov in ne pošilja zapisov na API. Obstoječe povezave, pravilni ID-ji, podrobnosti, nalaganje in prilagodljiv videz Folio ostanejo uporabni.| Preverjanje odsotnosti API zapisov (GET-only) |
