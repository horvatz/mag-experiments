# Specifikacija P07: Priljubljena opravila in trajna shramba

## Problem in kontekst

Folio prek javnega API-ja naloži projekte in opravila, ki so prikazana v preglednici ali na tabli. Uporabnik želi posamezna opravila označiti kot priljubljena, oznake obdržati po osvežitvi, jih neodvisno filtrirati znotraj trenutnega projekta ter hitro odstraniti oznake projekta. Enaka naslova ne pomenita istega opravila; identiteta je `Task.id`. Priljubljene ne spreminjajo podatkov API.

## Vhodi, dejanja in izidi

Vhodni zapisi so obstoječi `Project {id,name}` in `Task {id,projectId,title,description,status,assignee,dueDate}`. Shranjeni zapis je samo `{version:1,ids:string[]}` pod `folio:favorites:v1`; normalizacija odstrani ponovitve in ID-je razvrsti z običajnim UTF-16 leksikografskim vrstnim redom. Neznani ID-ji ostanejo v shrambi. Pokvarjen zapis se obravnava kot prazna množica, brez popravnega zapisa ob nalaganju.

Uporabnik lahko z ločenim gumbom preklopi priljubljenost opravila, vključi/izključi filter, odstrani priljubljene trenutnega projekta ali zamenja pogled/projekt. Preklop opravila ne odpira podrobnosti. Spremembe so takoj vidne v pomnilniku in se poskusijo zapisati v localStorage; ob izjemi ostane seja uporabna, prikazano pa je opozorilo o shrambi. Dogodek `storage` za pravi ključ zamenja stanje po istih pravilih, `null` pomeni prazno množico in dogodek se ne zapisuje nazaj. Preklic dialoga in API nalaganje ohranita obstoječe vedenje.

## Zahteve in pravila

Naj bo `F` množica shranjenih ID-jev, `T` urejen seznam opravil trenutnega projekta in `V = T`, če filter ni vključen, sicer `[t ∈ T | t.id ∈ F]`. `normalize(ids) = sortUTF16(unique(ids))`. Pri odstranitvi projekta `P` je novo stanje `F \ {t.id | t ∈ T}`. `X = |{t ∈ T | t.id ∈ F}|` in `M = |T|`. Zapis in validacija delujeta globalno; števec meri samo trenutni projekt.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | Vsaka vrstica/kartica ima ločen gumb z imenom `Priljubljeno opravilo <id>` in `aria-pressed`; preklop spremeni samo ta ID in ne odpre dialoga. | UI preveri oba pogleda, ponovljena naslova in dialog |
| R02 | Zapis je točno `{version:1,ids:normalize(F)}` pod `folio:favorites:v1`; API in polja opravila se ne spreminjajo. | Preveri JSON ter API zapise |
| R03 | Ob branju odstrani dvojnike, ohrani neznane nize, ne ustvari opravil in ne zapisuje nazaj. | Vnaprej nastavljena localStorage vrednost in pregled prikaza/shrambe |
| R04 | Manjkajoč/neveljaven zapis, napačna različica, manjkajoči `ids` ali neniz v `ids` dajo `F=∅`, brez izjeme in brez samodejnega zapisa. | Matrika neveljavnih začetnih zapisov |
| R05 | Privzeti filter je izključen; pri vključenem je prikaz `V` v izvornem vrstnem redu. | Checkbox ter ID-ji vrstic/kartic |
| R06 | Odstranitev aktivne oznake takoj odstrani opravilo iz `V`; če `V=∅`, izpiše se `Ni priljubljenih opravil.` in filter je mogoče izključiti. | Filter, preklop zadnje oznake, prazno stanje |
| R07 | Preglednica in tabla porabita isti `F` in `V`; podrobnosti se odprejo po ID-ju. | Menjava pogledov in navigacija podrobnosti |
| R08 | Menjava projekta ohrani globalni `F`, filter se ponastavi; po osvežitvi se obnovi `F`, filter je izključen. | Navigacija med projekti in osvežitev |
| R09 | Odstrani samo ID-je vseh opravil trenutnega projekta iz `F`, ohrani tuje/neznane ID-je; onemogočen je, če projekt nima priljubljenih. | Večprojektni zapis z neznanim ID-jem |
| R10 | Status števec ima `aria-label="Število priljubljenih"`, `role=status` in besedilo `Priljubljeno: X od M.`; števci stolpcev table štejejo `V`. | Preverjanje dostopnega drevesa in števil |
| R11 | Pravi `storage` dogodek takoj posodobi `F` po validaciji, `null` izprazni; drug ključ se prezre in dogodek ne sproži zapisa. Izjeme pri branju/zapisu pokažejo opozorilo z `role=alert` in besedo »shramba«. | Sintetični dogodki in simulirana nedostopna shramba |
| R12 | Priljubljenost je samo lokalna; brez API zapisov ali sprememb polj opravila. Ohraniti je treba Folio, nalaganje, navigacijo in mobilno širino. | Izhodiščni in razvojni testi, mobilni pregled |

## Izvedba in sledljivost

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | Gumb je izven povezave, vezan na ID in ne odpira podrobnosti. | D01; agent: task IDs, not duplicate titles… | src/components.tsx (FavoriteButton), src/App.tsx (vrstice), src/TaskBoard.tsx (kartice) | Uspešno; npm run check, razvojni D01 in agentni ID scenarij. |
| R02 | Shrani samo {version, ids}, enolično in UTF-16 razvrščeno. | D03; agent: writes unique IDs in UTF-16 order… | src/useFavorites.ts (normalize, save) | Uspešno; shranjeni JSON preverjen v obeh scenarijih. |
| R03 | Branje deduplicira, ohrani neznane ID-je, ne piše nazaj. | Agent: restored favorites normalize duplicates… | src/useFavorites.ts (parseFavorites, loadFavorites) | Uspešno; ghost ostane v zapisu, ne postane prikazano opravilo; začetni niz ostane nespremenjen. |
| R04 | Neveljavni začetni zapisi dajo prazno množico brez popravnega zapisa. | Agent: invalid stored shapes… | src/useFavorites.ts (parseFavorites) | Uspešno; preverjeni manjkajoči ključ, neveljaven JSON, napačna različica, manjkajoči ids in neniz v seznamu. |
| R05 | Filter je privzeto izključen in projicira trenutne priljubljene v izvorni vrstni red. | D02; agent: filtered board counts visible tasks… | src/App.tsx (favoritesOnly, visibleTasks) | Uspešno; preglednica ohrani izvorni vrstni red, tabla prikaže izbrane kartice po stolpcih. |
| R06 | Odstranitev med filtrom takoj odstrani rezultat; prazno stanje in izklop filtra ostaneta dostopna. | D02 | src/App.tsx (favorite-empty, checkbox) | Uspešno; razvojni test odstrani zadnjo oznako in preveri točno prazno sporočilo. |
| R07 | Oba pogleda prejmeta isti ID množico in filter; povezava podrobnosti ostane po ID-ju. | D04; agent: task IDs, not duplicate titles… | src/App.tsx (visibleTasks), src/TaskBoard.tsx, src/navigation.ts (obstoječa ID navigacija) | Uspešno; pogled zamenjan z ohranjenim stanjem, podrobnosti odprte za izbrani ID. |
| R08 | Globalna množica preživi menjavo projekta/osvežitev; filter se ponastavi. | D03; agent: project removal preserves… | src/App.tsx (key={project.id}), src/useFavorites.ts (root state) | Uspešno; agentni scenarij preveri ponastavitev ob menjavi projekta in po osvežitvi ter obnovo oznake. |
| R09 | Odstrani le ID-je naloženih opravil trenutnega projekta; onemogočen brez priljubljenih. | Agent: project removal preserves other-project and unknown IDs | src/App.tsx (disabled gumb in seznam ID-jev), src/useFavorites.ts (removeProject) | Uspešno; po odstranitvi ostaneta ID drugega projekta in neznani ID, nato se odstrani le opravilo projekta launch in gumb je onemogočen. |
| R10 | Status števec meri projekt, stolpci table pa filtriran seznam. | Agent: restore/count in filtered board counts visible tasks… | src/App.tsx (projectFavoriteCount, favorite-count), src/TaskBoard.tsx (števec stolpca) | Uspešno; preverjeno besedilo Priljubljeno: 1 od 8. in števci dveh vidnih stolpcev ter praznega stolpca. |
| R11 | Dogodek obravnava le pravi ključ; validira brez povratnega zapisa; napaka pokaže opozorilo. | Agent: storage events synchronize… in storage exceptions… | src/useFavorites.ts (storage listener, save), src/App.tsx (role=alert) | Uspešno; veljaven, neveljaven, drug ključ, null, napaka branja in napaka pisanja so preverjeni. |
| R12 | Lokalna funkcija brez API zapisov ali sprememb polj; ohranjen videz in ozka širina. | D04; baseline desktop/mobile; agent: mobile viewport | src/App.tsx, src/TaskBoard.tsx, src/styles.css | Uspešno; razvojni D04 preveri nič API zapisov, izhodiščna testa ohranita navigacijo, agentni test potrdi širino 390 px. |

## Odprta vprašanja in omejitve

V navodilih ni predpisanega videza novih kontrol; uporabimo obstoječe Folio gumbe, kontrolno skupino in odzivne sloge. Končni skriti primeri niso na voljo. Izjeme shrambe in predpisane vrste neveljavnih zapisov so preverjene z lastnimi testi; razvojni testi sami pokrivajo le del pravil.

## Zapis popravkov

- Začetna specifikacija, različica 1.0 zahtev P07.
- Dopolnjena sledljivost po implementaciji: vsaka zahteva R01–R12 je povezana z dejansko izvedenim testom in pripadajočim delom kode; sprejemna pravila niso bila spremenjena.
