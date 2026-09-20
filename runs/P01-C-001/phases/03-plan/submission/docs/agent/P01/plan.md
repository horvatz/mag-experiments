# Implementation Plan: P01 — Urejanje opravila

**Branch**: brez ustvarjanja veje; resolver vrne oznako P01 | **Date**: 2026-09-20 | **Spec**: [spec.md](spec.md)

**Input**: docs/agent/P01/spec.md in izvirni task/instructions.md, R01–R10.

## Summary

V TaskDetails dodamo obrazec z ločenim osnutkom naslova in stanja. Pripravljeni
updateTask shrani obe polji; šele uspešen odgovor posodobi podrobnosti in seznam
projekta, iz katerega izhajajo preglednica, tabla in števci. Preklic zavrže osnutek,
zavrnitev ga ohrani; čakanje zaklene oddajo. Folio in infrastruktura ostaneta ista.

## Technical Context

**Language/Version**: TypeScript 6.0.3, Node 24.11.x.

**Primary Dependencies**: nameščeni React/React DOM 19.3.0, Vite 8.3.0, lucide-react 1.46.0.

**Storage**: obstoječa strežniška shramba prek /api/; preživi osvežitev brskalnika,
ne pa zagona strežnika. Brez nove shrambe ali localStorage.

**Testing**: Playwright 1.63.0 in pripravljeni Chromium, ESLint, tsc in Vite build.

**Target Platform**: obstoječi namizni in mobilni spletni vmesnik Folio.

**Project Type**: React aplikacija s pripravljeno podatkovno storitvijo.

**Performance Goals**: ni novih časovnih meril; največ ena čakajoča zahteva.

**Constraints**: spremembe samo src/, tests/agent/, docs/agent/ in dovoljenih procesnih
datotek. Brez sprememb server/, shared/, odvisnosti, konfiguracije ali skupnih testov.

**Scale/Scope**: dve polji obstoječega opravila, vsi trije statusi in R01–R10.
Implementacija ne predpostavlja konkretnih naslovov ali števila opravil.

## Constitution Check

| Merilo | Pred raziskavo | Po zasnovi |
| --- | --- | --- |
| Izvirne zahteve R01–R10 in izključitve brez razširitve | PASS | PASS |
| Folio, slovenske oznake in dogovorjena dostopnost | PASS | PASS |
| Javni API, identiteta id, testne kontrole samo v testih | PASS | PASS |
| Sledljivost po skupni predlogi | PASS | PASS |
| Skupni in lastni testi, dejanski dokazi v predaji | PASS | PASS |
| Dovoljene datoteke, brez infrastrukture in novih odvisnosti | PASS | PASS |

Bistvenih neznank ali izjem ni. Raziskavo je izvedel isti agent brez delegiranja,
kot izrecno zahteva uporabnik. Pregled pomeni skladnost načrta, ne opravljenih testov.

## Project Structure

### Documentation (this feature)

~~~text
docs/agent/P01/
├── spec.md
├── development-spec.md
├── checklists/requirements.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/api.md
└── tasks.md  (naslednji korak speckit-tasks)
~~~

### Source Code (repository root)

~~~text
src/
├── TaskDetails.tsx   (obrazec, osnutek, napake, oddaja)
├── taskEditing.ts   (nova natančna normalizacija naslova)
├── useResource.ts   (posodobitev trenutno naloženega vira)
├── App.tsx          (uskladitev seznama po uspehu)
├── styles.css       (omejeni slogi obrazca Folio)
├── api.ts           (že pripravljen updateTask)
└── TaskBoard.tsx     (obstoječa izpeljava iz seznama)
tests/agent/P01.spec.ts  (dodatni funkcionalni scenariji)
~~~

**Structure Decision**: Ohranimo postavitev. TaskDetails, že vezan na taskId, ob
odprtju nastavi osnutek iz shranjenega Task in počisti napake. Naslov je textarea,
da ohrani notranje prelome; Stanje je select iz obstoječega TaskStatus.

useResource dobi omejeno funkcijo za posodobitev podatkov trenutnega naloženega vira.
TaskDetails po uspehu sprejme vrnjeni Task in pokliče onSaved v ProjectView. Ta zamenja
samo zapis istega id; obstoječe izpeljave nato uskladijo vse prikaze. Če seznam še ni
naložen, se ponovno pridobi. Pred odgovorom ni optimističnih sprememb.

Oddaja normalizira naslov po dogovorjenih štirih znakih in pošlje samo title/status.
Sinhrona ref zapora poleg saving prepreči ponovno oddajo pred izrisom. Ob zavrnitvi
try/catch/finally obnovi urejanje in ohrani vnos. Preklic zapre le obrazec; uspeh
prav tako pusti podrobnosti odprte, skladno z obstoječimi razvojnimi testi.

Vrstni red: normalizacija in uskladitev virov; uspešen tok US1; validacija in preklic
US2; čakanje in ponovitev US3; testi ter dokazi. Vsi tokovi so obvezni.
Podrobnosti: [raziskava](research.md), [model](data-model.md), [pogodba](contracts/api.md),
[preverjanje](quickstart.md), [sledljivost](development-spec.md).

## Complexity Tracking

Ni kršitev ustave; dodatna arhitekturna plast ali odvisnost ni potrebna.
