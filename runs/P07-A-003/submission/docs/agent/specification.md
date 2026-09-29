# P07 — razvojna specifikacija

## Problem in kontekst

Uporabnik želi označiti opravila kot priljubljena, jih hitro poiskati in ohraniti
izbor po osvežitvi. Folio že bere projekta in opravila prek `/api/`, ponuja
preglednico, tablo ter podrobnosti po ID-ju. Dopolnitev ohrani slovenski vmesnik,
obstoječo navigacijo, nalaganje in potrjeni videz iz `docs/dizajn.md`.
Postopek A: en agent; največ 20 minut od 2026-09-25 19:09:25 UTC.

## Vhodi, dejanja in izidi

- Opravilo: `id`, `projectId`, `title`, `description`, `status`, `assignee`,
  `dueDate`. Identiteto določa samo `id`; ostala polja ostanejo nespremenjena.
- Vhod shrambe: ključ `folio:favorites:v1`, JSON `{version:1,ids:string[]}`.
  Dodatna polja veljavnega objekta niso pomembna; ob zapisu se ne ohranijo.
- Dejanja: preklop posameznega ID-ja, vklop/izklop filtra, odstranitev vseh
  priljubljenih trenutnega projekta, menjava pogleda/projekta, osvežitev,
  zunanji dogodek `storage`.
- Preklop in skupinska odstranitev takoj spremenita pomnilniško množico ter
  poskusita zapisati celotno množico. Napaka shrambe prikaže `role=alert`
  z besedo »shramba«; dejanja v pomnilniku ostanejo uporabna.
  Opozorilo ostane do osvežitve: uspešen zapis po napaki branja sam ne dokazuje,
  da je mogoče znova brati. Ob osvežitvi se dostop ponovno preveri.
- Dejanja nimajo potrditve ali preklica. Zapiranje podrobnosti ne spreminja
  priljubljenih. Neveljaven zapis se obravnava kot prazen brez samodejnega zapisa.

## Zahteve in pravila

Naj bo `T(p)` izvorno urejen seznam vseh opravil projekta `p`, `I(p)` množica
njihovih ID-jev, `F` globalna množica priljubljenih in `q` lokalni filter.
`valid(v) := v` je objekt, `v.version === 1`, `Array.isArray(v.ids)` in
`∀ x ∈ v.ids: typeof x === 'string'`.
`parse(raw) := Set(JSON.parse(raw).ids)` pri veljavnem zapisu, sicer `∅`.
Prazni nizi in neznani ID-ji so nizi in zato veljavni; ne ustvarjajo opravil.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Ločen gumb `Priljubljeno opravilo <id>`; `aria-pressed ⇔ id ∈ F`. Preklop `F' = F △ {id}`; brez odpiranja podrobnosti. | D01; lasten scenarij obeh pogledov, enakih naslovov in tipkovnice. |
| R02 | Zapis je samo `{version:1,ids:sortUTF16(unique(F))}`. | D03; lasten zapis z Unicode ID-ji, podvojenimi in neznanimi ID-ji. |
| R03 | Ob zagonu `F=parse(raw)`; neznani ostanejo, podvojeni se združijo; prikaz izhaja samo iz API-ja. | Lasten test obnove in normalizacije ob uporabnikovem zapisu. |
| R04 | Manjkajoč/neveljaven zapis daje `∅`; branje ne zapisuje. Celoten seznam je neveljaven ob enem nenizu. | Parametrizirani lastni testi vseh neveljavnih oblik in opazovanje zapisov. |
| R05 | `V = q ? [t ∈ T(p) : t.id ∈ F] : T(p)`; vrstni red ostane izvoren, `q₀=false`. | D02; lasten test več kot desetih opravil in izvornega vrstnega reda. |
| R06 | Odstranitev pri `q=true` takoj posodobi `V`; pri `V=[]` je vidno `Ni priljubljenih opravil.` in filter ostane dosegljiv. | D02; lasten test obeh pogledov in praznega projekta. |
| R07 | Pogleda uporabljata isti `F,q`; podrobnosti ciljajo pravi ID. | D04; lasten prehod preglednica–tabla–podrobnosti. |
| R08 | Menjava projekta in osvežitev nastavita `q=false`; `F` se pri menjavi ohrani, pri osvežitvi obnovi. | Lasten test navigacije, vrnitve in osvežitve. |
| R09 | Skupinska odstranitev: `F'=F \ I(p)` iz celotnega projekta. Gumb je onemogočen natanko ko `F ∩ I(p)=∅`. | Lasten test s filtrom, drugim projektom, neznanim ID-jem in praznim projektom. |
| R10 | Status `Število priljubljenih`: `Priljubljeno: |F ∩ I(p)| od |T(p)|.` ne glede na filter. Stolpec stanja `s` šteje `|[t ∈ V : t.status=s]|`. | Lasten test števcev ob filtru in odstranitvi. |
| R11 | Pravi ključ v `storage`: `F'=parse(newValue)` brez zapisa; drug ključ ignoriran. Izjeme pri branju/pisanju so ujete, ostane pomnilniško stanje in opozorilo. | Lastni testi sintetičnih dogodkov, dveh zavihkov in napak shrambe. |
| R12 | Spremembe ne pišejo na API, ne spreminjajo opravil; ohranjeni `data-task-id`, imena, pregled stanj in širina strani pri 390 px. | D04, izhodiščni testi; lasten pregled omrežja, nespremenjenih podatkov in ozkega prikaza. |

## Izvedba in sledljivost

Izvedene datoteke: `src/useFavorites.ts` (validacija, pomnilnik, shramba,
dogodki), `src/FavoriteButton.tsx` (ločeno dejanje), `src/App.tsx` (globalno
stanje, projektni filter, kontrole in preglednica), `src/TaskBoard.tsx` (tabla),
`src/styles.css` (videz). Lastni testi so v `tests/agent/favorites.spec.ts`.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R12 | Pogoji iz zgornje tabele | Izvedeno: `npm run check`, 67 uspešnih testov; lokalni vizualni pregled | Datoteke zgoraj; podrobnosti za vsako zahtevo posebej v poročilu | [Končna sledljivost vseh R01–R12, testi, koda in dokazi](verification.md); [dnevnik končnega zagona](check.log). |

## Odprta vprašanja in omejitve

- `localStorage` je dovoljen izključno za zahtevane ID-je priljubljenih; podatki
  opravil ostajajo v javnem API-ju. To je izrecna izjema konkretne naloge glede
  na splošno prepoved nadomeščanja strežnika z lokalnimi podatki.
- Števec celotnega projekta je prikazan, ko so opravila uspešno naložena; med
  nalaganjem veljajo obstoječa stanja nalaganja in napak, ker imenovalec še ni znan.
- Na prazni filtrirani tabli se poleg sporočila o priljubljenih ohranijo vsi
  trije stolpci z ničelnimi števci. Povzetek stanj ostane za celoten projekt.
- Skrite končne preizkuse ni mogoče izvesti. Razširjanje sočasnih sprememb
  podatkov in navigacije med nalaganjem je izven dodatnega obsega naloge.

## Zgodovina sprememb specifikacije

- v1, pred implementacijo: zapis vhodov, predikatov, sprejemnih pogojev R01–R12,
  izvedbenega načrta in omejitev. Rezultati še niso zatrjevani.
- v2, po prvem uspešnem preverjanju: pojasnjeno trajanje opozorila R11 do
  osvežitve. Pregled kode je pokazal, da uspešen zapis po napaki branja ne sme
  skriti še vedno pomembnega opozorila; popravljena koda in okrepljen test A06.
- v3, ob predaji: načrtovani deli zamenjani z dejanskimi datotekami in povezavo
  na končno sledljivost. Po popravku R11 ponovno uspešni lint, tipi, gradnja in
  vseh 67 testov. Sprejemni pogoji R01–R12 niso bili zmanjšani.
