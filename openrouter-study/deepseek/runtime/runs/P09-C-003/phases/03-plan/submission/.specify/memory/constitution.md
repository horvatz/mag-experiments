# Ustava projekta Folio (P09)

## Osnovna načela

### I. Meje obsega
Spremembe so omejene na kodo vmesnika v `src/`, lastne teste v `tests/agent/`
in lastno dokumentacijo v `docs/agent/`. Začetni podatki, `server/`, `shared/`,
skupni testi `tests/baseline.spec.ts` in `tests/api.spec.ts`, odvisnosti ter
nastavitve zagona in preverjanja ostanejo nespremenjeni. Sprememba skupne
infrastrukture bi zahtevala vnaprej dogovorjeno posodobitev izhodišča za vse
postopke in ni del te naloge.

### II. Javni vmesnik in podatki
Aplikacija bere in shranjuje podatke izključno prek javnega vmesnika `/api/`,
izbira po `id`. Uporabniški vmesnik ne uporablja testnih kontrol `/__test/`,
ne nadomešča strežnika z lokalno kopijo podatkov in ne uporablja
`localStorage`. Naloga ne dodaja novih zapisovalnih API-jev.

### III. Potrjeni videz in jezik
Ohrani se potrjeni dizajn Folio iz `docs/dizajn.md` in slovenska poimenovanja
vmesnika. Obstoječe dostopnostne elemente (`data-task-id`, dostopna imena
pogledov in stolpcev, `aria-label`) ter uporabnost na širini 390 pik je treba
ohraniti.

### IV. Specifikacija in sledljivost
Zahteve se zajamejo po skupni predlogi specifikacije
(`task/specification-template.md`); izbrane zahteve se izrazijo s predikati
ali pravili spremembe stanja. Vsaka zahteva R01–R12 je povezana s pogoji,
kodo in dejansko izvedenimi testi; dokumenti se ne podvajajo, temveč se
povezujejo.

### V. Resnično preverjanje
Rešitev se preveri s skupnimi testi in smiselno dopolni z lastnimi
preverjanji. Izida se ne označi kot uspešnega brez dejanskega preverjanja;
neizvedeni testi in nepreverjeni scenariji se navedejo kot taki. Ob koncu se
opišejo spremembe, izvedena preverjanja, rezultati in neizpolnjene zahteve.

## Dodatne omejitve
- Stanje nove funkcionalnosti je lokalno trenutnemu projektu, razen kadar
  zahteva izrecno določa trajno shrambo ali URL.
- Naloga ne uvaja novih odvisnosti, novih arhitekturnih preureditev ali
  sprememb infrastrukture.
- Nejasnosti se rešujejo iz obstoječih zahtev; če bistvenega podatka ni, se
  omejitev jasno navede in se ne izmišljuje odgovorov.

## Razvojni tok
Specifikacija (`spec.md`) → načrt (`plan.md`) → naloge (`tasks.md`) →
izvedba → preverjanje. Koraki se izvajajo po vrstnem redu uradnih veščin
Spec Kit.

## Upravljanje
Ustava prevlada nad drugimi praksami. Spremembe zahtevajo dokumentacijo in
utemeljitev. Preverjanja morajo dokazati skladnost s temi načeli; odstopanja
se zabeležijo v specifikaciji.

**Različica**: 1.0.0 | **Sprejeto**: 2026-11-02 | **Nazadnje spremenjeno**: 2026-11-02
