# Pilot P01 po postopku C

Protokol C/0.1 je pripravljen pred prvim zagonom P01-C-001. Isti agent v
eni ohranjeni seji izvaja uradne korake Spec Kit 1.0.8. Uporabimo isti
Folio, navodila P01 v0.2, GPT-6 Astra z `xhigh`, CLI 0.154.0 in skupno
omejitev 20 minut kot pri A in B. Referenca, prejšnje rešitve in končni
testi niso dostopni agentu.

## Pripeta različica in priprava

Uporabimo [GitHub Spec Kit v1.0.8](https://github.com/github/spec-kit/releases/tag/v1.0.8),
commit `0cc9a6a1159471a3108b9bad718ba17006dd6039`. CLI je iz uradnega vira
nameščen v lokalno Python okolje 3.12.14 in uporabljen za pripravo prazne
projektne predloge z možnostmi `--integration codex --script sh
--ignore-agent-tools --non-interactive`. Namestitev ne spreminja sistemskih
orodij ali osebnih nastavitev.

Nastali `.specify/` in `.agents/skills/` sta nespremenjeno shranjeni v
`vendor/spec-kit-1.0.8/` skupaj z licenco, kontrolnimi vsotami in podatki o
izvoru. V izvoz kopiramo ta paket. Med meritvijo ni nameščanja ali prenosa
predlog. Git razširitev, dodatni preseti in zunanje razširitve niso vključeni.
Uporaba predlog in načrtovanje agentu štejeta v čas; namestitev orodja ne.

Uradna [integracija Codex in potek korakov](https://github.github.com/spec-kit/reference/agentic-sdd.html)
uporabljata lokalne veščine. Zaradi izključitve osebnih veščin izvajalnik v
vsakem pozivu izrecno navede ustrezni lokalni `SKILL.md`; agent ga prebere
in izvede. Ne nadomeščamo navodil Spec Kit z lastno krajšo različico.
Gostiteljev katalog ostane izključen, uradne veščine in predloge so samo
berljive. Jedrne skripte za razreševanje predlog ter pripravo načrta in
nalog delujejo lokalno brez namestitve dodatkov.

## Koraki in čas

1. `constitution`: agent iz skupnih projektnih pravil oblikuje projektna načela.
2. `specify`: pripravi specifikacijo P01 in vgrajeni seznam kakovosti zahtev.
3. `plan`: pripravi tehnični načrt in spremljevalne dokumente.
4. `tasks`: pripravi naloge za implementacijo in preverjanje.
5. `implement`: izvede naloge, preveri rešitev in zapiše rezultate.
6. `converge`: preveri skladnost kode s specifikacijo, načrtom in nalogami.

Vsak korak je ločen poziv v isti seji. Nadaljevanje cilja točen prvotni
identifikator seje; nov agent ali nova zgodovina se ne ustvarita. Koraki
sledijo [uradnemu poteku](https://github.com/github/spec-kit/blob/v1.0.8/docs/quickstart.md).
Dodatni interaktivni koraki `clarify`, `checklist` in `analyze` niso izbrani;
vgrajeni seznam kakovosti v koraku `specify` ostaja obvezen. Spletna
raziskava je omejena na lokalno kodo in priloženo gradivo kot pri A in B.
Ob nerešljivem vprašanju se agent ustavi in ga zabeleži; izvajalec med
meritvijo ne dopisuje odgovorov.

Skupna ura teče od prvega zagona, vključno s predajami. Pozivi predlagajo
kratko pripravo (približno 1, 3, 2 in 1 minuto za prve štiri korake), vendar
to niso ločene trde časovne meje. Implementacija mora pustiti vsaj dve
minuti za `converge`. Vsi ostali koraki imajo na voljo preostanek skupnih
20 minut. Agent lahko preveri čas s priloženim pripomočkom.

`converge` ne spreminja kode ali obstoječih nalog. Ob vrzelih pripne nove
naloge; izvajalnik dovoli še en par `implement → converge`, če čas ostane.
Izid z odprtimi nalogami po drugem pregledu je `convergence_incomplete`.
Iztek časa, manjkajoč dokument ali neveljavna predaja se ohranijo kot
neuspešen oziroma nepopoln zaključek. Izvajalec ne popravlja izdelka.

## Datoteke in predaje

Dokumenti funkcionalnosti nastajajo v `docs/agent/P01/`, kar določa podprta
nastavitev `SPECIFY_FEATURE_DIRECTORY`. Skupno predlogo agent izpolni z
vsebino oziroma povezavami na te dokumente. Koda in testi imajo iste meje
kot pri drugih postopkih: `src/`, `tests/agent/`, `docs/agent/`.

Edini dodatni zapisljivi datoteki sta `.specify/memory/constitution.md`
in `.specify/feature.json`; gre za dokument in kazalec postopka, ne za
spremembo aplikacije ali ocenjevalca. Izrecna dopolnitev je v izvoženih
navodilih. Med pripravo dokumentov koda ni zapisljiva. Korak `converge`
lahko samo pripne naloge in odda končni odgovor. Izvorne predloge,
veščine, infrastruktura in skupni testi so zaščiteni.

Končni odgovor `converge` ima določeno obliko JSON: izid, povzetek in
nepreverjene stvari. Izvajalnik ga prenese brez vsebinskih sprememb.
Izid `converged` zahteva nespremenjeno datoteko nalog brez neoznačenih
nalog; `tasks_appended` zahteva ohranjeno vsebino in nove neopravljene
naloge na koncu. To je preverjanje predaje, ne neodvisna ocena pravilnosti.

Pred začetkom zamrznemo pozive, nastavitve, uradni paket in izvajalnik.
Preverimo izolacijo, meje vsakega koraka, uradne skripte in vseh 38
osnovnih preverjanj. Po vsaki fazi shranimo dnevnik, čas in kopijo predaje.
Po koncu je oddaja zamrznjena ter neodvisno ocenjena z istimi 68
preverjanji, slogom, tipi in gradnjo kot pri A in B.

Poraba se zapisuje po fazah in po seji. Ker gre za nadaljevanja iste
seje, kumulativnih števcev ne seštevamo. Končni podatek primerjamo z
dogodki porabe izključno te seje; nepopolna meritev ostane neznana.
Naročniške porabe ne pretvarjamo v denarni strošek.

Pilot meri celoten tako določen postopek C. Rezultat sam zase ne dokazuje
prednosti Spec Kita, pravilnosti za vsa stanja ali primerljivosti vseh
obstoječih različic orodja. P01 ostaja naloga za umerjanje protokola.
