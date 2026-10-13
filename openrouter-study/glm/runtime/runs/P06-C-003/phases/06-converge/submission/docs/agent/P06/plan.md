# P06 — Načrt izvedbe

## Tehnični kontekst

Aplikacija je React 19 + TypeScript 6 + Vite 8. Podatki so tipi iz `shared/types.ts`, odjemalec pa bere prek obstoječega `GET /api/projects` in `GET /api/projects/:id/tasks`. Vite in strežnik ostajata nespremenjena; nove odvisnosti niso potrebne.

## Odločitve

- Izvoz uredimo kot čisto funkcijo v `src/export.ts`: izbor kolon v nespremenljivem vrstnem redu, filtriranje po statusu, nevtralizacija formul, CSV navedba, BOM in zaključek CRLF.
- Nove kontrole izvedemo v `src/CsvExportControls.tsx`: checkboxi z imeni `Stolpec <ime>`, selecta `Ločilo CSV` in `Filter izvoza` ter gumb `Izvozi CSV`.
- Stanje hranimo v obstoječem `ProjectView` v `src/App.tsx`. `<ProjectView key={project.id}>` zagotovi reset ob menjavi projekta in osvežitvi; preklop Preglednica/Tabla ne remounta komponente, zato nastavitve ohranimo.
- Prenos izvedemo z `Blob`, `URL.createObjectURL` in oddanim `a` elementom; vsebina ne gre na strežnik. Ime datoteke je `folio-<projectId>.csv`.
- Vidget vstavimo izven obstoječih vrstic in kartic, tako da `data-task-id`, povezave do podrobnosti, stolpci in obstoječi dostopnost ostanejo nespremenjeni.
- V `src/styles.css` dodamo samo Foliu skladne razrede za kompakten, vstavljeni blok kontrol na ozkem zaslonu; notranje drsenje obstoječih preglednice in table ostane.

## Datoteke

- `src/export.ts`: tipi `ExportColumn`, `ExportFilter`, nespremenljivi `COLUMNS`, sanitizacija, gradnja CSV in izbira vrstic.
- `src/CsvExportControls.tsx`: dostopne kontrole, stanje gumba in zagon prenosa.
- `src/App.tsx`: lokalno stanje izvoza, reset po projektu, vstavitev kontrol in podajanje opravil.
- `src/styles.css`: minimalni Folio stili za nove kontrole.
- `tests/agent/P06/export-csv.spec.ts`: agentovi testi za vse zahteve R01–R12.
- `docs/agent/P06/spec.md`: posodobljena sledljivost z dejanskimi izidi po izvedbi.

## Koraki

1. Implementiraj čisto izvozno logiko in pokrij formule, navedbe, CRLF, BOM, Unicode, filtriranje ter vrstni red.
2. Dodaj kontrole in jih poveži s `ProjectView`; preveri reset, ohranitev stanja prek poglecov in pogoje za onemogočen gumb.
3. Prilagodi obstoječe ali dodaj nove stile znotraj potrjenega Folio dizajna in 390-pikselne širine okna.
4. Dodaj agentove teste za izvoz, stanja, enake bajte med poglede, resetiranje, dostopnost, odsotnost zapisovalnih zahtev in regresijo obstoječih oznak.
5. Zaženi `npm run lint`, `npm run build` in `npm test`; zapiši dejanske izide in morebitne nepreverjene omejitve.

## Mejniki

- Izvoz ne spreminja strežniških podatkov, `shared/types.ts`, testnega API-ja, odvisnosti ali infrastrukture.
- Vmesnik ne uporablja `/__test/` ali `localStorage`.
