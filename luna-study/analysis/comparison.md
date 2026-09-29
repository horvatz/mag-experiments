# Primerjava Astre in Lune

144/144 arhiviranih. Obe zbirki sta zaključeni.

| Model | Postopek | Arhivi | Strogi uspehi | Zahteve (%) | Čas (min) | Popolna poraba | Vhodni tokeni¹ | Izhodni tokeni¹ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Astra | A | 24/24 | 19 | 79.17 | 8.84 | 19/24 | 752234 | 20177 |
| Astra | B | 24/24 | 19 | 83.33 | 13.24 | 19/24 | 1140360 | 27873 |
| Astra | C | 24/24 | 19 | 83.33 | — | 19/24 | 2794804 | 29236 |
| Luna | A | 24/24 | 17 | 97.22 | 12.09 | 21/24 | 2009793 | 29259 |
| Luna | B | 24/24 | 15 | 98.61 | 16.82 | 18/24 | 2026422 | 39774 |
| Luna | C | 24/24 | 1 | 72.22 | 18.49 | 2/24 | 6096964 | 55775 |

¹ Povprečje samo popolnih zapisov porabe; imenovalci so navedeni in so lahko selektivni. Vhod vključuje predpomnjene tokene, izhod vključuje reasoning. Tokeni niso denarni strošek.

Čas vključuje tudi začete neuspešne poskuse dostopa; njihovi kratki časi niso časi uspešnih rešitev. Če manjka vsaj en točen čas, je skupinsko povprečje zadržano.

**Omejitev:** Astra je bila merjena s CLI 0.154.0, Luna z 0.158.0-alpha.2.1 in v poznejšem obdobju. Medzbirčne razlike ne izolirajo učinka samega modela.

| Primerjava | Mera | Razlika | Opisni 95 % interval |
| --- | --- | --- | --- |
| Luna − Astra, A | demonstratedFraction | 0.1806 | -0.0035 do 0.3854 |
| Luna − Astra, B | demonstratedFraction | 0.1528 | 0.0069 do 0.3333 |
| Luna − Astra, C | demonstratedFraction | -0.1111 | -0.3889 do 0.1458 |
| astra, B − A | demonstratedFraction | 0.0417 | 0.0000 do 0.1250 |
| astra, C − A | demonstratedFraction | 0.0417 | 0.0000 do 0.1250 |
| astra, C − B | demonstratedFraction | 0.0000 | 0.0000 do 0.0000 |
| luna, B − A | demonstratedFraction | 0.0139 | 0.0000 do 0.0347 |
| luna, C − A | demonstratedFraction | -0.2500 | -0.4583 do -0.0694 |
| luna, C − B | demonstratedFraction | -0.2639 | -0.4688 do -0.0799 |
| (Luna B−A) − (Astra B−A) | demonstratedFraction | -0.0278 | -0.1215 do 0.0313 |
| (Luna C−A) − (Astra C−A) | demonstratedFraction | -0.2917 | -0.4688 do -0.1146 |
| Luna − Astra, A | strictSuccessFraction | -0.0833 | -0.4167 do 0.2500 |
| Luna − Astra, B | strictSuccessFraction | -0.1667 | -0.4583 do 0.1250 |
| Luna − Astra, C | strictSuccessFraction | -0.7500 | -0.9167 do -0.5000 |
| astra, B − A | strictSuccessFraction | 0.0000 | -0.1250 do 0.1250 |
| astra, C − A | strictSuccessFraction | -0.0000 | -0.1250 do 0.1250 |
| astra, C − B | strictSuccessFraction | -0.0000 | -0.1250 do 0.1250 |
| luna, B − A | strictSuccessFraction | -0.0833 | -0.2917 do 0.0833 |
| luna, C − A | strictSuccessFraction | -0.6667 | -0.9167 do -0.4167 |
| luna, C − B | strictSuccessFraction | -0.5833 | -0.8333 do -0.3333 |
| (Luna B−A) − (Astra B−A) | strictSuccessFraction | -0.0833 | -0.2917 do 0.1250 |
| (Luna C−A) − (Astra C−A) | strictSuccessFraction | -0.6667 | -0.9583 do -0.3750 |
| Luna − Astra, A | elapsedSeconds | 195.2171 | 50.7997 do 361.8856 |
| Luna − Astra, B | elapsedSeconds | 214.6132 | 59.1635 do 404.0130 |
| astra, B − A | elapsedSeconds | 264.4704 | 191.5228 do 325.5911 |
| luna, B − A | elapsedSeconds | 283.8665 | 178.5422 do 378.1793 |
| luna, C − A | elapsedSeconds | 384.1740 | 283.9832 do 464.0141 |
| luna, C − B | elapsedSeconds | 100.3076 | 42.7545 do 162.2862 |
| (Luna B−A) − (Astra B−A) | elapsedSeconds | 19.3961 | -104.6156 do 126.7661 |

Zadržano: Luna − Astra, C, elapsedSeconds; manjka potreben točen podatek.
Zadržano: astra, C − A, elapsedSeconds; manjka potreben točen podatek.
Zadržano: astra, C − B, elapsedSeconds; manjka potreben točen podatek.
Zadržano: (Luna C−A) − (Astra C−A), elapsedSeconds; manjka potreben točen podatek.

Analiza najprej povpreči tri ponovitve iste naloge/postopka. Intervali ponovno vzorčijo osem nalog; so opisni in ne pomenijo potrditve enakovrednosti pri ničelni razliki.
