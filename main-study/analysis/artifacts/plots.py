"""Publication-friendly descriptive figures from archived M/1.0 measurements."""
import json
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
from matplotlib.lines import Line2D

root = Path(__file__).resolve().parents[3]
data = json.loads((root / 'main-study/analysis/reporting-results.json').read_text())
out = root / 'main-study/analysis/figures'
out.mkdir(parents=True, exist_ok=True)
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 10, 'axes.titlesize': 13,
                     'axes.labelsize': 10, 'svg.fonttype': 'none', 'savefig.facecolor': 'white'})
tasks = [f'P{i:02d}' for i in range(3, 11)]
procedures = ['A', 'B', 'C']
colors = {'A': '#275DAD', 'B': '#B85D19', 'C': '#527E40'}
lookup = {r['id']: r for r in data['data']}
snapshot = data['generatedAt'].replace('T', ' ')[:19] + ' UTC'
scope = f"{data['archived']}/72 arhiviranih izvedb"
note = 'Vse izvedbe so arhivirane.' if data['complete'] else 'Nepopolna zbirka; brez končne primerjave postopkov.'

def save(fig, name):
    for ext in ['png', 'svg']:
        fig.savefig(out / f'{name}.{ext}', dpi=220, bbox_inches='tight')
    plt.close(fig)

matrix = np.full((8, 9), np.nan)
for r in data['data']:
    matrix[tasks.index(r['task']), procedures.index(r['procedure'])*3+r['repetition']-1] = r['score']['passed']
fig, ax = plt.subplots(figsize=(11, 6.2))
cmap = plt.get_cmap('viridis').copy()
cmap.set_bad('#E8EBEF')
im = ax.imshow(np.ma.masked_invalid(matrix), vmin=0, vmax=12, cmap=cmap, aspect='auto')
for y, task in enumerate(tasks):
    for p, procedure in enumerate(procedures):
        for rep in range(1, 4):
            x = p*3+rep-1
            r = lookup.get(f'{task}-{procedure}-{rep:03d}')
            text = '—' if not r else str(r['score']['passed']) + ('*' if r['executionStatus'] != 'completed' else '')
            ax.text(x, y, text, ha='center', va='center', fontsize=11,
                    color='#556170' if not r else ('white' if r['score']['passed'] < 7 else '#172033'))
ax.set_xticks(range(9), [f'{p} · {r}' for p in procedures for r in [1, 2, 3]])
ax.set_yticks(range(8), tasks)
ax.set_xlabel('Postopek · ponovitev')
ax.set_title(f'Dokazane zahteve od 12 — {scope}', loc='left', pad=14)
ax.set_xticks(np.arange(-.5, 9, 1), minor=True); ax.set_yticks(np.arange(-.5, 8, 1), minor=True)
ax.grid(which='minor', color='white', linewidth=1.5); ax.tick_params(which='minor', bottom=False, left=False)
for x in [2.5, 5.5]: ax.axvline(x, color='white', lw=5)
for spine in ax.spines.values(): spine.set_visible(False)
fig.colorbar(im, ax=ax, pad=.025, shrink=.85, ticks=[0, 3, 6, 9, 12], label='Dokazane zahteve')
fig.subplots_adjust(bottom=.21)
fig.text(.125, .10, '— ni arhiva; * postopek ni zaključen. Zahteva šteje le ob uspehu na obeh velikostih zaslona.', fontsize=9)
fig.text(.125, .064, note + ' Neopaženo preverjanje ni potrjena funkcionalna napaka.', fontsize=9)
fig.text(.125, .029, 'Vir: zamrznjene oddaje in neodvisne ocene; ' + snapshot, fontsize=8, color='#596678')
save(fig, 'dokazane-zahteve')

fig, ax = plt.subplots(figsize=(10.5, 5.4))
for r in data['data']:
    if r['elapsedSeconds'] is None:
        continue
    x = tasks.index(r['task']) + (procedures.index(r['procedure'])-1)*.22 + (r['repetition']-2)*.045
    ax.scatter(x, r['elapsedSeconds']/60, color=colors[r['procedure']], s=52,
               marker='o' if r['executionStatus']=='completed' else 'X', edgecolors='white', linewidth=.5, zorder=3)
ax.axhline(20, ls='--', color='#8E3E44', lw=1, label='Časovna meja 20 min')
ax.set_xticks(range(8), tasks); ax.set_xlim(-.6, 7.6)
max_time = max([20.0]+[r['elapsedSeconds']/60 for r in data['data'] if r['elapsedSeconds'] is not None])
ax.set_ylim(0, max_time+1.4)
ax.set_ylabel('Celoten modelski čas (min)')
ax.set_title(f'Čas posameznih izvedb — {scope}', loc='left', pad=14)
ax.grid(axis='y', color='#E2E5EA', lw=.7); ax.set_axisbelow(True)
ax.spines[['top','right']].set_visible(False)
legend = [Line2D([0],[0], marker='o', linestyle='', color=colors[p], label=p) for p in procedures]
legend += [Line2D([0],[0], marker='X', linestyle='', color='#555555', label='Nezaključen postopek'), Line2D([0],[0], linestyle='--', color='#8E3E44', label='Meja 20 min')]
ax.legend(handles=legend, loc='upper center', bbox_to_anchor=(.5,-.09), ncol=5, frameon=False, fontsize=9)
fig.subplots_adjust(bottom=.27)
fig.text(.125, .072, note + ' Neznani časi niso prikazani: ' + str(len(data['durationReporting']['missing'])) + '.', fontsize=9)
fig.text(.125, .035, 'Vir: execution.json posameznih arhivov; ' + snapshot, fontsize=8, color='#596678')
save(fig, 'cas-izvedb')

# Complete usage only. Cached/reasoning tokens are subsets, never extra totals.
usage_rows = [r for r in data['data'] if r['usageComplete'] and r['usage'] is not None]
missing_usage = [r['id'] for r in data['data'] if not r['usageComplete'] or r['usage'] is None]
fig, axes = plt.subplots(2, 1, figsize=(10.5, 7.4), sharex=True)
for ax, key, scale, ylabel in zip(axes, ['input_tokens', 'output_tokens'], [1_000_000, 1000],
                                 ['Vhodni tokeni (milijoni)', 'Izhodni tokeni (tisoči)']):
    for r in usage_rows:
        x = tasks.index(r['task']) + (procedures.index(r['procedure'])-1)*.22 + (r['repetition']-2)*.045
        ax.scatter(x, r['usage'][key]/scale, color=colors[r['procedure']], s=52,
                   edgecolors='white', linewidth=.5, zorder=3)
    ax.set_ylabel(ylabel)
    ax.set_ylim(bottom=0)
    ax.grid(axis='y', color='#E2E5EA', lw=.7); ax.set_axisbelow(True)
    ax.spines[['top','right']].set_visible(False)
axes[0].set_title(f'Popolno zabeležena poraba — {scope}', loc='left', pad=14)
axes[1].set_xticks(range(8), tasks); axes[1].set_xlim(-.6, 7.6)
axes[1].legend(handles=[Line2D([0],[0], marker='o', linestyle='', color=colors[p], label=p) for p in procedures],
               loc='upper center', bbox_to_anchor=(.5,-.14), ncol=3, frameon=False, fontsize=9)
fig.subplots_adjust(bottom=.24, hspace=.22)
fig.text(.125, .105, f"Popolni zapisi: {len(usage_rows)}/{data['archived']}. Izpuščeni nepopolni zapisi: " + (', '.join(missing_usage) or 'ni') + '.', fontsize=9)
fig.text(.125, .075, 'Predpomnjeni tokeni so vključeni v vhodne; reasoning v izhodne. Tokeni niso denarni strošek.', fontsize=9)
fig.text(.125, .045, note, fontsize=9)
fig.text(.125, .018, 'Vir: usklajena poraba točnih merjenih sej; ' + snapshot, fontsize=8, color='#596678')
save(fig, 'poraba-izvedb')

(out / 'provenance.json').write_text(json.dumps({'source': 'main-study/analysis/reporting-results.json', 'sourceGeneratedAt': data['generatedAt'],
    'archived': data['archived'], 'complete': data['complete'], 'matplotlib': matplotlib.__version__, 'numpy': np.__version__,
    'usageFigure': {'includedIds': [r['id'] for r in usage_rows], 'excludedIncompleteIds': missing_usage,
                    'units': {'input_tokens': 'millions', 'output_tokens': 'thousands'}, 'cachedAndReasoningAreSubsets': True},
    'figures': ['dokazane-zahteve.png', 'dokazane-zahteve.svg', 'cas-izvedb.png', 'cas-izvedb.svg', 'poraba-izvedb.png', 'poraba-izvedb.svg'],
    'note': 'Only measured archived values; blank cells are not zero. No inferential intervals on partial data.'}, indent=2)+'\n')
print(json.dumps({'archived': data['archived'], 'output': str(out)}))
