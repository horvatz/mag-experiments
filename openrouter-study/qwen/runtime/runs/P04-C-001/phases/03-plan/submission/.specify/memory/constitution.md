# Mag Admin Console - Project Constitution
# Mag Admin Console - Constituzija

## Projektna načela

**Jednostavnost**: Minimalne odvisnosti, pregledno in vzdržljivo kodo.
**Stabilnost**: Priznana infrastruktura in obstoječi konfiguraciji se ne dotakne.
**Tesnosti**: Ciljamo na podporni tesnost znotraj pilot P04 omejitev (1199 sekund).
**Transparentnost**: Jasnoumna dokumentacija in spremljivi izhodi.

## Skupni pogoji guard

**Prikaz**: Samo `src/`, `tests/agent/` in `docs/agent/`
  so pisanje dovoljeno.

**Poročilo**: Procesno `.specify/memory/constitution.md` in
  `.specify/feature.json` doporimo.

**Berljivi** so samo:
  - `node_modules/`, `dist/`
  - `vite/`
  - `tests/baseline.spec.ts`
  - `tests/api.spec.ts`
  - `src/`
  - `docs/agent/`
  - `task/`
  - `PROJECT_RULES.md`
  - `SKILL.md`
  - `.gitignore`

**Preverjanje**: Obstoječi testi (baseline spec) morajo prenesti.

**Git**: `zan/<branch>` lokalno in oddaljeno; najprej
  preverite imena razvora.

## Izvodi

- Uporabljaj `zan/<name>` za razveze
- Ne zaganjaj agentov (samo en uradni postopek)
- Shrani sproti delo; 1199 sekund skupno omejitev.

# P04 Feature Reference

- `docs/agent/P04/` za detajle specifikacije in nalog
- `.specify/feature.json` za metapodatke funkcionalnosti

## Implementacija (src/)

- API `/api/` za brisanje podatkov (ne dodajaj zapisovalnih API-jev)
- Razvrščanje z dvema ključema (primarni + sekundarni)
- Folio dizajn iz `docs/dizajn.md` potrdjen

## Projektni dokumenti

- `PROJECT_RULES.md` za splošna pravila
- `task/instructions.md` za specifične zahteve P04
- `docs/agent/P04/` za agencijsko dokumentacijo

## Metapodatki

- `.specify/feature.json` za procesne metapodatke
- `.specify/memory/constitution.md` za projektne načela

## Omejitve

  - Ne spreminja obstoječe infrastrukture
  - Ne ustvarja novih odvisnosti
  - Ne zaganja vseh agentov (samo uradni koraki)
  - Shrani spremembe z `git add`, `git diff`

## Datum sprejetja
2026-01-01 (Datum pilot začetka)

## Verzija
Pilot P04 - Konstituzija
