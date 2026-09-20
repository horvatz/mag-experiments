<!--
Sync Impact Report
Version change: neizpolnjena predloga → 1.0.0 (prvi sprejem za pilot P01).
Modified principles: pet mest predloge → I. Izvirne zahteve in omejen obseg;
II. Ohranitev vmesnika Folio; III. Javni API in identiteta;
IV. Sledljivost zahtev; V. Dokazljivo preverjanje.
Added sections: Meje sprememb; Potek dela; izpolnjena pravila Governance.
Removed sections: nobena vsebinska pravila (odstranjeni le primeri predloge).
Follow-up TODOs: ni. Predloge in ukazi ostanejo nespremenjeni.
Začasno poročilo za pregled; odstraniti pred morebitnim prihodnjim commitom ustave.
-->
# Pilot P01 — Folio Constitution

## Core Principles

### I. Izvirne zahteve in omejen obseg

Merilo so zahteve v `task/instructions.md`, tudi če jih izvedeni dokumenti izpustijo.
Specifikacija mora slediti nalogi in njenim izrecnim izključitvam. Ustava ne dodaja novih
funkcij, odvisnosti ali obveznih arhitekturnih preureditev.

### II. Ohranitev vmesnika Folio

Dopolnitve morajo uporabljati obstoječe gradnike, slovenska poimenovanja in potrjeni
videz iz `docs/dizajn.md`. Ohraniti morajo dogovorjene oznake, dostopna imena in
semantiko sporočil iz navodil naloge, da ostaneta vmesnik in preverjanje usklajena.

### III. Javni API in identiteta

Aplikacija mora podatke brati in shranjevati prek javnega `/api/` ter opravila izbirati
po `id`. Strežnika ne sme nadomestiti z lokalno kopijo podatkov ali `localStorage`.
Kontrole `/__test/` sme uporabljati samo testni program, nikoli uporabniški vmesnik.

### IV. Sledljivost zahtev

Razvojna specifikacija mora pokriti skupno `task/specification-template.md`; dovoljene
so povezave na dokumente Spec Kit. Vsako zahtevo je treba povezati s pravilom oziroma
sprejemnim pogojem, scenarijem ali testom, mestom izvedbe in dokazom rezultata.
Simboli in predpostavke morajo biti pojasnjeni; splošna pravila ločena od primerov.
Po popravkih je treba posodobiti povezave in ohraniti zgodovino sprememb specifikacije.

### V. Dokazljivo preverjanje

Rešitev je treba preveriti s skupnimi testi in ločenimi preverjanji zahtev P01.
Uspeh izhodiščnih testov sam ne dokazuje vseh zahtev. Poročilo mora navesti dejansko
izvedene teste, določljiv izvor rezultatov, neizvedena preverjanja, omejitve in
neizpolnjene zahteve. Neizvedenih testov ni dovoljeno označiti kot uspešne.

## Meje sprememb

Dovoljene so spremembe v `src/`, `tests/agent/` in `docs/agent/`; postopek C sme dodatno
posodobiti `.specify/memory/constitution.md` in `.specify/feature.json`.
Začetni podatki, `server/`, `shared/`, skupni testi, nastavitve, odvisnosti, uradne
predloge, veščine in druge datoteke Spec Kit ostanejo nespremenjeni. Sprememba skupne
infrastrukture zahteva vnaprej dogovorjeno posodobitev izhodišča za vse postopke in
ni del te naloge.

## Potek dela

Isti agent izvaja samo trenutno naročeni korak lokalnega Spec Kit; drugih agentov
ne zaganja. Dokumenti funkcionalnosti sodijo v `docs/agent/P01`. Raziskovanje je
omejeno na lokalno kodo in priložena navodila. Ne uporablja drugih projektov,
povezovalnikov, oddaljenih repozitorijev, vej ali commitov. Delo sproti shranjuje,
preostanek časa preverja z `node task/time-budget.mjs` in zadnjo minuto roka nameni
predaji. Bistvenih manjkajočih podatkov ne izmišljuje: omejitev navede in se ustavi.

## Governance

Ustava povzema `PROJECT_RULES.md`, skupno predlogo in izrecna navodila pilota;
ne nadomešča izvirnih zahtev. Ob neskladju veljajo izvirne zahteve in izrecne
uporabnikove omejitve. Sprememba ustave mora navesti razlog, vir pravila, vpliv
in datum; ne sme sama razširiti dovoljenega obsega dela.

Različica sledi semantičnemu različevanju: MAJOR za nezdružljivo spremembo ali
odstranitev načela, MINOR za novo ali vsebinsko razširjeno načelo, PATCH za
pojasnilo brez spremembe pomena. Predaja vsakega koraka mora preveriti skladnost
z mejami sprememb; končna predaja navede spremembe, rezultate preverjanj in odprte
omejitve. Različica 1.0.0 pomeni prvi sprejem projektnih pravil za ta pilot.

**Version**: 1.0.0 | **Ratified**: 2026-09-20 | **Last Amended**: 2026-09-20
