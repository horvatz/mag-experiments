# Specifikacija P02 — postopek A

## Problem in kontekst

Folio trenutno bere projekte, opravila, preglednico, tablo in podrobnosti. Uporabnik
želi izbranim opravilom trenutnega projekta spremeniti samo stanje. Posamezne
zahteve se lahko končajo različno; potrjenih uspehov ne razveljavimo. Ohranimo
slovenska poimenovanja, videz iz `docs/dizajn.md` in javni API.

## Vhodi, dejanja in izidi

Opravilo vsebuje `id`, `projectId`, `title`, `description`, `status`, `assignee`
in `dueDate`. Izbiramo izključno po `id`. Cilj je prazna vrednost ali `todo`,
`in_progress`, `done`. Izbira in cilj sta začasno stanje komponente projekta.

Dejanja: posamezni/skupni izbor, izbira cilja, uporaba, ponovitev neuspelih,
čiščenje, preklop pogleda in menjava projekta. Uporaba zahteva neprazen izbor
in cilj. Med zahtevami zaklenemo urejanje operacije; po napaki omogočimo samo
ponovitev ali čiščenje. Preklop pogleda ohrani operacijo. Menjava projekta in
osvežitev začneta brez začasnega stanja. Bralne podrobnosti ostanejo dostopne.

Uspeh sproti posodobi potrjeno stanje opravila v skupnem viru podatkov obeh
pogledov in števcev. Popolni uspeh izprazni izbor in cilj ter ohrani povzetek.
Delni/popolni neuspeh ohrani samo neuspele ID-je, izvirni cilj, povzetek in
razlog za vsak neuspeh. Čiščenje odstrani celotno začasno operacijo brez zapisov.

## Zahteve in pravila

Naj bo `P` množica ID-jev trenutnega projekta, `S ⊆ P` izbor, `c` cilj,
`I` izbor ob potrditvi, `D0` shranjeni podatki pred operacijo, `U` množica
uspešnih ID-jev celotne operacije in `F` trenutno neuspešni ID-ji. `D` pomeni
zadnje potrjene podatke. Predpostavimo zagotovljen končni odgovor vsake zahteve
in odsotnost sočasnih sprememb drugih uporabnikov.

- Začetek: `S = ∅`, `c = ""`, `U = F = ∅`, ni sporočil.
- Potrditev zajame nespremenljivi `I = S`, `c` in naslove iz `D`. Za vsak
  `i ∈ I` pošlje natanko en PATCH z `{title: D[i].title, status: c}`.
- Po vsakem uspehu za `i`: `D[i].status := odgovor.status`, `U := U ∪ {i}`.
  Za vsa druga polja `f ≠ status`: `D[i][f] = D0[i][f]`.
- Po koncu poskusa: `I = U ⊎ F`, `S = F`. Zavrnitve nimajo zapisov.
  Za vsak `i ∉ U`: `D[i] = D0[i]`; to vključuje neizbrane in druge projekte.
- Ponovitev pošlje po eno zahtevo samo za `F` z istim ciljem in zajetim
  naslovom. Novi uspehi se unijsko dodajo v `U`, zato jih štejemo največ enkrat.
  Povzetek je `Uspešno: |U|. Neuspešno: |F|.`.
- Če `F = ∅`, izpraznimo izbor in cilj; sicer sta cilj in izbor zaklenjena.
- Čiščenje odstrani `S`, `c`, `U`, `F` in sporočila, pri čemer `D` ostane enak.
- Skupno polje: označeno ⇔ `|P| > 0 ∧ S = P`; vmesno ⇔ `0 < |S| < |P|`;
  onemogočeno ⇔ `P = ∅` ali operacija teče ali obstajajo napake.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Native checkbox `Izberi opravilo <id>` v obeh pogledih, začetni izbor prazen, brez navigacije ob kliku. | D01; A01 (enaka naslova, oba pogleda). |
| R02 | Skupni checkbox, lastnost indeterminate, usklajen števec; prazen projekt onemogočen. | A01, A02. |
| R03 | Pogled deli stanje operacije; komponenta projekta se ob menjavi ponastavi, reload bere API. | A01, A03, A04. |
| R04 | Prazen začetni cilj; tri dovoljena stanja; brez izbora/cilja ni uporabe in nobeno urejanje izbora ne zapisuje. | D01; A01, A02. |
| R05 | Ena zahteva na izbrani ID z izvirnim naslovom in ciljem, tudi pri že doseženem stanju. | D02; A03, A05, A06. |
| R06 | Vsak uspeh se prikaže pred zaključkom drugih zahtev; pogleda/števci/podrobnosti/reload berejo potrjene podatke. | A03, A05, A06. |
| R07 | Zavrnitve ne ustavijo ostalih; povzetek in alert z ID, naslovom, razlogom. | D03; A03, A04, A06. |
| R08 | Izbrani ostanejo le neuspešni; ponavljanje vedno uporablja samo preostale napake. | D03; A03, A04. |
| R09 | Kumulativni uspehi brez podvajanja; popolni uspeh odstrani napake, cilj, izbor in ponovitev. | A03, A04. |
| R10 | Med delom vsi kontrolniki operacije zaklenjeni, viden napredek, sinhrona varovalka pred podvojenim proženjem; po napaki le ponovi/počisti. | D04; A03, A04, A05. |
| R11 | Čiščenje brez zahtev in brez razveljavitev; nova operacija ima ločen števec. | D01; A04. |
| R12 | API prejme samo nespremenjen naslov in novo stanje; vsa ostala polja in projekti nespremenjeni; obstoječi vmesnik deluje. | D02/D03; A03–A06; vsi testi izhodišča. |

Oznake A01–A06 so lastni scenariji v `tests/agent/P02.spec.ts`, vsak izveden
pri širinah 1440 in 320 pik. D01–D04 so nespremenjeni razvojni scenariji,
izvedeni v projektih development-desktop in development-mobile.

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01–R04 | Izbor, cilj, življenjska doba | A01, A02; D01 | `src/App.tsx` / `ProjectView`, `src/TaskBoard.tsx`, `src/BulkTaskControls.tsx`, `src/useBulkTaskUpdate.ts` | Uspešno, [celotni zagon](check-final.log). |
| R05–R10 | Zajeta operacija, sprotni rezultati, ponovitve, zaklep | A03–A06; D02–D04 | `src/useBulkTaskUpdate.ts` / `apply`, `run`, `retry`; `src/api.ts` / `updateTask`; `src/useResource.ts` / `updateData` | Uspešno, [celotni zagon](check-final.log). |
| R11–R12 | Čiščenje, neodvisnost, ohranitev podatkov | A04–A06; izhodiščni testi | `src/useBulkTaskUpdate.ts` / `clear`; `src/App.tsx` / preslikava samo statusa | Uspešno, [celotni zagon](check-final.log). |

Podrobna matrika R01–R12, izvedeni ukazi, dokazi in omejitve so v
[verification.md](verification.md).

## Odprta vprašanja in omejitve

Ni potrebnih uporabniških pojasnil. Sočasno urejanje drugih uporabnikov,
negotovi omrežni izidi in navigacija/osvežitev med shranjevanjem so izven obsega.
Spremembe so omejene na `src/`, `tests/agent/`, `docs/agent/`; testne kontrole
uporabljajo samo testi. Brez dodatnih agentov ali odvisnosti. Časovni okvir 20 minut.

## Zgodovina sprememb specifikacije

- 2026-09-21, v1: začetna specifikacija pred implementacijo; preverjanja so načrtovana.
- 2026-09-21, v2: po izvedbi dopolnjene dejanske datoteke in izidi; dodan A06
  za drugi projekt, drugačne naslove in pozni uspeh po zgodnji zavrnitvi.
  Sprejemni pogoji ostajajo enaki. A03 popravljen na dejansko strežnikovo
  besedilo napake; izbirnik cilja ima eksplicitno oznako `label`/`htmlFor`.
  Vizualni pregled je popravil CSS prednost modrega glavnega gumba in zajem
  posnetkov počaka na prikaz izbranega pogleda.
