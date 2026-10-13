# Specifikacija: Lokalni vrstni red z razveljavitvami (P10)

## Problem in kontekst
Aplikacija **Folio** omogoča upravljanje opravil v posebnem vrstnem redu. Vzpostavi se
funkcionalnost za manipulacijo z globalnim vrstnim redom opravil z možnostjo razveljavitve
in ponavljanja sprememb. Uporabniki lahko premikajo opravila gor ali dol, sistem pa
zabeleži zgodovino vseh sprememb omogočajoč pretekli korake.

### Začetno stanje
Pri začetku je vrstni red opravil enak prejetemu polju z API-ja. Vsako opravilo ima
prikazano globalno mesto (1–N) po svojem ID-ju. Enaki naslovi ne povezajo opravil med seboj.

### Začetno delovanje
Uporabnik ob začetku vidi opravila v prvotnem vrstnem redu. Premikanje opravila
sprememi le lokalno permutacijo; ne vpliva na polja ali zapiše na API.

### Zadnje stanje
Vsak veljaven premik obneša zadnjo permutacijo in je mogoče razveljaviti. Sistem
omeji na največ 20 prejšnjih permutacij; starejše se avtomatsko zavrnejo.

