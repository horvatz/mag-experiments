# Poročanje delno razpoložljivih artefaktov

Pojasnilo poročevalske plasti, 27. september 2026, po doseženi časovni
omejitvi L/1.0:P10-C-001. Ni del prvotne zamrznitve in ne spreminja
merjenih pozivov, izvedb ali rubrike M/1.0.

Prve štiri obravnavane oddaje so imele dokumentacijo in novo kodo. Pri
P10-C-001 so po 1200 sekundah nastali procesni dokumenti, implementacija
pa se ni začela. Izvirna rubrika določa manjkajoče ocene za odsotne oddaje,
ne opredeli pa posebej predstavitve oddaje z razpoložljivo dokumentacijo
in odsotno novo kodo. Zato poročevalska plast dopušča delno presojo:

- Razpoložljivi dokumenti dobijo ocene po nespremenjenih merilih 0–2.
- Organizacija odsotne avtorske kode ostane `null` z dokazanim razlogom.
  Kakovosti začetne aplikacije ne pripišemo modelu in odsotnosti kode ne
  predstavimo kot opaženo slabo organizacijo.
- Lastna preverjanja dobijo 0, kadar jih ni, saj izvirna rubrika to izrecno
  določa. Načrtovani testi brez izvedbe niso opravljeni testi.
- Popolnoma odsotna avtorska oddaja še vedno ostane neocenljiva v vseh
  dimenzijah, kot pri zgodovinskih napakah dostopa Astre.
- Porazdelitve 0/1/2 in število manjkajočih ocen poročamo za vsako dimenzijo
  posebej. Delne presoje štejejo med obravnavane, ne med petkrat ocenjene.

Enako pravilo velja za vse nadaljnje oddaje. Izbor 24 ponovitev 001 ostane
nespremenjen. To je razkrita dopolnitev obravnave manjkajočih artefaktov,
ne dodatna lestvica kakovosti ali način izločanja funkcionalnega neuspeha.
