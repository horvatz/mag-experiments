# P01 — lokalna raziskava

Datum: 2026-09-20. Pregledal isti agent, brez interneta ali drugih agentov.

## Shranjevanje

**Decision**: uporabiti obstoječi src/api.ts updateTask(id, { title, status }).
**Rationale**: shared/types.ts že določa TaskUpdate; server/http.ts in server/store.ts
zagotavljata PATCH, atomaren zapis, odgovor Task in zavrnitev brez sprememb.
**Alternatives considered**: nov endpoint ali lokalna shramba kršita omejitve;
nov odjemalec bi podvojil obstoječi helper.

## Prikazi

**Decision**: odgovor Task po uspehu prenesti v podrobnosti in seznam prek onSaved;
useResource razširiti s posodobitvijo trenutnih podatkov.
**Rationale**: App.tsx iz seznama računa števce in napaja TaskBoard; podrobnosti imajo
svoj vir. Posodobitev obeh zagotovi skladnost. Nenaložen seznam se ponovno pridobi.
**Alternatives considered**: samo ponovni GET dodaja čakanje in možno napako po
uspešnem zapisu; globalna knjižnica za stanje ni potrebna.

## Osnutek in naslov

**Decision**: ločen osnutek, normalizacija samo U+0020/U+0009/U+000A/U+000D na robovih,
textarea z oznako Naslov in select Stanje.
**Rationale**: R02 prepoveduje predčasen zapis; R03 ohrani notranje in druge znake.
trim() bi odstranil tudi U+00A0; input type=text odstranjuje prelome že v brskalniku.
**Alternatives considered**: neposredno spreminjanje Task in širše odstranjevanje
belih znakov kršita zahteve. Textarea ostaja dogovorjeno besedilno polje.

## Oddaja

**Decision**: saving za izris in sinhrona ref zapora; ločeni napaki naslova in shranjevanja.
**Rationale**: onemogočene kontrole in ref preprečijo hitro ponovno oddajo. Zavrnitev
ohrani osnutek in omogoči ponovitev; čakanje ima role=status, napake role=alert.
**Alternatives considered**: optimistični zapis krši R02/R08; nov obrazčni paket ni potreben.

## Preverjanje in videz

**Decision**: ohraniti sloge iz docs/dizajn.md in src/styles.css; skupne teste dopolniti
z tests/agent/P01.spec.ts.
**Rationale**: razvojni D01–D04 pokrivajo odprtje, osnovni uspeh, preklic in praznino,
ne pa celotnih R01–R10. Obstoječi projekt agent že odkriva dodatne teste.
**Alternatives considered**: spremembe konfiguracije ali skupnih testov niso dovoljene.

Vse neznanke razrešene iz lokalnih virov. Ni novih zahtev ali odvisnosti.
