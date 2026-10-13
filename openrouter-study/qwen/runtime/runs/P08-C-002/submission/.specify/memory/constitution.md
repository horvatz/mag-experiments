# Ustava projekta P08 - Koledarski pregled rokov

**Datum sprejetja:** 2026-10-13

## 1. Namen projekta

Uvedba funkcionalnosti koledarskega pregleda rokov za zapadele, današnje in prihodnje opravila v aplikaciji Folio.

## 2. Osnovna načela

- **Ohranitev obstoječega interfejsa:** Dodajamo novi vmesnik za izbiro referenčnega datuma in pogleda rokov; ne odstranjujemo obstoječih funkcij.
- **Slovenska jezikovna podpora:** Vsa nova poimenovanja uporabimo v slovenščini, skladno s potrjenim dizajnom v [docs/dizajn.md](file:///Users/zan/Documents/mag/experiments/openrouter-study/qwen/runtime/.work/pilots/P08-C-002/app/docs/dizajn.md).
- **API-first pristop:** Vse operacije z opravili potekajo prek javnega API-ja `/api/`.
- **Lokalno stanje:** Brez trajne shrambe ali URL-jev; stanja so vezana na trenutni projekt.

## 3. Nepreganjljiva pravila

1. **Obseg sprememb:** Spreminjamo samo `src/`, `tests/agent/`, `docs/agent/`.
2. **Nezdružujoče spremembe:** Nastavitve, strežnik, skupni tipi in odvisnosti ostajajo nedotaknjene.
3. **Testna infrastruktura:** Testne kontrole `/__test/` uporablja le testni program; uporabniški vmesnik jih ne bere ali ne manipulira.
4. **Podvajanje kode:** Pri izvajanju zahtev R01-R12 se upošteva predloga specifikacije.

## 4. Referenčni datum

- Začetni referenčni datum je fiksiran na `2026-09-21`.
- Sistematska obdelava datumov: YYYY-MM-DD, koledarski izračun dni, obravnavaprostopnih let in meje mescev.

## 5. Namesto naslednjih namenov:
- `$speckit-specify` – Izpolnite specifikacijo s povezavami na pogoje za R01-R12.
- `$speckit-taskstoissues` – Pretvorite pogoje v naloge za implementacijo.
