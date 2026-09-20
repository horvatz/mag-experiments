# Folio — projektna načela pilota P01, postopek C

**Različica:** 1.0.0 | **Sprejeto:** 2026-09-20 | **Posodobljeno:** 2026-09-20

## 1. Izvirne zahteve določajo obseg

Merilo so [navodila P01](../../task/instructions.md), vseh deset zahtev R01–R10 in skupni dogovor o uporabniškem vmesniku, tudi če jih razvojni dokument izpusti. Naloga obsega urejanje naslova in stanja obstoječega opravila; druga polja in izrecno izključeni scenariji ostajajo zunaj obsega. Načela ne uvajajo novih zahtev, odvisnosti ali obveznih arhitekturnih preureditev.

## 2. Ohranitev potrjenega vmesnika

Uporabljamo obstoječe gradnike, slogovne spremenljivke, slovenska poimenovanja in [potrjeni dizajn Folio](../../docs/dizajn.md). Ohranimo zahtevane oznake, dostopnost in identifikatorje vmesnika iz navodil P01.

## 3. Javni podatkovni vmesnik in identiteta

Podatke beremo in shranjujemo prek `/api/`; opravila izbiramo po `id`. Uporabniški vmesnik ne uporablja `/__test/`, lokalne kopije storitve ali `localStorage` kot nadomestila strežnika. Osnutek obrazca ostane ločen od shranjenih vrednosti do uspeha; sprememba ohrani druga opravila in preostala polja skladno z R01–R10.

## 4. Meje dovoljenih sprememb

Po [projektnih pravilih](../../PROJECT_RULES.md) in izrecni dopolnitvi postopka C so dovoljene spremembe samo v `src/`, `tests/agent/`, `docs/agent/`, `.specify/memory/constitution.md` in `.specify/feature.json`. Strežnik, začetni podatki, skupni tipi in testi, odvisnosti, nastavitve, uradne predloge, veščine in druge datoteke Spec Kit so samo berljivi. Ne ustvarjamo vej ali commitov ter ne uporabljamo drugih projektov, oddaljenih virov ali povezovalnikov.

## 5. Sledljivost in poštena dokazila

Dokumenti funkcionalnosti v `docs/agent/P01` morajo pokriti [skupno predlogo](../../task/specification-template.md): problem, vhode in izide, pravila vseh zahtev, sledljivost do kode in preverjanj ter odprta vprašanja in omejitve. Povezave med dokumenti lahko nadomestijo podvajanje. Pravila in razloženi predikati se ločijo od posameznih primerov. Po popravkih se sledljivost posodobi in ohrani zgodovina sprememb specifikacije.

Rešitev se preveri s skupnimi testi in smiselnimi preverjanji P01. Zapis vsebuje dejansko izvedena preverjanja, določljiv izvor rezultatov in nepreverjene ali neizpolnjene zahteve. Neizvedeni testi niso uspešni; uspeh razvojnih testov sam po sebi ne dokazuje vseh zahtev.

## Izvajanje in veljavnost

Isti agent z ohranjeno zgodovino izvaja lokalne uradne veščine Spec Kit 1.0.8 s presetom Lean 1.0.0 v vrstnem redu izvajalnika, brez drugih agentov. Vsak korak ostane v svojem obsegu; delo in dokazila se shranjujejo sproti, čas pa preverja z `node task/time-budget.mjs`. Velja skupni rok pilota z zadnjo minuto za predajo.

Ta dokument povzema navedene vire in izrecna navodila pilota; njihovega obsega ne širi. Bistvene manjkajoče informacije se označijo kot omejitev brez izmišljanja uporabnikovih odgovorov.
