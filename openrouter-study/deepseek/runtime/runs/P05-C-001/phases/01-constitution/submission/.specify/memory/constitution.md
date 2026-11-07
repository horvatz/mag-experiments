# Ustava projekta mag-app (Folio)

## Osnovna načela

### I. Zaprt obseg sprememb (NEDOVOLJENO KRŠITI)
Spremembe so dovoljene le v `src/`, lastnih testih v `tests/agent/` in dokumentaciji v `docs/agent/`; izjema postopka C sta procesni datoteki `.specify/memory/constitution.md` in `.specify/feature.json`. Strežnik `server/`, skupni tipi `shared/`, skupni testi, odvisnosti ter nastavitve zagona in preverjanja ostanejo nespremenjeni. Sprememba skupne infrastrukture je mogoča le kot vnaprej dogovorjena posodobitev izhodišča za vse postopke.

### II. Javni API je edini vir podatkov (NEDOVOLJENO KRŠITI)
Aplikacija bere in shranjuje izključno prek javnega vmesnika `/api/`. Testne kontrole `/__test/` uporablja samo testni program; vmesnik jih ne uvaža, ne bere testnega stanja in ne ponastavlja podatkov. Strežnika se ne nadomešča z lokalno kopijo podatkov ali `localStorage`; novih zapisovalnih API-jev ni.

### III. Potrjeni videz Folio in slovenska poimenovanja
Ohranimo potrjeni dizajn Folio iz `docs/dizajn.md`, slovenska poimenovanja ter obstoječe gradnike in slogovne spremenljivke. Povezave, pravilni ID-ji, podrobnosti, nalaganje in prilagodljiv videz ostanejo uporabni; nova dejanja ob opravilu so zunaj njegove povezave. Dostopnost ohranja `data-task-id`, dostopna imena obstoječih pogledov in stolpcev ter `aria-label="Pregled stanj opravil"`. Pri širini 390 pik se cela stran ne razširi; notranje drsenje preglednice in table je dovoljeno.

### IV. Zahteve so merilo, dokazi so dejanski (NEDOVOLJENO KRŠITI)
Zahteve R01–R12 in izrecni dogovor o vmesniku so zavezujoče, tudi če jih specifikacija ne ponovi. Vsaka zahteva je povezana s pogojem, kodo in dejansko izvedenim testom; neizvedenih ali nedostopnih preverjanj ne navajamo kot uspešnih. Razvojni primeri niso celoten obseg; končni primeri lahko uporabijo drugačne veljavne podatke iz opisane domene.

### V. Minimalnost in sledljivost
Ne dodajamo zahtev, odvisnosti ali obveznih arhitekturnih preureditev, ki niso v nalogi. Stanje nove funkcionalnosti je lokalno trenutnemu projektu; trajna shramba ali URL se ne uvajata, razen če zahteva to izrecno določa. Odprta vprašanja rešujemo iz obstoječih zahtev; če bistvenega podatka ni, navedemo omejitev in se ustavimo, ne izmislimo si uporabnikovega odgovora.

## Razvojni tok in kakovost

1. Zaporedje Spec Kit: specifikacija → načrt → naloge → izvedba, z lokalnimi veščinami iz `.agents/skills/` in skupno predlogo `task/specification-template.md`.
2. Vsaka zahteva se preveri s skupnimi testi in smiselno dodanimi lastnimi testi v `tests/agent/`; rezultati se sproti in jedrnato beležijo v `docs/agent/`.
3. Dokumentov ne podvajamo; skupno predlogo izpolnimo, po potrebi s povezavami na dokumente Spec Kit. Zapisujemo nepreverjene dele in omejitve.
4. Ne ustvarjamo vej ali commitov; zaključek opiše spremembe, izvedena preverjanja, njihove rezultate in neizpolnjene zahteve.

## Upravljanje

Ustava nadrejeno ureja delo v repozitoriju. Sprememba načel zahteva dokumentirano odobritev in posodobitev različice; skladnost se preverja ob vsakem koraku Spec Kit.

**Različica**: 1.0.0 | **Sprejeto**: 2026-10-09 | **Zadnja sprememba**: 2026-10-09
