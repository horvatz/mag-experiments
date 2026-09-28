# P08: Načrt izvedbe

## Tehnično izhodišče

- Odjemalec je React 19.3, TypeScript 6 in Vite 8 na Node 24; uporabniški vmesnik in slogi so v `src/`. Obstoječe odvisnosti zadostujejo, novih ne dodajamo.
- `App.tsx` vsebuje `ProjectView`, ki prek `useResource` bere `/api/projects/:id/tasks`; projekti se berejo prek `/api/projects`. `TaskBoard.tsx` prejme seznam opravil, `TaskDetails.tsx` pa podatke za podrobnosti bere ločeno. API za zapis obstaja, vendar ga P08 ne uporablja.
- `navigation.ts` ohranja projekt in izbrani prikaz v hash poti. P08 naj uporabi obstoječi preklop prikaza, datuma in skupine pa ne zapisuje v URL ali trajno shrambo.
- Playwright konfiguracija že vključuje namenske projekte za razvojne in agentne teste. `tests/development/P08.spec.ts` ima štiri pripravljene scenarije (D01–D04); ta in skupni testi so samo za branje. Odvisnosti in preverjevalna konfiguracija ostanejo nespremenjeni.

## Odločitve zasnove

1. **Čista koledarska logika.** Dodati majhen pripomoček v `src/deadlineGroups.ts` za razvrščanje, koledarsko prištevanje dni in filtriranje. Datume obravnavati kot veljavne koledarske nize `YYYY-MM-DD`, ne kot lokalne časovne trenutke. `done` razvrstiti pred preverjanjem roka; odprte skupine določiti z mejami `D`, `D+7` in `D+8`. Obstoječe oblikovanje prikaza datuma ostane ločeno.
2. **Stanje na ravni izbranega projekta.** V `ProjectView` hraniti začetni veljavni datum `2026-09-21`, besedilo polja, izbrano skupino `all` in stanje opozorila. Veljaven vnos takoj zamenja datum; prazen vnos spremeni besedilo in prikaže opozorilo, izračun pa uporablja zadnji veljavni datum. Obstoječi ključ komponente projekta poskrbi za ponastavitev ob menjavi projekta; preklop pogleda ohrani trenutno stanje, osvežitev ga ponastavi. Ne uporabljati `localStorage` ali novih parametrov poti.
3. **En vir za števce in oba prikaza.** Izračunati pet števil iz celotnega seznama projekta, nefiltrirano od `F`. Iz njega izpeljati stabilno filtriran seznam `L` in isti `L` predati preglednici oziroma `TaskBoard`; tabla ga nato razdeli po obstoječih statusih. Ohraniti izvorni vrstni red in identifikator `id`.
4. **Lokalna razširitev Folia.** Kontrole in števce dodati v obstoječi projektni pregled, obstoječi stolpci, navigacija, podrobnosti in slogi ostanejo v veljavi. Ohraniti slovenska besedila, zahtevane dostopne oznake, `data-task-id`, vidni fokus in prilagodljivo postavitev. Pri 390 px se lahko notranje pomikata preglednica in tabla, stran pa ne sme postati širša.
5. **Bralni obseg.** Uporabiti samo obstoječe `GET /api/` vire. Ne spreminjati opravil, ne uvajati zapisov, testnih kontrol v aplikacijo, strežniških sprememb ali sprememb skupnih tipov.

## Datoteke in zaporedje dela

1. `src/deadlineGroups.ts` — dodati in omejeno preveriti koledarski predikat ter funkcije za skupine in filtriranje.
2. `src/App.tsx` — dodati lokalno stanje datuma/skupine, pet števcev, `input type="date"`, `select`, opozorilo in izpeljavo `L`; preglednici in tabli podati isti seznam.
3. `src/TaskBoard.tsx` — prilagoditi prazno filtrirano stanje z zahtevanim besedilom ter ohraniti obstoječe stolpce, dostopna imena, vrstni red znotraj stolpcev in ID-je kartic.
4. `src/styles.css` — oblikovati nove kontrole in števce z obstoječimi Folio spremenljivkami; preveriti notranje drsenje pri širini 390 px in vidni fokus. Ostale slogovne smernice ostanejo iz `docs/dizajn.md`.
5. `tests/agent/P08.spec.ts` — dodati Playwright preverjanja za zahteve in primere, ki jih D01–D04 še ne pokrivajo: koledarske meje in prestopne datume, neodvisne števce, filtre/vrstni red, ponastavitev in ohranitev stanja, prazne primere, skladnost ID-jev prikazov ter odzivnost. Uporabiti nadzorovane API GET odgovore samo iz testov; ob preverjanju bralnega obsega test lahko opazuje poskuse zapisov.

## Preverjanje in sledljivost

- Razvojni testi D01–D04 in obstoječi regresijski testi ostanejo nespremenjeni. Med implementacijo se vsako pravilo poveže s scenarijem T-R01–T-R12 v `spec.md`; rezultate in dejansko uporabljena imena testov se zapiše po izvedbi, ne vnaprej.
- Po spremembah izvesti `npm run check` (lint, preverjanje TypeScript/build in celoten Playwright nabor). Po potrebi posebej ponoviti agentne ali razvojne Playwright scenarije; neuspešnih ali nedostopnih končnih testov se ne označi kot uspešne.
- Noben test ni bil izveden pri pripravi tega načrta.

## Meje

Spremembe kode so omejene na `src/`, lastni testi na `tests/agent/`, dokumenti postopka na `docs/agent/`. `server/`, začetni podatki, `shared/`, skupni testi, razvojni testi, nastavitve, odvisnosti in uradne predloge se ne spreminjajo. Načrt ne razširja funkcionalnega obsega specifikacije `spec.md`.
