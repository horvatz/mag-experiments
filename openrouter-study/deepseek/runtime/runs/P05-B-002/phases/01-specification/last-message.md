Specifikacija je zaključena in predana.

**Predaja**
- `docs/agent/specification.md` – kontekst, podatkovni model (`Task`/`Project` iz `shared/types.ts`), lokalno stanje `filter/size/page`, predikati `F`, `n`, `P`, `V`, `A`, `B`, pravila vseh dejanj ter sprejemni pogoji R01–R12 z načinom preverjanja in predvideno sledljivostjo (pogoj → test/scenarij → datoteka → izid).
- `docs/agent/specification-history.md` – začetni zapis in popravek formule statusa (`Stran {page} od {P}. Prikazano {A}–{B} od {n}.`; pri `n = 0`: `Stran 0 od 0. Prikazano 0–0 od 0.`).

**Ključne opredelitve**
- `P = 0` pri `n = 0`, sicer `1` pri `all` oziroma `ceil(n/size)`; vsaka sprememba velikosti ali filtra nastavi `page = 1`; menjava projekta/osvežitev resetira `all/all/1`; stanje ni v URL-ju ali trajni shrambi.
- Preglednica in tabla prejmeta isti odsek `V`; tabla ga šele združi v stolpce; pregled stanj šteje celoten nefiltrirani projekt.
- Izidi so označeni kot „ni še izvedeno“ – aplikacije in testov v tej vlogi nisem zaganjal; izvedba in vpisi dokazov so naloga implementerja.

Odprte predpostavke (značka ob naslovu = `n`, noga ohrani obstoječi pomen, omejitev `page ≤ P` ob spremembi podatkov) so zapisane v razdelku o omejitvah.
