# P08 Projektna Ustava

**Sprejeta:** 2026-10-13

## Projektno ime
P08: Koledarski pregled rokov (Schedule View)

## Vodenje principov
- Uporabniški vmesnik mora ohraniti potrjeni Folio dizajn iz `docs/dizajn.md`
- Jezik in poimenovanja ostajajo v slovenskem jeziku
- API-interaktivnost se izvaja samo preko `/api/` endpointov
- Testi lahko vrnejo poljubno število opravil; uporabniški vmesnik ne sme brati testnih kontrol `/__test/`
- Podatki se ne hranijo v `localStorage`; stanja so lokalna trenutnemu projektu

## Nepremična pravila
- Spremembe so omejene na `src/`, `tests/agent/`, in `docs/agent/`
- Začetne podatke, strežnik v `server/`, skupne tipe v `shared/` ne spreminjaj
- Ne ustvarjaj novih zapisovalnih API-jev; uporablja obstoječi `/api/`
- Ne spreminjaj skupnih odvisnosti ali konfiguracije
- Ne shranjuj ali hrani filtriranih stanj v trajni shrambi ali URL parametroh


## Projektna pravila
- Učinkovitost pred popolnostjo; vsaka sprememba mora služiti končnemu vidiku
- Ohranjanje doslednega stila kode in dokumentacije skozi vse obdobje naloge
- Vse spremembe morajo biti združljive z obstoječo arhitekturo in logiko

## Nepremagljiva načela
- Ne dodajamo odvisnosti ali funkcionalnosti, ki so izrecno zahtevane
- Testi so osnova za validacijo; brez testa ni prihodka
- Vsako odstopanje od definiranega območja zahteva izrecno odobritev

## Omejitve območja
-  je edini prostor za specifično dokumentacijo te naloge
- Koda se ne širi izven , ,  in procesnih datotek
- Končni podatki so v API-ju, ne v lokalnem stanju aplikacije

## Zgodovinska referenca
Ta ustava nastane kot jedro za vodenje projekta P08 in ohranjajo konsistentnost skozi vse faze razvoja.


## Projektna pravila
- Učinkovitost pred popolnostjo; vsaka sprememba mora služiti končnemu vidiku
- Ohranjanje doslednega stila kode in dokumentacije skozi vse obdobje naloge
- Vse spremembe morajo biti združljive z obstoječo arhitekturo in logiko

## Nepremagljiva načela
- Ne dodajamo odvisnosti ali funkcionalnosti, ki so izrecno zahtevane
- Testi so osnova za validacijo; brez testa ni prihodka
- Vsako odstopanje od definiranega območja zahteva izrecno odobritev

## Omejitve območja
- `docs/agent/P08/` je edini prostor za specifično dokumentacijo te naloge
- Koda se ne širi izven dovoljenih map
- Končni podatki so v API-ju, ne v lokalnem stanju aplikacije

## Zgodovinska referenca
Ta ustava nastane kot jedro za vodenje projekta P08.
