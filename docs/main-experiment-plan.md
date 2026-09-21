# Glavna raziskava: izvedbeni načrt

Priprava začeta po izrecnem naročilu avtorja, naj se izvedejo vsi preostali
eksperimenti in pripravi gradivo za pisanje. Delovni obseg je 8 nalog ×
3 postopki × 3 ponovitve = 72 glavnih izvedb. Naloge imajo oznake P03–P10;
P01/P02 sta pilotni in se ne vključita v glavno analizo. Načrt postane
zamrznjen šele po uspešnem preverjanju vseh referenc in meril, pred prvim
glavnim modelskim zagonom.

| Naloga | Funkcionalnost | Osrednji pogoji |
| --- | --- | --- |
| P03 | Iskanje in sestavljeni filtri | Normalizacija, konjunkcija pogojev, usklajenost pogledov. |
| P04 | Stabilno razvrščanje z dvema ključema | Smeri, sekundarni ključ in ohranitev vrstnega reda pri izenačenju. |
| P05 | Straničenje in filtriranje | Robovi strani, sprememba velikosti, ponastavitve, tabla. |
| P06 | Nastavljiv izvoz CSV | Izbor polj, ubežni znaki, Unicode in nevtralizacija formul. |
| P07 | Priljubljena opravila | Shranjeno stanje po ID-ju, pokvarjeni podatki, dogodki shrambe. |
| P08 | Pregled rokov | Koledarske meje, prestopna leta, skupine in neveljaven vnos. |
| P09 | Stanje pogleda v povezavi | Razčlenjevanje, potrditev, zgodovina brskalnika, podrobnosti. |
| P10 | Vrstni red z razveljavitvami | Permutacije, zgodovina, nova veja po razveljavitvi in meje. |

Naloge so omejene razširitve istega uporabniškega vmesnika. Osnovni
commit Folio ostaja enak kot v pilotih. Večina izbranih funkcionalnosti
obdeluje ali lokalno organizira prebrane podatke; vzorec zato ne predstavlja
strežniškega razvoja ali celotnega spektra React aplikacij. P01 in P02
sta že preverila zapisovanje na strežnik in obravnavo zavrnitev. Podobne
zahteve o pogledih in ohranitvi podatkov so skupne omejitve, ne ponovitev
pilotnih funkcionalnosti.

Za vsako nalogo pred modeli nastanejo: javnih 12 zahtev, enaka predloga
specifikacije, 4 razvojni scenariji, ločena referenca, 12 končnih scenarijev,
preslikava zahtev in namerne napake. Referenčna funkcija se ne uvaža v
teste. Dodatne podatkovne primere v brskalniških testih podaja raziskovalčev
javni testni pripomoček prek GET odgovorov; to ne spreminja kandidata ali
strežniške implementacije. Dejanja funkcionalnosti ne smejo pošiljati
zapisov. Zahteve in podatkovne domene so izrecno opisane agentom.

Skupni pogoji ostanejo GPT-6 Astra xhigh, pripeti CLI 0.154.0, Spec Kit
1.0.8/Lean 1.0.0 in največ 20 minut na izvedbo. Za vsako izvedbo se pripravi
svež izvoz in prazna zgodovina (pri C se potem nadaljuje ista seja).
Vrstni red bo določen pred meritvami z zapisanim semenom in uravnoteženimi
permutacijami A/B/C po blokih naloga × ponovitev. Merjene izvedbe tečejo
zaporedno, da si ne delijo brskalnika ali testnih strežnikov.

Vse začete izvedbe se ohranijo. Neuspeh oddaje ali iztek časa ni razlog
za izbiro uspešnejšega nadomestnega zagona. Infrastrukturni izid se označi
ločeno in ponovi le po vnaprej določenem pravilu. Pri prekinitvah se poraba
obravnava kot delno opažena; ne izmišljujemo manjkajočega končnega števca.
Naročniški tokeni ostanejo merska enota porabe, ne cena API ali denarni račun.

Pred zagoni se določi tudi rubrika kakovosti kode, specifikacij in
sledljivosti ter enak vzorec za vse postopke. Morebitne avtomatizirane
presoje se izrecno označijo kot take; ne predstavljajo človeškega pregleda
avtorja ali mentorja. Končna zbirka vsebuje podatke po izvedbah, skupinske
povzetke, negotovost po nalogah, primere napak in seznam omejitev za pisanje.

Trenutno stanje: tehnična kvalifikacija in priprava meril. Glavne meritve
še niso začete. Pretekli P02 je ohranjen v lokalnem posnetku `fa72212`.
