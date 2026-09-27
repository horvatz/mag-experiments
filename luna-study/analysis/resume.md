# Nadaljevanje L/1.0

Uporabnik je naročil vseh 72 meritev in končno gradivo, brez ustavljanja.
Naročniški dostop Lune je potrjen; ne prehajaj na API ali drug model.

Aktivni izvajalnik je bil zagnan 27. 9. 2026 ob 08:46 UTC, PID 35492,
seja 92534. Poročevalni spremljevalec je seja 89649. Pred nadaljevanjem
preberi `runtime/main-study/active.json`, preveri lock in živi proces.
Ne zaganjaj dvojnika vrste. Če seja ni več dosegljiva, to samo po sebi
ne pomeni, da je proces končan.

1. Živa vrsta `run.mjs` zaporedno izvaja, ocenjuje in arhivira preostalih
   72 ID-jev iz zamrznjenega razporeda. Začetih ID-jev ne ponavlja.
2. `refresh-artifacts.mjs` po novih arhivih preveri izvoze ter osveži
   preglednico, grafe in delovni PDF. Po koncu vrste se konča tudi sam.
3. Raziskovalec sproti pregleda 24 arhiviranih ponovitev 001: dejansko
   specifikacijo, kodo, teste in dnevniške dokaze. Ocene v
   `analysis/reviews/` potrebujejo collection L/1.0 ter SHA-256 datoteke
   archive-complete.json. Vzorčni zapis P05-A-001 ima vseh pet dimenzij,
   razvojno napako in dokazne povezave. Drugih ocen ne prepisuj avtomatsko.
4. `review-data.py` preveri povezave, vrstice in naslove ter izvozi presoje.
   `export-data.mjs` preveri arhive in izvozi vse testne/procesne izide.
5. Po 72 arhivih in 24 presojah zaženi poročevalni spremljevalec z
   `--once`, vizualno preglej vse nove grafe, vse liste preglednice in
   spremenjene strani PDF. Shrani dokaz pregleda v
   `analysis/visual-verification.json`; končni validator pokaže shemo.
6. Zaženi `verify.mjs` in `final-audit.py`, pripravi zaključni povzetek
   dejanskih izidov in primerjavo. Commit ter po potrebi objava sta ločena
   od nespremenljivih arhivov. Veja ima ime `zan/luna-experiments`.

Zamrznitve 477f5f3 in vhodov M/1.0 ne spreminjaj. Lokalni checkpoint
55a3b6f vsebuje prvi novi arhiv, njegovo presojo in poročevalska orodja.
P05-A-001: completed, 473,547 s, 70/70, 12/12, strogi uspeh. To ni
zaključek zbirke. Najnovejši podatki so vedno v aktualnih datotekah stanja.

`naloga/latex` je zunaj repozitorija experiments. Dodatni metodološki
razdelek 5.8 in rezultati 6.6 so že dodani; vsi prvotni rezultati Astre
ostajajo ločeni. PDF ima še 33 avtorskih opomb in ni magistrska za oddajo.
Medzbirčna primerjava ne izolira modela, ker sta različna CLI in obdobje.
