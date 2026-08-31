/* Défi géométrique — reproduire une figure sur quadrillage.
   Tout est local : aucune donnée ne quitte le navigateur. */
(() => {
'use strict';

const CLES = {
  eleves:    'defiTables.eleves',          // la liste est commune aux défis
  resultats: 'defiGeometrie.resultats',
  reglages:  'defiGeometrie.reglages',
};
const $  = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];

const lire = (cle, defaut) => {
  try { return JSON.parse(localStorage.getItem(cle)) ?? defaut; }
  catch { return defaut; }
};
const ecrire = (cle, valeur) => {
  try { localStorage.setItem(cle, JSON.stringify(valeur)); } catch { /* mode privé */ }
};
const echapper = (s) => String(s).replace(/[&<>"']/g,
  c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatTemps = (s) => {
  const m = Math.floor(s / 60);
  return String(m).padStart(2,'0') + ':' + String(Math.floor(s % 60)).padStart(2,'0');
};
const formatDate = (iso) => new Date(iso).toLocaleString('fr-FR',
  { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' });

let eleves    = lire(CLES.eleves, []);
let resultats = lire(CLES.resultats, []);
let reglages  = lire(CLES.reglages, {});

/* Une erreur coûte le temps de quelques traits : la pénalité pèse le même
   pourcentage pour un enfant rapide et pour un enfant lent, comme au défi
   des tables. */
const COUT_ERREUR = 5;

/* ------------------------------------------------------------------ */
/* Les segments                                                        */
/* ------------------------------------------------------------------ */
/* Un trait est décrit par ses deux extrémités, rangées dans un ordre fixe :
   tracé dans un sens ou dans l'autre, c'est le même trait. */
const cleSegment = (a, b) => {
  const [p, q] = (a[0] < b[0] || (a[0] === b[0] && a[1] <= b[1])) ? [a, b] : [b, a];
  return `${p[0]},${p[1]}-${q[0]},${q[1]}`;
};

function segmentsDe(figure) {
  const pts = figure.points;
  const segs = [];
  for (let i = 0; i < pts.length - 1; i++) segs.push(cleSegment(pts[i], pts[i + 1]));
  if (figure.ferme) segs.push(cleSegment(pts[pts.length - 1], pts[0]));
  return segs;
}

const pointsDeCle = (cle) => cle.split('-').map(p => p.split(',').map(Number));

/* ------------------------------------------------------------------ */
/* Le dessin                                                           */
/* ------------------------------------------------------------------ */
/* Le quadrillage est dessiné en SVG dans un repère où une unité vaut un
   carreau : la taille réelle se règle ensuite en CSS, en millimètres pour
   le papier et en pixels pour l'écran. */
/* Les couleurs sont portées par les attributs du SVG, pas par la feuille de
   style : à l'impression, le CSS ne s'applique pas toujours aux SVG et les
   traits disparaîtraient. */
const TRAIT_GRILLE = '#9aa0a6', POINT_GRILLE = '#5f6772', ENCRE = '#111111';

function svgQuadrillage(cotes, contenu, options = {}) {
  const m = 0.5;                                  // marge autour du quadrillage
  const traits = [];
  for (let i = 0; i <= cotes; i++) {
    traits.push(`<line x1="${i}" y1="0" x2="${i}" y2="${cotes}" stroke="${TRAIT_GRILLE}" stroke-width="0.02"/>`);
    traits.push(`<line x1="0" y1="${i}" x2="${cotes}" y2="${i}" stroke="${TRAIT_GRILLE}" stroke-width="0.02"/>`);
  }
  const noeuds = options.cliquables
    ? Array.from({ length: (cotes + 1) * (cotes + 1) }, (_, k) => {
        const x = k % (cotes + 1), y = Math.floor(k / (cotes + 1));
        return `<circle class="noeud" cx="${x}" cy="${y}" r="0.34" data-x="${x}" data-y="${y}"/>`;
      }).join('')
    : '';
  return `<svg viewBox="${-m} ${-m} ${cotes + 2 * m} ${cotes + 2 * m}"
    role="img" aria-label="quadrillage">
    <g class="grille">${traits.join('')}</g>
    <g class="points">${Array.from({ length: (cotes + 1) * (cotes + 1) }, (_, k) =>
      `<circle cx="${k % (cotes + 1)}" cy="${Math.floor(k / (cotes + 1))}" r="0.06"
        fill="${POINT_GRILLE}"/>`).join('')}</g>
    <g class="trace">${contenu}</g>
    <g class="noeuds">${noeuds}</g>
  </svg>`;
}

const COULEURS_TRAIT = {
  juste: '#1f8a4c',      // le trait attendu, bien tracé
  manquant: '#8a7a72',   // oublié : montré en pointillé
  'en-trop': '#c62828',  // tracé alors qu'il n'y était pas
};

const traitSVG = (cle, classe = '') =>
  (([a, b]) => `<line class="trait ${classe}" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"
    stroke="${COULEURS_TRAIT[classe] || ENCRE}" stroke-width="0.09" stroke-linecap="round"
    ${classe === 'manquant' ? 'stroke-dasharray="0.28 0.22"' : ''}/>`)(pointsDeCle(cle));

/* La figure pleine, pour la récompense */
const polygoneSVG = (figure) =>
  `<polygon class="remplissage" points="${figure.points.map(p => p.join(',')).join(' ')}"
    fill="${figure.couleur}"/>`;

/* ------------------------------------------------------------------ */
/* Élèves                                                              */
/* ------------------------------------------------------------------ */
function rafraichirEleves() {
  eleves = lire(CLES.eleves, []);
  const select = $('#select-eleve');
  const courant = select.value;
  select.innerHTML = eleves.length
    ? eleves.map(n => `<option>${echapper(n)}</option>`).join('')
    : '<option value="">— ajoute un élève —</option>';
  if (eleves.includes(courant)) select.value = courant;
  afficherRecord();
}

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
  const siennes = resultats.filter(r => r.eleve === nom);
  $('#record-eleve').textContent = (!nom || !siennes.length)
    ? ''
    : `${siennes.length} figure(s) reproduite(s) — meilleur temps corrigé : `
      + formatTemps(meilleur(siennes).corrige);
}

const meilleur = (liste) => [...liste].sort((a, b) => a.corrige - b.corrige)[0];

/* ------------------------------------------------------------------ */
/* Une partie                                                          */
/* ------------------------------------------------------------------ */
let partie = null;

function figuresDuPalier() {
  const palier = Number($('#palier').value) || 1;
  const liste = FIGURES.filter(f => f.palier === palier);
  return liste.length ? liste : FIGURES.filter(f => f.palier === 1);
}

function remplirChoixFigures() {
  const liste = figuresDuPalier();
  $('#choix-figure').innerHTML =
    '<option value="-1">Au hasard</option>' +
    liste.map((f, i) => `<option value="${i}">Figure ${i + 1} — ${f.points.length +
      (f.ferme ? 0 : -1)} traits</option>`).join('');
}

function demarrer(indexVoulu) {
  const eleve = $('#select-eleve').value;
  if (!eleve) { alert('Choisis d’abord un élève (bouton « + Nouveau »).'); return; }
  const liste = figuresDuPalier();
  const i = (indexVoulu !== undefined && indexVoulu >= 0)
    ? indexVoulu : Math.floor(Math.random() * liste.length);
  const figure = liste[i];

  partie = {
    eleve, figure,
    attendus: segmentsDe(figure),
    traces: [],
    premier: null,
    debut: Date.now(),
    minuteur: null,
    finie: false,
  };

  $('#hud-nom').textContent = eleve;
  $('#hud-chrono').textContent = '00:00';
  $('#message-partie').textContent = '';
  $('#message-partie').className = 'message';
  $('#apres-partie').classList.add('hidden');
  $('#ecran-accueil').classList.add('hidden');
  $('#ecran-partie').classList.remove('hidden');

  dessinerModele();
  dessinerCopie();
  partie.minuteur = setInterval(() => {
    $('#hud-chrono').textContent = formatTemps(tempsEcoule());
  }, 250);
}

const tempsEcoule = () => Math.round((Date.now() - partie.debut) / 1000);

function dessinerModele() {
  const f = partie.figure;
  $('#modele').innerHTML = svgQuadrillage(f.grille,
    partie.attendus.map(c => traitSVG(c, 'modele')).join(''));
}

function dessinerCopie() {
  const f = partie.figure;
  const traits = partie.traces.map(c => traitSVG(c)).join('');
  const attente = partie.premier
    ? `<circle class="depart" cx="${partie.premier[0]}" cy="${partie.premier[1]}" r="0.18"
        fill="#e8501e"/>`
    : '';
  $('#copie').innerHTML = svgQuadrillage(f.grille, traits + attente, { cliquables: true });
  $('#hud-traits').textContent = partie.traces.length;
}

$('#copie').addEventListener('click', (e) => {
  if (!partie || partie.finie) return;
  const noeud = e.target.closest('.noeud');
  if (!noeud) return;
  const point = [Number(noeud.dataset.x), Number(noeud.dataset.y)];
  if (!partie.premier) { partie.premier = point; dessinerCopie(); return; }
  if (partie.premier[0] === point[0] && partie.premier[1] === point[1]) {
    partie.premier = null; dessinerCopie(); return;        // deux fois le même point : on annule
  }
  const cle = cleSegment(partie.premier, point);
  if (partie.traces.includes(cle)) partie.traces = partie.traces.filter(c => c !== cle);
  else partie.traces.push(cle);
  partie.premier = null;
  dessinerCopie();
});

$('#btn-annuler').addEventListener('click', () => {
  if (!partie || partie.finie) return;
  if (partie.premier) partie.premier = null;
  else partie.traces.pop();
  dessinerCopie();
});

$('#btn-effacer-tout').addEventListener('click', () => {
  if (!partie || partie.finie) return;
  partie.traces = []; partie.premier = null;
  dessinerCopie();
});

$('#btn-verifier').addEventListener('click', verifier);

function verifier() {
  if (!partie || partie.finie) return;
  const attendus = new Set(partie.attendus);
  const traces = new Set(partie.traces);
  const justes  = [...traces].filter(c => attendus.has(c));
  const enTrop  = [...traces].filter(c => !attendus.has(c));
  const oublies = [...attendus].filter(c => !traces.has(c));
  const parfait = !oublies.length && !enTrop.length;

  clearInterval(partie.minuteur);
  partie.finie = true;
  const temps = Math.max(1, tempsEcoule());
  const erreurs = oublies.length + enTrop.length;
  /* la note tient compte des traits en trop, qui alourdissent le dessin */
  const note = Math.round(justes.length / (partie.attendus.length + enTrop.length) * 100);
  /* même barème qu'au défi des tables : une erreur coûte le temps de
     quelques traits justes, donc un pourcentage du temps mis */
  const corrige = justes.length
    ? Math.round(temps * (1 + COUT_ERREUR * erreurs / justes.length))
    : temps * 10;

  resultats.push({
    id: Date.now(),
    date: new Date().toISOString(),
    eleve: partie.eleve,
    figure: partie.figure.nom,
    palier: partie.figure.palier,
    traits: partie.attendus.length,
    justes: justes.length,
    erreurs,
    note, temps, corrige,
  });
  ecrire(CLES.resultats, resultats);

  /* la correction : ce qui est juste, ce qui manque, ce qui est en trop */
  const correction = justes.map(c => traitSVG(c, 'juste')).join('')
    + oublies.map(c => traitSVG(c, 'manquant')).join('')
    + enTrop.map(c => traitSVG(c, 'en-trop')).join('');
  $('#copie').innerHTML = svgQuadrillage(partie.figure.grille,
    (parfait ? polygoneSVG(partie.figure) : '') + correction);

  if (parfait) {
    $('#message-partie').innerHTML =
      `<strong>${echapper(partie.figure.nom)}</strong> — sans faute, en ${formatTemps(temps)} !`;
    $('#message-partie').className = 'message reussite';
  } else {
    const details = [];
    if (oublies.length) details.push(`${oublies.length} oublié(s), en pointillé`);
    if (enTrop.length) details.push(`${enTrop.length} en trop, en rouge`);
    $('#message-partie').innerHTML =
      `<strong>${note}/100</strong> — ${justes.length} trait(s) sur ${partie.attendus.length} : `
      + `${details.join(', ')}. Temps ${formatTemps(temps)}, corrigé ${formatTemps(corrige)}.`;
    $('#message-partie').className = 'message erreur';
  }
  $('#apres-partie').classList.remove('hidden');
  afficherScores();
}

$('#btn-demarrer').addEventListener('click', () => demarrer(Number($('#choix-figure').value)));
$('#btn-hasard').addEventListener('click', () => demarrer(-1));
$('#btn-suivante').addEventListener('click', () => demarrer(-1));
$('#btn-refaire').addEventListener('click', () => {
  const liste = figuresDuPalier();
  demarrer(liste.indexOf(partie.figure));
});
$('#btn-retour').addEventListener('click', () => {
  if (partie) clearInterval(partie.minuteur);
  $('#ecran-partie').classList.add('hidden');
  $('#ecran-accueil').classList.remove('hidden');
  rafraichirEleves();
});

$('#palier').addEventListener('change', () => { remplirChoixFigures(); genererFeuille(); });

/* ------------------------------------------------------------------ */
/* La feuille                                                          */
/* ------------------------------------------------------------------ */
function genererFeuille() {
  const combien = Math.max(1, Math.min(4, Number($('#nb-exercices').value) || 1));
  const carreau = $('#carreau').value;
  const liste = figuresDuPalier();
  const tirage = [...liste].sort(() => Math.random() - 0.5).slice(0, combien);
  while (tirage.length < combien) tirage.push(liste[Math.floor(Math.random() * liste.length)]);

  $('#feuille').innerHTML = `<section class="page" style="--carreau:${carreau}mm">
    <header class="feuille-entete">
      <p class="feuille-titre">Le défi géométrique
        <small>Nom : ______________________  Date : ____________</small></p>
      <div class="feuille-champs">
        <div class="champ-boite"><span>Début</span></div>
        <div class="champ-boite"><span>Fin</span></div>
      </div>
    </header>
    <p class="consigne">Reproduis chaque figure dans le quadrillage de droite, à la règle et au
       crayon. Quand elle est juste, colorie-la.</p>
    ${tirage.map(f => {
      /* le viewBox fait (côtés + 1) unités : la largeur suit la taille du carreau */
      const large = `style="--cotes:${f.grille + 1}"`;
      return `<div class="exercice">
        <div class="quadrillage papier" ${large}>${svgQuadrillage(f.grille,
          segmentsDe(f).map(c => traitSVG(c, 'modele')).join(''))}</div>
        <div class="quadrillage papier" ${large}>${svgQuadrillage(f.grille, '')}</div>
      </div>`;
    }).join('')}
  </section>`;
  ecrire(CLES.reglages, { exercices: combien, carreau, palier: $('#palier').value });
}

$('#btn-tirage').addEventListener('click', genererFeuille);
$('#btn-imprimer').addEventListener('click', () => window.print());
$$('#nb-exercices, #carreau').forEach(el => el.addEventListener('change', genererFeuille));

/* ------------------------------------------------------------------ */
/* Scores                                                              */
/* ------------------------------------------------------------------ */
function afficherScores() {
  const parEleve = [...new Set(resultats.map(r => r.eleve))]
    .map(nom => meilleur(resultats.filter(r => r.eleve === nom)))
    .sort((a, b) => a.corrige - b.corrige);

  $('#podium').innerHTML = parEleve.length
    ? parEleve.map((r, i) => `<div class="podium-place p${i + 1}">
        <div class="podium-nom">${['🥇','🥈','🥉'][i] || ''} ${echapper(r.eleve)}</div>
        <div class="podium-score">${formatTemps(r.corrige)}</div>
        <div class="podium-detail">${echapper(r.figure)} · ${r.traits} traits</div>
      </div>`).join('')
    : '<p class="vide">Aucune figure reproduite pour le moment.</p>';

  const lignes = [...resultats].sort((a, b) => b.id - a.id);
  $('#table-historique tbody').innerHTML = lignes.length
    ? lignes.map(r => `<tr>
        <td>${formatDate(r.date)}</td>
        <td>${echapper(r.eleve)}</td>
        <td>${echapper(r.figure)}</td>
        <td>${r.justes ?? r.traits}/${r.traits}${r.note !== undefined ? ` · ${r.note}/100` : ''}</td>
        <td>${formatTemps(r.temps)}</td>
        <td><strong>${formatTemps(r.corrige)}</strong></td>
        <td><button class="sup" data-id="${r.id}" title="Supprimer">✕</button></td>
      </tr>`).join('')
    : '<tr><td colspan="7" class="vide">Rien à afficher.</td></tr>';
}

$('#table-historique').addEventListener('click', (e) => {
  const btn = e.target.closest('.sup');
  if (!btn) return;
  resultats = resultats.filter(r => r.id !== Number(btn.dataset.id));
  ecrire(CLES.resultats, resultats);
  afficherScores();
});

$('#btn-effacer').addEventListener('click', () => {
  if (!confirm('Effacer définitivement tous les résultats de géométrie ?')) return;
  resultats = [];
  ecrire(CLES.resultats, resultats);
  afficherScores();
});

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */
$$('.tab').forEach(tab => tab.addEventListener('click', () => {
  $$('.tab').forEach(t => t.classList.toggle('is-active', t === tab));
  $$('.view').forEach(v => v.classList.toggle('hidden', v.id !== 'view-' + tab.dataset.view));
  if (tab.dataset.view === 'scores') afficherScores();
}));

/* ------------------------------------------------------------------ */
if (reglages.exercices) $('#nb-exercices').value = reglages.exercices;
if (reglages.carreau)   $('#carreau').value = reglages.carreau;
remplirChoixFigures();
genererFeuille();
rafraichirEleves();
afficherScores();
})();
