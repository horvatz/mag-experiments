# Projektna ustava - Pilot P10

## Ime projekta
P10: Lokalni vrstni red z razveljavitvami

## Vodilna načela
- Funkcionalnost se osredotoča na razvrščanje opravil z globalnim in relativnim vrstnim redom.
- Uporabniški vmesnik ohraja potrjen videz Folio in slovenska poimenovanja.
- Spremembe so lokalne permutacije; ne vplivajo na zapiske API-ja ali polja opravil.
- Sistem podpira zgodovino razveljavitv in ponovitev za učinkovito upravljanje sprememb.

## Nepogojna pravila
- Spreminjamo samo datoteke v `src/`, `tests/agent/` in `docs/agent/`.
- Ne dodajamo novih zapisovanj API-ja; vsi podatki se berejo iz obstoječega javnega vmesnika `/api/`.
- Testni primeri `/__test/` so namenjeni samo testnemu programistu; uporabniški vmesnik jih ne sme brati.
- Število shranjenih prejšnjih permutacij je omejeno na 20; starejše se zavrnejo ob dodatnih spremembah.
- Strogo upoštevamo dogovor o vmesniku, vključno z ARIA oznakami in strukturo stolpcev.

## Datum sprejetja
09. 10. 2026 (2026-10-09)

---
*Ta ustava obsega samo projektna načela. Implementacija se nadaljuje v naslednjih korakih.*
