# Neodvisni pregled P01

Pregledane so izvirne zahteve R01–R10, pravila projekta, predloga, specifikacija 1.0 z zgodovino, implementacija, osnovni/razvojni/lastni testi ter `verification.md` in njegova dokazila. Konkretnih odstopanj, ki bi zahtevala popravek specifikacije ali implementacije, nisem našel. Merilo so bile izvirne zahteve, ne zgolj predana specifikacija.

Začetni `review.json` je bil shranjen pred pregledom izvedbe. Nato je bil dopolnjen za vsako od desetih zahtev, še pred zaključnim pregledom dokazil. Kode, specifikacije, testov in infrastrukture nisem spreminjal.

| Zahteva | Neodvisni pregled specifikacije in kode | Pregledano testno dokazilo |
| --- | --- | --- |
| R01 | S01 določa identiteto po id. `TaskDetails` nalaga po id; novi `TaskEditor` inicializira naslov in stanje iz shranjenega opravila. | D01 desktop/mobile in A03 preverjajo začetne vrednosti ter različne istoimenske zapise. |
| R02 | S02 loči osnutek od shranjenih podatkov. Lokalna `title`/`status` ne spreminjata seznama; oba `updateData` se sprožita šele po uspešnem odgovoru. | A02 table/board preverja celotne zapise, vrstico/kartico in števce pred oddajo ter med zadržano zahtevo; D03 preverja odsotnost zapisa. |
| R03 | S03 natančno opredeli dovoljene robne znake. `normalizeTitle` uporablja samo U+0020/U+0009/U+000A/U+000D; prazen rezultat prepreči PATCH. Napaka je ob polju, povezana z `aria-describedby`, ima `role=alert`; veljaven popravek odstrani napako in `aria-invalid`. | A01 preverja dejanski payload, prazen/bel naslov, notranje znake ter ohranitev NBSP in U+2003; D04 preverja napako in popravek. |
| R04 | S04 zahteva vse prehode. HTML `select` ima tri pravilno poimenovane možnosti; oddaja ne omejuje prehoda glede na prejšnje stanje. | A03 preverja vse možnosti in vseh šest usmerjenih prehodov; A01 ohranja stanje ob spremembi naslova. |
| R05 | S05 zahteva skupen zapis in uskladitev. En PATCH vsebuje obe polji; potrjeni odgovor posodobi podrobnosti in seznam po id, nato zapre obrazec. Tabla, stolpci in števci izhajajo iz seznama. Ponovno branje uporablja javni API. | D02 in A02/A03 preverjajo shranjene vrednosti, podrobnosti, preglednico, tablo, števce ter osvežitev. |
| R06 | S06 določa preklic brez zapisa. `onCancel` odstrani urejevalnik brez API klica; novo odprtje ustvari nov osnutek in prazne napake. | D03 in A04 preverjajo navaden osnutek, validacijsko napako ter preklic po zavrnitvi, vrednosti ob ponovnem odprtju in število zahtev. |
| R07 | S07 ohrani druge zapise in polja. `updateTask` pošlje samo naslov/stanje; seznam zamenja samo zapis z ustreznim id. Javni strežniški zapis potrjuje atomarno spremembo teh dveh polj. | A02/A03 primerjata celotne zapise vseh projektov z dovoljenima spremembama izbranega id; osnovni API-test dodatno preverja izolacijo. |
| R08 | S08 ohrani vnos po zavrnitvi. `catch` prikaže alert in ne spremeni podatkov ali osnutka; obrazec ostane odprt. Uspešna ponovitev odstrani obrazec in napako. | A02 v obeh pogledih preverja zadržano zavrnitev, nespremenjene zapise, ohranjen vnos in uspešno ponovno oddajo. |
| R09 | S09 določa največ eno odprto zahtevo. Sinhroni `pending` ref zaščiti oddajo; `saving` onemogoči obe polji in oba gumba ter prikaže `role=status`; `finally` sprosti urejanje po zavrnitvi. | A02 sproži pet zaporednih sinhronih oddaj, preveri eno zahtevo, vse disabled kontrole, status in ponovno omogočene kontrole. |
| R10 | S10 ohrani navigacijo in izolacijo. Projekt in podrobnosti imata ključa po id; vsako novo urejanje dobi svež `TaskEditor`. Obstoječe poti ohranijo izbrani pogled. | A03/A04 preverjata menjavo pogleda/projekta in drugo opravilo po uspehu ali preklicu; osnovni testi dodatno pokrivajo navigacijo. |

Specifikacija sledi predlogi, vsebuje pravila sprememb stanja, predpostavke, sledljivost in omejitve. Njene oznake »Ni izvedeno« se izrecno nanašajo na fazo avtorja specifikacije; dejanski izvedbeni rezultati so skladno z dogovorom v `verification.md`. To ni izpust zahtev ali nedokazana trditev o uspehu.

Pregledal sem celoten `docs/agent/check.log`: vsebuje uspešne ESLint, TypeScript in produkcijsko gradnjo ter `51 passed (21.8s)` — 38 osnovnih, 8 razvojnih in 5 lastnih testov. Imena testov in njihove trditve se ujemajo s sledljivostjo v `verification.md`. To so rezultati implementerjevega zagona; sam teh ukazov nisem izvedel. Ker pregled ni pokazal konkretnega razloga za ponovitev, obstoječih preverjanj nisem ponavljal.

Sam sem vizualno pregledal shranjena `editing-1440.png` in `validation-390.png` ter sloge in `docs/dizajn.md`: obrazec uporablja obstoječo postavitev dialoga, tipografijo, nevtralne površine, modra dejanja in vidni fokus; mobilna napaka je ob polju, kontrolniki so čitljivi. Meritve dimenzij, fokusov in odsotnosti `pageerror` v `visual-check.json` izvirajo iz implementerjeve skripte; nisem jih ponovno izvedel. Primerjava pik z izhodiščnimi posnetki ni bila opravljena.

V `src/` ni uporabe `/__test/` ali `localStorage`; branje in zapis gresta prek javnega API-ja. Pregled je ostal znotraj izvoza te naloge in brez drugih agentov ali oddaljenih storitev.

Omejitve: aplikacije v tej fazi nisem zagnal. Končni skriti testi, drugi brskalniški pogoni in fizične mobilne naprave niso preverjeni. Po navodilih je javni internet blokiran, Chromium je dostopen prek `chromium.connect(wsEndpoint)`; teh omejitev nisem obšel ali ponovno preizkušal. Implementer poroča tudi o nedostopnem Git pregledu zaradi manjkajočega `xcrun`; sam Git pregleda nisem izvajal. Trajnost po ponovnem zagonu strežnika in navigacija med odprtim urejanjem sta zunaj zahtevane naloge.

Končni strojno berljivi izid je v `review.json`: pregled zaključen, vseh deset zahtev pregledanih, brez ugotovitev in brez zahtevanih sprememb.
