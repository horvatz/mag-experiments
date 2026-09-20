# P01 — obstoječa pogodba API in vmesnika

Vir: shared/types.ts, src/api.ts, server/http.ts in server/store.ts. Dokument opisuje
pripravljeno storitev, brez sprememb strežnika.

| Metoda in pot | Uspešen odgovor | Namen |
| --- | --- | --- |
| GET /api/projects | 200 Project[] | projekti |
| GET /api/projects/:projectId/tasks | 200 Task[] | seznam projekta |
| GET /api/tasks/:id | 200 Task | podrobnosti |
| PATCH /api/tasks/:id | 200 Task | skupni zapis naslova in stanja |

PATCH uporablja Content-Type: application/json, telo z natanko title (string) in
status (todo/in_progress/done). Oba sta obvezna; dodatna polja so zavrnjena. Odjemalec
uporabi updateTask s kodiranjem id v poti. Odgovor je celoten shranjeni Task; druga
polja in drugi zapisi se ne spremenijo.

Napaka ima obliko { message: string }. Obstoječi odgovori: 400 neveljaven vnos,
404 neznan id, 415 napačna vrsta vsebine, 503 zavrnjeno shranjevanje. Odjemalec
ob zavrnitvi ohrani osnutek. Normalizacija odstranjuje le štiri dogovorjene znake.
Podatki preživijo osvežitev brskalnika; obstojnost prek zagona strežnika ni zahtevana.

## Uporabniški vmesnik

Naslov je besedilno polje, Stanje select; gumbi Uredi, Shrani in Prekliči.
Napaka polja uporablja aria-invalid=true in aria-describedby na sporočilo;
napake role=alert, čakanje role=status. Med čakanjem so obe polji in zaključna
gumba disabled. Ohranimo data-task-id, imena stolpcev in oznako Pregled stanj opravil.
Folio in vidni fokus ostaneta; ob zaključku se zapre obrazec, podrobnosti ostanejo.

## Samo testni program

POST /__test/reset ponastavi stanje. POST /__test/next-save z mode success/reject/hold
nastavi naslednji odziv; POST /__test/release z outcome success/reject sprosti zahtevo.
GET /__test/state vrne tasks, saveRequests, pending, nextMode. Uporabljajo se izključno
iz testnega programa Playwright request, nikoli iz src/.
