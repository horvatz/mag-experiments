"""Reporting-only PDF, separate from the concurrently edited thesis."""
from pathlib import Path
from collections import Counter
from datetime import datetime, timezone
from xml.sax.saxutils import escape
import hashlib, json, math
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader

study=Path(__file__).resolve().parents[2]; root=study.parent; a=study/'analysis'
read=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
c=read(a/'comparison.json'); l=read(a/'reporting-results.json'); ast=read(root/'main-study/analysis/reporting-results.json')
r=read(a/'review-verification.json'); timing=read(a/'phase-timing.json'); process=read(a/'process-summary.json')
astra_reviews=read(root/'main-study/analysis/review-distribution.json')
astra_process=read(root/'main-study/analysis/process-summary.json')
assert c['snapshots']=={'astra':ast['generatedAt'],'luna':l['generatedAt']}
assert astra_reviews['sourceGeneratedAt']==astra_process['sourceGeneratedAt']==ast['generatedAt']
assert timing['comparisonSnapshot']==c['generatedAt'] and process['sourceGeneratedAt']==l['generatedAt']
assert read(a/'figures/provenance.json')['generatedAt']==c['generatedAt']
fonts=Path('/Users/zan/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/libreoffice-headless/libreoffice/LibreOfficeDev.app/Contents/Resources/fonts/truetype')
for name,file in [('Report','DejaVuSans.ttf'),('ReportBold','DejaVuSans-Bold.ttf')]:pdfmetrics.registerFont(TTFont(name,str(fonts/file)))
pdfmetrics.registerFontFamily('Report',normal='Report',bold='ReportBold')
navy=colors.HexColor('#17324a'); teal=colors.HexColor('#176a70'); pale=colors.HexColor('#eef4f6'); gray=colors.HexColor('#526575')
styles={
 'title':ParagraphStyle('title',fontName='ReportBold',fontSize=24,leading=29,textColor=navy,spaceAfter=15),
 'h':ParagraphStyle('h',fontName='ReportBold',fontSize=16,leading=21,textColor=navy,spaceAfter=10),
 'sub':ParagraphStyle('sub',fontName='ReportBold',fontSize=10,leading=14,textColor=teal,spaceBefore=10,spaceAfter=6),
 'body':ParagraphStyle('body',fontName='Report',fontSize=9,leading=13,spaceAfter=8,textColor=navy),
 'small':ParagraphStyle('small',fontName='Report',fontSize=7.6,leading=10.7,spaceAfter=6,textColor=gray),
 'cell':ParagraphStyle('cell',fontName='Report',fontSize=7.5,leading=10,textColor=navy),
 'head':ParagraphStyle('head',fontName='ReportBold',fontSize=7.5,leading=10,textColor=colors.white),
}
def clean(s):return str(s).replace('−','-').replace('—','-').replace('–','-').replace('\u2011','-')
def p(s,style='body'):return Paragraph(escape(clean(s)),styles[style])
def num(v,d=1,factor=1):return '-' if v is None else f'{v*factor:,.{d}f}'.replace(',',' ').replace('.',',')
W=A4[0]-88
story=[]
def add(s,style='body'):story.append(p(s,style))
def table(headers,rows,widths):
 cells=[[p(x,'head') for x in headers]]+[[p(x,'cell') for x in row] for row in rows]
 t=Table(cells,colWidths=[W*x for x in widths],repeatRows=1,hAlign='LEFT')
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),navy),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,pale]),('LINEBELOW',(0,-1),(-1,-1),.4,colors.HexColor('#c3d2dc'))]))
 story.append(t);story.append(Spacer(1,9))
def page(title):story.append(PageBreak());add(title,'h')
status='ZAKLJUČENI ZBIRKI' if c['complete'] else 'VMESNI PODATKI'
add('Astra in Luna\nPrimerjava eksperimentov'.replace('\n',' - '),'title')
add(f'{status} | M/1.0: 72/72 | L/1.0: {l["archived"]}/72','sub')
add('Ločeno podatkovno gradivo za pisanje magistrske naloge. A je en agent, B razvoj s tremi vlogami, C potek Spec Kit. Vsaka zbirka načrtuje osem nalog, tri pristope in tri ponovitve; meja je 1200 sekund na pristop.')
if not c['complete']:add('Luna še ni zaključena. Trenutna sestava nalog ni uravnotežena; tabele niso končna razvrstitev pristopov.')
add('Funkcionalni izidi in čas','sub')
table(['Model / pristop','Arhivi','Strogi uspehi','12/12 zahtev','Zahteve %','Čas min'],[[f'{x["model"].title()} / {x["procedure"]}',f'{x["archived"]}/24',f'{x["strictSuccesses"]}/{x["archived"]}',f'{x["perfectRequirementSubmissions"]}/{x["archived"]}',num(x['meanDemonstratedFraction'],1,100),num(x['meanElapsedSeconds'],2,1/60)] for x in c['summaries']],[.22,.12,.16,.18,.15,.17])
add('Vsi začeti poskusi ostanejo v imenovalcih. Strogi uspeh zahteva zaključek pristopa, dovoljene spremembe in uspeh vseh preverjanj. Zahteva šteje le ob uspehu obeh velikosti zaslona. 12/12 samo po sebi ne potrdi zaključene predaje.','small')
add('Poraba samo pri popolnih zapisih','sub')
table(['Model / pristop','Popolni zapisi','Vhodni tokeni','Izhodni tokeni'],[[f'{x["model"].title()} / {x["procedure"]}',f'{x["completeUsageCount"]}/{x["archived"]}',num(x['meanInputTokensCompleteOnly'],0),num(x['meanOutputTokensCompleteOnly'],0)] for x in c['summaries']],[.26,.2,.27,.27])
add('Neznane vrednosti niso ničle. Poraba popolnih zapisov je lahko izbran podvzorec. Predpomnjeni tokeni so del vhodnih, tokeni razmišljanja del izhodnih. Tokeni niso denarni strošek.','small')
add('Astra: CLI 0.154.0; Luna: CLI 0.158.0-alpha.2.1, poznejše obdobje. Primerjava zbirk ne izolira učinka modela. Kratka napaka dostopa ni hitro rešena naloga. Povprečje časa je zadržano, če manjka katera od meritev.','small')
for name,title,note in [
 ('primerjava-zahtev','Dokazane zahteve po nalogah','Vsaka celica predstavlja eno ponovitev. Zvezdica označuje nezaključen pristop; črtica odsoten arhiv. Dejanska ničla ostane prikazana kot 0. Testi in ponovitve niso dodatne neodvisne naloge.'),
 ('primerjava-casa','Čas posameznih izvedb','Prikaz vključuje tudi neuspešne poskuse in časovne prekinitve. Pri Astri manjka točen čas P06-C-001; točka je izpuščena. Meja 20 minut velja za celoten modelski pristop.'),
 ('primerjava-porabe','Poraba pri popolnih zapisih','Manjkajoča celotna poraba ni nič. Opažene spodnje meje prekinjenih sej so ločeno v podatkovnem izvozu in niso vključene med popolne zapise.')]:
 page(title); img=Image(str(a/'figures'/f'{name}.png')); scale=min(W/img.imageWidth,610/img.imageHeight); img.drawWidth=img.imageWidth*scale;img.drawHeight=img.imageHeight*scale;story.append(img);story.append(Spacer(1,12));add(note)
page('Potek, predaje in popravki')
add('Naknadni opis priprave pri C','sub')
add('Po 29 arhivih Lune smo dodali opis zabeleženih faz. Za vsako izvedbo seštejemo constitution, specify, plan in tasks, tudi ob prekinjeni pripravi. Nezačete faze niso izmerjene ničle. Mediana znanih vsot ni čas uspešne rešitve.')
table(['Model','Arhivi C','Znane vsote','Mediana min','Implement začet','Converge začet'],[[x['model'].title(),x['count'],f'{x["known"]}/{x["count"]}',num(x['medianKnownSeconds'],2,1/60),f'{x["implementationStarted"]}/{x["count"]}',f'{x["convergenceStarted"]}/{x["count"]}'] for x in timing['preparationSummary']],[.16,.12,.17,.18,.19,.18])
add('B: formalni pregled in povratni koraki','sub')
table(['Mera','Astra','Luna'],[[label]+[str(data['B'][key]) for data in [astra_process,process]] for label,key in [
 ('Arhivirane oddaje B','archived'),('Pregledi začeti','reviewsStarted'),('Potrjene predaje pregleda','validatedReviews'),('Brez potrjene predaje','withoutValidatedReview'),('Zahtevan popravek specifikacije','runsRequestingSpecificationRepair'),('Zahtevan popravek kode ali testov','runsRequestingCodeRepair'),('Popravki specifikacije začeti','specificationRepairsStarted'),('Popravki specifikacije zaključeni','specificationRepairsCompleted'),('Povratne implementacije začete','implementationRepairsStarted'),('Povratne implementacije zaključene','implementationRepairsCompleted')]], [.64,.18,.18])
add('C: konvergenca in dodatna implementacija','sub')
table(['Mera','Astra','Luna'],[[label]+[str(data['C'][key]) for data in [astra_process,process]] for label,key in [
 ('Arhivirane oddaje C','archived'),('Konvergence začete','convergencePassesStarted'),('Potrjene predaje konvergence','validatedConvergencePasses'),('Brez potrjene konvergence','withoutValidatedConvergence'),('Dodatne implementacije začete','additionalImplementationStarted'),('Dodatne implementacije zaključene','additionalImplementationCompleted')]], [.64,.18,.18])
add('Zahteva za popravek ni potrjena funkcionalna napaka. Popravki znotraj iste faze niso povratni koraki. Nepotrjena predaja ne pomeni pregleda brez napak.','small')
page('Vsebinske presoje: Astra in Luna')
add('V obeh zbirkah je vnaprej izbrana ponovitev 001 vseh osmih nalog pri A/B/C. Ocene 0, 1 in 2 so ordinalne; tabeli prikazujeta število ocen po vsaki dimenziji. Presoje so AI-podprte in neslepe, brez izmerjenega človeškega soglasja.')
labels=['Pokritost specifikacije','Predikati in invariante','Sledljivost','Organizacija kode','Lastna preverjanja']
add('Astra: vseh 24 presoj obravnavanih','sub')
add('V celoti ocenjenih '+str(sum(g['rated'] for g in astra_reviews['groups']))+', neocenljivih '+str(sum(g['unavailable'] for g in astra_reviews['groups']))+'.')
table(['Dimenzija','A: 0 / 1 / 2','B: 0 / 1 / 2','C: 0 / 1 / 2'],[[label]+[' / '.join(map(str,g['dimensions'][i]['counts'])) for g in astra_reviews['groups']] for i,label in enumerate(labels)],[.4,.2,.2,.2])
add('Manjkajoče ocene v vsaki dimenziji, A/B/C: '+'/'.join(str(g['unavailable']) for g in astra_reviews['groups'])+'. Odsotne avtorske oddaje niso ocenjene kot nič.','small')
add(f'Vnaprej izbrani vzorec Lune: {r["reviewResolved"]}/24 obravnavanih','sub')
add(f'V celoti ocenjenih {r["rated"]}, delno ocenjenih {r["partial"]}, neocenljivih {r["unavailable"]}; še {r["pending"]} presoj.')
table(['Dimenzija','A: 0 / 1 / 2','B: 0 / 1 / 2','C: 0 / 1 / 2'],[[label]+[' / '.join(map(str,g['dimensions'][i]['counts'])) for g in r['groups']] for i,label in enumerate(labels)],[.4,.2,.2,.2])
add('Dimenzij ne seštevamo. Manjkajoče ocene in še neobravnavane oddaje niso ničle. Pri odsotni avtorski kodi je organizacija kode neocenjena; odsotna lastna preverjanja imajo po rubriki 0. Razločitev delne presoje je razkrit poročevalski dodatek.','small')
add('Manjkajoče med že obravnavanimi, A/B/C: '+ '; '.join(label+': '+'/'.join(str(g['dimensions'][i]['missing']) for g in r['groups']) for i,label in enumerate(labels))+'.','small')
if c['complete']:
 for title,include in [
  ('Opisne razlike znotraj Astre',lambda x:x['label'].startswith('astra,')),
  ('Opisne razlike znotraj Lune',lambda x:x['label'].startswith('luna,')),
  ('Zgodovinske razlike med zbirkama',lambda x:x['label'].startswith('Luna − Astra')),
  ('Razlike razlik med pristopi',lambda x:x['label'].startswith('(Luna'))]:
  page(title)
  add('Opisni 95-odstotni percentilni intervali iz 20.000 ponovnih vzorcev osmih nalog. Najprej so povprečene tri ponovitve pri isti nalogi in pristopu. Pozitivna vrednost pomeni višji rezultat prvega člena; pri času daljše trajanje.')
  values=[]
  for x in filter(include,c['contrasts']):
   fraction=x['metric']!='elapsedSeconds';metric={'elapsedSeconds':'Čas (min)','demonstratedFraction':'Zahteve (o. t.)','strictSuccessFraction':'Strogi uspeh (o. t.)'}[x['metric']]
   values.append([x['label'].replace('luna, ','').replace('astra, ','').replace('Luna − Astra, ','').replace('(Luna ','(L ').replace('(Astra ','(A '),metric,num(x['meanDifference'],2,100 if fraction else 1/60),num(x['lower'],2,100 if fraction else 1/60),num(x['upper'],2,100 if fraction else 1/60)])
  table(['Primerjava','Mera','Razlika','Spodaj','Zgoraj'],values,[.3,.25,.15,.15,.15])
  withheld=list(filter(include,c['withheld']))
  if withheld:add('Zadržano zaradi manjkajočega časa: '+ '; '.join(x['label'] for x in withheld)+'.')
  add('O. t. so odstotne točke. Interval z ničlo ne potrjuje enakovrednosti. Osem sorodnih nalog je namenski vzorec. Več kontrastov ni zbirka potrditvenih hipotez. Razlike zbirk vključujejo model, CLI in obdobje.','small')
non=[x for x in l['data'] if not x['strictSuccess']]
# Balanced explicit pages keep the explanatory note with the table and avoid
# a nearly empty spill page as the number of archived submissions grows.
failure_pages=max(1,math.ceil(len(non)/24))
failure_chunk=max(1,math.ceil(len(non)/failure_pages))
for index in range(failure_pages):
 page('Oddaje Lune brez strogega uspeha'+(f' ({index+1}/{failure_pages})' if failure_pages>1 else ''))
 if index==0:
  add(f'{len(non)} od {l["archived"]} arhiviranih oddaj nima strogega uspeha. Tabela loči status izvedbe od dejansko dokazanih zahtev in neodvisnih testov. Izidov ne popravljamo in začetih meritev ne ponavljamo.')
 selected=non[index*failure_chunk:(index+1)*failure_chunk]
 table(['ID','Status','Zahteve','Testi'],[[x['id'],x['executionStatus'].replace('_',' '),f'{x["score"]["passed"]}/12',f'{sum(g["passed"] for g in x["groups"].values())}/{sum(g["total"] for g in x["groups"].values())}'] for x in selected],[.23,.43,.17,.17])
 if index==failure_pages-1:
  add('Celotni popis vsebuje neuspešne kontrole, točne testne izide in dokazne poti. Status časovne omejitve sam ne pove, ali je bila oddana implementacija pravilna.','small')
page('Viri in uporaba pri pisanju')
add('Številčni vir je comparison.json, za Luno reporting-results.json. Izvirne oddaje, izvedbeni dogodki in neodvisne ocene so v luna-study/runtime/runs/<ID>/. Enak lokalni ID v M/1.0 in L/1.0 pomeni dve različni meritvi.')
for title,text in [
 ('Sledljivost','evidence-map.md povezuje naloge, arhive in presoje. archive-verification.json preveri inventarje, modele, izvajalnik, časovno mejo in izvor ocenjevanja.'),
 ('Vsebinska presoja','content-review.md in reviews/<ID>.json vsebujeta utemeljitve. review-verification.json preveri izbor, hashe in dokazne povezave. Formalni vzorec so samo ponovitve 001.'),
 ('Proces in razvoj','process-summary.json beleži formalne predaje, phase-timing.json znane čase faz. development-cases.md vsebuje označene naknadne ilustracije; ne dokazujejo pogostosti ali vzročne prednosti pristopa.'),
 ('Manjkajoči podatki','Vsi začeti poskusi ostanejo v primarni primerjavi. Napake dostopa Astre niso napake njene kode. Analiza samo zaključenih pristopov je opis izbranega podvzorca, ne nadomestna glavna analiza.'),
 ('Obseg zaključka','70/70 pomeni uspeh na zamrznjenem naboru, ne pravilnosti vseh možnih vhodov. Pristopi se razlikujejo v vlogah, predajah, dokumentih in razporejanju časa; rezultat ne izolira posamezne sestavine.'),
 ('Ločeno od magistrske','Ta PDF je podatkovno gradivo. Poglavja magistrske v naloga/latex/chapters ureja avtor v ločenem poteku. Številčni LaTeX vložek se osvežuje v naloga/latex/generated/luna-comparison.tex.')]:
 add(title,'sub');add(text)
add('Podatkovni posnetek: '+c['generatedAt'],'small')
add('Astra: '+c['snapshots']['astra']+'; Luna: '+str(c['snapshots']['luna']),'small')
add('Končna celovitost zahteva vseh 72 arhivov Lune, 24 obravnavanih presoj, vizualni pregled artefaktov in uspešen final-verification.json. Izdelan PDF sam ne potrjuje teh pogojev.','small')
output=root/'outputs/01a0c0dd-8558-70e1-8ed7-03605027f3bd/astra-luna-comparison.pdf';output.parent.mkdir(parents=True,exist_ok=True)
def footer(canv,doc):
 canv.saveState();canv.setStrokeColor(colors.HexColor('#c3d2dc'));canv.line(44,40,A4[0]-44,40);canv.setFont('Report',7);canv.setFillColor(gray);canv.drawString(44,27,f'Astra / Luna | {status} | {l["archived"]}/72 Luna');canv.drawRightString(A4[0]-44,27,str(doc.page));canv.restoreState()
SimpleDocTemplate(str(output),pagesize=A4,leftMargin=44,rightMargin=44,topMargin=42,bottomMargin=53,title='Astra in Luna - primerjava eksperimentov',author='Raziskovalno gradivo magistrske naloge').build(story,onFirstPage=footer,onLaterPages=footer)
pages=PdfReader(output).pages
assert len(pages)>=7 and all(page.extract_text().strip() for page in pages)
receipt={'generatedAt':datetime.now(timezone.utc).isoformat(),'comparisonSnapshot':c['generatedAt'],'archived':c['archived'],'complete':c['complete'],'pdf':str(output),'sha256':sha(output),'pages':len(pages),'sources':{str(x.relative_to(root)):sha(x) for x in [a/'comparison.json',a/'reporting-results.json',a/'review-verification.json',a/'phase-timing.json',a/'process-summary.json',a/'figures/provenance.json',root/'main-study/analysis/review-distribution.json',root/'main-study/analysis/process-summary.json']},'visuallyReviewed':False}
(a/'pdf-verification.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
