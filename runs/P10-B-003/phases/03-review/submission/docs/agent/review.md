# Neodvisni pregled P10

Pregled je zaključen. Vseh dvanajst zahtev je primerjanih z izvirnimi navodili, specifikacijo, implementacijo, testi in verification.md. Konkretnih napak ni; spremembe specifikacije ali kode niso zahtevane.

| Zahteva | Pregled in dokaz |
| --- | --- |
| R01 | Izvorni red in mesta izhajajo iz ID-jev prejetega polja; Map loči enake naslove. A01 preverja 13 opravil in posebne ID-je. |
| R02 | move zamenja samo globalna sosednja ID-ja v kopiji permutacije; Task objektov ne spreminja. Dokazi D01, A01 in A04. |
| R03 | Varovalo preveri obstoj ID-ja ter obe meji pred commit; oba robna gumba sta disabled. A03 preverja ponovljena robna dejanja. |
| R04 | commit shrani celotno prejšnjo permutacijo; undo obnovi zadnjo in trenutno doda v redo. Dokaza D02 in A02. |
| R05 | redo obnovi vrh sklada in shrani trenutno permutacijo v undo; posnetki se ne mutirajo. A02 primerja vseh 20 ponovitev. |
| R06 | Samo commit počisti redo; neveljaven move vrne isto stanje. A03 preverja ohranitev obeh razveljavljenih korakov in razvejitev. |
| R07 | remember uporablja slice(-20); A02 preverja 21 premikov, 20 undo, 20 redo in reset pri polni zgodovini. |
| R08 | reset uporabi commit samo pri različnem redu; gumb je pri izvornem redu disabled. A03 pokriva reset z redo in njegovo undo/redo. |
| R09 | Preglednica sledi orderedTasks, tabla ga filtrira po stalnih stanjih; mesta in dejanja ostajajo globalna. A04 preverja stolpce in števce. |
| R10 | useTaskOrder živi v ProjectView s ključem project.id; pogled in podrobnosti ga ne odklopita. A05 pokriva oba sklada, projekte in reload. |
| R11 | Števec in disabled pogoji izhajajo iz dolžin skladov; prazno polje še vedno prikaže kontrole. A06 preverja 0/1 opravil in oba pogleda. |
| R12 | Premiki ne kličejo API-ja ali shrambe; izvorni objekti napajajo števce in podrobnosti po ID-ju. Folio slogi in notranje drsenje so ohranjeni. |

Rezultat npm run check (53/53, lint, tipi in gradnja) je rezultat implementerja iz docs/agent/check.log, ne moj zagon. Pregledal sem dejanske teste in vse zapise uspeha. Specifikacija jasno označi predimplementacijske načrte; dejansko sledljivost in rezultate dopolnjuje verification.md.

Sam sem pregledal vse štiri shranjene posnetke preglednice in table pri širinah 390 in 1440 pik in CSS glede docs/dizajn.md. Mapa predogled/ v izvozu ni na voljo, zato primerjava s prvotnimi referenčnimi posnetki ni mogoča. Končni skriti testi niso dostopni. Chromium zahteva connect prek task/browser.json; javni internet ni dovoljen.

Samostojno izvedeni dodatni preizkus R10/R12: lokalni strežnik 5193/3123, chromium.connect, ločen kontekst 390 × 844, štiri opravila z enakimi naslovi in različnimi ID-ji. Dva premika in undo ustvarijo P=[b,a,c,d], U=1, R=1. GET podrobnosti b vrne 503; ponovni poskus uspe, Escape ohrani P/U/R. Na tabli GET podrobnosti a vrne 503; zapiranje z gumbom prav tako ohrani P/U/R. Redo obnovi [b,a,d,c], dve razveljavitvi obnovita [a,b,c,d], U=0, R=2. Preverjena so vsa mesta, števec zgodovine, red preglednice, širina strani, odsotnost zapisov API in dogodkov pageerror.

Izid samostojnega preizkusa: PASS, izhodna koda 0; viewport=390, widthOverflow=false, apiWrites=[], pageErrors=[]. Preizkus je bil izveden neposredno z Node skripto brez ustvarjanja testnih datotek. Prvi poskus injiciranja samo ene napake ni dosegel pričakovanega stanja zaradi razvojnega StrictMode in ponovnega GET; po spremembi testne injekcije na trajno napako do izrecnega ponovnega poskusa je celotni scenarij uspel. Aplikacija ni bila spreminjana.

Celotnih testov nisem ponavljal, ker za to ni bilo konkretnega razloga; njihovih rezultatov ne predstavljam kot lastni zagon. Pisal sem samo review.json in review.md. Nedostopni skriti testi in manjkajoči izvorni referenčni posnetki ostajajo omejitvi pregleda.
