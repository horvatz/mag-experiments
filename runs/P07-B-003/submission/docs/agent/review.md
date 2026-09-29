# Neodvisni pregled P07

Pregled je zaključen za vseh R01–R12. Predani dnevniki niso lastni zagoni pregledovalca.

| Zahteva | Neodvisni pregled kode in dokazil |
| --- | --- |
| R01 | Samostojen FavoriteButton po ID-ju je zunaj povezave v obeh pogledih; aria-pressed izvira iz skupne množice. D01 in A07 sta pokrita v predanih testih. |
| R02 | save zapisuje samo version in enkratne ID-je iz Set, z običajnim sort() za UTF-16; A01 preveri celoten zapis. |
| R03 | readFavorites obnovi Set; neznani ID-ji ostanejo v množici, prikaz izhaja samo iz API opravil; A01/A03/D03. |
| R04 | Skupni validator zavrne celoten neveljaven zapis; inicializacija ne piše; A02 pokriva 11 neveljavnih/manjkajočih vrednosti. |
| R05 | ProjectView inicializira filter na false in filtrira izvorni tasks brez razvrščanja; A06 pokriva 0/1/13 opravil. |
| R06 | Odstranitev takoj spremeni visibleTasks; prazno sporočilo in kontrole ostanejo v obeh pogledih; D02/A06. |
| R07 | App hrani skupno množico, ProjectView skupni filter za oba pogleda; povezave uporabljajo ID; A03/A06/A07/D04. |
| R08 | Hook je nad key={project.id}, filter pod njim; menjava projekta in osvežitev ponastavita le filter; A01/A03. |
| R09 | Izbris dobi ID-je celotnega tasks, ne visibleTasks; gumb je disabled pri nič priljubljenih v projektu; A03/A06. |
| R10 | Status šteje celotni tasks, stolpci dobijo visibleTasks; ustrezna role in aria-label ter besedilo; A03/A04/A06. |
| R11 | storage nadomesti množico z istim validatorjem brez save; varovana getItem/setItem in getter ohranijo pomnilniško stanje ter alert; A04/A05. |
| R12 | Dejanja priljubljenih spreminjajo le Set in localStorage; ni klicev zapisovalnega API-ja ali mutacij tasks. Pregledani so navigacija, useResource, slogi in docs/dizajn.md; A07/D04 ter 38 osnovnih testov so v predanem dnevniku uspešni. |

Specifikacija zajame vseh R01–R12, predikate, sledljivost ter pošteno označi lastne teste kot neizvedene. Dejanske rezultate dopolni implementerjev verification.md. Nobena konkretna napaka specifikacije ali implementacije za zdaj ni ugotovljena.

Pregledovalec je sam odprl predana posnetka mobile-table.png in desktop-board.png ter ju primerjal z docs/dizajn.md; konkretnih vizualnih neskladnosti ni. Dodatni izvajalni pregled bo pokril ohranitev filtra med podrobnostmi in dogodek storage iz drugega zavihka v tem stanju, kar ni izrecno zajeto v predanih testih.

Lastno izvajalno preverjanje pregledovalca (Chromium prek chromium.connect iz task/browser.json, lokalna porta 5193/3123, GET odgovori z nadzorovanimi podatki):

- PASS R07: podrobnosti poljubnega ID-ja iz filtrirane preglednice se odprejo in zaprejo z ohranjenim filtrom.
- PASS R03/R06/R07/R10/R11: dejanski storage iz drugega zavihka posodobi filtrirano tablo med odprtimi podrobnostmi; filter ostane, števec in prazno stanje se uskladita, ni povratnega zapisa in tuji/neznani ID-ji ostanejo.
- PASS R08/R11: dejanski dogodek newValue=null izprazni tudi priljubljene drugega projekta; navigacija ponastavi filter.
- PASS R12: pri 390 px oba pogleda ohranita širino strani; nobeno izvedeno dejanje ne pošlje zapisovalnega API zahtevka.

Vsi dodatni scenariji so uspeli. Celotnega npm run check nisem ponovil: predani check.log dokumentira uspešne lint, typecheck, build in 67 testov (38 osnovnih, 8 razvojnih, 21 lastnih). Ta rezultat pripada implementerju, ne pregledovalčevemu zagonu. Končni/skriti testi niso dostopni; drugih brskalniških pogonov nisem preveril. Javni internet je blokiran; uporabljene so bile samo lokalne storitve in predpisani Chromium connect.

Ugotovitve: nobene konkretne neskladnosti. Spremembe specifikacije in kode niso zahtevane. Pregledovalec je pisal samo review.json in review.md; kode, specifikacije, testov, infrastrukture in odvisnosti ni spreminjal.

Končna predaja je shranjena več kot minuto pred rokom faze. Lokalna storitev, zagnana za dodatno preverjanje, je ustavljena.
