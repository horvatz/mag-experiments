# Naloge: Folio — Priljubljena opravila in trajna shramba

Priredba: P07.1.0.

## Setup (S)
- [x] S001 Ustvari mapo `src/hooks/` za custom hooks
- [x] S002 Preveriti obstoječo navigacijo v `src/navigation.ts`

## Infrastruktura – hook (I)
- [x] I001 Ustvari `src/hooks/useFavorites.ts` z `localStorage`
- [x] I002 Preverite tipologije v `shared/types.ts`

## Kompletne funkcije (F)
- [x] F001 Ustvari `FavoriteButton` v `src/components.tsx`
- [x] F002 Ustvari `FavoritesCount` v `src/components.tsx`
- [x] F003 Ustvari `RemoveProjectFavorites` v `src/components.tsx`
- [x] F004 Ustvari `ShowFavoritesOnly` v `src/components.tsx`

## Integracija (IN)
- [ ] IN001 Integrirajte `FavoritesCount` v `src/App.tsx`
- [ ] IN002 Integrirajte `FavoriteButton` v `src/TaskBoard.tsx`
- [ ] IN003 Integrirajte `ShowFavoritesOnly` in `RemoveProjectFavorites` v `src/TaskBoard.tsx`

## Testiranje (T)
- [ ] T001 Ustvari `tests/agent/P07.spec.ts`

## Poliranje (P)
- [ ] P001 Do `src/styles.css` Folio dizajn
- [ ] P002 Do `src/components.tsx` ARIA in fokus
- [ ] P003 Do `src/hooks/useFavorites.ts` `storage` dogodk
- [ ] P004 Do `docs/agent/` dokumenti
