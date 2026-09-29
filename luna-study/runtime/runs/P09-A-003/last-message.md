P09 je implementiran: filtri so del hash povezave, osnutek se potrdi z enim dejanjem, navigacija in zgodovina ohranita potrjeno stanje, ponastavitev pa ohrani izbrani način pogleda. Dodani so tudi prazni rezultati, števec in odzivne kontrole. Specifikacija je v [specification.md](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P09-A-003/app/docs/agent/specification.md), sledljivost in preverjanja pa v [verification.md](/Users/zan/Documents/mag/experiments/luna-study/runtime/.work/pilots/P09-A-003/app/docs/agent/verification.md).

Končni `npm run check` je uspel: **53/53 preverjanj**. Tudi agentni testi so po zadnjih spremembah uspeli: **7/7**.

Neizpolnjenih zahtev ni. Omejitev preverjanja: uporabljeni so bili konfigurirani namizni in mobilni profili Chromium; razvrščanje naslovov s supplementary-plane znaki ni bilo posebej preizkušeno.
