# P06 — Izvedbene naloge

Vir: [specifikacija](spec.md), [načrt](plan.md), [izvirne zahteve](../../../task/instructions.md). Naloge izvaja isti agent zaporedno po številkah; vsaka je odvisna od prejšnje. Označi jih šele po dejanski izvedbi. Brez novih odvisnosti ali sprememb infrastrukture.

## Priprava

- [ ] T001 Preglej meje posegov in obstoječi `ProjectView` v `src/App.tsx`, `src/styles.css` ter testne možnosti v `tests/development/P06.spec.ts`; v `docs/agent/P06/validation.md` odpri kratek dnevnik preverjanj z začetnim stanjem »ni izvedeno« in povezavo na ta seznam. Ne spreminjaj pregledanih skupnih testov ali konfiguracije.

## Temeljna logika

- [ ] T002 V `src/csv.ts` implementiraj kanonične kolone, tipizirane nastavitve in čisto serializacijo po predikatih iz `docs/agent/P06/spec.md`: stabilni filter, varovalo praznih kolon/vrstic, BOM, obe ločili, vedno navedene celice, podvojeni narekovaji, CRLF po zadnjem zapisu ter natančna nevtralizacija formul pred navajanjem vseh podatkovnih polj; ohrani Unicode, datume, interne statuse in nespremenljiv vhod. Pokriva R01–R09, R12.

## Uporabniška zgodba 1 — Nastavljen prenos trenutnega projekta

- [ ] T003 V `src/CsvExport.tsx` dodaj sedem checkboxov, HTML selecta in gumb z dogovorjenimi dostopnimi imeni, privzetimi nastavitvami ter predikatom omogočenosti. Ob kliku uporabi trenutne nastavitve in lokalni Blob prenos `folio-<projectId>.csv`; varuj tudi obdelovalnik, odstrani začasno povezavo in odloženo sprosti URL. Brez novih strani, omrežnih zapisov ali sprememb opravil. Pokriva R01–R06, R11–R12.

## Uporabniška zgodba 2 — Pogledi in življenjska doba nastavitev

- [ ] T004 V `src/App.tsx` vključi `CsvExport` v skupni del naloženega projektnega pogleda pred preglednico/tablo. Ohranitev iste komponente med pogledoma mora ohraniti nastavitve, obstoječi `key={project.id}` in osvežitev pa jih ponastavita; vsak prikaz/povzetek še uporablja celotno izvorno polje. Ohranijo se podrobnosti, bralni tokovi, oznake in povezave. Pokriva R04, R10–R12.

## Dodelava in preverjanje

- [ ] T005 V `src/styles.css` oblikuj prelomljive izvozne kontrole po `docs/dizajn.md` z obstoječimi barvami, površinami, gumbom in vidnim fokusom; pri 390 pikah ne razširi cele strani ter ohrani notranje drsenje in obstoječa dostopna imena. Pokriva R12 in dogovor o vmesniku.
- [ ] T006 V `tests/agent/P06.spec.ts` dodaj teste čiste serializacije z neodvisno določenimi pričakovanimi bajti za obe ločili, izvirni vrstni red, izbor v drugačnem vrstnem redu, nič kolon/vrstic, notranje narekovaje/CR/LF/CRLF, prazne vrednosti, Unicode, robne presledke, interne statuse in datume. Preveri štiri sprožilce formul, poljubne kombinacije dovoljenih začetnih znakov, varne podobne nize in zamrznjen vhod; pravilo velja za vsako podatkovno kolono. Pokriva R01–R09, R12; S01–S05, S07.
- [ ] T007 V `tests/agent/P06.spec.ts` dodaj brskalniške preizkuse s testnim nadzorom GET: privzeti prenos in BOM/ime, 0/1/več kot 10 opravil, drugačni ID-ji in enaki naslovi, nič kolon brez prenosa in ponovni izbor, vsi filtri in prazni zadetki, celotni prikaz/povzetek, enaki bajti med pogledoma, zaporedni izvozi in ponastavitve ob menjavi/vrnitvi projekta ter osvežitvi. Preveri odsotnost zapisov API/nove strani, delovanje podrobnosti ter kontrole in širino 390 pik v obeh pogledih. Pokriva R01–R12; S01–S08.
- [ ] T008 Izvedi `npm run check` (lint, TypeScript/build, skupni API in regresijski testi, razvojni P06 na namizju/mobilno ter agentovi testi). Shrani dnevnik v `docs/agent/P06/check.log` in rezultate v `docs/agent/P06/validation.md`; vizualno preveri Folio na namizju in pri 390 pikah s posnetki v isti mapi. Morebitne napake popravi samo v dovoljenih datotekah in ponovi ustrezna preverjanja z ločenim dnevnikom; neizvedeno ali blokirano označi izrecno.
- [ ] T009 V `docs/agent/P06/spec.md` dopolni vseh dvanajst vrstic sledljivosti s konkretnimi deli kode, testnimi imeni ter izidi/povezavami na `docs/agent/P06/validation.md` in dnevnike. Ohrani predikate in zgodovino sprememb; zapiši nepreverjene scenarije, omejitve ter morebitne neizpolnjene zahteve. Preveri skladnost dovoljenih posegov in označitev nalog v `docs/agent/P06/tasks.md`; predaja vsebuje samo dejanske rezultate.

## Merilo zaključka

R01–R12 in dogovor o vmesniku so implementirani ter povezani z dejanskimi preverjanji po skupni predlogi. Če ostane neuspeh ali omejitev, ostane ustrezna naloga odprta in predaja navede konkreten razlog. Nedostopni končni testi se ne štejejo med izvedene teste.
