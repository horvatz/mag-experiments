# Zgodovina specifikacije

- Začetni zapis: povzel namen, podatke, predpostavke o skladih `U`/`R` in sprejemne pogoje R01–R12 iz izvornih navodil. Stanje preverjanj označeno kot neizvedeno.
- Končni zapis: po pregledu `shared/types.ts`, `src/App.tsx`, `src/TaskBoard.tsx`, `src/TaskDetails.tsx`, `src/navigation.ts` in `src/styles.css` potrdil podatkovna polja, GET poti, projektni reset s `key={project.id}`, statusno filtriranje table, obstoječe atribute in odzivne drsnike. Dodal prehodne predikate U/R, obseg testnih podatkov, mapiranje R01–R12 na ciljne komponente in jasno označil vse teste kot neizvedene (vloga specifikacije jih ne izvaja). Ni odprtih odločitev, ki bi preprečevale implementacijo.
- Zaključni popravek: dostopni imeni gumbov za premik sta izpisani ločeno po smeri; globalno mesto je izrecno povezano z zahtevanim aria-label.
