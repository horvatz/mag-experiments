# Načrt izvedbe P05

Specifikacija in pogoji R01–R12 so v [`spec.md`](./spec.md); ta načrt zabeleži izvedbene odločitve brez ponavljanja zahtev.

## Tehnični kontekst

- Aplikacija uporablja React 19, TypeScript 6 in Vite 8. Obstoječe knjižnice in Chromium so nameščeni; novih odvisnosti ni treba dodati.
- `ProjectView` v `src/App.tsx` prejme opravila iz `GET /api/projects/:id/tasks`, izračuna pregled stanj in izriše preglednico ali `TaskBoard`. `TaskBoard` že sprejme seznam `Task[]` in iz njega oblikuje stolpce.
- `ProjectView` je ključan z ID-jem projekta. Preklop pogleda in odpiranje podrobnosti spreminjata hash, ne zamenjata pa komponente za isti projekt; lokalno stanje zato lahko preživi te prehode in se ob osvežitvi ali menjavi projekta ponastavi.
- Playwrightova konfiguracija ima ločen projekt `agent` za `tests/agent/**/*.spec.ts`. Obstoječe teste, konfiguracijo in skupno infrastrukturo pustimo nespremenjene.

## Odločitve

1. V `ProjectView` hranimo samo izbrano velikost, filter in trenutno stran. Začetne vrednosti so `all`, `all`, `1`; ob vsaki spremembi velikosti ali filtra se stran nastavi na `1`. Filter in odsek strani se vedno izračunata iz nespremenjenega seznama API-ja v izvornem vrstnem redu.
2. Najprej filtriramo, nato izrežemo eno stran. Pri `all` je neprazen rezultat ena stran. Isti izračunani seznam strani podamo preglednici in tabli; komponenta `TaskBoard` nato opravila razvrsti v stolpce. Pregled stanj in skupno število opravil ostaneta vezana na celoten seznam, števci stolpcev pa na posredovano stran.
3. Stanja strani ne zapisujemo v URL, `localStorage` ali drug trajni pomnilnik. Obstoječa hash navigacija za projekt, pogled in podrobnost ostane nespremenjena; klicev API za zapis ne dodamo.
4. Nove kontrole postavimo ob obstoječi preklop pogleda v razdelku opravil. Uporabimo določena slovenska dostopna imena, robno onemogočanje gumbov in natančna besedila statusa iz specifikacije. Ohranimo potrjeni videz Folia; ozki zaslon ne dobi vodoravnega preliva celotne strani.

## Datoteke in zaporedje dela

1. **Stanje in podatkovni odsek — `src/App.tsx` (R01–R05).** Dodaj lokalno stanje, izračun filtriranega seznama in strani, obravnavo štirih navigacijskih gumbov ter neveljavnih robov. Ob spremembi velikosti ali filtra nastavi prvo stran.
2. **Pogledi in obstoječi prikazi — `src/App.tsx`, po potrebi `src/TaskBoard.tsx` (R06–R08, R11).** Preglednici in tabli posreduj isti odsek. Ohranitev stanja potrdi s preklopom pogleda in odpiranjem/zapiranjem podrobnosti; projektna menjava in osvežitev morata začeti s privzetimi vrednostmi. Ne spremeni obsega projektnih števcev.
3. **Kontrole in odzivnost — `src/App.tsx`, `src/styles.css` (R09–R10, R12).** Dodaj status `role="status"`, selecta in gumbe z določenimi imeni ter sporočilo za prazen rezultat. Slog prilagodi obstoječim Folio spremenljivkam; pri 390 px po potrebi omeji drsenje na preglednico ali tablo.
4. **Lastna preverjanja in dokazila — `tests/agent/P05.spec.ts`, `docs/agent/P05/spec.md`.** Dodaj scenarije, ki z ID-ji preverijo vse R01–R12, vključno z mejami velikosti strani, praznimi rezultati, ohranitvijo stanja, števci, povezavami in odsotnostjo zapisov. Po dejanskem preverjanju posodobi sledljivost in rezultate v specifikaciji.

`src/TaskBoard.tsx` naj ostane nespremenjena, če zadošča obstoječi sprejem seznama strani. `src/TaskDetails.tsx`, `src/navigation.ts`, `src/api.ts`, `src/useResource.ts`, `shared/`, strežnik, nastavitve, odvisnosti, `tests/development/` in skupni testi niso predvideni za spremembo.

## Preverjanje izvedbe

Ko bo implementacija pripravljena, izvedi lastne P05 teste iz Playwrightovega `agent` projekta, razvojne P05 teste in skupne regresijske preverjanja, nato lint in build. Zabeleži samo dejansko izvedene ukaze in rezultate; skriti ali nedostopni končni testi ostanejo nepreverjeni.
