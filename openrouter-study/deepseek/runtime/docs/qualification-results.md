# Rezultati tehnične kvalifikacije Q/1

Vsi trije preizkusi so uspeli. Izvedeni so bili po
[vnaprej zapisanem protokolu](qualification-protocol.md), pred glavnimi
meritvami. To so tehnični modeli z namerno vneseno napako oziroma
prekinitvijo; niso dodatne primerjalne ponovitve P01–P10.

| Preizkus | Trajanje | Opaženi izid |
| --- | ---: | --- |
| [Q-B-001](../qualification/Q-B-001/execution.json) | 183,576 s | Pregled je zahteval oba popravka; specifikacijo in kodo sta popravila njuna prvotna avtorja. |
| [Q-C-001](../qualification/Q-C-001/execution.json) | 332,091 s | Prvi pregled je pripel nalogo, sledili sta druga implementacija in uspešna druga konvergenca. |
| [Q-I-001](../qualification/Q-I-001/execution.json) | 7,582 s | Prekinitev po začetem ukazu; končni števec manjka, opažena poraba je pravilno označena kot delna. |

Pri B so bile tri različne seje, popravka pa sta nadaljevala točna
prvotna identifikatorja. Pri C je vseh osem korakov uporabljalo isto sejo.
Vsa nadaljevanja so vrnila kontrolno besedo, ki je niso dobila ponovno
in ni bila v delovnih datotekah. Meje pisanja so bile upoštevane.
Pred vnosom napake in po popravku je javni test funkcije uspel.
Pregledovalčevih ugotovitev izvajalnik ni sestavil namesto modela.

Poraba B je popolna: 257.443 vhodnih in 4.154 izhodnih tokenov. C je
popoln s 768.534 vhodnimi in 7.722 izhodnimi tokeni. Seštevanje se opravi
enkrat na različno sejo; kumulativnih nadaljevanj ne seštevamo.
Pri I je opaženih 10.183 vhodnih in 75 izhodnih tokenov, polje popolne
porabe pa ostaja null. Ta opaženi del ni trditev o celotni obračunani
porabi, še posebej ne za prekinitev aktivne modelske zahteve.

Po zaključku niso ostali procesi prekinjenega ukaza ali izvajalnikov Q.
Pozivi, nastavitve, dnevniki, vmesne oddaje, vnesene napake pred/po in
izvajalnik ob zagonu so shranjeni v `qualification/`. Poskusi niso
spreminjali arhivov P01/P02 ali izvirne aplikacije.

Za glavno raziskavo je določeno: poraba brez potrjenega končnega dogodka
ostane cenzuriran delni podatek. Poročamo njeno popolnost in zadnji opaženi
števec; ne vpisujemo ničle in je ne mešamo s popolnimi seštevki. To omogoča
pošteno obravnavo prekinitev, ne zagotavlja pa izračuna neznanega denarnega
stroška. Sam tehnični uspeh povratne zanke ne zagotavlja, da bo pregledovalec
v glavni nalogi našel vsako vsebinsko napako.
