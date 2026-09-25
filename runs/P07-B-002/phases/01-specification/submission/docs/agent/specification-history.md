# Zgodovina specifikacije P07

## 2026-09-25 – 0.1, začetni zapis

Po branju `PROJECT_RULES.md`, `task/instructions.md` in skupne predloge je bil shranjen uporaben osnutek `specification.md` z vsemi R01–R12, dogovorom o vmesniku in neizvedenim stanjem preverjanj.

## 2026-09-25 – 1.0, predaja implementerju

Po branju `shared/types.ts`, relevantnih datotek `src/`, `docs/dizajn.md`, razvojnih testov D01–D04 in konfiguracije preverjanja so dodani predikati za dekodiranje, filtriranje, preklop, odstranitev projekta in storage. Vsak R01–R12 je povezan s sprejemnim pogojem, scenarijem preverjanja in mestom v kodi. Razjasnjeni so globalni F, lokalni filter, neznani ID-ji, odsotnost zapisov ob inicializaciji/sinhronizaciji, pomnilniški način ob izjemi ter ohranitev praznih stolpcev in videza.

V tej vlogi ni bilo zagona aplikacije, testov ali vizualnega pregleda. Rezultate implementacije in preverjanj zabeleži implementer v svojih zapiskih; morebitne popravke teh dveh dokumentov opravi prvotni avtor v nadaljevani seji. Spremenjeni sta samo avtorjevi datoteki specifikacije in njene zgodovine.

Dokumentacijski pregled `git diff --check -- docs/agent/specification.md docs/agent/specification-history.md` se ni izvedel: lokalni `git` je vrnil napako `xcrun: invalid active developer path`, ker manjkajo orodja CommandLineTools. Infrastruktura ni bila spreminjana.
