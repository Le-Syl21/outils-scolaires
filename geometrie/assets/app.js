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

/* Une figure est faite d'un ou plusieurs contours : un bateau, c'est une
   coque et une voile, deux tracés qui ne se touchent pas. */
const contoursDe = (figure) => figure.contours || [figure.points];

/* Les côtés de la figure, tels qu'ils sont décrits : pour le dessin. */
function cotesDe(figure) {
  const segs = [];
  contoursDe(figure).forEach(pts => {
    for (let i = 0; i < pts.length - 1; i++) segs.push(cleSegment(pts[i], pts[i + 1]));
    if (figure.ferme !== false) segs.push(cleSegment(pts[pts.length - 1], pts[0]));
  });
  return segs;
}

/* Un côté long se découpe en pas élémentaires. Sans cela, un enfant qui trace
   un côté de trois carreaux en trois petits traits obtiendrait un dessin
   identique mais une comparaison fausse. Le pas est le plus petit vecteur de
   même direction : une case pour un trait droit ou une diagonale à 45°, le
   vecteur entier pour une oblique du type deux à droite, un en haut. */
const pgcd = (a, b) => b ? pgcd(b, a % b) : a;

function unitesDuTrait(a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const pas = pgcd(Math.abs(dx), Math.abs(dy)) || 1;
  const ux = dx / pas, uy = dy / pas;
  const unites = [];
  for (let i = 0; i < pas; i++) {
    unites.push(cleSegment([a[0] + ux * i, a[1] + uy * i],
                           [a[0] + ux * (i + 1), a[1] + uy * (i + 1)]));
  }
  return unites;
}

/* La figure ramenée à ses pas élémentaires : c'est là-dessus qu'on compare. */
function segmentsDe(figure) {
  const unites = new Set();
  cotesDe(figure).forEach(c => {
    const [a, b] = pointsDeCle(c);
    unitesDuTrait(a, b).forEach(u => unites.add(u));
  });
  return [...unites];
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

/* Le quadrillage peut être rectangulaire : la symétrie demande deux fois la
   largeur, de part et d'autre de l'axe. */
function svgQuadrillage(cols, contenu, options = {}) {
  const lignes = options.lignes ?? cols;
  const m = 0.5;                                  // marge autour du quadrillage
  const traits = [];
  for (let i = 0; i <= cols; i++) {
    traits.push(`<line x1="${i}" y1="0" x2="${i}" y2="${lignes}" stroke="${TRAIT_GRILLE}" stroke-width="0.02"/>`);
  }
  for (let j = 0; j <= lignes; j++) {
    traits.push(`<line x1="0" y1="${j}" x2="${cols}" y2="${j}" stroke="${TRAIT_GRILLE}" stroke-width="0.02"/>`);
  }
  const noeuds = [];
  const points = [];
  for (let y = 0; y <= lignes; y++) {
    for (let x = 0; x <= cols; x++) {
      points.push(`<circle cx="${x}" cy="${y}" r="0.06" fill="${POINT_GRILLE}"/>`);
      if (options.cliquables) {
        noeuds.push(`<circle class="noeud" cx="${x}" cy="${y}" r="0.34" data-x="${x}" data-y="${y}"/>`);
      }
    }
  }
  return `<svg viewBox="${-m} ${-m} ${cols + 2 * m} ${lignes + 2 * m}"
    role="img" aria-label="quadrillage">
    <g class="grille">${traits.join('')}</g>
    <g class="points">${points.join('')}</g>
    <g class="trace">${contenu}</g>
    <g class="noeuds">${noeuds.join('')}</g>
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
/* Tous les contours réunis en un seul tracé, avec la règle « pair-impair » :
   un contour posé à l'intérieur d'un autre y creuse un trou. Sans cela, l'œil
   du poisson et la porte du château se remplissaient de la couleur de la
   figure et disparaissaient. */
const polygoneSVG = (figure) =>
  `<path class="remplissage" fill="${figure.couleur}" fill-rule="evenodd" d="${
    contoursDe(figure).map(pts =>
      'M' + pts.map(p => p.join(' ')).join(' L') + ' Z').join(' ')}"/>`;

/* À partir du troisième niveau, la figure ne se reproduit plus en face mais
   décalée dans le quadrillage : il ne suffit plus de recopiercase par case,
   il faut compter. Une croix marque le point de départ. */
function translater(figure, dx, dy) {
  return { ...figure,
    contours: contoursDe(figure).map(pts => pts.map(([x, y]) => [x + dx, y + dy])) };
}

function decalagePour(figure) {
  if (figure.palier < 3) return [0, 0];
  const pts = contoursDe(figure).flat();
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  /* on ne sort pas du quadrillage, et on se limite à deux carreaux */
  const tirer = (avant, apres) => {
    const choix = [];
    for (let d = -Math.min(2, avant); d <= Math.min(2, apres); d++) if (d) choix.push(d);
    return choix.length ? choix[Math.floor(Math.random() * choix.length)] : 0;
  };
  return [tirer(Math.min(...xs), figure.grille - Math.max(...xs)),
          tirer(Math.min(...ys), figure.grille - Math.max(...ys))];
}

/* L'axe se pose juste à droite de la figure, et le quadrillage s'arrête après
   son image : sans quoi la moitié de la feuille reste vide. */
function cadreSymetrie(figure) {
  const xs = contoursDe(figure).flat().map(p => p[0]);
  const axe = Math.max(...xs) + 1;
  return { axe, colonnes: 2 * axe - Math.min(...xs) + 1 };
}

/* La symétrie par rapport à un axe vertical : le point d'abscisse x se
   retrouve à la même distance de l'autre côté. */
const symetrique = (figure, axe) => ({ ...figure,
  contours: contoursDe(figure).map(pts => pts.map(([x, y]) => [2 * axe - x, y])) });

const axeSVG = (axe, lignes) =>
  `<line x1="${axe}" y1="-0.35" x2="${axe}" y2="${lignes + 0.35}"
     stroke="#e8501e" stroke-width="0.05" stroke-dasharray="0.4 0.25"/>`;

const croixSVG = ([x, y]) =>
  `<path d="M${x - 0.22} ${y - 0.22} L${x + 0.22} ${y + 0.22}
            M${x - 0.22} ${y + 0.22} L${x + 0.22} ${y - 0.22}"
     stroke="#e8501e" stroke-width="0.07" stroke-linecap="round"/>`;

/* ------------------------------------------------------------------ */
/* Mesures : périmètre et aire                                         */
/* ------------------------------------------------------------------ */
/* Le périmètre se compte en carreaux parcourus, l'aire par la formule du
   lacet. L'exercice se limite aux figures à angles droits et à contour
   unique : une diagonale mesure la racine de deux, et un enfant de primaire
   ne compte pas des demi-carreaux. */
const estRectiligne = (figure) => contoursDe(figure).length === 1
  && cotesDe(figure).every(c => {
       const [[x1, y1], [x2, y2]] = pointsDeCle(c);
       return x1 === x2 || y1 === y2;
     });

const perimetreDe = (figure) => segmentsDe(figure).length;

function aireDe(figure) {
  const pts = contoursDe(figure)[0];
  let deux = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    deux += x1 * y2 - x2 * y1;
  }
  return Math.abs(deux) / 2;
}

/* De quoi varier à l'infini : un rectangle, parfois amputé d'un coin.
   Le L a le même périmètre que le rectangle dont il vient — une belle
   surprise à faire découvrir. */
function figureRectiligne() {
  const l = 3 + Math.floor(Math.random() * 5);
  const h = 2 + Math.floor(Math.random() * 5);
  const x = 1, y = 1;
  /* le quadrillage colle à la figure, avec un carreau de marge : un grand
     quadrillage vide pour un petit rectangle rend le comptage plus pénible */
  const grille = Math.max(l, h) + 2;
  if (Math.random() < 0.45) {
    return { nom: 'Le rectangle', palier: 1, grille, couleur: '#e8501e',
      points: [[x, y], [x + l, y], [x + l, y + h], [x, y + h]], ferme: true };
  }
  const a = 1 + Math.floor(Math.random() * (l - 1));
  const b = 1 + Math.floor(Math.random() * (h - 1));
  return { nom: 'La figure en L', palier: 1, grille, couleur: '#1f8a4c',
    points: [[x, y], [x + l, y], [x + l, y + h - b], [x + l - a, y + h - b],
             [x + l - a, y + h], [x, y + h]], ferme: true };
}

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
  /* le nombre de côtés se compte sur le tracé réel, contours multiples compris ;
     le compter sur la liste des points oubliait la fermeture et le second contour */
  $('#choix-figure').innerHTML =
    '<option value="-1">Au hasard — tu découvriras la figure à la fin</option>' +
    liste.map((f, i) => `<option value="${i}">${echapper(f.nom)} — ${cotesDe(f).length} côtés,
      ${segmentsDe(f).length} segments</option>`).join('');
}

function demarrer(indexVoulu) {
  const eleve = $('#select-eleve').value;
  if (!eleve) { alert('Choisis d’abord un élève (bouton « + Nouveau »).'); return; }
  const liste = figuresDuPalier();
  const i = (indexVoulu !== undefined && indexVoulu >= 0)
    ? indexVoulu : Math.floor(Math.random() * liste.length);
  const figure = liste[i];

  const symetrie = $('#exercice').value === 'symetrie';
  /* en symétrie, le quadrillage est deux fois plus large : la figure donnée à
     gauche, son image à construire à droite de l'axe */
  const cadre = symetrie ? cadreSymetrie(figure) : null;
  const axe = symetrie ? cadre.axe : 0;
  const colonnes = symetrie ? cadre.colonnes : figure.grille;
  const decalage = symetrie ? [0, 0] : decalagePour(figure);
  const cible = symetrie
    ? symetrique(figure, axe)
    : translater(figure, decalage[0], decalage[1]);
  partie = {
    eleve, figure, cible, decalage, symetrie, axe, colonnes,
    attendus: segmentsDe(cible),
    traces: [],
    historique: [],          // pour annuler le dernier geste
    premier: null,
    debut: Date.now(),
    minuteur: null,
    finie: false,
  };

  $('#consigne-partie').textContent = symetrie
    ? 'Trace le symétrique de la figure, de l’autre côté de l’axe pointillé.'
    : ((decalage[0] || decalage[1])
        ? 'La figure est à reproduire décalée : commence à la croix.'
        : 'Reproduis la figure à la même place, en face.');
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
  /* en symétrie, tout se passe dans un seul quadrillage : pas de modèle à part */
  $('#atelier-modele').classList.toggle('hidden', partie.symetrie);
  if (partie.symetrie) return;
  $('#modele').innerHTML = svgQuadrillage(f.grille,
    cotesDe(f).map(c => traitSVG(c, 'modele')).join(''));
}

function dessinerCopie() {
  const f = partie.figure;
  const traits = partie.traces.map(c => traitSVG(c)).join('');
  const attente = partie.premier
    ? `<circle class="depart" cx="${partie.premier[0]}" cy="${partie.premier[1]}" r="0.18"
        fill="#e8501e"/>`
    : '';
  /* la croix du point de départ, quand la figure est à reproduire décalée */
  const repere = (partie.decalage[0] || partie.decalage[1])
    ? croixSVG(contoursDe(partie.cible)[0][0]) : '';
  /* en symétrie, la figure donnée et l'axe sont dessinés d'avance */
  const donne = partie.symetrie
    ? axeSVG(partie.axe, f.grille) + cotesDe(f).map(c => traitSVG(c, 'modele')).join('')
    : '';
  $('#copie').innerHTML = svgQuadrillage(partie.colonnes,
    donne + repere + traits + attente,
    { cliquables: true, lignes: f.grille });
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
  const unites = unitesDuTrait(partie.premier, point);
  partie.historique.push([...partie.traces]);
  const dejaLa = unites.every(u => partie.traces.includes(u));
  if (dejaLa) partie.traces = partie.traces.filter(u => !unites.includes(u));
  else unites.forEach(u => { if (!partie.traces.includes(u)) partie.traces.push(u); });
  partie.premier = null;
  dessinerCopie();
});

$('#btn-annuler').addEventListener('click', () => {
  if (!partie || partie.finie) return;
  if (partie.premier) partie.premier = null;
  else if (partie.historique.length) partie.traces = partie.historique.pop();
  dessinerCopie();
});

$('#btn-effacer-tout').addEventListener('click', () => {
  if (!partie || partie.finie) return;
  partie.historique.push([...partie.traces]);
  partie.traces = []; partie.premier = null;
  dessinerCopie();
});

$('#btn-verifier').addEventListener('click', verifier);

function verifier() {
  if (!partie || partie.finie) return;
  const attendus = new Set(partie.attendus);
  /* en symétrie, ce qui est tracé du côté donné est ignoré : ce n'est pas le
     travail demandé, et l'enfant peut repasser dessus sans être pénalisé */
  const aGauche = (c) => partie.symetrie
    && pointsDeCle(c).every(([x]) => x <= partie.axe);
  const traces = new Set(partie.traces.filter(c => !aGauche(c)));
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
  const donne = partie.symetrie
    ? axeSVG(partie.axe, partie.figure.grille)
      + cotesDe(partie.figure).map(c => traitSVG(c, 'modele')).join('')
      + (parfait ? polygoneSVG(partie.figure) : '')
    : '';
  $('#copie').innerHTML = svgQuadrillage(partie.colonnes,
    donne + (parfait ? polygoneSVG(partie.cible) : '') + correction,
    { lignes: partie.figure.grille });

  if (parfait) {
    $('#message-partie').innerHTML =
      `<strong>${echapper(partie.figure.nom)}</strong> — sans faute, en ${formatTemps(temps)} !`;
    $('#message-partie').className = 'message reussite';
  } else {
    const details = [];
    if (oublies.length) details.push(`${oublies.length} oublié(s), en pointillé`);
    if (enTrop.length) details.push(`${enTrop.length} en trop, en rouge`);
    $('#message-partie').innerHTML =
      `<strong>${note}/100</strong> — ${justes.length} segment(s) sur ${partie.attendus.length} : `
      + `${details.join(', ')}. Temps ${formatTemps(temps)}, corrigé ${formatTemps(corrige)}.`;
    $('#message-partie').className = 'message erreur';
  }
  $('#apres-partie').classList.remove('hidden');
  afficherScores();
}

/* ------------------------------------------------------------------ */
/* La série de mesures                                                 */
/* ------------------------------------------------------------------ */
const FIGURES_PAR_SERIE = 5;
let serie = null;

function tirerFigureMesurable() {
  const livrees = FIGURES.filter(estRectiligne);
  /* deux tirages sur trois viennent du générateur : les figures livrées se
     reconnaîtraient trop vite */
  return (Math.random() < 0.34 && livrees.length)
    ? livrees[Math.floor(Math.random() * livrees.length)]
    : figureRectiligne();
}

function demarrerMesures() {
  const eleve = $('#select-eleve').value;
  if (!eleve) { alert('Choisis d’abord un élève (bouton « + Nouveau »).'); return; }
  serie = {
    eleve, index: 0, justes: 0,
    figures: Array.from({ length: FIGURES_PAR_SERIE }, tirerFigureMesurable),
    debut: Date.now(), minuteur: null, finie: false,
  };
  $('#mes-nom').textContent = eleve;
  $('#mes-message').textContent = '';
  $('#mes-message').className = 'message';
  $('#mes-apres').classList.add('hidden');
  $('#ecran-accueil').classList.add('hidden');
  $('#ecran-mesures').classList.remove('hidden');
  serie.minuteur = setInterval(() => {
    $('#mes-chrono').textContent = formatTemps((Date.now() - serie.debut) / 1000);
  }, 250);
  afficherMesure();
}

function afficherMesure() {
  const f = serie.figures[serie.index];
  $('#mes-compte').textContent = `${serie.index + 1}/${FIGURES_PAR_SERIE}`;
  $('#mes-figure').innerHTML = svgQuadrillage(f.grille,
    polygoneSVG({ ...f, couleur: '#f6d9cd' })
    + cotesDe(f).map(c => traitSVG(c, 'modele')).join(''));
  $('#mes-perimetre').value = '';
  $('#mes-aire').value = '';
  $('#mes-perimetre').focus();
}

$('#btn-mes-valider').addEventListener('click', () => {
  if (!serie || serie.finie) return;
  const f = serie.figures[serie.index];
  const p = Number($('#mes-perimetre').value);
  const a = Number($('#mes-aire').value);
  const bonP = p === perimetreDe(f), bonA = a === aireDe(f);
  serie.justes += (bonP ? 1 : 0) + (bonA ? 1 : 0);

  if (!bonP || !bonA) {
    const dits = [];
    if (!bonP) dits.push(`périmètre ${perimetreDe(f)}`);
    if (!bonA) dits.push(`aire ${aireDe(f)}`);
    $('#mes-message').textContent = `Non : ${dits.join(', ')}.`;
    $('#mes-message').className = 'message erreur';
  } else {
    $('#mes-message').textContent = 'Les deux sont justes !';
    $('#mes-message').className = 'message reussite';
  }

  serie.index++;
  if (serie.index < FIGURES_PAR_SERIE) { afficherMesure(); return; }

  clearInterval(serie.minuteur);
  serie.finie = true;
  const temps = Math.max(1, Math.round((Date.now() - serie.debut) / 1000));
  const total = FIGURES_PAR_SERIE * 2;
  const erreurs = total - serie.justes;
  const note = Math.round(serie.justes / total * 100);
  const corrige = serie.justes
    ? Math.round(temps * (1 + COUT_ERREUR * erreurs / serie.justes))
    : temps * 10;
  resultats.push({
    id: Date.now(), date: new Date().toISOString(), eleve: serie.eleve,
    figure: 'Périmètre et aire', palier: 0,
    traits: total, justes: serie.justes, erreurs, note, temps, corrige,
  });
  ecrire(CLES.resultats, resultats);
  $('#mes-message').innerHTML =
    `<strong>${note}/100</strong> — ${serie.justes} bonnes réponses sur ${total}, `
    + `en ${formatTemps(temps)} (corrigé ${formatTemps(corrige)}).`;
  $('#mes-message').className = 'message ' + (note === 100 ? 'reussite' : 'erreur');
  $('#mes-apres').classList.remove('hidden');
  afficherScores();
});

$('#mes-aire').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') $('#btn-mes-valider').click();
});
$('#mes-suivante').addEventListener('click', demarrerMesures);
$('#mes-retour').addEventListener('click', () => {
  if (serie) clearInterval(serie.minuteur);
  $('#ecran-mesures').classList.add('hidden');
  $('#ecran-accueil').classList.remove('hidden');
  rafraichirEleves();
});

$('#btn-demarrer').addEventListener('click', () => {
  if ($('#exercice').value === 'mesures') { demarrerMesures(); return; }
  demarrer(Number($('#choix-figure').value));
});
$('#btn-hasard').addEventListener('click', () => {
  if ($('#exercice').value === 'mesures') { demarrerMesures(); return; }
  demarrer(-1);
});

/* le choix d'une figure précise n'a pas de sens pour une série de mesures */
$('#exercice').addEventListener('change', () => {
  const mesures = $('#exercice').value === 'mesures';
  $('#choix-figure').closest('.field').classList.toggle('hidden', mesures);
  genererFeuille();
});
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

/* Chaque palier a son carreau : grand pour débuter, plus fin ensuite */
const CARREAU_PALIER = { 1: '10', 2: '7', 3: '5', 4: '5' };

$('#palier').addEventListener('change', () => {
  const carreau = CARREAU_PALIER[$('#palier').value];
  if (carreau) $('#carreau').value = carreau;
  remplirChoixFigures();
  genererFeuille();
});

/* ------------------------------------------------------------------ */
/* La feuille                                                          */
/* ------------------------------------------------------------------ */
function genererFeuille() {
  const combien = Math.max(1, Math.min(4, Number($('#nb-exercices').value) || 1));
  const carreau = $('#carreau').value;
  const mesures = $('#exercice').value === 'mesures';
  const liste = mesures ? [] : figuresDuPalier();
  const tirage = mesures
    ? Array.from({ length: combien }, tirerFigureMesurable)
    : [...liste].sort(() => Math.random() - 0.5).slice(0, combien);
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
    <p class="consigne">${mesures
      ? 'Le côté d’un carreau vaut 1. Écris le périmètre et l’aire de chaque figure.'
      : $('#exercice').value === 'symetrie'
      ? 'Trace le symétrique de chaque figure, de l’autre côté de l’axe pointillé, à la règle '
        + 'et au crayon. Quand il est juste, colorie la figure entière.'
      : 'Reproduis chaque figure dans le quadrillage de droite, à la règle et au crayon. '
        + 'Quand elle est juste, colorie-la.'}</p>
    ${tirage.map(f => {
      /* le viewBox fait (côtés + 1) unités : la largeur suit la taille du carreau */
      const large = `style="--cotes:${f.grille + 1}"`;
      if ($('#exercice').value === 'mesures') {
        return `<div class="exercice mesure-papier">
          <div class="quadrillage papier" style="--cotes:${f.grille + 1}">${
            svgQuadrillage(f.grille, cotesDe(f).map(c => traitSVG(c, 'modele')).join(''))}</div>
          <div class="cases-mesure">
            <div class="champ-boite"><span>Périmètre</span></div>
            <div class="champ-boite"><span>Aire</span></div>
          </div>
        </div>`;
      }
      if ($('#exercice').value === 'symetrie') {
        const { axe, colonnes } = cadreSymetrie(f);
        const donne = axeSVG(axe, f.grille)
          + cotesDe(f).map(c => traitSVG(c, 'modele')).join('');
        return `<div class="exercice">
          <div class="quadrillage papier" style="--cotes:${colonnes + 1}">${
            svgQuadrillage(colonnes, donne, { lignes: f.grille })}</div>
        </div>`;
      }
      const [dx, dy] = decalagePour(f);
      const repere = (dx || dy) ? croixSVG(contoursDe(translater(f, dx, dy))[0][0]) : '';
      return `<div class="exercice">
        <div class="quadrillage papier" ${large}>${svgQuadrillage(f.grille,
          cotesDe(f).map(c => traitSVG(c, 'modele')).join(''))}</div>
        <div class="quadrillage papier" ${large}>${svgQuadrillage(f.grille, repere)}</div>
      </div>`;
    }).join('')}
  </section>`;
  ecrire(CLES.reglages, { exercices: combien, carreau, palier: $('#palier').value });
}

$('#btn-tirage').addEventListener('click', genererFeuille);
$('#btn-imprimer').addEventListener('click', () => window.print());
$$('#nb-exercices, #carreau, #exercice').forEach(el =>
  el.addEventListener('change', genererFeuille));

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
