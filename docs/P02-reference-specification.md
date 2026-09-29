# Referenčna specifikacija P02 v0.1

Gradivo avtorja raziskave. Agentom se izvozijo skupna navodila in razvojni
testi, ne ta dokument, referenčna koda, končni testi ali mutacije. Naloga je
samostojna in začne z istim pripetim Folio kot P01, brez rešitve P01.

## Model in pravila

`S` je globoka kopija vseh shranjenih opravil. `I` je množica izbranih ID-jev
trenutnega projekta ob potrditvi, `z` ciljno stanje. `K` so že potrjeni uspehi,
`F` zavrnjeni ID-ji in `W` ID-ji brez odgovora. V začetnem krogu so vsi v `W`.
Po vsakem odgovoru ostajajo `K`, `F` in `W` disjunktni in njihova unija je `I`.

- Za `t` v `K` je `S'(t)` enak `S(t)`, razen `status = z`.
- Za `t` zunaj `K` velja `S'(t) = S(t)`. To zajame vsa druga polja,
  neizbrana opravila, neuspehe in druge projekte.
- Začetni krog pošlje natanko en PATCH za vsak `t` v `I`. Število zapisovalnih
  zahtev je `|I|`, tudi ko je `S(t).status = z`.
- Naslednji krog pošlje natanko en PATCH za vsak `t` v predhodnem `F`.
  Uspehi preidejo v kumulativni `K`; ostali ostanejo v novem `F`. Skupno
  število zahtev je `|I| + Σ |F_pred_ponovitvijo|`, brez povratnih zapisov.
- Ko je `W` prazna, povzetek kaže `|K|` uspehov in `|F|` neuspehov, izbor
  je `F`. Če je `F` prazna, se cilj ponastavi; sicer ostane `z` in je zaklenjen.
- Menjava pogleda ohrani lokalno stanje. Čiščenje, menjava projekta in
  osvežitev ga po zaključenem krogu zavržejo, brez spremembe shranjenega `S'`.

Vrstni red zahtev ni del merila. Uspehe je treba prikazati po prejemu odgovora,
tudi če ostajajo druge zahteve odprte. Med čakanjem ni optimističnih zapisov.
Pri ponovnem poskusu se uspehi štejejo po opravilih, ne po številu poskusov.

## Sledljivost

| Zahteva | Razvojni scenarij | Končni scenariji |
| --- | --- | --- |
| R01 izbor po ID | D01 | E01, E05 |
| R02 skupni in delni izbor | D01 | E01, E02 |
| R03 življenjska doba lokalnega stanja | — | E01, E11, E12, E13 |
| R04 veljavna potrditev in lokalni osnutek | D01, D04 | E03, E06 |
| R05 natančna množica zahtev | D02 | E04, E05, E06 |
| R06 trajnost in prikaz potrjenih uspehov | D02 | E04, E08, E11, E13 |
| R07 neodvisni izidi in napake | D03 | E07, E08, E09 |
| R08 ponovi samo neuspele | D03 | E07, E09, E11 |
| R09 kumulativni rezultat in zaključek | D02, D03 | E04, E07, E09, E10 |
| R10 zaklep in podvajanje | D04 | E06, E07, E08, E09 |
| R11 čiščenje brez razveljavitve | D01 | E03, E10, E12 |
| R12 nespremenljivost in regresije | D02 | E02, E04, E05, E12, E13 in skupni testi |

## Referenčna izvedba

`useBulkTasks.ts` upravlja izbor, začasni cilj, izide ter ponavljanje.
Sinhrona zastavica preprečuje drugi začetek med istim krogom. Vsak odgovor
se obravnava neodvisno; referenca pošilja sočasno, testi pa dovolijo tudi
zaporedno izvedbo. `useResource.ts` posodablja seznam s funkcijskim zapisom,
da sočasni odgovori ne prepišejo že sprejetih rezultatov.

`App.tsx` drži operacijo na ravni projekta, ne pogleda. Tabela in
`TaskBoard.tsx` uporabljata isti izbor in potrjeni seznam. `BulkToolbar.tsx`
prikaže kontrole, povzetek in razloge napak. `bulk.css` doda samo sloge te
funkcionalnosti; izhodiščni videz, podatkovni API in strežnik ostajajo pripeti.

## Neodvisnost preverjanja

Testi ne uvažajo funkcij kandidatove ali referenčne implementacije.
Pričakovane podatke sestavijo iz celotnega posnetka pred scenarijem in
spremenijo samo dovoljena stanja. Preberejo tudi odhodne zahteve in bralne
prikaze. Pri E08 je prvi prispeli zapis uspešen, drugi zadržan in nato
zavrnjen; test ne predpiše, kateri ID mora priti prvi ali ali je pošiljanje
sočasno. E04 zajame vseh devet parov izhodiščnega/ciljnega stanja.

Javni testni pripomoček `tasks/P02/helpers.ts` serijsko poveže nastavitev
`/__test/next-save` in dejanski PATCH skozi zaupanja vreden strežnik. S tem
prepreči, da sočasna zahteva porabi zavrnitev drugega ID-ja. Zadržanje poteka
pred vstopom v to vrsto; noben rezultat ali shranjen zapis ni izmišljen v
testu. Dnevniki zahtev nastanejo iz brskalnika, števec zapisov in celotni
podatki pa iz strežnika. Za izvoz pripomočka je potreben tudi `support/types.ts`.

Preverjanje namernih napak šteje le prevodljive napačne različice, ki odpovejo
na pričakovanem vsebinskem preverjanju. Napaka zagona, prevajanja ali iztek
časa se ne štejejo kot zaznava. To ni dokaz popolnosti testov ali pravilnosti
v vseh stanjih. P02 ostaja pilot; uspeh reference ni rezultat agentov.
