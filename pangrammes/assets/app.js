/* Défi des pangrammes — feuilles d'écriture cursive et course à la lisibilité.
   Tout est local : aucune donnée ne quitte le navigateur. */
(() => {
'use strict';

const CLES = {
  eleves:    'defiTables.eleves',        // liste partagée avec le Défi Tables
  resultats: 'defiEcriture.resultats',
  reglages:  'defiEcriture.reglages',
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
let indexCourant = 0;   // pangramme affiché

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */
$$('.tab').forEach(tab => tab.addEventListener('click', () => {
  $$('.tab').forEach(t => t.classList.toggle('is-active', t === tab));
  $$('.view').forEach(v => v.classList.toggle('hidden', v.id !== 'view-' + tab.dataset.view));
  if (tab.dataset.view === 'chrono') { rafraichirEleves(); afficherScores(); }
}));

const allerA = (vue) => $(`.tab[data-view="${vue}"]`).click();

/* ------------------------------------------------------------------ */
/* La feuille                                                          */
/* ------------------------------------------------------------------ */
function remplirChoixPangrammes() {
  $('#choix-pangramme').innerHTML = PANGRAMMES.map((p, i) =>
    `<option value="${i}">${echapper(p.texte)}</option>`).join('');
  $('#choix-pangramme').value = String(indexCourant);
}

/* Une ligne vierge : des espaces insécables, qui portent la réglure. */
const ligneVide = () => '<p class="ligne libre">' + '&nbsp;'.repeat(120) + '</p>';

function construireFeuille() {
  const p = PANGRAMMES[indexCourant];
  const interligne = $('#taille').value;
  const repasses = Math.max(0, Math.min(10, Number($('#nb-repasse').value) || 0));
  const libres   = Math.max(0, Math.min(30, Number($('#nb-libres').value) || 0));
  const avecMots = $('#opt-mots').checked && p.mots.length > 0;
  const avecChrono = $('#opt-chrono').checked;

  const feuille = $('#feuille');
  feuille.style.setProperty('--interligne', interligne + 'mm');

  const champs = avecChrono ? `
    <div class="feuille-champs">
      <div class="champ-boite"><span>Début</span></div>
      <div class="champ-boite"><span>Fin</span></div>
      <div class="champ-boite"><span>Temps</span></div>
      <div class="champ-boite"><span>Lisibilité — /10</span></div>
    </div>` : '';

  const lexique = avecMots ? `
    <section class="lexique">
      <h3>Les mots de la phrase</h3>
      <dl>${p.mots.map(m =>
        `<dt>${echapper(m.mot)}</dt><dd>${echapper(m.sens)}</dd>`).join('')}</dl>
    </section>` : '';

  feuille.innerHTML = `
    <div class="feuille-inner">
      <header class="feuille-entete">
        <p class="feuille-titre">Le défi des pangrammes
          <small>Nom : ______________________  Date : ____________</small></p>
        ${champs}
      </header>
      <p class="consigne">Cette phrase contient les 26 lettres de l'alphabet.
         Repasse sur le modèle pâle, puis recopie-la seul, en soignant le tracé.</p>
      <div class="zone-ecriture">
        <p class="ligne modele">${echapper(p.texte)}</p>
        ${Array.from({ length: repasses }, () =>
            `<p class="ligne repasse">${echapper(p.texte)}</p>`).join('')}
        ${Array.from({ length: libres }, ligneVide).join('')}
      </div>
      ${lexique}
    </div>`;

  majJauge();
}

/* Prévient quand la feuille déborde d'une page A4 (297 mm moins 2 × 15 mm) */
function majJauge() {
  const inner = $('.feuille-inner');
  const jauge = $('#jauge');
  if (!inner) return;
  const mm = 96 / 25.4;                       // 1 mm en pixels CSS
  const dispo = (297 - 30) * mm;
  const pages = Math.max(1, Math.ceil(inner.getBoundingClientRect().height / dispo - 0.02));
  jauge.textContent = pages === 1
    ? 'Tient sur une page ✓'
    : `Déborde sur ${pages} pages — enlève des lignes ou réduis la taille.`;
  jauge.className = 'jauge ' + (pages === 1 ? 'ok' : 'trop');
}

function memoriserReglages() {
  reglages = {
    taille: $('#taille').value,
    repasse: $('#nb-repasse').value,
    libres: $('#nb-libres').value,
    mots: $('#opt-mots').checked,
    chrono: $('#opt-chrono').checked,
  };
  ecrire(CLES.reglages, reglages);
}

function appliquerReglages() {
  if (reglages.taille)  $('#taille').value      = reglages.taille;
  if (reglages.repasse) $('#nb-repasse').value  = reglages.repasse;
  if (reglages.libres)  $('#nb-libres').value   = reglages.libres;
  if ('mots' in reglages)   $('#opt-mots').checked   = reglages.mots;
  if ('chrono' in reglages) $('#opt-chrono').checked = reglages.chrono;
}

$$('#taille, #nb-repasse, #nb-libres, #opt-mots, #opt-chrono').forEach(el =>
  el.addEventListener('change', () => { memoriserReglages(); construireFeuille(); }));

$('#choix-pangramme').addEventListener('change', (e) => {
  indexCourant = Number(e.target.value);
  construireFeuille();
  majPhraseChrono();
});

$('#btn-hasard').addEventListener('click', () => {
  if (PANGRAMMES.length < 2) return;
  let n;
  do { n = Math.floor(Math.random() * PANGRAMMES.length); } while (n === indexCourant);
  indexCourant = n;
  $('#choix-pangramme').value = String(indexCourant);
  construireFeuille();
  majPhraseChrono();
});

$('#btn-imprimer').addEventListener('click', () => window.print());
window.addEventListener('resize', majJauge);

/* ------------------------------------------------------------------ */
/* La collection                                                       */
/* ------------------------------------------------------------------ */
let filtreNiveau = '';

function afficherCollection() {
  const liste = PANGRAMMES.filter(p => !filtreNiveau || p.niveau === filtreNiveau);
  $('#compte-collection').textContent =
    `${PANGRAMMES.length} phrases dans la collection.`;
  $('#liste-pangrammes').innerHTML = liste.map(p => {
    const i = PANGRAMMES.indexOf(p);
    return `<article class="carte-pangramme">
      <p class="cursive">${echapper(p.texte)}</p>
      <p class="infos">
        <span class="badge">${p.niveau}</span>
        <span>${p.signes} signes</span>
        ${p.mots.length ? `<span>${p.mots.length} mot(s) expliqué(s)</span>` : ''}
      </p>
      ${p.mots.length ? `<ul class="mots">${p.mots.map(m =>
        `<li><strong>${echapper(m.mot)}</strong> — <span>${echapper(m.sens)}</span></li>`).join('')}</ul>` : ''}
      <button class="btn btn-ghost btn-sm" data-utiliser="${i}" type="button">
        Faire la feuille avec celui-ci</button>
    </article>`;
  }).join('') || '<p class="vide">Aucune phrase à ce niveau.</p>';
}

$$('.filtres .btn').forEach(btn => btn.addEventListener('click', () => {
  filtreNiveau = btn.dataset.niveau;
  $$('.filtres .btn').forEach(b => b.classList.toggle('is-active', b === btn));
  afficherCollection();
}));

$('#liste-pangrammes').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-utiliser]');
  if (!btn) return;
  indexCourant = Number(btn.dataset.utiliser);
  $('#choix-pangramme').value = String(indexCourant);
  construireFeuille();
  majPhraseChrono();
  allerA('feuille');
  window.scrollTo(0, 0);
});

/* ------------------------------------------------------------------ */
/* Élèves                                                              */
/* ------------------------------------------------------------------ */
function rafraichirEleves() {
  eleves = lire(CLES.eleves, []);        // le Défi Tables a pu en ajouter
  const select = $('#select-eleve');
  const courant = select.value;
  select.innerHTML = eleves.length
    ? eleves.map(n => `<option>${echapper(n)}</option>`).join('')
    : '<option value="">— ajoute un élève —</option>';
  if (eleves.includes(courant)) select.value = courant;
}

$('#btn-ajout-eleve').addEventListener('click', () => {
  const nom = (prompt('Prénom de l’élève ?') || '').trim();
  if (!nom) return;
  if (!eleves.includes(nom)) { eleves.push(nom); ecrire(CLES.eleves, eleves); }
  rafraichirEleves();
  $('#select-eleve').value = nom;
});

/* ------------------------------------------------------------------ */
/* Le chrono                                                           */
/* ------------------------------------------------------------------ */
let depart = null, minuteur = null, tempsFinal = 0;

const majPhraseChrono = () => {
  $('#chrono-phrase').textContent = PANGRAMMES[indexCourant].texte;
};

$('#btn-chrono').addEventListener('click', () => {
  if (minuteur) {                                   // arrêt
    clearInterval(minuteur); minuteur = null;
    tempsFinal = Math.max(1, (Date.now() - depart) / 1000);
    $('#chrono-affichage').textContent = formatTemps(tempsFinal);
    $('#btn-chrono').textContent = 'Démarrer ▶';
    $('#bloc-lisibilite').classList.remove('hidden');
    return;
  }
  if (!$('#select-eleve').value) {
    alert('Choisis d’abord un élève (bouton « + Nouveau »).');
    return;
  }
  depart = Date.now(); tempsFinal = 0;
  $('#bloc-lisibilite').classList.add('hidden');
  $('#btn-chrono').textContent = 'Arrêter ⏹';
  minuteur = setInterval(() => {
    $('#chrono-affichage').textContent = formatTemps((Date.now() - depart) / 1000);
  }, 200);
});

$('#btn-raz').addEventListener('click', () => {
  clearInterval(minuteur); minuteur = null; tempsFinal = 0;
  $('#chrono-affichage').textContent = '00:00';
  $('#btn-chrono').textContent = 'Démarrer ▶';
  $('#bloc-lisibilite').classList.add('hidden');
});

const MOTS_LISIBILITE = [
  '', 'Presque illisible', 'Très difficile à relire', 'Difficile à relire',
  'Lisible avec effort', 'Passable', 'Correcte', 'Bien formée',
  'Soignée', 'Très soignée', 'Impeccable',
];

$('#lisibilite').addEventListener('input', (e) => {
  const v = Number(e.target.value);
  $('#lisibilite-valeur').textContent = v;
  $('#lisibilite-texte').textContent = MOTS_LISIBILITE[v];
});

/* Score = signes lisibles par minute : la vitesse pondérée par la lisibilité */
const score = (r) => Math.round(r.signes * r.copies / (r.temps / 60) * r.lisibilite / 10);
const vitesse = (r) => Math.round(r.signes * r.copies / (r.temps / 60));

$('#btn-enregistrer').addEventListener('click', () => {
  const eleve = $('#select-eleve').value;
  if (!eleve || !tempsFinal) return;
  const p = PANGRAMMES[indexCourant];
  resultats.push({
    id: Date.now(),
    date: new Date().toISOString(),
    eleve,
    phrase: p.texte,
    signes: p.signes,
    copies: Math.max(1, Number($('#nb-copies').value) || 1),
    temps: Math.round(tempsFinal),
    lisibilite: Number($('#lisibilite').value),
  });
  ecrire(CLES.resultats, resultats);
  $('#bloc-lisibilite').classList.add('hidden');
  $('#chrono-affichage').textContent = '00:00';
  tempsFinal = 0;
  afficherScores();
});

/* ------------------------------------------------------------------ */
/* Scores                                                              */
/* ------------------------------------------------------------------ */
const meilleur = (liste) => [...liste].sort((a, b) => score(b) - score(a))[0];

function afficherScores() {
  const parEleve = [...new Set(resultats.map(r => r.eleve))]
    .map(nom => meilleur(resultats.filter(r => r.eleve === nom)))
    .sort((a, b) => score(b) - score(a));

  $('#podium').innerHTML = parEleve.length
    ? parEleve.map((r, i) => `
        <div class="podium-place p${i+1}">
          <div class="podium-nom">${['🥇','🥈','🥉'][i] || ''} ${echapper(r.eleve)}</div>
          <div class="podium-score">${score(r)}</div>
          <div class="podium-detail">signes lisibles / minute<br>
            ${vitesse(r)} signes/min · lisibilité ${r.lisibilite}/10</div>
        </div>`).join('')
    : '<p class="vide">Aucun résultat enregistré pour le moment.</p>';

  const lignes = [...resultats].sort((a, b) => b.id - a.id);
  $('#table-historique tbody').innerHTML = lignes.length
    ? lignes.map(r => `<tr>
        <td>${formatDate(r.date)}</td>
        <td>${echapper(r.eleve)}</td>
        <td><strong>${score(r)}</strong></td>
        <td>${vitesse(r)} s/min<br><span class="note-info">${formatTemps(r.temps)} · ${r.copies} copie(s)</span></td>
        <td>${r.lisibilite}/10</td>
        <td class="phrase" title="${echapper(r.phrase)}">${echapper(r.phrase)}</td>
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
  if (!confirm('Effacer définitivement tous les résultats d’écriture ?')) return;
  resultats = [];
  ecrire(CLES.resultats, resultats);
  afficherScores();
});

/* ------------------------------------------------------------------ */
indexCourant = Math.floor(Math.random() * PANGRAMMES.length);   // une phrase au hasard
appliquerReglages();
remplirChoixPangrammes();
construireFeuille();
afficherCollection();
majPhraseChrono();
rafraichirEleves();
$('#lisibilite-texte').textContent = MOTS_LISIBILITE[Number($('#lisibilite').value)];
document.fonts?.ready.then(majJauge);      // la jauge attend le chargement de Marelle
})();
