# Zgodovinski zapis specifikacije P03

- 2026-10-09 06:42:48 – izvirna specifikacija ustvarjena po skupni predlogi s pogoji R01–R12:
  - Problem in kontekst: iskalnik, filter stanja/filter osebe na vrhu projekta
  - Vlhovi, dejanja in izidi: input \`type=search\`, \<select> za stanje/oseb, gumb \`Počisti filtre\`
  - Zahteve R01–R12: privzeto, NFD, iskalni besede, logični IN, izbor oseb, preglednica/tabla,
    prepričevana, osveževanje, števec, prazno, čist, navodila/bralna podrobnost
  - Predikati: \`isSearchMatch\`, \`matchesFilter\`
  - Sledi: vsaka sprememba inputa/osebe osveži prikaz; \`Počisti filtre\` vrača vse na default
  - Odprta: Regex ne uporablja; filter ne shrani v \`localStorage\` niti URL; ARIA neimplementirano
  - Izvedba: tabela R01–R12, povezava na \`src/\` dosežke in testne scenarije

---

Nadaljevanje: še vedno brez R02–R12 testov; testni primeri: NFD znaki, večbesedna iskalba, 
kombinacija stanje+oseb; tabela/tabla preklop; navigacija med projekti; F5.


