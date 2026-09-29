# Neodvisni pregled P02

Pregledane so izvirne zahteve, specifikacija, izvorna koda, testi ter verification.md. V spodnjih vrsticah je zabeležen pregled kode in testnih trditev; implementerjev uspešen zagon ni lasten zagon pregledovalca. Za zdaj ni konkretnih ugotovitev za popravek.

| Zahteva | Dokaz in presoja |
| --- | --- |
| R01 | Set<string>, polja z imenom po ID v App.tsx in TaskBoard.tsx, ločena od povezav; E01 preverja enaka naslova in odsotnost dialoga. Brez ugotovljenega odstopanja. |
| R02 | BulkTaskControls uporablja velikost množice, indeterminate in prazno/onemogočeno skupno polje; E01 ter E01-empty. Brez ugotovljenega odstopanja. |
| R03 | Hook je nad obema pogledoma v ProjectView s ključem projekta; pomnilniško stanje se ob projektu/osvežitvi ponastavi; E01, E05, E02/E06 in E03. Brez ugotovljenega odstopanja. |
| R04 | Prazen začetni cilj, tri možnosti, pogoji disabled in brez zapisov v toggle/changeTarget; D01, E01, E03. Brez ugotovljenega odstopanja. |
| R05 | apply zajame objekte izbranih ID in cilj; send pošlje po en updateTask z naslovom in ciljem tudi ob enakem stanju; E03 in E05 preverjata telesa ter števila. Brez ugotovljenega odstopanja. |
| R06 | Vsak uspeh funkcionalno posodobi samo status ustreznega ID pred Promise.all; vsi prikazi uporabljajo podatke vira, podrobnosti ponovno berejo API; E04 in E03. Brez ugotovljenega odstopanja. |
| R07 | Vsaka zahteva ima lasten try/catch; zavrnitev ne posodobi podatkov, skupni zaključek ustvari povzetek in opozorila z ID/naslovom/razlogom; D03, E04, E05, E02/E06. Brez ugotovljenega odstopanja. |
| R08 | Zaključek izbere samo failures; retryFailed uporablja samo njihove prvotne objekte in isti operation.target; E05 in E02/E06 preverjata več zaporednih zavrnitev. Brez ugotovljenega odstopanja. |
| R09 | Operation.successful je množica skozi vse ponovitve; uspešen zaključek počisti izbor, cilj, napake in možnost ponovitve; E05 preverja 1/2, 2/1, 3/0. Brez ugotovljenega odstopanja. |
| R10 | Sinhroni running ref prepreči dvojni vstop; progress in failures zakleneta kontrole, ponovitev/čiščenje sta dovoljena po neuspehu; D04, E04, E10. Brez ugotovljenega odstopanja. |
| R11 | clear brez PATCH ponastavi izbor, cilj, napake, rezultat in operation; uspešni podatki ostanejo; E04 preveri tudi novo neodvisno operacijo. Brez ugotovljenega odstopanja. |
| R12 | PATCH telo vsebuje le nespremenjeni title in ciljni status; lokalni merge spreminja samo status. onlyStatuses primerja vsa polja vseh projektov; E03/E04/E05 in osnovni testi. Brez ugotovljenega odstopanja. |

## Zaključek in izvor dokazov

Vseh R01–R12 je pregledanih. Specifikacija zajema izvirne zahteve, predikate in skupno pogodbo vmesnika. Izvedba in testne trditve se ujemajo s pravili; konkretnih odstopanj za popravek ni. Obe zastavici sta false in findings je prazen.

Pregledovalec je sam prebral kodo, specifikacijo, razvojne in lastne teste, testni transport, verification.md ter check-final.log. Transport res pošlje PATCH lokalnemu API-ju; onlyStatuses primerja vsa polja vseh opravil, tudi drugih projektov. Iskanje v src/ ni pokazalo uporabe testnih kontrol ali brskalniške shrambe.

Dnevnik implementerja kaže uspešen lint, preverjanje tipov, gradnjo in 57 testov (38 osnovnih, 8 razvojnih, 11 lastnih), 24,8 s. To je pregledan dokaz predhodnega zagona, ne lasten zagon pregledovalca. Ker pregled ni odkril konkretnega razloga za ponovitev, testi niso bili ponovno zagnani.

Pregledovalec je sam vizualno pregledal obstoječa posnetka test-results/run/agent-bulk-status-E05-cumu-cc125-d-locked-failures-at-1440px-agent/bulk-success-1440.png ter test-results/run/agent-bulk-status-E05-cumu-8207c-nd-locked-failures-at-390px-agent/bulk-failure-390.png. Navigacija, tipografija, nevtralne površine, modri poudarki in notranje drsenje so skladni z docs/dizajn.md. Kontrole in napake se na mobilnem posnetku prelomijo znotraj strani. Izvorna mapa predogled/ ni izvožena, zato neposredna primerjava z izhodiščnimi posnetki ni mogoča.

Omejitve: ročni bralnik zaslona ter vse širine in kombinacije stanj niso preverjeni. Pregled je omejen na izvoženo lokalno gradivo; po navodilih je javni internet blokiran, lasten brskalniški zagon pa zahteva chromium.connect(wsEndpoint). Pregledovalec aplikacije ali brskalnika ni zaganjal. Izključeni scenariji iz navodil niso obravnavani kot napake. Spremenjena sta samo review.json in review.md; koda, specifikacija in testi ostajajo nespremenjeni.
