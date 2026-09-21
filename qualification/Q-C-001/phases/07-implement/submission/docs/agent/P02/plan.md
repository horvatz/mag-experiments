# Načrt tehnične kvalifikacije Q

- **Kontekst:** TypeScript v obstoječem projektu; brez novih odvisnosti ali infrastrukture.
- **Funkcija:** V `src/qualification.ts` izvoziti `shift(values: readonly number[]): number[]`. Z `map` povečati vsako vrednost za 1; ohraniti vrstni red in vhod ter vrniti novo polje tudi za prazen vhod (R01/R02).
- **Javni test:** Po implementaciji zagnati samo `node task/qualification-check.mjs`; pričakovati uspešen izhod za R01/R02. Brez sprememb testa, gradnje ali brskalnika.
