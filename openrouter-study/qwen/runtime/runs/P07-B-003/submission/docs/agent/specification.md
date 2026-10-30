# Specifikacija: Priljubljena opravila (P07)

## Problem in kontekst

Uporabniki zelijo oznaciti specifična opravila (Task ID) kot priljubljena znotraj projekta. Obenem zelijo možnost filtriranja prikaza zgolj na priljubljena opravila. Funkcionalnost je lokalna, brez API zapisov, in ostaja ohranjena prek menjave projekta in osvežitve strani.

## Vhodi, dejanja in izidi

### Podatkovni tipi (shared/types.ts)
- Task { id: string, projectId: string, title: string, ... }
- Project { id: string, name: string }

### Shramba
- Kljuc: folio:favorites:v1
- Format: { version: 1, ids: string[] }
- ids: enkratni, UTF-16 razvrsceni.

### Vmesni elementi
- Gumb aria-label="Priljubljeno opravilo <id>" z aria-pressed.
- Checkbox aria-label="Prikaži le priljubljena".
- Gumb aria-label="Odstrani priljubljene tega projekta".
- role="status" z aria-label="Priljubljeno: X od M.".
- role="alert" za napake shrambe.

## Zahteve in pravila

| Zahteva | Pravilo | Naican preverjanja |
| --- | --- | --- |
| R01 | Gumb preklopi stanje samo za ta ID. | Gumb aria-pressed. |
| R02 | LocalStorage kljuc folio:favorites:v1, JSON z {version:1,ids:string[]}. | JSON zapis. |
| R03 | Shramba obnovi ID-je; podvojeni so enkratni. | Shramba. |
| R04 | Napake branja => prazna mnozica; shramba ne spremeni statusa. | UI. |
| R05 | Checkbox privzeto false. | Dialog. |
| R06 | Filter na priljubljene ali Ni priljubljenih opravil. | Prikaz. |
| R07 | Preglednica/table isto mnozico/filter. | UI. |
| R08 | Menjava projekta resetira filter, ohrani shrambo. | Menjava. |
| R09 | Gumb odstrani samo ID-je trenutnega projekta. | Model. |
| R10 | Steti Priljubljeno: X od M.: X=vseh priljubljenih v projektu. | UI. |
| R11 | Storage event za kljuc ustvari/odstrani ID-je; napake v role=alert. | Storage event. |
| R12 | Ni API zapisov, ni sprememb polj Taska. | API/UI. |

## Odprta vprasanja in omejitve
- API predpostavljamo po shared/types.ts.
- Nastavitve UI razporeditve niso predpisane.
- Testi /__test/ ne uporabljajo UI.
