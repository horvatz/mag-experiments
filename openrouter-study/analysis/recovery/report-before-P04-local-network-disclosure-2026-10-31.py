"""Reporting only; reads archived measurements and separately authored reviews."""
import argparse
import gzip
import json
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from xml.sax.saxutils import escape

import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.ticker import PercentFormatter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak

HERE = Path(__file__).resolve().parent
STUDY = HERE.parent.parent
ROOT = STUDY.parent
OUTPUT = ROOT / 'outputs/01a10e33-388d-7fb1-b33e-a32a923bff0b'
QA = HERE / 'qa'
SLUGS = ['astra', 'luna', 'glm', 'deepseek', 'qwen']
LABELS = dict(zip(SLUGS, ['GPT Astra', 'GPT Luna', 'GLM-5.3', 'DeepSeek V4.1 Flash', 'Qwen3.5-9B']))
DIMENSIONS = ['specificationCoverage', 'predicatesInvariants', 'traceability', 'codeOrganization', 'ownChecks']
DIM_LABELS = ['Pokritost', 'Predikati', 'Sledljivost', 'Koda', 'Preverjanja']
COLORS = ['#334B75', '#7D9BBD', '#B8814E']

def load(path):
    return json.loads(path.read_text())

def number(value, digits=2):
    if value is not None and abs(value) < .5 * 10**(-digits):
        value = 0
    if value is None:
        return 'manjka'
    rounded = Decimal(str(value)).quantize(Decimal(1).scaleb(-digits), rounding=ROUND_HALF_UP)
    return f'{rounded:.{digits}f}'.replace('.', ',')

def reviews(partial):
    records, groups = [], []
    for slug in SLUGS:
        collection = ROOT / ('main-study' if slug == 'astra' else 'luna-study') if slug in ['astra', 'luna'] else STUDY / slug
        for procedure in 'ABC':
            selected = []
            for task in range(3, 11):
                path = collection / 'analysis/reviews' / f'P{task:02}-{procedure}-001.json'
                if not path.exists():
                    if not partial:
                        raise ValueError(f'Missing preselected review: {path}')
                    continue
                record = load(path)
                assert record['id'] == path.stem and record['humanReview'] is None
                assert record['interRaterAgreement'] is None
                scores = {d['dimension']: d['score'] for d in record['dimensions']}
                assert set(scores) == set(DIMENSIONS)
                assert all(v is None or v in [0, 1, 2] for v in scores.values())
                records.append(dict(slug=slug, procedure=procedure, task=f'P{task:02}', path=str(path.relative_to(ROOT)), scores=scores))
                selected.append(scores)
            groups.append(dict(slug=slug, procedure=procedure, records=len(selected), dimensions={d: dict(n=sum(s[d] is not None for s in selected), mean=float(np.mean([s[d] for s in selected if s[d] is not None])) if any(s[d] is not None for s in selected) else None) for d in DIMENSIONS}))
    return dict(method='AI-podprta, neslepa vsebinska presoja. Ista rubrika M/1.0, vnaprej izbrana ponovitev 001. Brez človeških ocen ali izmerjenega soglasja.', records=records, groups=groups)

def availability():
    result = []
    for slug in ['glm', 'deepseek', 'qwen']:
        rows = load(STUDY / slug / 'analysis/reporting-results.json')['data']
        affected = []
        for row in rows:
            path = STUDY / slug / 'api' / row['id'] / 'model/api-ledger.jsonl'
            ledger = [json.loads(line) for line in path.read_text().splitlines() if line.strip()]
            errors = [r for r in ledger if r.get('responseStatus') in ['failed', 'incomplete'] or r.get('httpStatus') is not None and r['httpStatus'] != 200 or r.get('status') in ['transport_error', 'rejected_before_upstream']]
            archive = STUDY / slug / 'runtime/runs' / row['id']
            native_errors = []
            for events_path in [archive / 'events.jsonl.gz', *sorted((archive / 'phases').glob('*/events.jsonl.gz'))]:
                if not events_path.exists():
                    continue
                for line in gzip.decompress(events_path.read_bytes()).decode().splitlines():
                    event = json.loads(line)
                    message = event.get('message') or (event.get('error') or {}).get('message', '')
                    if event.get('type') in ['error', 'turn.failed'] and message.startswith('stream disconnected before completion:'):
                        native_errors.append(dict(message=message, evidence=str(events_path.relative_to(ROOT))))
            if errors or native_errors:
                affected.append(dict(id=row['id'], requests=[r['number'] for r in errors], executionStatus=row['executionStatus'], evidence=str(path.relative_to(ROOT)), nativeErrors=native_errors))
        isolation = [dict(id=row['id'], executionStatus=row['executionStatus']) for row in rows if row['executionStatus'] == 'isolation_interrupted']
        result.append(dict(slug=slug, archived=len(rows), explicitResponseOrTransportErrors=len(affected), affected=affected, isolationInterruptions=isolation))
    return result

def chart(comparison, metric, filename, title):
    plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 9, 'axes.spines.top': False, 'axes.spines.right': False})
    fig, ax = plt.subplots(figsize=(7.1, 3.35), layout='constrained')
    positions = np.arange(5)
    for j, procedure in enumerate('ABC'):
        rows = [next(g for g in comparison['summaries'] if g['slug'] == s and g['procedure'] == procedure) for s in SLUGS]
        values = [g['strictSuccesses'] / g['archived'] if metric == 'strict' and g['archived'] else g['meanDemonstratedFraction'] if metric == 'requirements' else np.nan for g in rows]
        bars = ax.bar(positions + (j - 1) * .24, [np.nan if v is None else v for v in values], width=.24, label=procedure, color=COLORS[j])
        for bar, value, row in zip(bars, values, rows):
            if value is not None and np.isfinite(value):
                label = f"{row['strictSuccesses']}/{row['archived']}" if metric == 'strict' else f'{value:.0%}'
                ax.text(bar.get_x() + bar.get_width()/2, value + .025, label, ha='center', fontsize=7)
    ax.set_xticks(positions, [LABELS[s].replace('DeepSeek V4.1 Flash', 'DeepSeek\nV4.1 Flash') for s in SLUGS])
    ax.set_ylim(0, 1.12)
    ax.set_yticks(np.arange(0, 1.01, .2))
    ax.yaxis.set_major_formatter(PercentFormatter(1))
    ax.grid(axis='y', alpha=.2); ax.set_axisbelow(True)
    ax.legend(ncols=3, frameon=False, loc='upper left', bbox_to_anchor=(0, 1.18))
    ax.set_ylabel(title)
    fig.savefig(filename, dpi=200); plt.close(fig)

def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--preview', action='store_true')
    args = parser.parse_args()
    comparison = load(STUDY / 'analysis/comparison.json')
    if not args.preview:
        assert comparison['complete'] and comparison['newArchived'] == 216
    qualitative = reviews(args.preview)
    service = availability()
    QA.mkdir(parents=True, exist_ok=True); OUTPUT.mkdir(parents=True, exist_ok=True)
    (STUDY / 'analysis/qualitative-summary.json').write_text(json.dumps(qualitative, ensure_ascii=False, indent=2) + '\n')
    (STUDY / 'analysis/availability-summary.json').write_text(json.dumps(service, ensure_ascii=False, indent=2) + '\n')
    chart(comparison, 'strict', QA / 'strict.png', 'Delež strogih uspehov')
    chart(comparison, 'requirements', QA / 'requirements.png', 'Delež dokazanih zahtev')
    font_dir = Path(matplotlib.get_data_path()) / 'fonts/ttf'
    pdfmetrics.registerFont(TTFont('DejaVu', str(font_dir / 'DejaVuSans.ttf')))
    pdfmetrics.registerFont(TTFont('DejaVuBold', str(font_dir / 'DejaVuSans-Bold.ttf')))
    styles = getSampleStyleSheet()
    for style in styles.byName.values():
        style.fontName = 'DejaVu'; style.fontSize = 9; style.leading = 13
    styles['Title'].fontName = 'DejaVuBold'; styles['Title'].fontSize = 20; styles['Title'].leading = 26; styles['Title'].alignment = TA_LEFT
    styles['Heading1'].fontName = 'DejaVuBold'; styles['Heading1'].fontSize = 14; styles['Heading1'].leading = 19; styles['Heading1'].spaceAfter = 12
    styles['Heading2'].fontName = 'DejaVuBold'; styles['Heading2'].fontSize = 11; styles['Heading2'].leading = 16
    styles.add(ParagraphStyle('SmallTable', fontName='DejaVu', fontSize=7.3, leading=10))
    styles.add(ParagraphStyle('MethodBody', parent=styles['Normal'], leading=11.5))
    story = []
    method_page = False
    def p(text, style='Normal'):
        if method_page and style == 'Normal':
            style = 'MethodBody'
        story.extend([Paragraph(text, styles[style]), Spacer(1, 4 if method_page else 8)])
    def table(headers, rows, widths):
        cells = [[Paragraph(escape(str(v)), styles['SmallTable']) for v in r] for r in [headers, *rows]]
        t = Table(cells, colWidths=widths, repeatRows=1, hAlign='LEFT')
        t.setStyle(TableStyle([('BACKGROUND', (0,0),(-1,0), colors.HexColor('#E8EDF4')), ('VALIGN',(0,0),(-1,-1),'TOP'), ('BOTTOMPADDING',(0,0),(-1,-1),7), ('TOPPADDING',(0,0),(-1,-1),7), ('LINEBELOW',(0,0),(-1,0),.6,colors.HexColor('#334B75')), ('LINEBELOW',(0,1),(-1,-1),.2,colors.HexColor('#CCD4DF'))]))
        story.extend([t, Spacer(1, 12)])
    p('Primerjava petih modelov', 'Title')
    p('Isti razvojni postopki A, B in C na osmih nalogah. Zbirke M/1.0, L/1.0 in O/1.0.', 'Heading2')
    if args.preview:
        p(f'DELOVNI PREDOGLED - zbirka ni zaključena. Arhiviranih {comparison["newArchived"]}/216 novih izvedb. Prikazani delni rezultati niso končna primerjava.')
    else:
        p('216 novih izvedb prek OpenRouter in 144 že arhiviranih izvedb z Astro in Luno. Vsak model ima 72 izvedb: osem nalog, trije postopki in tri ponovitve.')
    p('Strogi uspeh združi veljaven zaključek postopka, dovoljenost sprememb, lint, tipe, gradnjo in vseh 70 neodvisnih preverjanj. Dokazane zahteve so ločeno funkcionalno merilo; vsaka oddaja ima 12 zahtev. Uspešna funkcionalnost zato lahko spremlja neuspešen zaključek postopka.')
    story.append(Image(str(QA / 'strict.png'), width=487, height=230))
    p('Številke nad stolpci so uspehi / vse arhivirane izvedbe. Začetih izvedb nismo nadomeščali z uspešnejšimi ponovitvami.')
    p('Astra in Luna sta zgodovinski zbirki. Razlike vključujejo ponudnika, različico odjemalca, kvantizacijo, hitrosti storitev in transport JSON. Primerjava opisuje te konkretne konfiguracije in ne izolira vzročnega učinka modela.')
    p('Pred vsako novo meritvijo prek OpenRouter je izveden kratek neodvisen povezovalni preizkus CONNECTION_OK. Njegov čas in odgovor sta izključena iz 216 meritev, strošek pa je vključen v skupni proračun. Uspešen kratek odziv ne zagotavlja uspeha dolge merjene izvedbe.')
    story.append(PageBreak())
    p('Avtomatizirani rezultati', 'Heading1')
    rows = [[LABELS[g['slug']], g['procedure'], f"{g['strictSuccesses']}/{g['archived']}", f"{g['perfectRequirementSubmissions']}/{g['archived']}", number(None if g['meanDemonstratedFraction'] is None else g['meanDemonstratedFraction']*100,1) + ' %', number(None if g['meanElapsedSeconds'] is None else g['meanElapsedSeconds']/60,2)] for g in comparison['summaries']]
    table(['Model','Postopek','Strogi uspehi','Vseh 12 zahtev','Dokazane zahteve','Čas (min)'], rows, [125,48,73,75,83,83])
    p('Delež dokazanih zahtev je povprečje vseh 12 zahtev po oddajah. Naveden je čas merjenega razvojnega postopka, brez priprave, povezovalnih preizkusov in neodvisnega ocenjevanja. Vključuje tudi neuspele izvedbe in roke. Če manjka točen čas katere koli izvedbe v skupini, povprečje ostane manjkajoče; uspešnih izvedb nismo izbirali naknadno.')
    story.append(PageBreak())
    p('Dokazane funkcionalne zahteve', 'Heading1')
    story.append(Image(str(QA / 'requirements.png'), width=487, height=230))
    p('Zahteva je dokazana, ko ustrezna preverjanja uspejo na obeh velikostih zaslona. Delno izpolnjeni pogoji niso dokaz celotne zahteve. Delež vseh izpolnjenih zahtev in število popolnih oddaj sta ločeni merili.')
    p('Vse začete izvedbe ostanejo v imenovalcu. Časovna prekoračitev ali neveljaven zaključek postopka lahko zmanjšata strogo uspešnost, tudi če je v arhivirano oddajo že vključena delujoča funkcionalnost. Zato je treba oba grafa brati skupaj.')
    p('Pri GLM/P03-C-001 je 22 skritih testov obstalo pri natančnem imenu iskalnika: navodilo konča stavek z »Išči opravila.«, test pa zahteva ime brez pike. Oddaja vsebuje piko; javni in lastni testi uporabljajo nenatančno ime. Izvirna rezultata 48/70 preverjanj in 1/12 dokazanih zahtev ostaneta nespremenjena. Ti neuspehi niso dokaz 22 različnih napak filtriranja; dvoumnost dogovora imena je omejitev merila.')
    if comparison['newArchived'] >= 102:
        p('Qwen/P08-C-002 je oddal 14 nalog z oznakami v krepkem tisku (**T001**). Zamrznjeni preverjevalnik sprejme oznake brez krepkega tiska in zavrne predajo pred implementacijo. Rezultat ostane izviren (38/70, 0/12); zavrnitev je posledica formata, ne odsotnosti nalog.')
    if comparison['newArchived'] >= 121:
        p('Pri več oddajah P08 in P07 ostaneta dve preverjanji prazne table neuspešni: pripomoček zahteva območje z imenom Tabla opravil, oddaja pa ga zamenja s sporočilom o praznem rezultatu. Tako imajo npr. DeepSeekove P07-C-003 in P07-A-003 izvirna izida 68/70 in 11/12. Izidi ostanejo nespremenjeni. Gre za občutljivost preverjanja na strukturo praznega pogleda; dve neuspešni preverjanji istega vzroka nista dokaz dveh različnih napak logike.')
    if comparison['newArchived'] >= 112:
        p('DeepSeek/P04-B-002 doseže 70/70 in 12/12, vendar zaključni odgovor pregleda ovije JSON v oznake Markdown. Validator zavrne ta odgovor, čeprav je shranjena datoteka review.json veljavna. Strogi neuspeh zato ne pomeni neuspešne funkcionalnosti.')
    if comparison['newArchived'] >= 125:
        p('GLM/P07-B-003 doseže 68/70 in 11/12 zaradi manjkajočega zahtevanega sporočila Ni priljubljenih opravil. na prazni filtrirani tabli. Območje table ostane prisotno. Obe neuspešni preverjanji potrjujeta isto funkcionalno vrzel R06; uspešnih 14 lastnih testov tega primera ne pokrije.')
    story.append(PageBreak())
    p('Vsebinska kakovost oddaj', 'Heading1')
    p(qualitative['method'])
    p('Ocene po petih dimenzijah so 0-2. Manjkajoča ali neberljiva oddaja ostane manjkajoča in ni nadomeščena. Prisotnost dokumenta ali testne datoteke sama po sebi ni dokaz kakovosti. V preglednici so posamezne ocene; evidence in utemeljitve ostajajo v zapisih presoje.')
    p('Povprečja vsebinskih ocen vključujejo samo dejansko ocenljive dimenzije. Ob manjkajočih oddajah so lahko selektivna; n pri vsaki dimenziji pokaže njen imenovalec in se lahko razlikuje od števila izbranih zapisov.')
    rows = [[LABELS[g['slug']], g['procedure'], str(g['records']), *[number(g['dimensions'][d]['mean'],2) + f" (n={g['dimensions'][d]['n']})" for d in DIMENSIONS]] for g in qualitative['groups']]
    table(['Model','Post.','Vzorec',*DIM_LABELS], rows, [105,33,38,62,62,62,62,62])
    story.append(PageBreak())
    p('Čas, poraba in obračunani stroški', 'Heading1')
    rows = [[LABELS[g['slug']],g['procedure'],str(g['completeUsageCount']),str(g['completeCostCount']),number(g['meanCostUSD'],4),number(g['knownCostUSD'],4) if not g['historical'] and g['archived'] else 'manjka'] for g in comparison['summaries']]
    table(['Model','Postopek','Popolna poraba, n','Popoln račun, n','Povpr. USD','Znani seštevek USD'], rows, [125,48,83,83,72,76])
    p('Računi OpenRouter imajo prednost pred oceno iz cenika. Neznani stroški niso nič; povprečje je prikazano le ob popolnih računih celotne skupine. Znani seštevek pri nepopolnem obračunu je spodnja meja, ne končni strošek. Piloti in diagnostika so ločeni od stroškov merjenih oddaj, vključeni pa v proračunsko omejitev. Zamrznjeno obračunsko pravilo šteje zavrnitve HTTP400/401/403/404 brez responseId kot 0; GLM slikovni HTTP404 zato nima generation računa ali vrnjene usage, njegova ničla izvira iz tega pravila.')
    p('Za Astro in Luno ni primerljivih računov API. Popolna poraba pomeni popolnost usklajenega zapisa tokenov v merjenem odjemalcu, ne enakega predpomnjenja ali računovodstva med ponudniki. Pri nadaljevanih sejah zapis lahko manjka tudi ob popolnem računu API. Stanje dobroimetja se lahko uskladi z zamikom in ne nadomesti računa posamezne izvedbe. Metapodatki GLM/Wafer z dne 30. oktobra kažejo drugačen cenik od zamrznjenega posnetka. Čas spremembe ni znan; stroškovne razlike lahko odražajo tudi različne cene.')
    p('Nižji strošek ali krajši čas neuspele oziroma prekinjene izvedbe ne pomeni cenejše ali hitrejše uspešne rešitve. Oba kazalnika je treba brati skupaj s funkcionalnostjo in strogim uspehom.')
    story.append(PageBreak())
    p('Razlike med postopki', 'Heading1')
    p('Tri ponovitve najprej povprečimo po nalogi in postopku. Razlike nato parimo po osmih nalogah. Intervali so opisni 95-odstotni percentilni intervali iz 20.000 ponovnih vzorčenj z izvirnim fiksnim semenom. Enota vzorčenja je naloga, ne vsaka od 24 oddaj. Intervali ne odpravljajo zgodovinskih razlik med zbirkami.')
    for metric, label, scale in [('strictSuccessFraction','Strogi uspeh: razlika v odstotnih točkah',100), ('demonstratedFraction','Dokazane zahteve: razlika v odstotnih točkah',100)]:
        if metric == 'demonstratedFraction':
            story.append(PageBreak())
            p('Razlike med postopki: funkcionalnost', 'Heading1')
        p(label, 'Heading2')
        selected = [c for c in comparison['comparisons'] if ':' in c['label'] and c['metric'] == metric]
        def readable_label(label):
            for slug in SLUGS:
                label = label.replace(slug, LABELS[slug])
            return label.replace('−', '-')
        rows = [[readable_label(c['label']),number(c['meanDifference']*scale,1),f"[{number(c['lower']*scale,1)}; {number(c['upper']*scale,1)}]"] for c in selected]
        table(['Kontrast','Povprečna razlika','95 % interval'],rows,[247,110,130])
        if metric == 'strictSuccessFraction':
            p('Če vsi postopki pri nekem modelu dosežejo 0 strogih uspehov, to merilo doseže spodnjo mejo. Enak opaženi izid in interval [0; 0] ne dokazujeta splošne enakovrednosti postopkov: ponovno vzorčenje tega vzorca ne more ustvariti neopaženih uspehov. Funkcionalnost in vsebinske ocene zato poročamo ločeno.')
    p('Kontrasti med modeli in časovne razlike so zapisani v primerjalnih podatkih. Če manjka katera od potrebnih treh ponovitev ali točen podatek, kontrasta ne izračunamo.')
    story.append(PageBreak())
    method_page = True
    p('Konfiguracije in omejitve primerjave', 'Heading1')
    models = load(STUDY / 'analysis/model-description.json')['models']
    table(['Model','Ponudnik','Kvantizacija','Razmišljanje','Licenca'], [[LABELS[m['slug']],m['provider'],m['quantization'],m['effort'] or 'vključeno',m['license']['name']] for m in models], [130,110,77,80,90])
    p('Vsi trije novi modeli imajo javno dostopne uteži; njihove licence se razlikujejo. GLM ima licenco GLM-5.3, DeepSeek MIT in Qwen Apache-2.0. Izraz javne uteži je zato natančnejši skupni opis od enotne oznake odprta koda.')
    p('A pomeni enega agenta; B zaporedje specifikacije, implementacije, pregleda in popravkov; C trajno sejo z zaporedjem Spec Kit. Naloge, vloge, testi in izvirne fazne meje ostanejo enaki. Skupni rok je 1.200 s. Priprava C porablja isti rok; fazne meje in rezerve za poznejše korake lahko izvedbo ustavijo pred skupnim rokom. B po faznem roku specifikacije lahko nadaljuje, če je zahtevani dokument že oddan; prekoračitev ostane zabeležena. Ocenjevanje sestavlja 38 regresijskih, 8 razvojnih in 24 skritih preverjanj.')
    p('Diagnostika vseh treh modelov je pokazala, da native json_schema zavre samodejno izbiro orodij. Relay zato posreduje isto shemo kot besedilo navodil; izvirni validator preveri odgovor brez popravljanja.')
    p('Po zamrznjenem katalogu je GLM besedilen, DeepSeek sprejema slike, Qwen tudi video; orodja so enaka. GLM P06-B-001 prekine slikovni HTTP404; tudi sintetična uporabniška slika je zavrnjena, svež besedilni odgovor uspe. DeepSeek P06-A-001 prekine HTTP422 pri slikovnem rezultatu view_image; diagnostika potrdi delujoč besedilni rezultat in sliko v uporabniškem sporočilu, zavrne pa slikovni function_call_output. Začetna kvalifikacija teh rezultatov ni preverila. Meritvi ostaneta brez ponovitve; omejitvi prenosa ne dokazujeta slabe implementacije. Metapodatki in modalnosti omejujejo zgodovinsko primerljivost.')
    p('Izvirni sandbox zavrne npr. heredoc; druge poti pisanja so predhodno preverjene. Modeli se zavrnitvam prilagodijo različno. Neuspešni orodni klici so lahko ohranjeni le v naslednjih API vhodih. Presojamo dejansko oddajo, ne osnutka v neuspešnem ukazu.')
    p('Qwenova prvotna pot DeepInfra/bf16 je dvakrat odpovedala zaradi preobremenitve. SiliconFlow/fp8 je bil določen pred prvo meritvijo in ostaja zamrznjen. Diagnostika in časovne prekoračitve kvalifikacije so ohranjene; model ni izločen.')
    p('Astra je bila izmerjena z odjemalcem 0.154, Luna in novi modeli z 0.158.0-alpha.2.1. Nova zbirka uporablja drug račun, storitve in čas meritev. Ugotovitve veljajo za osem uporabljenih nalog in te konfiguracije; ne pomenijo splošne lestvice vseh sposobnosti modelov.')
    p('Astro je pred implementacijo prizadelo 12 zaporednih napak prijave 401 in ena omejitev uporabe. Ostanejo v primarni analizi brez ponovitve; ne dokazujejo slabe implementacijske sposobnosti. Uravnoteženost zavrnitev po postopkih ne odpravi izgube oddaj ali pristranskosti primerjave.')
    p('Nove arhivirane izvedbe z izrecno napako odziva ali transporta API: ' + '; '.join(f"{LABELS[g['slug']]} {g['explicitResponseOrTransportErrors']}/{g['archived']}" for g in service) + '. Vzrok Qwenovih response.failed, DeepSeekovega HTTP520 (P08-C-001) in prekinjenega toka (P07-A-003) ni potrjen. GLM/P07-A-003 prejme HTTP429 zaradi preobremenitve skupne kvote Wafer. Qwen/P06-B-002: HTTP200/completed, 101 token razmišljanja in nobenega besedila ali orodnega klica v dnevniku. Qwen/P09-A-001: šest HTTP200/completed zahtev, brez avtorske oddaje in le zaključne orodne oznake v zadnjem odgovoru. Vzroka nista potrjena; primera nista v števcu izrecnih napak API. Običajne prekinitve ob roku brez napake odziva niso vključene.')
    if comparison['newArchived'] >= 170:
        p('GLM/P09-C-001 prekine lokalna napaka pri preverjanju dobroimetja, preden je zadnja zahteva poslana ponudniku; zaključni koraki so pozneje dokončani brez ponovitve meritve.')
    p('Prekinitve varovala izolacije: ' + '; '.join(f"{LABELS[g['slug']]} {len(g['isolationInterruptions'])}/{g['archived']}" for g in service) + '. Tudi te ostanejo v imenovalcu strogega uspeha. Varovalo lahko sprožita zaznana vrata ali časovna prekoračitev povezave; brez dodatnih dokazov takšna prekinitev ni dokaz slabe implementacije modela.')
    p('Uporabnik je ob premorih prekinil GLM P03-C-002 po 551,030 s (66/70 preverjanj) in DeepSeek P03-B-001 po 727,047 s (70/70). Status operator_interruption ostane v primarni analizi brez ponovitve. Skrajšanega časa in nedokončanega postopka ne pripisujemo sposobnosti modela. Zadnji zahtevi GLM69 in DeepSeek55 imata shranjena vhoda brez zaključnega relay zapisa: prenos, odziv in strošek so neznani. Izvirna dnevnika in transparentna raziskovalčeva dodatka sta ohranjena; dodatka nista opaženi napaki API ali ničelna računa.')
    amendment_path = STUDY / 'budget-amendment-1.json'
    if amendment_path.exists():
        amendment = load(amendment_path)
        assert amendment['status'] == 'approved' and amendment['effectiveAfterArchivedPosition'] == 123
        story.append(PageBreak())
        method_page = False
        p('Dokumentirana proračunska dopolnitev', 'Heading1')
        p('Po 123. novi arhivirani meritvi je prvotno proračunsko pravilo ustavilo vrsto. Znani stroški in rezerve za nepotrjene račune so skupaj z največjim možnim stroškom naslednje zahteve presegli odobrenih 40 USD, čeprav je na predplačniškem računu ob prekinitvi ostalo 13,82 USD. Nepotrjeni računi zato niso postali ničelni.')
        p('Uporabnik je 30. oktobra 2026 izrecno odobril porabo preostalega obstoječega dobroimetja brez doplačil. Dopolnitev O/1.0-budget-amendment-1 velja za poznejše diagnostike in nove meritve od položaja 124: Qwen/P07-B-003. Pred vsako zahtevo se sveže preveri dejansko kritje največjega stroška pri izvirno izbranem ponudniku. Tudi morebitno poznejše dopolnjeno dobroimetje ne poveča dovoljenja nad prvotnih 40 USD skupne porabe računa; hkratne zahteve imajo lastne rezerve.')
        p('Spremenjeno je samo proračunsko varovalo prenosa. Modeli, ponudniki, pozivi, naloge, roki, razvojni postopki in ocenjevalci ostanejo isti. Prvih 123 meritev in njihovi izidi ostanejo ohranjeni brez ponovitev. Po dopolnitvi je sveža diagnostika istega GLM/Wafer vrnila CONNECTION_OK; kratek uspeh ne zagotavlja zanesljivosti dolgih merjenih odzivov.')
        p('Izvirni proračun, izvorna koda prenosa in zamrznitev so ohranjeni z zgoščenimi vrednostmi. Aktivni operator je označen O/1.0+budget-amendment-1. Novi dnevniki zahtev navajajo uporabljeno pravilo in dejansko stanje računa. Neznani stroški in prvotne konzervativne rezerve ostanejo ločeno v revizijski evidenci; povprečja nepopolnih računov ostanejo manjkajoča.')
        p('Revizijska sled: budget-amendment-1.json; analysis/recovery/budget-amendment-2026-10-30/implementation.json in original/; analysis/recovery/user-approved-budget-resume-2026-10-30.json. Sprememba je odobrena med zbiranjem podatkov in je del omejitev primerjave.')
    p('Viri modelnih licenc in uteži', 'Heading2')
    for m in models:
        p(f"{escape(LABELS[m['slug']])}: <link href=\"{escape(m['publicWeights'])}\" color=\"#334B75\">uradna objava uteži</link>; <link href=\"{escape(m['license']['url'])}\" color=\"#334B75\">licenca</link>.")
    filename = QA / 'preview.pdf' if args.preview else OUTPUT / 'primerjava-modelov.pdf'
    def footer(canvas, doc):
        canvas.setFont('DejaVu',7); canvas.setFillColor(colors.HexColor('#536279'))
        canvas.drawString(40,25,'Primerjava razvojnih postopkov - ' + ('delovni predogled' if args.preview else 'zaključeno poročilo'))
        canvas.drawRightString(A4[0]-40,25,str(doc.page))
    SimpleDocTemplate(str(filename),pagesize=A4,leftMargin=40,rightMargin=40,topMargin=38,bottomMargin=42,title='Primerjava petih modelov',author='Raziskovalčeva AI-podprta analiza').build(story,onFirstPage=footer,onLaterPages=footer)
    print(json.dumps(dict(previewOnly=args.preview,pdf=str(filename),reviews=len(qualitative['records']))))

if __name__ == '__main__':
    main()
