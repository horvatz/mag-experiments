# Načrt izvedbe P07

2026-09-25 · Podlaga: [specifikacija](spec.md), [izvirne zahteve](../../../task/instructions.md), [ustava](../../../.specify/memory/constitution.md). V tem koraku se aplikacija ne spreminja.

## Tehnični kontekst

Obstoječa aplikacija uporablja React 19.3, TypeScript 6, Vite 8 in lucide-react; preverjanje uporablja ESLint in Playwright. Vse je že nameščeno. `src/App.tsx` vsebuje App in ProjectView, `src/TaskBoard.tsx` tablo, `src/TaskDetails.tsx` podrobnosti, `src/navigation.ts` hash navigacijo, `src/useResource.ts` nalaganje javnega API-ja, `src/styles.css` potrjeni videz. Skupni tip Task in javni API ostaneta nespremenjena.

`App` ostane montiran med projekti; `ProjectView` že ima `key={project.id}`. To omogoča globalne priljubljene in naravno ponastavitev lokalnega filtra brez sprememb usmerjanja. Tabla že filtrira opravila po statusih v stabilnem vrstnem redu in računa števce iz prejetega seznama.

## Odločitve in podatkovni tok

1. **En primerek upravljanja priljubljenih v App.** Dodamo `src/useFavorites.ts` z validacijo shrambe in hookom. Stanje vsebuje `Set<string>` in opozorilo o nedostopni shrambi; App ga posreduje ProjectView. Brez nove knjižnice, konteksta ali zapisovalnega API-ja (R02–R04, R07–R08, R11–R12).
2. **Branje in zunanja sinhronizacija ne zapisujeta.** Leni začetni bralnik ujame tudi izjemo dostopa do `window.localStorage`; validira celoten JSON in vrne prazno množico pri neveljavnem vhodu. Poslušalec storage za točen ključ uporabi isti dekoder, za null vrne prazno množico in se ob odmontiranju odstrani. Neznani nizi ostanejo v množici (R03–R04, R11).
3. **Zapis samo iz uporabniških dejanj.** Preklop in odstranitev projektnih ID-jev ustvarita novo množico, jo objavita v pomnilniku in poskusita zapisati `{version:1,ids:[...ids].sort()}`. Privzeti sort nizov zagotovi vrstni red UTF-16. Napaka ohrani novo množico ter vključi opozorilo. Stranskih učinkov ne postavljamo v render ali funkcionalni updater stanja, saj React StrictMode lahko ponavlja inicializacijo/updaterje; zadnja objavljena množica je dostopna obdelovalcem dogodkov, da zaporedna dejanja ne uporabijo zastarelega stanja (R01–R02, R09, R11).
4. **Filter živi v ProjectView.** `useState(false)` se ponastavi zaradi obstoječega projektnega ključa, med pogledoma pa ostane. Iz celotnega `tasks` izpeljemo `visibleTasks`, X in M; opravila ne mutiramo. ProjectView pošlje isti vidni seznam v preglednico ali tablo. Projektno odstranjevanje uporabi ID-je vseh `tasks`, ne vidnega seznama (R05–R10).
5. **Dostopna ločena dejanja.** Dodamo majhno komponento `src/FavoriteButton.tsx` s tanko ikono Star iz nameščene knjižnice, `type=button`, točnim dostopnim imenom in `aria-pressed`. V preglednici je sorojenec povezave znotraj celice; na kartici je zunaj povezave v obstoječem elementu z data-task-id. Klik gumba zato ne odpre podrobnosti. Povezave in podrobnosti ostanejo po pravilnem ID-ju (R01, R07).
6. **Kontrole ostanejo dosegljive v praznem prikazu.** Pod naslovom opravil dodamo prelomljivo vrstico s checkboxom, števcem role=status/aria-label in gumbom odstranitve. Pri aktivnem filtru in nič rezultatih prikažemo točno prazno sporočilo. Na prazni filtrirani tabli ohranimo regijo in tri stolpce z ničelnimi števci ter dodamo sporočilo nad tablo. Napaka shrambe je vidno opozorilo role=alert z besedo `shramba` (R05–R06, R09–R11).
7. **Folio ostane izhodišče.** CSS dodatki uporabijo obstoječe barve, robove in fokus, nevtralne gumbe ter modro izbrano stanje. Kartica ohrani vsebino in notranji odmik; gumb dobi prostor zunaj povezave brez prekrivanja besedila. Kontrole se pri 390 px prelomijo. Notranje drsenje table/preglednice ostane; glavna stran se ne razširi (R12).

## Datoteke in obseg

| Datoteka | Predvidena sprememba | Zahteve |
| --- | --- | --- |
| `src/useFavorites.ts` (nova) | Dekoder, začetno branje, množica, preklop, odstranitev ID-jev, kanoničen zapis, storage poslušalec in opozorilo | R01–R04, R08–R09, R11–R12 |
| `src/FavoriteButton.tsx` (nova) | Skupen dostopen gumb za oba pogleda | R01, R07 |
| `src/App.tsx` | Globalni hook, lokalni filter, kontrole, števec, prazno stanje, filtrirana preglednica in props table | R01, R05–R12 |
| `src/TaskBoard.tsx` | Gumbi zunaj povezav; prejem vidnih opravil in iste množice | R01, R05–R07, R10 |
| `src/styles.css` | Omejeni dodatki za gumbe, kontrole, opozorilo in kartice | R12 |
| `tests/agent/P07.spec.ts` (nova) | Vedenjski robni in regresijski scenariji, ki dopolnijo razvojne teste | R01–R12 |
| `docs/agent/P07/spec.md` in dokazila v istem imeniku | Končne povezave na kodo/teste, rezultati, omejitve in zgodovina sprememb | Sledljivost vseh zahtev |

`server/`, `shared/`, odvisnosti, konfiguracije, obstoječi testi in predloge ostanejo samo berljivi. V aplikaciji ni uvozov testnih pripomočkov ali dostopa do `/__test/`. Ne potrebujemo spremembe `src/api.ts`, nalaganja ali navigacije.

## Preverjanje in dokazila

Razvojni D01–D04 pokrivajo osnovni preklop po ID-ju, filtriranje, osvežitev, enotnost pogledov in odsotnost API zapisov. Lastni Playwright testi dopolnijo S01–S12 iz specifikacije z drugačnimi ID-ji, Unicode sortiranjem, dvojniki/neznanimi ID-ji, več kot desetimi opravili in praznimi projekti, projektno odstranitvijo, števci, nepravilnimi zapisi, storage dogodki ter ločenima izjemama branja in zapisa. Preverijo tudi ohranitev filtra ob podrobnostih ter širino 390 px. Kontrola API zahtevkov in primerjava podatkov preverita lokalnost sprememb.

Uporabimo obstoječo Playwright konfiguracijo: projekt `agent` že odkriva `tests/agent/**/*.spec.ts`, razvojni projekti pokrivajo namizje in mobilni prikaz, baseline in api sta ločena projekta. Testni program lahko uporablja obstoječe kontrolne poti; aplikacija jih ne sme.

Predvideni ukazi po implementaciji:

- `npm run lint` in `npm run build` (build vključuje typecheck).
- `npm test` za skupne API/baseline, razvojne P07 in dodatne agentne teste z obstoječim strežnikom iz konfiguracije.
- Ciljno ponovimo prizadete teste samo ob popravkih ali nepojasnjenem izidu.

Dnevnike shranimo v `docs/agent/P07/`, obstoječa konfiguracija pa shrani Playwright dokazila v dovoljene izhodne imenike. Vizualno pregledamo namizni in ozki posnetek Folio. V specifikaciji zapišemo resnične izide in točna imena testov; trenutno nič od tega še ni izvedeno. Nedostopnih končnih testov ne štejemo med opravljene.

## Zaporedje in omejitve

Najprej upravljanje množice in skupen gumb, nato povezava v App/ProjectView in tabli, nato slogi in lastni vedenjski testi, zatem obstoječa preverjanja in dopolnitev dokazil. Vse opravlja isti agent brez vzporednih agentov, vej ali commitov. Ni bistvenih odprtih vprašanj; skupni čas se preverja z `node task/time-budget.mjs` in zadnja minuta ostane za predajo.
