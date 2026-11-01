# Specifikacija: Iskanje in sestavljeni filtri

## Problem in kontekst

Aplikacija Folio trenutno prikazuje vsa opravila trenutnega projekta v izvornem vrstnem redu. Uporabniki morajo zmožnost za:
- Iskanje opravil po id, title, description in assignee
- Filtriranje po status (all, todo, in_progress, done)
- Filtriranje po assignee (all ali točno ime)
- Kombinacijo iskalnega vnosa in filtrov (logični AND)

Zasnova ohranja obstoječe podatke, pogled in navigacijo.

## Vhodi, dejanja in izidi

### Podatkovni tipi
interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: todo | in_progress | done
  assignee: string
  dueDate: string
}

type FilterStatus = all | todo | in_progress | done
type FilterAssignee = all | string

### Uporabniški vnos
- Iskalni input (type=search): Iščite opravila
- HTML select - Filter stanja: all, todo, in_progress, done
- HTML select - Filter oseba: all + vsa različna neprazna assignee imena iz projekta
- Gumb Počisti filtre: Vrne vse kontrole na privzete vrednosti

### Izhod
- Tabla in tabla prikazujeta ista opravila po aplikaciji vseh pogojev
- Spodaj: Prikazano: N od M (N = prikazani, M = vse v projektu)
- Če je rezultat 0 (neprazen projekt): Ni zadetkov.
- Prazen projekt: 0 od 0, običajno prazno stanje

## Predpogoji in dejanja

### Počisti filtre
- Vrnite vse tri kontrole na privzete vrednosti
- Prikaži vsa opravila projekt
- Ne spremeni izvornega vrstnega reda

### Izhod: Iskanje
- Iskalni vnos razdeli po belinah v neprazne besede
- Ujemanje: vse besede morajo biti dobesedni podnisi (ne regularni izrazi), vrstni red ni pomemben
- Prazen vnos ne omejuje

### Prenos: Iskanje
- Poj: združena id, title, description, assignee
- Unicode NFD -> odstrani kombinacijska znamenja U+0300-U+036F -> male ckrke
- Primer: car, c, C -> enako iskanje

### Izhod: Filtriranje
- Stanje: all, todo, in_progress, done
- Oseba: natančna ujemanja, brez normalizacije
- Logični AND: oba pogoja se morata izpolniti
- Nekatere filtre ne vplivajo na druge
