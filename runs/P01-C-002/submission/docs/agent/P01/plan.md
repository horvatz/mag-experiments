# P01 — Načrt izvedbe

2026-09-20. Podlaga: [specifikacija](spec.md), [projektna načela](../../../.specify/memory/constitution.md), [izvirne zahteve](../../../task/instructions.md). Načrt potrjen pred implementacijo; izvedba je zaključena v povezanih nalogah.

## Tehnični kontekst

Obstoječa aplikacija uporablja React 19, TypeScript 6, Vite 8, `lucide-react`, navaden CSS in usmerjanje prek URL hash. Podatke bere `useResource`; pripravljeni `updateTask` pošlje obe polji kot JSON z `PATCH /api/tasks/:id` in vrne celoten `Task`. Strežnik že zagotavlja atomarnost, natančno odstranjevanje dovoljenih robnih belih znakov in zavrnitev brez zapisa. Skupni tipi so `Task`, `TaskStatus`, `TaskUpdate` v `shared/types.ts`.

Nameščeni Playwright ima projekte `api`, `desktop`, `mobile`, `development-desktop`, `development-mobile` in `agent`. Skupni razvojni testi D01–D04 pokrivajo osnovno odprtje, uspeh, preklic in validacijo. Obstoječa konfiguracija zažene pripravljeni strežnik in se poveže z nameščenim Chromiumom. Novih odvisnosti, nastavitev ali sprememb storitve ni.

## Odločitve in tok podatkov

1. **Urejanje v obstoječih podrobnostih.** `TaskDetails` ohrani dialog in prikaz neurejenih podatkov; doda »Uredi« in pogojni obrazec. Osnutek `{title,status}`, napaka naslova, napaka shranjevanja in stanje čakanja so lokalni. Odprtje kopira zadnje potrjene podatke, preklic osnutek in napake zavrže. Obstoječi `key={taskId}` preprečuje prenos stanja na drugo opravilo. Pokriva R01, R02, R06, R10.
2. **Natančna normalizacija.** Majhna čista funkcija `normalizeTitle` odstrani samo robne U+0020/U+0009/U+000A/U+000D; ne uporablja splošnega `trim()`. Isto pravilo velja za veljavnost med popravljanjem in payload ob oddaji. Za naslov je primerna kompaktna `textarea`, ki ima vlogo `textbox` in dopušča preverjanje belih znakov brez odstranjevanja prelomov, ki ga opravlja enovrstični HTML input. Stanje je označen HTML `select` z vsemi tremi vrednostmi. Pokriva R03, R04.
3. **En sam zahtevek.** Oddaja najprej preveri veljavnost. Sinhrona zapora z `useRef` prepreči ponovno oddajo še pred ponovnim izrisom Reacta; stanje Reacta onemogoči obe polji in oba zaključna gumba ter pokaže `role="status"`. Kliče se obstoječi `updateTask(task.id, {title: normalized, status})`, brez drugih polj. `finally` sprosti zaporo; zavrnitev ohrani osnutek in prikaže `role="alert"`. Pokriva R03, R07–R09.
4. **Potrjeni odgovor uskladi prikaze.** `useResource` dobi majhno funkcijo za posodobitev trenutnih podatkov s funkcijskim updaterjem, vezano na trenutni ključ vira. Po uspešnem PATCH `TaskDetails` zamenja potrjeni `Task` in prek `onSaved(savedTask)` obvesti `ProjectView`. Ta po `id` zamenja samo izbrani element seznama. Če seznam še ni naložen, sproži novo branje z obstoječim `retry`, ki prekine staro branje. Ni optimističnega spreminjanja in ni ločene kopije strežnika. Števci ter `TaskBoard` se že izračunajo iz seznama, zato se uskladijo v istem izrisu. Ponovno odprtje/obnovitev strani bere API. Pokriva R02, R05, R07.
5. **Dostopnost in Folio.** Obrazec uporablja oznaki »Naslov« in »Stanje« ter zahtevane gumbe. Napaka naslova ima povezavo `aria-describedby` in `aria-invalid`; napake so alerti. Dodajo se le lokalni slogi obrazca, obstoječi `.button`, barvne spremenljivke, robovi in razmiki ostanejo osnova. Oblika dialoga, navigacije, preglednice in table ter obstoječe testne oznake se ohranijo. Pokriva dogovor vmesnika in R10.

Uspešno shranjevanje zapre obrazec in pusti podrobnosti odprte s potrjenima vrednostma. Preklic ne zapre podrobnosti. Zapiranje z Escape in navigacija med odprtim urejanjem ostajata izven zahtevanega obsega; brez novih uporabniških pravil.

## Predvidene datoteke

| Datoteka | Predvidena sprememba | Zahteve |
| --- | --- | --- |
| `src/taskEditing.ts` | Čista normalizacija naslova, brez dodatne knjižnice. | R03 |
| `src/TaskDetails.tsx` | Osnutek, obrazec, validacija, oddaja, napake, preklic, zaklep in `onSaved`. | R01–R10 |
| `src/useResource.ts` | Posodobitev potrjenih podatkov trenutnega vira; ohranitev obstoječega nalaganja in napak. | R05 |
| `src/App.tsx` | `onSaved` in zamenjava opravila po `id` v `ProjectView`. | R02, R05, R07, R10 |
| `src/styles.css` | Omejeni slogi obrazca, napak, čakanja in glavnega gumba skladno s Folio. | Dogovor vmesnika |
| `tests/agent/P01.spec.ts` | Dopolnilna vedenjska preverjanja S1–S7, glej spodaj. | R01–R10 |
| `docs/agent/P01/spec.md`, `docs/agent/verification.md` | Končna sledljivost do delov kode/testov, dejanski rezultati, omejitve in zgodovina. | Skupna predloga |

`src/api.ts`, `src/TaskBoard.tsx`, `src/components.tsx` in `src/navigation.ts` se praviloma uporabijo brez sprememb. Skupni tipi, strežnik, podatki, testi, konfiguracija in odvisnosti ostanejo nedotaknjeni.

## Preverjanje in dokazi

Izvesti `npm run check`: lint, preverjanje tipov in build, nato vsi projekti Playwright iz obstoječe konfiguracije, vključno s skupnimi in agentnimi testi. Izhod shraniti v `docs/agent/P01/` in v `docs/agent/verification.md` navesti ukaz, rezultat ter povezavo na dnevnik. Po popravku ponoviti ustrezna prizadeta preverjanja; brez trditve o neizvedenih testih.

Agentni testi naj dopolnijo D01–D04 z vedenjskimi dokazi:

- S2/S3: osnutek v preglednici in tabli ter API ostaja nespremenjen; preklic po vnosu/napaki in ponovno odprtje; prazen naslov ter robni beli znaki, notranji presledki in U+00A0. Ločeno preveriti čisto normalizacijo na nizih s CR/LF in integracijo obrazca ter dejanski payload.
- S4/S5: vseh šest prehodov stanj, naslov in stanje skupaj, neurejena polja, opravila z enakim naslovom ter drugi projekt; preglednica, tabla, stolpec, števci, podrobnosti in osvežitev. Primerjati shranjene podatke prek javnega API-ja oziroma testnega posnetka.
- S6: testni program uporabi pripravljene `/__test/next-save` z `mode: hold`, `/__test/release` z izidom in `/__test/state` za preverjanje čakanja, števila zahtev, zavrnitve in ponovnega uspeha. Preveriti štiri onemogočene kontrole in ohranitev uporabnikovega vnosa. Aplikacija teh poti nikoli ne uporablja.
- S7: po zaključku urejanja preklop obeh pogledov, projekta in opravila brez prenosa osnutka ali napak. Obstoječi testi na telefonu preverijo ohranitev postavitve; dodatno pregledati obrazec pri ozki širini.

Merila uspeha in splošna pravila ostajajo v [specifikaciji](spec.md); ta načrt jih ne nadomešča s posameznimi testi. Dejanski rezultati so v [zapisu preverjanj](../verification.md): celoten `npm run check` je uspešen. Bistvenih odprtih tehničnih vprašanj po pregledu kode ni.
