"""Descriptive, task-preserving figures for the historical Astra–Luna comparison."""
import json
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D

study = Path(__file__).resolve().parents[2]
root = study.parent
astra = json.loads((root / 'main-study/analysis/reporting-results.json').read_text())
luna_file = study / 'analysis/reporting-results.json'
luna = json.loads(luna_file.read_text()) if luna_file.exists() else {'data': [], 'archived': 0, 'generatedAt': None}
comparison = json.loads((study / 'analysis/comparison.json').read_text())
assert comparison['snapshots'] == {'astra': astra['generatedAt'], 'luna': luna['generatedAt']}
out = study / 'analysis/figures'
out.mkdir(parents=True, exist_ok=True)
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 10, 'axes.titlesize': 12, 'svg.fonttype': 'none', 'savefig.facecolor': 'white'})
tasks = [f'P{i:02d}' for i in range(3, 11)]
procedures = ['A', 'B', 'C']
collections = [('Astra', astra), ('Luna', luna)]
colors = {'Astra': '#334B75', 'Luna': '#B46429'}
scope = f"Astra {astra['archived']}/72; Luna {luna['archived']}/72"
state = 'Obe zbirki sta zaključeni.' if comparison['complete'] else 'Vmesni posnetek; brez končnega sklepanja o Luni.'
limitation = 'CLI in obdobji se razlikujejo; primerjava ne izolira učinka samega modela.'
snapshot = comparison['generatedAt'].replace('T', ' ')[:19] + ' UTC'

def save(fig, name):
    for ext in ['png', 'svg']:
        fig.savefig(out / f'{name}.{ext}', dpi=220, bbox_inches='tight')
    plt.close(fig)

fig, axes = plt.subplots(1, 2, figsize=(14, 6.3), sharey=True)
cmap = plt.get_cmap('viridis').copy()
cmap.set_bad('#E8EBEF')
for ax, (model, data) in zip(axes, collections):
    matrix = np.full((8, 9), np.nan)
    lookup = {r['id']: r for r in data['data']}
    for r in data['data']:
        matrix[tasks.index(r['task']), procedures.index(r['procedure']) * 3 + r['repetition'] - 1] = r['score']['passed']
    im = ax.imshow(np.ma.masked_invalid(matrix), vmin=0, vmax=12, cmap=cmap, aspect='auto')
    for y, task in enumerate(tasks):
        for p, procedure in enumerate(procedures):
            for rep in range(1, 4):
                x = p * 3 + rep - 1
                r = lookup.get(f'{task}-{procedure}-{rep:03d}')
                label = '—' if r is None else str(r['score']['passed']) + ('*' if r['executionStatus'] != 'completed' else '')
                ax.text(x, y, label, ha='center', va='center', fontsize=9, color='#58616E' if r is None else ('white' if r['score']['passed'] < 7 else '#172033'))
    ax.set_title(f"{model}: {data['archived']}/72", loc='left', pad=12)
    ax.set_xticks(range(9), [f'{p}·{r}' for p in procedures for r in [1, 2, 3]])
    ax.set_yticks(range(8), tasks)
    ax.set_xlabel('Postopek · ponovitev')
    ax.set_xticks(np.arange(-.5, 9, 1), minor=True); ax.set_yticks(np.arange(-.5, 8, 1), minor=True)
    ax.grid(which='minor', color='white', linewidth=1.2); ax.tick_params(which='minor', bottom=False, left=False)
    for x in [2.5, 5.5]: ax.axvline(x, color='white', lw=4)
    for spine in ax.spines.values(): spine.set_visible(False)
fig.suptitle('Dokazane zahteve od 12', x=.125, ha='left', fontsize=15)
fig.subplots_adjust(bottom=.25, right=.9, wspace=.12)
cax = fig.add_axes([.92, .27, .014, .56])
fig.colorbar(im, cax=cax, ticks=[0, 3, 6, 9, 12])
fig.text(.125, .145, '— ni arhiva; * postopek ni zaključen. Zahteva potrebuje uspeh na obeh zaslonih.', fontsize=9)
fig.text(.125, .105, limitation, fontsize=9)
fig.text(.125, .065, state, fontsize=9)
fig.text(.125, .024, 'Vir: arhivi M/1.0 in L/1.0; ' + snapshot, fontsize=8, color='#58616E')
save(fig, 'primerjava-zahtev')

fig, axes = plt.subplots(2, 1, figsize=(11, 8), sharex=True, sharey=True)
maximum = max([20] + [r['elapsedSeconds']/60 for _, d in collections for r in d['data'] if r['elapsedSeconds'] is not None])
procedure_colors = {'A': '#275DAD', 'B': '#B85D19', 'C': '#527E40'}
for ax, (model, data) in zip(axes, collections):
    for r in data['data']:
        if r['elapsedSeconds'] is None:
            continue
        x = tasks.index(r['task']) + (procedures.index(r['procedure'])-1)*.22 + (r['repetition']-2)*.045
        ax.scatter(x, r['elapsedSeconds']/60, color=procedure_colors[r['procedure']], marker='o' if r['executionStatus'] == 'completed' else 'X', s=43, edgecolors='white', linewidth=.45, zorder=3)
    ax.axhline(20, color='#8E3E44', ls='--', lw=1)
    ax.set_title(f"{model}: {data['archived']}/72", loc='left')
    ax.set_ylabel('Celoten modelski čas (min)')
    ax.set_ylim(0, maximum + 1.5)
    ax.grid(axis='y', color='#E2E5EA', lw=.7); ax.set_axisbelow(True)
    ax.spines[['top', 'right']].set_visible(False)
axes[1].set_xticks(range(8), tasks); axes[1].set_xlim(-.6, 7.6)
handles = [Line2D([0], [0], marker='o', linestyle='', color=procedure_colors[p], label=p) for p in procedures]
handles += [Line2D([0], [0], marker='X', linestyle='', color='#555555', label='Nezaključen postopek'), Line2D([0], [0], color='#8E3E44', ls='--', label='Meja 20 min')]
axes[1].legend(handles=handles, loc='upper center', bbox_to_anchor=(.5, -.16), ncol=5, frameon=False, fontsize=9)
fig.subplots_adjust(bottom=.28, hspace=.25)
missing = [(model, r['id']) for model, d in collections for r in d['data'] if r['elapsedSeconds'] is None]
fig.text(.125, .125, f'Neznani časi niso prikazani: {len(missing)}. Kratki neuspehi dostopa niso časi rešitev.', fontsize=9)
fig.text(.125, .085, limitation, fontsize=9)
fig.text(.125, .05, state, fontsize=9)
fig.text(.125, .014, 'Vir: execution.json arhivov; ' + snapshot, fontsize=8, color='#58616E')
save(fig, 'primerjava-casa')

fig, axes = plt.subplots(2, 1, figsize=(10.5, 7.8), sharex=True)
usage_counts = {}
for ax, key, scale, label in zip(axes, ['input_tokens', 'output_tokens'], [1_000_000, 1_000], ['Vhodni tokeni (milijoni)', 'Izhodni tokeni (tisoči)']):
    for model_index, (model, data) in enumerate(collections):
        valid = [r for r in data['data'] if r['usageComplete'] and r['usage'] is not None]
        usage_counts[model] = {p: sum(r['procedure'] == p for r in valid) for p in procedures}
        for r in valid:
            jitter = (tasks.index(r['task']) * 3 + r['repetition'] - 12.5) * .009
            x = procedures.index(r['procedure']) + (model_index - .5)*.34 + jitter
            ax.scatter(x, r['usage'][key]/scale, color=colors[model], marker='o' if model == 'Astra' else '^', s=37, edgecolors='white', linewidth=.4, alpha=.88, zorder=3)
    ax.set_ylabel(label); ax.set_ylim(bottom=0); ax.set_xlim(-.6, 2.6)
    ax.grid(axis='y', color='#E2E5EA', lw=.7); ax.set_axisbelow(True)
    ax.spines[['top', 'right']].set_visible(False)
axes[0].set_title('Popolno zabeležena poraba: ' + scope, loc='left', pad=12)
axes[1].set_xticks(range(3), procedures); axes[1].set_xlabel('Postopek')
axes[1].legend(handles=[Line2D([0], [0], marker='o' if m == 'Astra' else '^', linestyle='', color=colors[m], label=m) for m, _ in collections], loc='upper center', bbox_to_anchor=(.5, -.2), ncol=2, frameon=False)
fig.subplots_adjust(bottom=.32, hspace=.2)
counts = '; '.join(m + ' A/B/C: ' + '/'.join(str(usage_counts[m][p]) for p in procedures) for m, _ in collections)
fig.text(.125, .15, 'Popolni zapisi: ' + counts + '. Vsaka točka je ena meritev.', fontsize=9)
fig.text(.125, .115, 'Nepopolni zapisi so izpuščeni; izbor je lahko selektiven. Tokeni niso denarni strošek.', fontsize=9)
fig.text(.125, .08, limitation, fontsize=9)
fig.text(.125, .045, state, fontsize=9)
fig.text(.125, .012, 'Vir: usklajena poraba arhiviranih sej; ' + snapshot, fontsize=8, color='#58616E')
save(fig, 'primerjava-porabe')
(out / 'provenance.json').write_text(json.dumps({'generatedAt': comparison['generatedAt'], 'snapshots': comparison['snapshots'], 'archived': comparison['archived'], 'complete': comparison['complete'], 'usageCounts': usage_counts, 'missingDuration': missing, 'matplotlib': matplotlib.__version__, 'numpy': np.__version__, 'limitation': limitation}, indent=2) + '\n')
print(json.dumps({'archived': comparison['archived'], 'figures': 3, 'output': str(out)}))
