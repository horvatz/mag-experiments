# Dodatni eksperiment L/1.0: GPT-6 Luna

Predmerilni načrt, 27. september 2026. Uporabnik je naročil celotno dodatno
primerjavo pred pisanjem. Glavna zbirka M/1.0 z Astro je zaključena in ostane
nespremenjena. Ta dokument in izvedbeni dodatki se zamrznejo pred prvo meritvijo.

## Raziskovalno vprašanje

Ali se razlike med postopki A, B in C pri istem preizkusu pojavijo tudi pri
GPT-6 Luna? Zanimajo nas funkcionalna uspešnost, strogi uspeh, čas, poraba,
predaje/popravki ter kakovost dokumentacije in kode. Prednosti posameznega
postopka ali slabših izidov Lune ne predpostavljamo.

## Nespremenjeni pogoji

P03–P10 × A/B/C × tri ponovitve pomeni 72 novih meritev. Vrstni red uporablja
isti vnaprej določeni razpored in seme kot M/1.0. Vsaka kombinacija dobi svež
izvoz istega začetnega commita in prazno zgodovino. Navodila, pozivi, 12 zahtev,
38 regresijskih, 8 razvojnih in 24 zasebnih preverjanj ostanejo enaki.
Postopki A/B/C, pravice, Spec Kit, 1200-sekundni skupni čas in fazne rezerve
ostanejo enaki. Merjene izvedbe tečejo zaporedno, brez posegov raziskovalca.

Vsak ID ima ključ (zbirka, lokalni ID), na primer L/1.0:P03-A-001.
Meritve so v runtime/runs, delovne kopije v runtime/.work; poti M/1.0 se ne
uporabljajo za pisanje. Začete meritve se ne ponovijo ali zamenjajo zaradi izida.

## Model in nujna sprememba izvajalnika

Model je gpt-6-luna, reasoning xhigh, obstoječa naročnina ChatGPT. CLI 0.154.0
je 27. septembra model zavrnil z napako HTTP 400 »not supported when using
Codex with a ChatGPT account«. Ista prijava in model sta uspešno opravila
ločeno preverbo z že nameščenim CLI 0.158.0-alpha.2.1. Ta izvršljiva datoteka
je lokalno kopirana in pripeta s SHA-256. Globalna prijava ni spremenjena.
Node ostane 24.11.1, odvisnosti in Chromium so isti kot pri Astri.

Ker sta različica CLI in obdobje izvajanja drugačna, zgodovinska primerjava
Astra–Luna **ne izolira čistega učinka modela**. Razlike opisujejo model skupaj
z izvajalnim okoljem in obdobjem. Primerjave A/B/C znotraj L/1.0 imajo skupno
okolje. Ne ponavljamo Astre, da bi izbrali lepši rezultat ali odstranili stare
infrastrukturne neuspehe. Modelski interni pozivi in ponudnikova storitev niso
v celoti pod raziskovalčevim nadzorom.

## Kvalifikacija in zamrznitev

Preverba dostopa, tehnični izvozi P06-*-9xx in kvalifikacije Q-B/Q-C/Q-I so
ločeni od 72 meritev. Preverijo izolacijo, 38 regresijskih preverjanj, javne
prehode, strukturirani izhod, predajo vlog, nadaljevanje iste seje in zapis
delne porabe. Uspešna kvalifikacija ni dokaz uspešnosti glavnih nalog.
Referenčne rešitve in negativne kontrole imajo že potrjene nespremenjene
izvore; preverijo se njihovi hashi. Zunanje varovalo pred vsako novo meritvijo
preveri dostop, pri napaki med meritvijo pa najprej ohrani izid in ustavi vrsto.
Preverbe dostopa so izključene iz merjenega časa in porabe.

Tehnični P06-A-901 se je ustavil pri dodatni preverbi zaradi napačne poti do
neobstoječe stare datoteke; preverba popravljene obstoječe poti je uspela.
Kvalifikacija Q-B-001 ni mogla uporabljati orodij zaradi manjkajočega
code-mode-host v kopiji paketa. Ostane shranjena kot infrastrukturni neuspeh
kvalifikacije. Paket je dopolnjen z izvirnimi spremljevalnimi datotekami in
SHA-256 inventarjem; nove kvalifikacije imajo oznake Q-B/C/I-002. To niso
zamenjave merjenih izidov. Pred zamrznitvijo je preverjen nov tehnični izvoz.

## Analiza, manjkajoči podatki in zaključek

Primarni izid ostane delež zahtev, dokazanih na obeh zaslonih. Vse začete
izvedbe ostanejo v imenovalcu; odsotno opazovanje ni potrjena funkcionalna
napaka. Neznan čas ali poraba ostaneta null, opažena delna poraba ločena.
Povprečje, ki zahteva neznan čas, se zadrži; null ni nič. Tokeni niso račun API.

Najprej povprečimo tri ponovitve po nalogi in postopku, nato primerjamo osem
parov nalog. Opisni 95-odstotni percentilni intervali uporabljajo 20.000
ponovnih vzorcev z istim zapisanim semenom. Postopke primerjamo znotraj Lune,
nato opisno med zbirkama po istem postopku in za spremembo razlik B−A/C−A.
Izidi vseh meritev so glavni; prikaz samo zaključenih rešitev je jasno označena
občutljivostna analiza. Neodvisnost posameznih testov ali 24 ponovitev ni
predpostavljena. Razlik ne razglasimo za učinek samega modela.

Vseh 24 ponovitev 001 je vnaprej izbranih za isto petdimenzijsko rubriko.
AI-podprta neslepa presoja ostane ločena od človeške presoje, brez skupnega
seštevka kakovosti in brez izmišljenega medocenjevalskega soglasja. Nedostopne
oddaje imajo manjkajoče ocene. Končni izvoz vsebuje arhive, preverjeno tabelo
rezultatov, procesne podatke, grafe, preglednico in gradivo za magistrsko.

## Dokumentacijska vira

- [OpenAI: GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna)
- [OpenAI: Codex changelog, podpora Luni od septembra 2026](https://learn.chatgpt.com/docs/changelog)

Dokumentacija ne nadomesti dejansko preverjenega dostopa. Dokazi so v
qualification/service-probe*.json in qualification/access-diagnostic.json.
