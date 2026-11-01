# Pregled P04 (postopek B, vloga pregledovalca)

Pregledal sem specifikacijo, kodo, lastne teste in verification.md ter sam izvedel:
- 38 osnovnih/API testov (projekti api, desktop, mobile): vsi uspešni,
- 8 razvojnih testov D01-D04 (development-desktop, development-mobile): vsi uspešni,
- 11 lastnih testov v tests/agent/: vsi uspešni,
- npm run typecheck, npm run lint in npm run build: uspešni.

Vsebinsko so R01-R12 v kodi večinoma pravilno pokrite (normalizacija in leksikografska primerjava, rang stanj in datumi, stabilnost in neodvisni smeri, fiksni stolpci table, ohranjanje nastavitev, ponastavitev, projekcija brez pisanja, enkratni ID-ji in prave podrobnosti).

## Ugotovitve

1. Implementacija (R05): sekundarni select ponuja tudi vrednost original (src/App.tsx:19 sestavi SECONDARY_OPTIONS kot none + vse KEY_OPTIONS). Dogovor o vmesniku in R05 določata sekundarne ključe none/title/assignee/status/dueDate; original med njimi ni. Funkcionalno je enaka none, zato testi ne padejo, a vmesnik odstopa od dogovora. Popravek: sekundarne možnosti sestaviti iz eksplicitnega seznama brez original.
2. Specifikacija (R06): splošni predikat E(t,u) = dS * S(t,u) ob P = 0 (primarni original) skupaj s cmp(t,u) = dP * E(t,u) narekuje razvrščanje po sekundarnem ključu, kar nasprotuje lastnemu pravilu S = T ne glede na sekundarni ključ in smeri. Popravek: izjemo za original vključiti v formulo (E = 0 oziroma cmp = idx razlika).

## Neodvisno nepreverjeno
- Skriti končni testi niso dostopni.
- Preverjeno le v Chromiumu; drugi brskalniki niso bili preverjeni.
- git diff ni bil dosegljiv (peskovnik ne dovoli branja ~/.gitconfig); spremembe zunaj dovoljenih map sem preveril po časovnih žigih datotek.
- Piškotki pri R09 samo statično; okoljskih opomb iz verification.md nisem mogel ponoviti.
