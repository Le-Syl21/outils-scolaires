/* Défi Tables — outil de révision des tables de multiplication.
   Tout est local : aucune donnée ne quitte le navigateur. */
(() => {
'use strict';

const TOUTES  = Array.from({ length: 20 }, (_, i) => i + 1);   // 1 à 20
const DEFAUT  = [1,2,3,4,5,6,7,8,9,10];   // niveau facile
const CLES = { eleves:'defiTables.eleves', resultats:'defiTables.resultats',
               tables:'defiTables.tables', cout:'defiTables.coutErreur',
               extras:'defiTables.extras', operation:'defiTables.operation' };

const OPERATIONS = {
  'x':     { signe:'×', nom:'multiplication', libelle:'fois' },
  '+':     { signe:'+', nom:'addition',       libelle:'plus' },
  '-':     { signe:'−', nom:'soustraction',   libelle:'moins' },
  '/':     { signe:'÷', nom:'division',       libelle:'divisé par' },
  'mixte': { signe:'?', nom:'calcul mélangé', libelle:'opéré avec' },
};
const $  = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];

/* ------------------------------------------------------------------ */
/* Stockage                                                            */
/* ------------------------------------------------------------------ */
const lire = (cle, defaut) => {
  try { return JSON.parse(localStorage.getItem(cle)) ?? defaut; }
  catch { return defaut; }
};
const ecrire = (cle, valeur) => {
  try { localStorage.setItem(cle, JSON.stringify(valeur)); } catch { /* mode privé */ }
};

let eleves    = lire(CLES.eleves, []);
let resultats = lire(CLES.resultats, []);
let tables    = lire(CLES.tables, DEFAUT);   // tables travaillées
let coutErreur = lire(CLES.cout, 5);   // une erreur coûte le temps de N cases justes
let extras    = lire(CLES.extras, []);       // tables ajoutées à la main (16 pour l'hexa…)
let operation = lire(CLES.operation, 'x');   // ×, +, −, ÷ ou mélangé

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */
const melanger = (tab) => {
  const t = [...tab];
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
};

const formatTemps = (s) => {
  const m = Math.floor(s / 60);
  return String(m).padStart(2,'0') + ':' + String(s % 60).padStart(2,'0');
};

const formatDate = (iso) => new Date(iso).toLocaleString('fr-FR',
  { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' });

/* ------------------------------------------------------------------ */
/* Navigation entre les vues                                           */
/* ------------------------------------------------------------------ */
$$('.tab').forEach(tab => tab.addEventListener('click', () => {
  $$('.tab').forEach(t => t.classList.toggle('is-active', t === tab));
  $$('.view').forEach(v => v.classList.toggle('hidden', v.id !== 'view-' + tab.dataset.view));
  if (tab.dataset.view === 'scores') afficherScores();
  if (tab.dataset.view === 'impression' && !$('#feuilles').children.length) genererFeuilles();
  if (tab.dataset.view === 'scores') afficherScores();
}));

/* ------------------------------------------------------------------ */
/* Les opérations                                                      */
/* ------------------------------------------------------------------ */
/* Le résultat attendu, ou null quand la case n'a pas de réponse
   entière et positive : on ne soustrait pas plus grand que soi, et une
   division qui ne tombe pas juste n'a pas sa place sur la feuille. */
function attendu(l, c, op) {
  switch (op) {
    case 'x': return l * c;
    case '+': return l + c;
    case '-': return l >= c ? l - c : null;
    case '/': return (c > 0 && l % c === 0) ? l / c : null;
    default:  return null;
  }
}

/* En mélangé, chaque case tire une opération parmi celles qui tombent juste */
function opDeCase(l, c) {
  const possibles = ['x', '+', '-', '/'].filter(o => attendu(l, c, o) !== null);
  return possibles[Math.floor(Math.random() * possibles.length)] || 'x';
}

/* Pour diviser, les lignes ne sont pas les nombres choisis mais des
   dividendes : ceux qui se divisent par le plus de colonnes, en gardant
   des quotients raisonnables. Sans cela, la grille serait aux trois quarts
   barrée. */
function dividendes(diviseurs, combien) {
  const utiles = diviseurs.filter(d => d > 0);
  if (!utiles.length) return [];
  const plafond = Math.max(...utiles) * 12;
  const candidats = [];
  for (let n = 2; n <= plafond; n++) {
    const score = utiles.filter(d => n % d === 0 && n / d <= 12).length;
    if (score) candidats.push({ n, score });
  }
  candidats.sort((a, b) => b.score - a.score || a.n - b.n);
  return candidats.slice(0, combien).map(x => x.n).sort((a, b) => a - b);
}

/* Les en-têtes de la grille, selon l'opération */
function entetes(op, nombres) {
  const colonnes = [...nombres];
  if (op === '-') {
    /* les lignes sont décalées vers le haut pour que toute soustraction
       reste positive, ce qui fait travailler le passage de la dizaine */
    const decalage = Math.max(...nombres);
    return { lignes: nombres.map(n => n + decalage), colonnes };
  }
  if (op === '/') return { lignes: dividendes(nombres, nombres.length), colonnes };
  return { lignes: [...nombres], colonnes };
}

/* ------------------------------------------------------------------ */
/* Choix des tables                                                    */
/* ------------------------------------------------------------------ */
/* Cases proposées : les tables usuelles + celles ajoutées par l'utilisateur */
const tablesProposees = () =>
  [...new Set([...TOUTES, ...extras, ...tables])].sort((a, b) => a - b);

function construireChoixTables() {
  $('#choix-tables').innerHTML = tablesProposees().map(n => {
    const perso = !TOUTES.includes(n);
    return `<span class="table-case${perso ? ' perso' : ''}">
      <label><input type="checkbox" value="${n}"
        ${tables.includes(n) ? 'checked' : ''}>${n}</label>` +
      (perso ? `<button class="retirer" data-n="${n}" type="button"
                  title="Retirer la table de ${n}">×</button>` : '') +
      `</span>`;
  }).join('');
  majInfoTables();
}

/* Ajout d'une table personnalisée */
function ajouterTable() {
  const champ = $('#table-perso');
  const n = Number(champ.value);
  if (!Number.isInteger(n) || n < 1 || n > 50) {
    alert('Indique un nombre entier entre 1 et 50.');
    return;
  }
  if (!TOUTES.includes(n) && !extras.includes(n)) {
    extras.push(n);
    ecrire(CLES.extras, extras);
  }
  if (!tables.includes(n)) {
    tables = [...tables, n].sort((a, b) => a - b);
    ecrire(CLES.tables, tables);
  }
  champ.value = '';
  $$('.operations .btn').forEach(b => b.classList.toggle('is-active', b.dataset.op === operation));
construireChoixTables();
genererFeuilles();
  genererFeuilles();
}

$('#btn-ajout-table').addEventListener('click', ajouterTable);
$('#table-perso').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); ajouterTable(); }
});

/* Retrait d'une table personnalisée */
$('#choix-tables').addEventListener('click', (e) => {
  const btn = e.target.closest('.retirer');
  if (!btn) return;
  const n = Number(btn.dataset.n);
  extras = extras.filter(x => x !== n);
  tables = tables.filter(x => x !== n);
  ecrire(CLES.extras, extras);
  ecrire(CLES.tables, tables);
  construireChoixTables();
  genererFeuilles();
});

function majPresetActif() {
  const courant = tables.join(',');
  $$('.presets .btn').forEach(b =>
    b.classList.toggle('is-active', b.dataset.preset === courant));
}

function majInfoTables() {
  majPresetActif();
  const { lignes, colonnes } = entetes(operation, tables);
  let jouables = 0;
  lignes.forEach(l => colonnes.forEach(c => {
    if (operation === 'mixte' || attendu(l, c, operation) !== null) jouables++;
  }));
  const total = lignes.length * colonnes.length;
  const barrees = total - jouables;
  $('#info-grille').textContent =
    `Grille ${lignes.length} × ${colonnes.length} : ${jouables} calculs` +
    (barrees ? ` (${barrees} cases barrées, sans réponse entière)` : '') +
    '. La note est ramenée sur 100.';
  $('#info-operation').textContent = {
    'x': 'Le tableau croisé des tables de multiplication.',
    '+': 'Chaque case additionne son nombre de ligne et celui de colonne.',
    '-': 'Les lignes sont décalées vers le haut pour que la soustraction reste positive.',
    '/': 'Les lignes sont des dividendes ; les cases qui ne tombent pas juste sont barrées.',
    'mixte': 'Chaque case porte sa propre opération, tirée au sort.',
  }[operation];
  $('#label-tables').textContent =
    operation === '/' ? 'Diviseurs travaillés' : 'Nombres travaillés';
  $('#rappel-tables').textContent = tables.length ? tables.join(', ') : 'aucune';
}

$('#choix-tables').addEventListener('change', () => {
  tables = $$('#choix-tables input:checked').map(i => Number(i.value)).sort((a,b) => a-b);
  ecrire(CLES.tables, tables);
  majInfoTables();
  genererFeuilles();               // garde les feuilles à jour
});

$$('.operations .btn').forEach(btn => btn.addEventListener('click', () => {
  operation = btn.dataset.op;
  ecrire(CLES.operation, operation);
  $$('.operations .btn').forEach(b => b.classList.toggle('is-active', b === btn));
  majInfoTables();
  genererFeuilles();
}));

$$('.presets .btn').forEach(btn => btn.addEventListener('click', () => {
  tables = btn.dataset.preset.split(',').map(Number);
  ecrire(CLES.tables, tables);
  construireChoixTables();
  genererFeuilles();
}));

/* ------------------------------------------------------------------ */
/* Élèves                                                              */
/* ------------------------------------------------------------------ */
function rafraichirEleves() {
  const select = $('#select-eleve');
  const filtre = $('#filtre-eleve');
  const courant = select.value;

  select.innerHTML = eleves.length
    ? eleves.map(n => `<option>${echapper(n)}</option>`).join('')
    : '<option value="">— ajoute un élève —</option>';
  if (eleves.includes(courant)) select.value = courant;

  filtre.innerHTML = '<option value="">Tous les élèves</option>' +
    eleves.map(n => `<option>${echapper(n)}</option>`).join('');

  afficherRecord();
}

const echapper = (s) => String(s).replace(/[&<>"']/g,
  c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

$('#btn-ajout-eleve').addEventListener('click', () => {
  const nom = (prompt('Prénom de l’élève ?') || '').trim();
  if (!nom) return;
  if (!eleves.includes(nom)) { eleves.push(nom); ecrire(CLES.eleves, eleves); }
  rafraichirEleves();
  $('#select-eleve').value = nom;
  afficherRecord();
});

$('#select-eleve').addEventListener('change', afficherRecord);

function afficherRecord() {
  const nom = $('#select-eleve').value;
  const perso = resultats.filter(r => r.eleve === nom);
  const zone = $('#record-eleve');
  if (!nom || !perso.length) { zone.textContent = ''; return; }
  const best = meilleur(perso);
  zone.innerHTML = `Record de <strong>${echapper(nom)}</strong> : ` +
    `${afficherCorrige(best)} de temps corrigé ` +
    `(${formatTemps(best.temps)}, ${casesJustes(best)}/${totalCases(best)} justes) ` +
    `— ${perso.length} partie(s) jouée(s).`;
}

/* ------------------------------------------------------------------ */
/* Temps corrigé : temps réel + nb erreurs × coût × (temps / cases justes)
   Une erreur coûte le temps de N cases justes : la pénalité est donc
   proportionnelle au rythme du joueur (même pourcentage pour un rapide
   et pour un lent) et à la taille de la grille. Diviser par les cases
   JUSTES (et non par le total) rend l'abandon de cases perdant.        */
/* ------------------------------------------------------------------ */
const totalCases = (r) => r.total ?? 100;
const casesJustes = (r) => r.justes ?? r.note;
const nbErreurs = (r) => totalCases(r) - casesJustes(r);

function tempsCorrige(r) {
  const justes = casesJustes(r);
  if (justes <= 0) return Infinity;            // rien de juste : hors classement
  return Math.round(r.temps * (1 + coutErreur * nbErreurs(r) / justes));
}

const afficherCorrige = (r) => {
  const tc = tempsCorrige(r);
  return Number.isFinite(tc) ? formatTemps(tc) : '—';
};

/* Pourcentage ajouté par les erreurs, pour l'affichage */
function penalitePct(r) {
  const tc = tempsCorrige(r);
  if (!Number.isFinite(tc) || r.temps === 0) return null;
  return Math.round((tc / r.temps - 1) * 100);
}

/* Meilleur = plus petit temps corrigé */
const meilleur = (liste) => [...liste].sort(
  (a, b) => tempsCorrige(a) - tempsCorrige(b))[0];

/* ------------------------------------------------------------------ */
/* Partie en cours                                                     */
/* ------------------------------------------------------------------ */
let partie = null;   // { eleve, lignes, colonnes, debut, minuteur }

$('#btn-demarrer').addEventListener('click', demarrer);
$('#btn-rejouer').addEventListener('click', demarrer);
$('#btn-terminer').addEventListener('click', () => terminer(false));
$('#btn-abandon').addEventListener('click', () => {
  if (confirm('Abandonner la partie en cours ?')) { arreterChrono(); montrer('accueil'); }
});
$('#btn-retour').addEventListener('click', () => montrer('accueil'));

function montrer(ecran) {
  ['accueil','partie','resultat'].forEach(e =>
    $('#ecran-' + e).classList.toggle('hidden', e !== ecran));
  if (ecran === 'accueil') { rafraichirEleves(); }
}

function demarrer() {
  const eleve = $('#select-eleve').value;
  if (!eleve) { alert('Choisis d’abord un élève (bouton « + Nouveau »).'); return; }

  if (tables.length < 2) { alert('Choisis au moins deux tables.'); return; }

  const melange = $('#opt-melange').checked;
  const { lignes, colonnes } = entetes(operation, tables);
  partie = {
    eleve,
    tables:   [...tables],
    operation,
    lignes:   melange ? melanger(lignes) : lignes,
    colonnes: melange ? melanger(colonnes) : colonnes,
    debut: Date.now(),
    minuteur: null
  };
  /* en mélangé, l'opération est tirée case par case, une fois pour toutes */
  partie.ops = partie.lignes.map(l => partie.colonnes.map(c =>
    operation === 'mixte' ? opDeCase(l, c) : operation));

  construireGrille();
  $('#hud-nom').textContent = eleve;
  $('#hud-chrono').textContent = '00:00';
  majCompteur();
  montrer('partie');
  partie.minuteur = setInterval(() => {
    $('#hud-chrono').textContent = formatTemps(tempsEcoule());
  }, 250);
  const premier = $('#grille-jeu input');
  if (premier) premier.focus();
}

const tempsEcoule = () => Math.round((Date.now() - partie.debut) / 1000);
const arreterChrono = () => { if (partie?.minuteur) clearInterval(partie.minuteur); };

function construireGrille() {
  const t = $('#grille-jeu');
  // au-delà d'une douzaine de tables, on rétrécit les cases plutôt que
  // d'imposer un long défilement horizontal
  const cote = Math.max(30, Math.min(56, Math.round(940 / (partie.colonnes.length + 1))));
  t.style.setProperty('--case-w', cote + 'px');
  t.style.setProperty('--case-fs', Math.max(.8, Math.min(1.15, cote / 48)) + 'rem');
  const signe = OPERATIONS[partie.operation].signe;
  let html = `<tr><th class="coin">${signe}</th>` +
    partie.colonnes.map(c => `<th>${c}</th>`).join('') + '</tr>';
  partie.lignes.forEach((l, i) => {
    html += `<tr><th>${l}</th>` + partie.colonnes.map((c, j) => {
      const op = partie.ops[i][j];
      const rep = attendu(l, c, op);
      if (rep === null) {
        /* pas de réponse entière et positive : la case est hors jeu */
        return '<td class="neutre" aria-hidden="true"></td>';
      }
      const marque = partie.operation === 'mixte'
        ? `<span class="signe-case">${OPERATIONS[op].signe}</span>` : '';
      return `<td>${marque}<input type="text" inputmode="numeric" autocomplete="off" maxlength="4"
        aria-label="${l} ${OPERATIONS[op].libelle} ${c}" data-r="${i}" data-c="${j}"></td>`;
    }).join('') + '</tr>';
  });
  t.innerHTML = html;
}

/* Écouteurs posés une seule fois sur le tableau (délégation) */
$('#grille-jeu').addEventListener('input', (e) => {
  if (e.target.tagName !== 'INPUT') return;
  e.target.value = e.target.value.replace(/\D/g, '');
  majCompteur();
});
$('#grille-jeu').addEventListener('keydown', clavier);

function majCompteur() {
  const total = $$('#grille-jeu input').length;
  const remplies = $$('#grille-jeu input').filter(i => i.value.trim() !== '').length;
  $('#hud-remplies').textContent = `${remplies}/${total}`;
}

function clavier(e) {
  const inp = e.target;
  if (inp.tagName !== 'INPUT') return;
  const r = +inp.dataset.r, c = +inp.dataset.c;
  const n = partie.lignes.length;
  const aller = (dr, dc) => {
    const cible = $(`#grille-jeu input[data-r="${(r+dr+n)%n}"][data-c="${(c+dc+n)%n}"]`);
    if (cible) { cible.focus(); cible.select(); }
    e.preventDefault();
  };
  switch (e.key) {
    case 'Enter':      c === n-1 ? aller(1, 1-n) : aller(0, 1); break;
    case 'ArrowRight': if (inp.selectionStart === inp.value.length) aller(0, 1); break;
    case 'ArrowLeft':  if (inp.selectionStart === 0) aller(0, -1); break;
    case 'ArrowDown':  aller(1, 0); break;
    case 'ArrowUp':    aller(-1, 0); break;
  }
}

function terminer(force) {
  const vides = $$('#grille-jeu input').filter(i => i.value.trim() === '').length;
  if (!force && vides > 0 &&
      !confirm(`Il reste ${vides} case(s) vide(s). Terminer quand même ?`)) return;

  arreterChrono();
  const temps = tempsEcoule();
  let justes = 0;
  const cases = [];

  partie.lignes.forEach((l, i) => {
    partie.colonnes.forEach((c, j) => {
      const champ = $(`#grille-jeu input[data-r="${i}"][data-c="${j}"]`);
      if (!champ) { cases.push(null); return; }       // case hors jeu
      const saisie = champ.value.trim();
      const bonne = attendu(l, c, partie.ops[i][j]);
      const juste = saisie !== '' && Number(saisie) === bonne;
      if (juste) justes++;
      cases.push({ saisie, attendu: bonne, juste, op: partie.ops[i][j] });
    });
  });

  const total = cases.filter(Boolean).length;
  const resultat = {
    id: Date.now(),
    eleve: partie.eleve,
    date: new Date().toISOString(),
    tables: partie.tables,
    operation: partie.operation,
    justes, total,
    note: Math.round(justes / total * 100),   // ramenée sur 100
    temps
  };
  resultats.push(resultat);
  ecrire(CLES.resultats, resultats);

  afficherResultat(resultat, cases);
}

function afficherResultat(res, cases) {
  $('#res-note').textContent    = res.note;
  $('#res-justes').textContent  = `${res.justes}/${res.total}`;
  $('#res-temps').textContent   = formatTemps(res.temps);
  $('#res-erreurs').textContent = res.total - res.justes;
  $('#res-corrige').textContent = afficherCorrige(res);
  const pct = penalitePct(res);
  $('#res-detail-penalite').textContent = !pct
    ? 'aucune pénalité'
    : `+${pct} % pour ${nbErreurs(res)} erreur(s)`;

  const perso = resultats.filter(r => r.eleve === res.eleve);
  const best = meilleur(perso);
  const record = best.id === res.id && perso.length > 1;

  $('#res-titre').textContent = res.justes === res.total
    ? `Sans faute, bravo ${res.eleve} ! 🎉`
    : `Résultat de ${res.eleve}`;
  $('#res-message').textContent = record
    ? '🥇 Nouveau record personnel !'
    : `Meilleur temps corrigé de ${res.eleve} : ${afficherCorrige(best)}.`;

  // Grille de correction
  let html = `<tr><th class="coin">${OPERATIONS[partie.operation].signe}</th>` +
    partie.colonnes.map(c => `<th>${c}</th>`).join('') + '</tr>';
  let k = 0;
  partie.lignes.forEach(l => {
    html += `<tr><th>${l}</th>`;
    partie.colonnes.forEach(() => {
      const cas = cases[k++];
      if (!cas) { html += '<td class="neutre"></td>'; return; }
      html += cas.juste
        ? `<td class="juste">${cas.attendu}</td>`
        : `<td class="faux"><span class="barre">${cas.saisie || '—'}</span>` +
          `<span class="attendu">${cas.attendu}</span></td>`;
    });
    html += '</tr>';
  });
  $('#grille-correction').innerHTML = html;

  montrer('resultat');
}

/* ------------------------------------------------------------------ */
/* Scores                                                              */
/* ------------------------------------------------------------------ */
function afficherScores() {
  rafraichirEleves();

  // Podium : le meilleur résultat de chaque élève
  const parEleve = [...new Set(resultats.map(r => r.eleve))]
    .map(nom => meilleur(resultats.filter(r => r.eleve === nom)))
    .sort((a, b) => tempsCorrige(a) - tempsCorrige(b));

  $('#podium').innerHTML = parEleve.length
    ? parEleve.map((r, i) => `
        <div class="podium-place p${i+1}">
          <div class="podium-nom">${['🥇','🥈','🥉'][i] || ''} ${echapper(r.eleve)}</div>
          <div class="podium-corrige">${afficherCorrige(r)}</div>
          <div class="podium-detail">${formatTemps(r.temps)} + ${nbErreurs(r)} erreur(s)
            · ${r.note}/100</div>
        </div>`).join('')
    : '<p class="vide">Aucune partie enregistrée pour le moment.</p>';

  // Historique
  const filtre = $('#filtre-eleve').value;
  const lignes = resultats
    .filter(r => !filtre || r.eleve === filtre)
    .sort((a, b) => b.id - a.id);

  $('#table-historique tbody').innerHTML = lignes.length
    ? lignes.map(r => `<tr>
        <td>${formatDate(r.date)}</td>
        <td>${echapper(r.eleve)}</td>
        <td><strong>${r.note}</strong>/100</td>
        <td title="Tables : ${(r.tables || [1,2,3,4,5,6,7,8,9,10]).join(', ')}">
          ${OPERATIONS[r.operation || 'x'].signe} ${r.justes ?? r.note}/${r.total ?? 100}</td>
        <td>${formatTemps(r.temps)}</td>
        <td><strong>${afficherCorrige(r)}</strong></td>
        <td><button class="sup" data-id="${r.id}" title="Supprimer">✕</button></td>
      </tr>`).join('')
    : '<tr><td colspan="7" class="vide">Rien à afficher.</td></tr>';
}

$('#filtre-eleve').addEventListener('change', afficherScores);

$('#cout-erreur').addEventListener('change', (e) => {
  coutErreur = Math.min(20, Math.max(1, Number(e.target.value) || 5));
  e.target.value = String(coutErreur);
  ecrire(CLES.cout, coutErreur);
  $('#cout-info').textContent = coutErreur;
  afficherScores();
});

$('#table-historique').addEventListener('click', (e) => {
  const btn = e.target.closest('.sup');
  if (!btn) return;
  resultats = resultats.filter(r => r.id !== Number(btn.dataset.id));
  ecrire(CLES.resultats, resultats);
  afficherScores();
});

$('#btn-effacer').addEventListener('click', () => {
  if (!confirm('Effacer définitivement tous les scores enregistrés ?')) return;
  resultats = [];
  ecrire(CLES.resultats, resultats);
  afficherScores();
});

/* ------------------------------------------------------------------ */
/* Feuilles à imprimer                                                 */
/* ------------------------------------------------------------------ */
function feuilleHTML() {
  const base = entetes(operation, tables);
  const lignes = melanger(base.lignes), colonnes = melanger(base.colonnes);
  const ops = lignes.map(l => colonnes.map(c =>
    operation === 'mixte' ? opDeCase(l, c) : operation));
  let aRemplir = 0;

  let grille = `<tr><th class="coin">${OPERATIONS[operation].signe}</th>` +
    colonnes.map(c => `<th>${c}</th>`).join('') + '</tr>';
  lignes.forEach((l, i) => {
    grille += `<tr><th>${l}</th>` + colonnes.map((c, j) => {
      const op = ops[i][j];
      if (attendu(l, c, op) === null) return '<td class="neutre"></td>';
      aRemplir++;
      return operation === 'mixte'
        ? `<td><span class="signe-case">${OPERATIONS[op].signe}</span></td>`
        : '<td></td>';
    }).join('') + '</tr>';
  });

  /* Dimensionnement : la grille occupe la largeur de la page (186 mm utiles
     sur A4 avec 12 mm de marge), donc une colonne mesure 186/(n+1) mm.
     On rend les cases carrées et on plafonne à 17 mm pour les petites
     grilles ; la police suit la taille des cases. */
  const cotes   = lignes.length + 1;
  const cote    = Math.min(17, Math.round(186 / cotes * 10) / 10);
  const police  = Math.max(6, Math.min(15, Math.round(cote * 0.9 * 10) / 10));

  return `<div class="feuille" style="--case-h:${cote}mm;--case-fs:${police}pt">
    <div class="nom-ligne">Nom : ______________________</div>
    <div class="entete">
      <table>
        <tr><td>début :</td><td class="champ"></td></tr>
        <tr><td>Fin :</td><td class="champ"></td></tr>
        <tr><td>Temps :</td><td class="champ"></td></tr>
      </table>
      <table>
        <tr><td>NOTE :</td><td class="champ note-case">/${aRemplir}</td></tr>
      </table>
    </div>
    <table class="grille">${grille}</table>
  </div>`;
}

function genererFeuilles() {
  const nb = Math.min(10, Math.max(1, Number($('#nb-grilles').value) || 1));
  $('#feuilles').innerHTML = Array.from({ length: nb }, feuilleHTML).join('');
  $('#alerte-impression').classList.toggle('hidden', tables.length <= 30);
}

$('#btn-generer').addEventListener('click', genererFeuilles);
$('#nb-grilles').addEventListener('change', genererFeuilles);
$('#btn-imprimer').addEventListener('click', () => window.print());

/* Depuis l'accueil, on bascule sur l'aperçu plutôt que d'imprimer d'emblée :
   on y règle le nombre de feuilles avant de lancer l'impression. */
$('#btn-imprimer-accueil').addEventListener('click', () => {
  $('.tab[data-view="impression"]').click();
  window.scrollTo(0, 0);
});

/* ------------------------------------------------------------------ */
construireChoixTables();
$('#cout-erreur').value = String(coutErreur);
$('#cout-info').textContent = coutErreur;
rafraichirEleves();
})();
