# P05 Constitution (Folio)
<!-- Projektna ustava za pilot P05; izpeljana iz PROJECT_RULES.md in skupne predloge. -->

## Core Principles

### I. Meje dovoljenih sprememb (NON-NEGOTIABLE)
Spreminjamo samo kodo vmesnika v `src/`, lastne teste v `tests/agent/` in dokumente v `docs/agent/`; izjemoma procesni datoteki `.specify/memory/constitution.md` in `.specify/feature.json`. Začetni podatki, `server/`, `shared/`, skupni testi, odvisnosti in nastavitve ostanejo nespremenjeni. Predloge ne širijo obsega naloge in ne spreminjajo infrastrukture.

### II. Podatki samo prek javnega API-ja
Aplikacija bere in shranjuje podatke izključno prek javnega vmesnika `/api/`, izbira po `id`. UI ne uvaža ali uporablja testnih kontrol `/__test/`, ne nadomešča strežnika z lokalno kopijo podatkov ali `localStorage` in ne uvaja novih zapisovalnih API-jev.

### III. Ohranitev potrjenega dizajna Folio
Obstoječi videz Folio iz `docs/dizajn.md`, slovenska poimenovanja, dostopna imena in obstoječe povezave ostanejo uporabni. Nova dejanja ob opravilu so zunaj njegove povezave; `data-task-id` na vrsticah in karticah se ohrani.

### IV. Sledljivost zahtev
Vsaka zahteva R01–R12 je v specifikaciji povezana s pogojem, delom kode in dejansko izvedenim testom. Izbrani pogoji se izrazijo s predikati; splošno pravilo se loči od posameznega testnega primera.

### V. Pošteno poročanje o preverjanju
Rešitev se preveri s skupnimi testi in smiselno dodanimi lastnimi preverjanji. Neizvedeni ali nedostopni testi se nikoli ne navajajo kot uspešni; nepreverjeni deli, omejitve in odstopanja se jasno zapišejo.

## Dodatne omejitve

Zahteve P05 veljajo, tudi če jih specifikacija izpusti. Stanje nove funkcionalnosti je lokalno trenutnemu projektu; brez trajne shrambe ali URL-ja, razen kjer zahteva izrecno določa drugače. Navigacija med nalaganjem in sočasne spremembe podatkov se ne širijo prek obstoječih regresijskih zahtev.

## Razvojni potek

Uporabljajo se uradne lokalne veščine Spec Kit po vrstnem redu; gostiteljeve veščine so izključene. Veje in commite se ustvarja samo, če je izrecno zahtevano; sicer se delo shranjuje sproti v dovoljene datoteke.

## Governance

Ta ustava nadomešča druge prakse znotraj svojega obsega. Spremembe zahtevajo dokumentacijo in ohranitev skladnosti z `PROJECT_RULES.md` in navodili naloge. Vsaka sprememba, ki bi razširila obseg ali infrastrukturo, je neskladna in se ne izvede.

**Version**: 1.0.0 | **Ratified**: 2026-10-11 | **Last Amended**: 2026-10-11
