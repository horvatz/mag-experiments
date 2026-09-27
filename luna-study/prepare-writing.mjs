// Reporting only: reads archived results, never changes measured inputs or submissions.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const study = dirname(fileURLToPath(import.meta.url)), output = resolve(study, '../../naloga/latex/generirano')
const read = p => JSON.parse(readFileSync(p))
const c = read(resolve(study, 'analysis/comparison.json'))
const lunaFile = resolve(study, 'analysis/reporting-results.json')
const luna = existsSync(lunaFile) ? read(lunaFile) : { archived: 0, generatedAt: null, data: [] }
const astra = read(resolve(study, '../main-study/analysis/reporting-results.json'))
assert.deepEqual(c.snapshots, { astra: astra.generatedAt, luna: luna.generatedAt })
const tex = s => String(s).replace(/[&%$#_{}]/g, x => '\\' + x).replaceAll('−', '--')
const n = (v, digits = 1, factor = 1) => Number.isFinite(v) ? (v*factor).toFixed(digits).replace('.', '{,}') : '---'
const rows = c.summaries
const lines = [String.raw`% Generated from luna-study/analysis/comparison.json; do not edit numerical values by hand.`,
`Podatkovni posnetek ${tex(c.generatedAt.slice(0,19).replace('T',' '))} UTC vsebuje ${luna.archived} od 72 načrtovanih arhivov L/1.0 ter vseh 72 arhivov M/1.0.`,
c.complete ? 'Obe zbirki sta zaključeni. Vsi začeti poskusi ostanejo v imenovalcih.' : String.raw`\textbf{Dodatna zbirka še ni zaključena.} Spodnje vrednosti so vmesni opis; ne predstavljajo končne primerjave ali razvrstitve postopkov.`,
String.raw`Neznana vrednost je označena s črtico. Kratek neuspešen poskus dostopa ni čas uspešne rešitve. Če manjka točen čas katerega od arhiviranih poskusov v skupini, njeno povprečje zadržimo.`, '',
String.raw`\begin{table}[htbp]
\centering\small
\caption{Primerjava funkcionalnih izidov in časa po zbirkah.}
\label{tab:luna-izidi}
\begin{tabular}{@{}llrrrr@{}}
\toprule
Model & Postopek & Arhivi & Strogi uspehi & Zahteve (\%) & Čas (min) \\
\midrule`,
...rows.map(r => `${r.model === 'astra' ? 'Astra' : 'Luna'} & ${r.procedure} & ${r.archived}/24 & ${r.archived ? `${r.strictSuccesses}/${r.archived}` : '---'} & ${n(r.meanDemonstratedFraction, 1, 100)} & ${n(r.meanElapsedSeconds, 2, 1/60)} \\\\`),
String.raw`\bottomrule\end{tabular}
\par\smallskip\parbox{0.95\textwidth}{\footnotesize Delež zahtev vključuje vse arhivirane poskuse. Strogi uspeh zahteva zaključen postopek, dovoljene spremembe in uspeh vseh preverjanj. Število arhivov ni število uspešnih rešitev.}
\end{table}`, '',
String.raw`\begin{table}[htbp]
\centering\small
\caption{Poraba tokenov v podmnožici s popolnim zapisom.}
\label{tab:luna-poraba}
\begin{tabular}{@{}llrrr@{}}
\toprule
Model & Postopek & Popolni zapisi & Vhodni tokeni & Izhodni tokeni \\
\midrule`,
...rows.map(r => `${r.model === 'astra' ? 'Astra' : 'Luna'} & ${r.procedure} & ${r.completeUsageCount}/${r.archived} & ${n(r.meanInputTokensCompleteOnly,0)} & ${n(r.meanOutputTokensCompleteOnly,0)} \\\\`),
String.raw`\bottomrule\end{tabular}
\par\smallskip\parbox{0.95\textwidth}{\footnotesize Povprečji sta izračunani samo iz popolnih zapisov; izbor je lahko povezan z izidom. Vhod vključuje predpomnjene tokene, izhod vključuje tokene razmišljanja. Neznana poraba ni nič in se ne pretvarja v denarni strošek.}
\end{table}`, '',
String.raw`\paragraph{Omejitev zgodovinske primerjave.}
Astra je bila merjena s CLI 0.154.0, Luna z 0.158.0-alpha.2.1 v poznejšem obdobju. Medzbirčne razlike opisujejo model skupaj z okoljem in obdobjem; ne izolirajo učinka samega modela.`, '']
if (c.complete) {
  const groups = [
    ['luna', 'Razlike med postopki znotraj Lune.', x => x.label.startsWith('luna,')],
    ['model', 'Zgodovinske razlike Luna minus Astra pri istem postopku.', x => x.label.startsWith('Luna − Astra')],
    ['interakcija', 'Razlike razlik med postopki v obeh zbirkah.', x => x.label.startsWith('(Luna')],
  ]
  for (const [key, caption, include] of groups) {
    lines.push(String.raw`\begin{table}[htbp]\centering\small`, `\\caption{${caption}}\\label{tab:luna-${key}}`, String.raw`\begin{tabular}{@{}llrrr@{}}\toprule
Primerjava & Mera & Razlika & Spodnja meja & Zgornja meja \\
\midrule`)
    for (const row of c.contrasts.filter(include)) {
      const label = tex(row.label.replace('luna, ', '').replace('Luna − Astra, ', '').replaceAll('(Luna ', '(L ').replaceAll('(Astra ', '(A '))
      const fraction = row.metric !== 'elapsedSeconds'
      const metric = row.metric === 'demonstratedFraction' ? 'Zahteve (o. t.)' : row.metric === 'strictSuccessFraction' ? 'Strogi uspeh (o. t.)' : 'Čas (min)'
      lines.push(`${label} & ${metric} & ${n(row.meanDifference,2,fraction ? 100 : 1/60)} & ${n(row.lower,2,fraction ? 100 : 1/60)} & ${n(row.upper,2,fraction ? 100 : 1/60)} \\\\`)
    }
    lines.push(String.raw`\bottomrule\end{tabular}
\par\smallskip\parbox{0.95\textwidth}{\footnotesize O. t.: odstotne točke. Opisni 95-odstotni percentilni intervali iz 20.000 ponovnih vzorcev osmih nalog. Najprej so povprečene tri ponovitve pri isti nalogi in postopku.}
\end{table}`)
  }
  if (c.withheld.length) lines.push('Zaradi manjkajočih točnih časov so zadržane primerjave: ' + c.withheld.filter(x => !x.label.startsWith('astra,')).map(x => tex(x.label)).join('; ') + '.')
  lines.push('Ničelna razlika ali interval z ničlo ne potrjujeta enakovrednosti. Vzorec obsega osem sorodnih, namensko izbranih nalog. Izidi samo zaključenih postopkov so ločen opis izbranega podvzorca in ne nadomeščajo glavnih izidov.')
}
const unfinished = luna.data.filter(r => r.executionStatus !== 'completed')
if (unfinished.length) {
 lines.push(String.raw`\paragraph{Nezaključeni postopki v zbirki L/1.0.}`, `Med arhivi je ${unfinished.length} nezaključenih postopkov. Ti ostanejo v glavnih imenovalcih. Uspeh funkcionalnih preverjanj ne nadomesti zaključka postopka in predaje.`)
 for (const status of [...new Set(unfinished.map(r => r.executionStatus))]) {
  const subset = unfinished.filter(r=>r.executionStatus===status)
  lines.push(`Status \\texttt{${tex(status)}}: ${subset.map(r=>tex(r.id)).join(', ')}. Popolno funkcionalno pokritje 12/12 zahtev ima ${subset.filter(r=>r.score.passed===12).length} od ${subset.length} teh oddaj.`)
 }
 if (unfinished.some(r=>r.id==='P05-C-001')) lines.push(String.raw`Pri P05--C--001 se je implementacijska faza ustavila ob svoji časovni meji. Dogodki potrdijo končni razvojni zagon 51/51, neodvisna ocena pa 70/70 in 12/12. Vendar je predaja ostala nedokončana in korak konvergence ni bil izveden. Zato nima strogega uspeha; njegova celotna poraba ostane neznana, opažena delna poraba pa je ločena spodnja meja.`)
}
const reviewsFile = resolve(study, 'analysis/review-verification.json')
if (existsSync(reviewsFile)) {
 const r = read(reviewsFile)
 const labels = ['Pokritost specifikacije', 'Predikati in invariante', 'Sledljivost', 'Organizacija kode', 'Lastna preverjanja']
 lines.push(String.raw`\paragraph{Vsebinska presoja dodatne zbirke.}`, `Obravnavanih je ${r.reviewResolved} od 24 vnaprej izbranih oddaj: ${r.rated} jih ima vsebinske ocene, ${r.unavailable} jih ni mogoče oceniti, ${r.pending} pa jih še čaka na obravnavo. Presoja je AI-podprta in neslepa. Neodvisna človeška presoja in soglasje med ocenjevalci nista izmerjena. Utemeljitve ter dokazne povezave so v spremljajoči datoteki \\texttt{luna-study/analysis/content-review.md}.`,
 String.raw`\begin{table}[htbp]\centering\small
\caption{Porazdelitev vsebinskih ocen v zbirki L/1.0.}\label{tab:luna-presoja}
\begin{tabular}{@{}lrrr@{}}\toprule
Dimenzija & A & B & C \\
\midrule`,
 ...labels.map((label,index) => `${label} & ${r.groups.map(g=>g.dimensions[index].counts.join(' / ')).join(' & ')} \\\\`),
 String.raw`\bottomrule\end{tabular}
\par\smallskip\parbox{0.95\textwidth}{\footnotesize Trojica pomeni število ocen 0 / 1 / 2. Manjkajoče in še neobravnavane ocene niso ničle. Dimenzij ne seštevamo v skupno oceno.}
\end{table}`)
}
for (const [file, caption, label] of [
['primerjava-zahtev','Dokazane zahteve v zbirkah Astra in Luna; vsaka celica je ena ponovitev.','zahteve'],
['primerjava-casa','Modelski čas posameznih izvedb obeh zbirk. Nepopolni postopki imajo posebno oznako; neznani časi niso narisani.','cas'],
['primerjava-porabe','Posamezne meritve s popolnim zapisom porabe; imenovalci so navedeni na sliki.','tokeni'],
]) lines.push(String.raw`\begin{figure}[p]\centering`, `\\includegraphics[width=\\textwidth,height=0.76\\textheight,keepaspectratio]{../../experiments/luna-study/analysis/figures/${file}.png}`, `\\caption{${caption}}\\label{fig:luna-${label}}`, String.raw`\end{figure}`)
mkdirSync(output, {recursive:true})
writeFileSync(resolve(output,'luna-primerjava.tex'), lines.join('\n')+'\n')
writeFileSync(resolve(study,'analysis/writing-snapshot.json'), JSON.stringify({ generatedAt:new Date().toISOString(), comparisonSnapshot:c.generatedAt, snapshots:c.snapshots, archived:luna.archived, complete:c.complete, reviewVerificationSha256:existsSync(reviewsFile) ? createHash('sha256').update(readFileSync(reviewsFile)).digest('hex') : null, file:resolve(output,'luna-primerjava.tex') },null,2)+'\n')
console.log(JSON.stringify({luna:luna.archived,complete:c.complete,output}))
