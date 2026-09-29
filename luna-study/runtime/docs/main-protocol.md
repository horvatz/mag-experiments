# Glavni protokol L/1.0

Ta protokol velja za P03–P10. Zamrznjen je šele z datoteko
`main-study/frozen-inputs.json`, ki nastane po preverjanju referenc,
negativnih kontrol in izoliranega izvoza, pred prvo merjeno izvedbo.
P01/P02 ter Q-B/Q-C/Q-I ostanejo ločeni piloti oziroma kvalifikacija.

## Zasnova

8 nalog × postopki A/B/C × 3 ponovitve = 72 vnaprej določenih izvedb.
Vsaka naloga ima 12 javnih zahtev, štiri javne razvojne scenarije in
12 zasebnih sprejemnih scenarijev. Sprejemni E01–E12 ustrezajo R01–R12;
oba prikaza naprave morata uspeti, da je zahteva avtomatizirano dokazana.
Vsak scenarij lahko dodatno preveri predpogoje ali drugo povezano zahtevo.
Preverjanja ne dokazujejo pravilnosti za celotno neskončno podatkovno domeno.

Vsi prejmejo isti commit `6dc1193f32a1fc00722fbc0983907d32b908cb51`,
ista navodila naloge, predlogo in razvojne teste. Prejmejo svež izvoz brez
prejšnjih rešitev ali zgodovine pogovora. Dovoljene spremembe so `src/`,
`tests/agent/`, `docs/agent/`; C sme spremeniti še dve vnaprej določeni
procesni datoteki Spec Kit. Referenc, sprejemnih testov, arhivov drugih
izvedb, osebnih datotek in omrežja agent ne vidi. Brskalnik je ločeno
izoliran; raziskovalčevi strežniki med izvedbo ne smejo delovati.

Model GPT-6 Luna, reasoning xhigh, CLI 0.158.0-alpha.2.1, Node 24.11.1;
isti nameščeni paketi in Chromium. Brez izbire drugega modela ob neuspehu.
Uporabi se obstoječa naročnina; tokeni niso račun API ali denarni strošek.
Časovna meja vsake izvedbe je 1200 sekund, skupaj s specifikacijo,
implementacijo, agentovim preverjanjem in predajami. Priprava in neodvisna
ocena se časovno merita ločeno. Izvedbe potekajo zaporedno.

- A: ena nova seja, priprava specifikacije, implementacija in preverjanje.
- B: protokol B/0.3; tri ločene vloge, specifikacija → implementacija →
  pregled, nato morebitni popravki pri prvotnih avtorjih z istima sejama.
  Vnaprej določene časovne rezerve in pravice ostanejo kot pri P02.
- C: C/0.2, uradni Spec Kit 1.0.8/Lean 1.0.0; constitution → specify →
  plan → tasks → implement → converge v isti novi seji, največ še en
  krog implementacije in konvergence v isti časovni meji.

A ima od L/1.0 prav tako shranjeno točno sejo, da lahko raziskovalec po
koncu pridobi delno opažene tokene ob prekinitvi. To ne doda prejšnjega
konteksta. Enoten postopek rekonstrukcije velja za vse tri postopke.

## Vrstni red

Seme `mag-main-M1-2026-09-21` in razpored sta v
`main-study/schedule.json`. Znotraj naloge imajo trije ponovitveni bloki
Latinove rotacije; polovica nalog uporablja ABC/BCA/CAB, polovica
ACB/CBA/BAC. Vsak postopek je znotraj vsake naloge enkrat prvi, drugi in
tretji. Vseh šest permutacij se pojavi po štirikrat. Zaporedje 24 blokov
je določeno s semenom pred rezultati. Ponovitve niso nove naloge.

## Izidi in manjkajoči podatki

Primarni izid: delež avtomatizirano dokazanih zahtev (0–12 / 12), ob
upoštevanju obeh velikosti zaslona. Nedovoljena sprememba pomeni neveljavno
oddajo in nič dokazanih zahtev v glavni analizi; surovi testi ostanejo.
Neizveden test pomeni nedokazano zahtevo, ne opažene funkcionalne napake.
Ločeno se poročajo 38 regresijskih, 8 razvojnih in 24 sprejemnih preverjanj,
lint/tipi/gradnja, status postopka in strogi uspeh vseh pogojev.

Čas je dejanski čas do konca ali prekinitve; časovna omejitev se označi,
ne razglasi za normalen uspešen zaključek. Poraba združuje zadnji
kumulativni števec natanko enkrat na sejo. CLI se primerja z dogodki
token_count. Če manjkajo zaključni števci ali je postopek prekinjen, je
celotna poraba null; zadnja opažena poraba se poroča kot spodnja meja.
Predpomnjeni tokeni so podmnožica vhodnih, reasoning podmnožica izhodnih.

Vse začete izvedbe se ohranijo tudi ob napaki, zavrnitvi, izteku časa,
omejitvi naročnine ali nedokončanem procesu B/C. Merjenih izvedb se
samodejno ne ponavlja in ne izbira boljšega rezultata. Tehnična priprava
pred prvim modelskim dogodkom se lahko ponovi, pri čemer ostane dnevnik.
Če napaka infrastrukture zahteva dodatno izvedbo, se original ohrani;
dopolnitev potrebuje označen dodatek protokola in ločeno analizo.

Čakalna vrsta se ustavi ob omejitvi storitve ali okvari izvajalnika;
že zaključene oddaje ostanejo arhivirane. Ponovni zagon nadaljuje pri
naslednjem neizvedenem ID-ju. Ročno popravljanje agentove oddaje ni dovoljeno.
Neodvisna ocena uporablja kopijo zamrznjene oddaje in do 900 sekund za
celoten testni sklop. Tudi nepopolna ocena ostane jasno označena.

## Analiza in kakovost

Primarno se izidi najprej povprečijo po treh ponovitvah iste naloge in
postopka. Primerjave A–B/A–C/B–C so parne po nalogah. Ko so na voljo vse
72 izvedbe, se za parne razlike uporabijo opisni 95-odstotni percentilni
intervali iz 20.000 ponovnih vzorcev osmih nalog z zapisanim semenom.
Zahteve, testi in ponovitve se ne obravnavajo kot neodvisne naloge.
Pri nepopolni zbirki ni potrditvenega sklepanja ali prikrivanja manjkajočih
blokov. Uspešni in neuspešni izidi ostanejo v imenovalcu začete zbirke.

Rubrika v `main-rubric.md` je določena pred meritvami. Objektivni strojni
kazalniki ter vsebinske presoje so ločeni. Podprta presoja s pomočjo AI
se označi kot taka; ne nadomešča neodvisnega človeškega ocenjevalca.
Noben rezultat pilota ali kvalifikacije ne vstopi v glavno zbirko.

Obseg je omejen na osem razširitev istega React uporabniškega vmesnika,
večinoma organiziranje prebranih podatkov. Emulirani mobilni Chromium ni
fizična naprava. Naročniška infrastruktura, ponudnikova nedeterminističnost,
majhno število sorodnih nalog in morebitne prekinitve omejujejo posploševanje.

## Dopolnitev L/1.0

To je nova ločena zbirka z GPT-6 Luna. Njeni lokalni ID-ji P03–P10
se razločujejo z zbirko L/1.0; niso ponovitve meritev M/1.0 z Astro.
Podrobnosti primerjave in razlika v različici CLI so v ../../protocol.md.
Zunanje preverbe dostopa niso del časa ali porabe meritve.
