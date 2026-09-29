# P07 – preverjanje implementacije

Začetni zapis implementerja, 2026-09-25. Prebrani so PROJECT_RULES.md, task/instructions.md, task/specification-template.md in predana specifikacija v1. Izvirne R01–R12 ostajajo obvezne. Specifikacije in pregledovalčevih datotek ne spreminjam.

## Začetni načrt (ob nastanku še neizvedeno; končni izidi spodaj)

- Pregled obstoječega Folio dizajna, komponent in razvojnih testov.
- R01–R10: gumbi po ID-jih, skupno stanje, kanonična trajna shramba, filter, prazna stanja, menjava projekta/pogleda, odstranitev projekta in števci.
- R04/R11: neveljavni zapisi brez samodejnega prepisa, storage dogodki brez povratnega zapisa, izjeme branja/zapisa z uporabnim stanjem v pomnilniku.
- R12: brez zapisov API ali sprememb opravil; ohranitev navigacije, dizajna in širine 390 px.
- Smiselni dodatni testi v tests/agent/ za vrzeli razvojnih testov.
- Obvezni npm run check: slog, tipi, gradnja ter osnovni, razvojni in lastni testi. Trenutno ni izveden noben test.

## Omejitve in predaja

Uporabljam samo lokalni izvoz in storitve naloge. Infrastruktura, odvisnosti, navodila in skupni testi so samo berljivi; dodatnih agentov ne zaganjam. Chromium je treba povezati prek wsEndpoint iz task/browser.json. Javni internet je blokiran. Končni nedostopni testi niso del preverjanja. Rok faze je 21:38:06.481 UTC; zadnja minuta je namenjena predaji.

## Dejanski rezultati

- Implementirani so globalna množica, validacija in zapis shrambe, dogodki storage, opozorilo ob izjemi, gumbi ob opravilu, projektni filter/brisanje/števec in vidni števci table. Podrobnejša sledljivost bo v implementation.md.
- Prvi samostojni lint, typecheck in build so uspešni.
- Prvi npm run check: lint/gradnja, 38 osnovnih in 8 razvojnih testov ter prva dva lastna testa so uspeli. Zagon je bil nato prekinjen zaradi napačne pričakovane velikosti razvojnega projekta v lastnih testih (5 namesto dejanskih 8 opravil). Aplikacija je pravilno prikazovala 8. Popravljen je samo pričakovani M v lastnih testih; ponovni celotni check teče. Prvotni dnevnik: check-initial.log.
- Ročni zajem prek chromium.connect na localhost:5193: pri 390 px sta mobileBoardFits in mobileTableFits oba true. Posnetki desktop-table.png, desktop-board.png, mobile-table.png in mobile-board.png so shranjeni. Vizualno pregledana namizna preglednica in mobilna tabla ohranjata Folio, zvezdice in nove kontrole so vidne.
- Sistemska Git in Python se ne zaženeta zaradi manjkajoče poti Xcode CommandLineTools (xcrun). Uporabljen Node za dovoljene datotečne operacije. Infrastruktura ni bila spreminjana.

## Končni rezultat in predaja

**npm run check: uspešno, izhod 0.** Lint, typecheck, produkcijska gradnja in vseh **67 testov** so uspešni: 38 osnovnih, 8 razvojnih P07 in 21 lastnih; Playwright je trajal 26,6 s. Dokaz: [check.log](check.log). Prvi prekinjeni zagon zaradi napačnega testnega pričakovanja je ohranjen v [check-initial.log](check-initial.log); ne šteje kot uspešen zagon.

Vseh R01–R12 je povezanih s pogoji, končno kodo in dejanskimi testi v [implementation.md](implementation.md). Napake ali izpusti predane specifikacije niso bili ugotovljeni. Znane neizpolnjene zahteve niso bile zaznane.

Vizualni pregled: namizna preglednica, mobilna preglednica in mobilna tabla ohranjajo Folio. Namizna tabla je bila ponovno zajeta po izrecnem čakanju na regijo table, ker je prvi posnetek nastal pred zaključkom navigacije. Rezultati širine in imena posnetkov: [visual-check.json](visual-check.json). Kontrole, zvezdice in prikaz brez razširitve strani pri 390 px so preverjeni; notranje drsenje ostaja.

Omejitve: uporabljena je lokalna povezava na nameščeni Chromium, ne chromium.launch(); javni internet ni uporabljen. Git/Python sta blokirana z manjkajočimi sistemskimi orodji. Končni skriti testi niso dostopni. Storage uskladitev je preverjena z dogodki StorageEvent, ne s sočasnim ročnim delom v dveh fizičnih oknih. Regresije nalaganja/navigacije so uspešne; dodatne sočasne spremembe zunaj dogovorjenega obsega niso preverjene.

Predaja je shranjena več kot 60 sekund pred rokom faze. Pregledovalec lahko prevzame rešitev in uporabi check.log, implementation.md, lastne teste in štiri posnetke. Za popravke ostane prvotni implementer na voljo v nadaljevani seji.
