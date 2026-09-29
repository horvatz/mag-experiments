# Projektna načela Folio — pilot P07, postopek C

## I. Izvirne zahteve in sledljivost

Merilo so `task/instructions.md` (vseh R01–R12), `PROJECT_RULES.md` in izrecna dopolnila uporabnika. Izpust v specifikaciji ne razveljavi zahteve. Dokumentacija v `docs/agent/P07` pokrije vse razdelke `task/specification-template.md`; povezave med dokumenti Spec Kit lahko nadomestijo podvajanje. Zahteve poveže s sprejemnimi pogoji, kodo, testi in dejanskimi dokazili. Izbrane pogoje izrazi s predikati ter pojasni simbole in predpostavke.

## II. Ohranitev Folio in dostopnosti

Ohranijo se potrjeni dizajn iz `docs/dizajn.md`, slovenska poimenovanja, nalaganje, navigacija ter ozki prikaz. Obstoječa in zahtevana dostopna imena, vloge, stanja ter identifikatorji ostanejo skladni z navodili. Opravila se izbirajo po ID-ju; enak naslov ne pomeni enakega opravila.

## III. Javni podatki in lokalne priljubljene

Aplikacija podatke opravil bere prek obstoječega `/api/`; strežnika ne nadomešča z lokalno kopijo. Izrecna izjema P07 dovoljuje `localStorage` samo za priljubljene po R02–R04 in R11, brez polj opravil. Spremembe priljubljenih so lokalne, ne spreminjajo opravil in ne zapisujejo na API. Testne kontrole `/__test/` in testni podatkovni pripomočki so dovoljeni samo testnemu programu.

## IV. Omejen obseg sprememb

Dovoljene so spremembe v `src/`, `tests/agent/`, `docs/agent/` ter za postopek C v `.specify/memory/constitution.md` in `.specify/feature.json`. Začetni podatki, strežnik, skupni tipi in testi, odvisnosti, nastavitve, infrastruktura, uradne predloge, veščine ter ostale datoteke Spec Kit ostanejo nespremenjeni. Načela ne uvajajo novih zahtev, odvisnosti ali obveznih arhitekturnih preureditev.

## V. Preverjanje in poštena predaja

Rešitev se preveri s skupnimi testi in smiselnimi lastnimi preverjanji vseh zahtev P07. Pravila veljajo za celotno opisano domeno podatkov, ne samo razvojne primere. Dokumentacija navaja dejansko izvedene teste, rezultate in določljiva dokazila; neizvedeni in nedostopni končni testi niso uspešni testi. Predaja navede spremembe, omejitve in neizpolnjene zahteve; po popravkih se posodobijo povezave in ohrani zgodovina specifikacije.

## Vodenje postopka

En isti agent z ohranjeno zgodovino izvaja samo korak lokalne uradne veščine, ki ga sproži izvajalnik. Brez drugih agentov, vej, commitov, oddaljenih repozitorijev, povezovalnikov ali zunanjega raziskovanja. Delo se sproti shranjuje; čas se preverja z `node task/time-budget.mjs`, zadnja minuta skupnega roka je namenjena predaji. Bistveno manjkajoč podatek se navede kot omejitev in delo ustavi, brez izmišljanja uporabnikovega odgovora.

Ta načela povzemajo izvorna navodila in ne širijo njihovega obsega. Spremembe načel morajo ostati skladne z njimi in biti označene z datumom ter različico.

**Različica**: 1.0.0 | **Sprejeto**: 2026-09-25 | **Nazadnje spremenjeno**: 2026-09-25
