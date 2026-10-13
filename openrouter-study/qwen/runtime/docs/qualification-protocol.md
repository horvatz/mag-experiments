# Tehnična kvalifikacija pred glavnimi meritvami

Q/1, določeno pred zagoni. To niso primerjalne izvedbe P01–P10. Njihov
namen je preveriti dejansko nadaljevanje sej, predaje in označevanje
nepopolne porabe. Uporabljeni so isti CLI, model, izolacijski profili,
oblike predaj in funkciji poteka B/C kot pri pilotih.

Majhna naloga Q ima dve zahtevi: funkcija `shift` vrne novo polje s
posamezno vrednostjo povečano za 1 (R01), vhod pa ostane nespremenjen (R02).
Javni test vsebuje pozitivna, negativna števila, ničlo in prazno polje.
Ker preverjamo predajo, je naloga namenoma preprosta. Časovna meja
posamezne faze je 120 sekund, celotnega preizkusa pa 15 minut.

B najprej izvede avtorja specifikacije in implementerja. Po uspešni prvi
implementaciji izvajalnik po tem protokolu spremeni pravilo +1 v +2 v
specifikaciji ter kodo v napačno različico +2. Shrani obe stanji in
kontrolne vsote. Pregledovalec mora primerjati izdelek z nespremenjenim
izvirnim navodilom. Uspešen preizkus zahteva ugotovitve za specifikacijo
in kodo, obe dejanski nadaljevanji prvotnih sej, upoštevanje mej pisanja
ter pravilen končni rezultat. Izid pregleda ni vnaprej vpisan.

C v isti seji izvede šest uradnih korakov s presetom Lean. Po prvi
implementaciji izvajalnik vnaprej določeno napako +2 vnese samo v kodo.
Uspeh zahteva pripete nove naloge po prvem pregledu, drugo implementacijo
in drugi pregled v isti seji, popravljen rezultat ter nespremenjene
meje posameznih faz. Oba pregleda imata strukturirano predajo.

Izvorna seja prejme tudi neobčutljivo kontrolno besedo. Beseda ni zapisana
v delovno gradivo in ni ponovno poslana v poziv za popravek. Nadaljevanje
jo mora navesti v svojem končnem odgovoru. To poleg identifikatorja seje
preverja dejansko ohranitev konteksta; ne meri sposobnosti reševanja naloge.

I ločeno preveri prekinitev: agent odda kratek odgovor in zažene dolgo
lokalno čakanje. Izvajalnik ustavi svojo procesno skupino šele po zaznavi
začetega ukaza in dogodka porabe iz točno te seje. Končni dogodek CLI
manjka, zato mora poraba ostati označena kot delno opažena, nikoli ničla
ali popolni seštevek. Prekinitev ne dokazuje poznavanja vseh obračunanih
tokenov pri prekinitvi aktivne zahteve modelu.

Vsak začeti poskus se shrani, tudi neuspešen. Popravki kvalifikacijskega
izvajalnika pomenijo nov poskus z novo oznako. Glavne meritve ne prejmejo
teh napak, pozivov ali povratnih informacij. Za glavne meritve se poraba
ob prekinitvi vnaprej obravnava kot cenzuriran delni podatek; popolnost
funkcionalne ocene je od tega neodvisna.
