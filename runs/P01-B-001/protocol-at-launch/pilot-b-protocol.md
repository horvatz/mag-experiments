# Pilot P01 po postopku B

Postopek B uporablja tri agente z ločenimi pogovori: avtorja specifikacije,
avtorja implementacije in pregledovalca. Delajo zaporedno na istem izvozu.
Noben ne dobi pogovora drugega agenta, rešitve A, reference ali končnih testov.
Predaja poteka prek dokumentov in kode. Popravke opravi prvotni avtor v svoji
obstoječi seji. Pregledovalec kode in specifikacije ne popravlja sam.

Izhodišče, naloga P01 v0.2, model GPT-6 Astra z `xhigh`, CLI 0.154.0,
odvisnosti, javni testi in končna ocena so enaki kot pri A. Podrobnosti
izolacije določa [osnovni protokol](pilot-protocol.md). Dodatno zapremo tudi
predoglede prejšnjih kandidatov. Vsaka vloga ima preverjene pravice za pisanje
samo svojih datotek. Pogovore hrani odjemalec, ukazi agentov do njih nimajo
dostopa. Skrivnih testov med delom ne izvajamo.

## Vnaprej določene predaje in čas

Skupna omejitev je 1200 sekund od zagona prve seje, vključno s predajami.
Priprava okolja in končno ocenjevanje sta izključena, tako kot pri A.

1. Avtor specifikacije ima največ 180 sekund. Zapiše `specification.md` po
   skupni predlogi; po potrebi vodi `specification-history.md`.
2. Avtor implementacije dobi specifikacijo in izvirne zahteve. Pripravi kodo,
   lastne teste in `verification.md`. Konča najpozneje pri 900 sekundah
   skupnega časa; zadnjih 300 sekund ostane za pregled in popravke.
3. Pregledovalec ima največ 180 sekund in mora pustiti vsaj 120 sekund do
   skupne omejitve. Pregleda zahteve, specifikacijo, kodo in preverjanja.
   Zapiše `review.md` in strojno berljiv `review.json`.
4. Če pregled zahteva popravek specifikacije, se nadaljuje seja njenega
   avtorja (največ 60 sekund, najmanj 30 sekund ostane implementerju).
5. Če pregled zahteva popravek kode ali specifikacije, se nadaljuje seja
   avtorja implementacije. Ta obravnava ugotovitve in preveri spremembe v
   preostalem času. Dodatnega kroga pregleda v tem pilotu ni.

Zgodnejši zaključek faze sprosti čas naslednjim fazam. Časovne omejitve faz
so trde in so del postopka B. Ob prekinitvi faze se predajo že zapisane
datoteke; prekinitev je vidna v rezultatu in se ne šteje za običajen zaključek.
Če specifikacija manjka, pregled ni veljaven, pride do kršitve meja ali
tehnične napake, se postopek ustavi in zabeleži razlog. Ocenimo tudi tako
nepopolno predajo; izvajalec je ne popravlja. Po globalni omejitvi ne začnemo
nove faze. Več časa ali ročnih namigov med izvajanjem ne dodajamo.

To so nastavitve tega pilota, ne že potrjene nastavitve glavne primerjave.
Rezultat primerja celotna postopka, tudi razporeditev časa in predaj.

## Zapis in preverjanje

Pred prvo sejo zamrznemo vse pozive, nastavitve vlog in časovni razpored.
Ob vsaki predaji shranimo čas, surovo porabo, dnevnik, spremembe datotek in
kopijo kode, testov ter dokumentov. Preverimo lastništvo sprememb. Skupno
porabo seštejemo le, če poznamo obseg števcev; nadaljevane seje zahtevajo
preverjanje, da prejšnje porabe ne štejemo dvakrat. Manjkajoč podatek ni nič.

Po zadnji fazi predajo zamrznemo in izvedemo ista neodvisna preverjanja kot
pri A: slog, tipi, gradnja ter 38 osnovnih, 8 razvojnih in 22 končnih
preverjanj. Pregledovalčeva ocena ni nadomestilo za to končno oceno.

Zagon uporablja iste ukaze `pilot:prepare`, `pilot:browser`,
`pilot:preflight`, `pilot:run`, `pilot:evaluate` in `pilot:archive`, z
identifikatorjem `P01-B-001`. Pozivi so v `procedure-b.json`, dejansko poslani
pozivi s preostalim časom pa v `phases/`. Nadaljevanje iste seje uporablja
[uradno podprti `codex exec resume`](https://learn.chatgpt.com/docs/non-interactive-mode).
