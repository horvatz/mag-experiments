Korak `$speckit-implement` je opravljen.

**Izvedba**
- Novo jedro: `src/favorites.ts` (ključ `folio:favorites:v1`, validacija/normalizacija UTF-16/serijalizacija), `src/useFavorites.ts` (stanje prek `useSyncExternalStore`, `try/catch`, dogodek `storage` brez povratnega zapisa), `src/FavoriteButton.tsx`.
- Vmesnik: `src/App.tsx` (gumbi v vrsticah, filter `Prikaži le priljubljena`, `Odstrani priljubljene tega projekta`, `role=status` `Priljubljeno: X od M.`, prazno stanje, `role=alert` z „shramba"), `src/TaskBoard.tsx` (gumbi na karticah zunaj povezav, števci stolpcev iz vidnih opravil), `src/styles.css`.
- Testi: `tests/agent/favorites.spec.ts` — 16 lastnih testov za R01–R12 (vključno s `StorageEvent`, izjemama branja/zapisa in pogledom 390 px).
- Dokumenti: `docs/agent/verification.md` (dnevniki, sledljivost, omejitve), posodobljena `spec.md` (dejanski izidi) in `tasks.md` (T001–T018 označene).

**Preverjanje (dejansko izvedeno)**
- Zagon 1 (`--project=agent`): 15 uspelih, 1 neuspeh — napaka v zaporedju testa R12, popravljen test, ne koda.
- Zagon 2 `npm run check`: lint, tipi in gradnja uspešni; **62 uspelih, 0 neuspešnih** — 38 skupnih (api/desktop/mobile, brez regresij), 8 razvojnih primerov P07 (oba profila), 16 lastnih.

**Omejitve**
- Končni (skriti) testi niso dostopni in niso bili izvedeni; niso navedeni kot uspešni.
- T002 (ločen izhodiščni zagon pred spremembami) ni bil izveden; izhodišče potrjeno posredno prek skupnih testov v zagonu 2.

Proračun: porabljenih ~320 s v tem koraku, skupno ostaja 540 s.
