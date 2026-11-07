# Rubrika in presoja pred meritvami

Različica M/1.0. Avtomatizirana funkcionalna merila imajo prednost pred
samooceno agenta. Presoja dokumentov ne more spremeniti izida testa.

## Objektivni kazalniki za vsako izvedbo

- dokazane zahteve R01–R12, regresija, razvojni in sprejemni testi;
- lint, tipi, gradnja, dovoljenost sprememb in zaključek postopka;
- trajanje, faze, število popravkov, popolna oziroma delno opažena poraba;
- število spremenjenih datotek in dodanih lastnih testnih datotek;
- obstoj specifikacije, verifikacijskega zapisa in povezav do zahtev.

Prisotnost besedila R01 ali testne datoteke sama ne dokazuje kakovosti.
Zato se ti zadnji kazalniki ne seštevajo v navidezno oceno kakovosti kode.
Pri C so enakovredni artefakti v njegovem imeniku značilnosti; število
samodejno ustvarjenih dokumentov se ne šteje za kakovost.

## Vsebinska rubrika 0–2 po dimenziji

Vnaprej izbran vzorec je ponovitev 001 vseh osmih nalog pri vseh treh
postopkih: 24 oddaj. Izbira ni odvisna od uspeha. Manjkajoča/neberljiva
oddaja se označi manjkajoče in se ne nadomesti z uspešnejšo ponovitvijo.
Vsaka ocena potrebuje kratko utemeljitev in povezavo do konkretne datoteke.

| Dimenzija | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Pokritost specifikacije | Večina pogojev manjka ali si nasprotuje | Osnovni pogoji so navedeni, ostanejo konkretne vrzeli | Vse zahteve in bistveni robovi so jasno, skladno opredeljeni |
| Predikati/invariante | Ni uporabne formalizacije | Nekateri pogoji so preverljivi, preostali le opisni | Ključni prehodi in ohranjene lastnosti imajo preverljive predikate |
| Sledljivost | Trditve brez povezav ali izmišljeni dokazi | Delne povezave zahteva–koda–test | Povezave omogočajo preverjanje in odkrito označijo nepreverjeno |
| Organizacija kode | Logika je težko sledljiva, znatno nepotrebno podvajanje | Razumljiva rešitev z jasno navedenimi slabostmi | Odgovornosti, stanje in izpeljani podatki so dosledno ločeni |
| Lastna preverjanja | Ni smiselnih dodatnih preverjanj ali so lažno navedena | Koristni primeri, toda manjkajo pomembni robovi | Zahtevne lastnosti preverijo tudi negativni in mejni primeri |

Ocene se poročajo po dimenzijah z navedenim ocenjevalcem in načinom presoje.
Presoja, ki pozna postopek, ni slepa. Presoja Codexa je označena
»AI-podprta, neslepa vsebinska presoja«; ni človeška ocena in nima
izmerjenega soglasja med ocenjevalci. Polja za neodvisno človeško presojo
ostanejo prazna, dokler jih dejansko ne izpolni človek. Ločeno navedemo
primer odkrite napake za vsako nalogo/postopek, kadar napaka obstaja.
