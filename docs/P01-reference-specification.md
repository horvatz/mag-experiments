# Referenčna specifikacija P01 v0.2

Ta dokument opisuje referenčno rešitev za preverjanje meril. Je gradivo avtorja
raziskave in ni razvojna specifikacija, ki jo mora pripraviti posamezni agent.
Skupna zahteva je v `tasks/P01/instructions.md`; vsi postopki dobijo isto različico.

## Namen in model

Uporabnik v podrobnostih izbranega opravila izbere »Uredi«, popravi naslov ali
stanje ter spremembo shrani ali prekliče. Druge lastnosti se ne urejajo.

`S` je globoka kopija shranjenih opravil pred scenarijem, `S'` stanje po njem.
`t` je identifikator urejanega opravila. `d` je začasni vnos naslova in stanja,
`Q` pa število zahtev za posodobitev med scenarijem. Funkcija `n` odstrani samo
začetne in končne znake U+0020, U+0009, U+000A in U+000D. Vnos je veljaven,
če `n(d.title)` ni prazen in je stanje `todo`, `in_progress` ali `done`.

Začetno stanje vključuje opravila z enakimi naslovi. Izbira zato uporablja
identifikator. Med posameznim scenarijem ni drugih piscev podatkov. Ko test
pripravi drugačno začetno stanje, aplikacijo naloži šele po tej pripravi.

## Pravila

| Zahteva | Pravilo | Končni scenarij |
| --- | --- | --- |
| R01 | Novo urejanje začne z `d.title = S(t).title` in `d.status = S(t).status`. | E01 |
| R02 | Samo sprememba polj ohrani `S' = S`, `Q = 0` in vse bralne prikaze. | E02 |
| R03 | Neveljaven naslov ohrani `S' = S`, `Q = 0`; pokaže povezano napako. Veljaven popravek napako odstrani. V zahtevi se pošlje `n(d.title)`. | E03, E04 |
| R04 | Dovoljenih je vseh šest prehodov med različnimi stanji in shranjevanje pri nespremenjenem stanju. | E05 |
| R05 | Uspeh nastavi obe polji na `n(d.title)` in `d.status`, zapre obrazec ter posodobi bralne prikaze, stolpec kartice in števce. Nov zajem vrne iste podatke. | E04, E05, E06 |
| R06 | Preklic ohrani `S' = S`, `Q = 0`, zavrže vnos in napake; naslednje urejanje začne z R01. | E07 |
| R07 | Za `u ≠ t` velja `S'(u) = S(u)`. Pri `t` se lahko razlikujeta samo naslov in stanje. | E08; celovita primerjava tudi v scenarijih shranjevanja |
| R08 | Zavrnitev ohrani `S' = S` in vnos; prikaže napako ter omogoči ponovni poskus. Uspešen ponovni poskus izpolni R05. | E09 |
| R09 | Med čakanjem so polji in gumba onemogočeni, prikazan je napredek. Hitri ponovljeni pritiski skupaj povzročijo samo eno zahtevo. | E10 |
| R10 | Po shranjevanju ali preklicu delujejo projekti, oba pogleda in podrobnosti. Naslednje opravilo dobi svoj vnos brez prejšnjih napak. | E11 |

V končnih testih se pričakovani zapis sestavi iz kopije `S`, v kateri se
zamenjata samo dovoljeni polji izbranega identifikatorja. Ta primerjava zajame
vsa opravila in vsa njihova polja. Normalizacija se preverja s konkretnimi,
vnaprej določenimi pričakovanimi nizi ter tudi z vsebino odhodne zahteve.
Zgolj uspeh strežniškega preverjanja tako ne prikrije napačne odjemalčeve normalizacije.

## Izvedba reference

| Datoteka v `reference/P01/overlay/src/` | Odgovornost |
| --- | --- |
| `TaskEditor.tsx` | Lastni začasni vnos, preverjanje naslova, shranjevanje, preklic, napake in zaklep med zahtevo. |
| `TaskDetails.tsx` | Preklop med branjem in urejanjem, prikaz shranjenega zapisa ter vračanje fokusa. |
| `App.tsx` | Po uspehu zamenja samo izbrano opravilo v podatkih trenutnega projekta. Oba pogleda in števci izhajajo iz istega seznama. |
| `useResource.ts` | Sprejme nov potrjen zapis brez ponastavitve prikaza ali vmesnega optimističnega zapisa. |
| `styles.css` | Videz polj, dejanj ter prikaza napake in čakanja. |

Vsako odprtje urejanja ustvari nov obrazec. Začasni vnos se ne shranjuje v
skupne podatke. Sinhrona zastavica pri pošiljanju prepreči podvojeno zahtevo
tudi pred naslednjim prikazom onemogočenih gumbov. Bralni podatki se spremenijo
šele po uspešnem odgovoru strežnika; odgovor vsebuje celotno opravilo.

Med urejanjem je zapiranje podrobnosti onemogočeno, da se delo zaključi z
»Shrani« ali »Prekliči«. Obnašanje navigacije med odprtim urejanjem, drugih
piscev ter negotovega izida omrežja ni vključeno v merila P01.

## Dokazila in omejitve

Dejanski rezultati, različica osnovne aplikacije in kontrolne vsote virov
so v `reports/reference-summary.json`. Preverjanje namernih napak je v
`reports/mutation-summary.json`. Štirje razvojni testi so ločeni od enajstih
končnih scenarijev; končni testi ne uvažajo kode reference.

Pozitiven rezultat pomeni uspeh na navedenih primerih in skupnih regresijskih
testih. Ne predstavlja formalnega dokaza za vsa mogoča stanja. Pred izvedbami
agentov je treba dokončati procesno izolacijo in pravila predaje kode.
