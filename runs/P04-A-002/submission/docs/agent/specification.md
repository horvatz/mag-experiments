# P04 — specifikacija postopka A

## Problem in kontekst

Uporabnik želi stabilno razvrščati opravila projekta po dveh ključih v preglednici
in na tabli. Izhodišče bere opravila iz javnega API-ja in jih prikazuje v prejetem
zaporedju. Dodatek uvede štiri lokalne kontrole in ponastavitev, ohrani slovenski
vmesnik, dostopnost, bralne funkcije ter potrjeni videz Folio.

## Vhodi, dejanja in izidi

- Vhod je polje opravil trenutnega projekta iz `/api/projects/:id/tasks`.
  Vsako opravilo ima enkraten `id`, `projectId`, besedilna `title` in `assignee`,
  `status` iz todo/in_progress/done ter veljaven koledarski `dueDate` v YYYY-MM-DD.
  `description` in ostala polja ostanejo nespremenjena. Polje je lahko prazno.
- HTML selecti: Primarni ključ (original/title/assignee/status/dueDate),
  Primarna smer (asc/desc), Sekundarni ključ (none/title/assignee/status/dueDate),
  Sekundarna smer (asc/desc). Kontrole so na voljo tudi pri praznem projektu.
- Sprememba kontrole takoj izračuna projekcijo v pomnilniku. Ne sproži zapisa ali
  ponovnega pridobivanja podatkov. Gumb Izvorni vrstni red obnovi vse privzete vrednosti.
- Menjava pogleda ter odpiranje/zapiranje podrobnosti ohranita nastavitve.
  Menjava projekta in osvežitev ustvarita novo privzeto stanje. Nastavitve niso v URL-ju
  ali trajni shrambi. Preklic podrobnosti z Escape ali zapiranjem ne vpliva nanje.
- Ob napaki branja ostane obstoječi prikaz napake s ponovitvijo; razvrščanje je
  uporabno po uspešnem branju. Dodatek ne uvaja zapisovalnih napak ali potrjevanja.

## Zahteve in pravila

Naj bo A izvorno polje, i(x) prvotni indeks elementa x in S=(p,dp,s,ds).
Privzeto stanje je S0=(original,asc,none,asc). N(x) je zaporedno NFD,
odstranitev le znakov U+0300–U+036F, nato `toLowerCase()`.
Ck(x,y) vrne -1/0/1 po UTF-16 primerjavi N za title/assignee, po rangu
todo=0, in_progress=1, done=2 za status in po kronologiji za dueDate.
Pri veljavnih fiksno širokih datumih YYYY-MM-DD kronologiji ustreza primerjava nizov.
Dasc(c)=c in Ddesc(c)=-c.

Če p=original, velja sort(A,S)=kopija(A). Sicer primerjalnik najprej uporabi
Ddp(Cp(x,y)), samo ob ničli še Dds(Cs(x,y)), če s≠none, ter ob ponovni
ničli i(x)-i(y). Smer nikoli ne vpliva na zadnji indeksni pogoj.

| Zahteva | Pravilo oziroma sprejemni pogoj | Način preverjanja |
| --- | --- | --- |
| R01 | S=S0 ob prvem prikazu; IDs(sort(A,S0))=IDs(A). | Privzete kontrole in vrstni red v brskalniku; D01. |
| R02 | title in assignee uporabljata natančno N ter `<`/`>`; brez locale/numeric vrstnega reda. | Unicode, sestavljeni/razstavljeni znaki, ločila, presledki, 10 pred 2, UTF-16. |
| R03 | todo < in_progress < done; datumi kronološko, tudi čez mesece/leta. | Izrecno pričakovani vrstni red za oba ključa in smeri; D02/D03. |
| R04 | Smer spremeni le izid izbranega ključa; pri izenačenju ohrani indeks. | Naraščajoče/padajoče, izenačenja in nasprotni smeri ključev. |
| R05 | Sekundarni ključ se uporabi natanko ob Cp=0; njegova smer je neodvisna. | Vsi sekundarni ključi, none in obe smeri; D02. |
| R06 | Cp=Cs=0 ⇒ relativni vrstni red i; p=s je dovoljeno; p=original prevlada nad ostalimi kontrolami. | Enaka ključa z nasprotnima smerema, normalizirana izenačenja, original z vsemi kontrolami. |
| R07 | Za vsak status t: tabla[t]=filter(sort(A,S),status=t); stolpci vedno todo,in_progress,done. | Primerjava vseh stolpcev z vrstnim redom preglednice; D03. |
| R08 | S po menjavi pogleda ali odprtju/zaprtju podrobnosti = S pred dejanjem. | Oba pogleda, podrobnosti po ID, vrnitev in Escape. |
| R09 | Menjava projekta ali reload ⇒ S'=S0. Brez shrambe in parametrov razvrščanja. | Oba projekta, vrnitev, osvežitev, URL in pregled kode. |
| R10 | Reset ⇒ S'=S0; pri dolžini A≤1 je sort(A,S)=A za vsak veljaven S. | Reset vseh kontrol, matrika ključev/smeri za prazno in enojno polje ter UI. |
| R11 | A po razvrščanju = A pred; multiset(sort(A,S))=multiset(A); noben zapis API. | Zamrznjeno polje in objekti, ID-ji, nespremenjeni povzetki/stanja, omrežne zahteve; D04. |
| R12 | Vsak izvorni ID je prikazan enkrat in odpira svoje podatke. scrollWidth≤390 pri viewport=390. | Več kot deset opravil, enaki naslovi, Unicode, ID podrobnosti, mobilni pregled in regresije. |

## Izvedba in sledljivost

Izvedeni deli: `src/taskSort.ts` (čista stabilna projekcija),
`src/TaskSortControls.tsx` (štiri kontrole in reset), `src/App.tsx` (lokalno stanje
v ProjectView, skupna projekcija za oba pogleda), `src/styles.css` (odzivna postavitev).
Obstoječi `src/TaskBoard.tsx` že filtrira po stalnem vrstnem redu stolpcev.

| Zahteva | Pogoj | Test ali scenarij | Datoteka in del kode | Izid ter dokaz |
| --- | --- | --- | --- | --- |
| R01 | S0, izvorno zaporedje | D01, A01, A07 | [taskSort/defaultSortSettings](../../src/taskSort.ts), [App/ProjectView](../../src/App.tsx) | Uspešno; [končni dnevnik](check-final.log). |
| R02 | N in UTF-16 | A02 za title in assignee | [taskSort/normalize, compareKey](../../src/taskSort.ts) | Uspešno; A02 v [dnevniku](check-final.log). |
| R03 | Rangi in datumi | D02/D03, A03/A04 | [taskSort/statusOrder, compareKey](../../src/taskSort.ts) | Uspešno; A03/A04 v [dnevniku](check-final.log). |
| R04 | Stabilnost desc | A02–A05 | [taskSort/compareKey, indeks](../../src/taskSort.ts) | Uspešno; obe smeri v [dnevniku](check-final.log). |
| R05 | Drugi ključ | D02, A05 za vse štiri ključe | [taskSort/sortTasks](../../src/taskSort.ts) | Uspešno; vse štiri kombinacije smeri v [dnevniku](check-final.log). |
| R06 | Izenačenja, original | A01–A05, A08 | [taskSort/original in izvorni indeks](../../src/taskSort.ts) | Uspešno; [dnevnik](check-final.log). |
| R07 | Projekcija table | D03, A07/A08 | [App/sortedTasks](../../src/App.tsx), [TaskBoard/columns in filter](../../src/TaskBoard.tsx) | Uspešno; vsi stolpci pri 390/1440 px v [dnevniku](check-final.log). |
| R08 | Ohranitev S | A07, regresije podrobnosti | [App/ProjectView](../../src/App.tsx) | Uspešno; oba pogleda in vseh 13 ID-jev v [dnevniku](check-final.log). |
| R09 | Ponastavitev S | A08 | [App/key projekta in useState](../../src/App.tsx) | Uspešno; projekti, zgodovina, reload obeh pogledov v [dnevniku](check-final.log). |
| R10 | Reset in dolžina A≤1 | D04, A06/A08/A09 | [controls/reset](../../src/TaskSortControls.tsx), [taskSort](../../src/taskSort.ts) | Uspešno; vseh 100 nastavitev čiste funkcije in UI v [dnevniku](check-final.log). |
| R11 | Brez mutacij/zapisov | D04, A01, A07–A09 | [taskSort/kopija](../../src/taskSort.ts), [App/izvorni povzetki](../../src/App.tsx) | Uspešno; zamrznjeni objekti, povzetki in zahteve v [dnevniku](check-final.log). |
| R12 | ID-ji, branje, širina | A07/A09 in 38 izhodiščnih preverjanj | [App](../../src/App.tsx), [TaskBoard](../../src/TaskBoard.tsx), [styles/sort-controls](../../src/styles.css) | Uspešno; [dnevnik](check-final.log) in štirje pregledani posnetki. |

Podrobna sledljivost z imeni testov, rezultati, posnetki in omejitvami je v
[verification.md](verification.md). Vsi navedeni uspešni izidi so iz dejanskih zagonov.

## Odprta vprašanja in omejitve

Zahteve ne potrebujejo dodatnih pojasnil. Neveljavni/manjkajoči datumi so zunaj
domene; ne uvajamo validacije ali novih API-jev. Navigacijo med nalaganjem in
sočasne zunanje spremembe preverimo v obsegu obstoječih regresij. Končni testi
niso dostopni. Delo izvede en agent, brez sprememb infrastrukture ali odvisnosti.

## Zgodovina sprememb specifikacije

- 2026-09-25, v1: začetna specifikacija pred implementacijo; rezultati še niso znani.
- 2026-09-25, v1.1: po izvedbi dopolnjene povezave na kodo, testi A01–A09 in
  dejanski uspešni izidi; popravljeno oblikovanje oznake dolžine polja v tabeli.
  Sprejemni pogoji in obseg zahtev ostajajo enaki.
