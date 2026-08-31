/* Défi Tables — outil de révision des tables de multiplication.
   Tout est local : aucune donnée ne quitte le navigateur. */
(() => {
'use strict';

const TABLES = [1,2,3,4,5,6,7,8,9,10];
const CLES = { eleves:'defiTables.eleves', resultats:'defiTables.resultats' };
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
    `${best.note}/100 en ${formatTemps(best.temps)} — ${perso.length} partie(s) jouée(s).`;
}

/* Meilleur = note la plus haute, puis le temps le plus court */
const meilleur = (liste) => [...liste].sort(
  (a, b) => b.note - a.note || a.temps - b.temps)[0];

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

  const melange = $('#opt-melange').checked;
  partie = {
    eleve,
    lignes:   melange ? melanger(TABLES) : [...TABLES],
    colonnes: melange ? melanger(TABLES) : [...TABLES],
    debut: Date.now(),
    minuteur: null
  };

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
  let html = '<tr><th class="coin">X</th>' +
    partie.colonnes.map(c => `<th>${c}</th>`).join('') + '</tr>';
  partie.lignes.forEach((l, i) => {
    html += `<tr><th>${l}</th>` + partie.colonnes.map((c, j) =>
      `<td><input type="text" inputmode="numeric" autocomplete="off" maxlength="3"
        aria-label="${l} fois ${c}" data-r="${i}" data-c="${j}"></td>`).join('') + '</tr>';
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
  const total = TABLES.length * TABLES.length;
  const remplies = $$('#grille-jeu input').filter(i => i.value.trim() !== '').length;
  $('#hud-remplies').textContent = `${remplies}/${total}`;
}

function clavier(e) {
  const inp = e.target;
  if (inp.tagName !== 'INPUT') return;
  const r = +inp.dataset.r, c = +inp.dataset.c;
  const n = TABLES.length;
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
  let note = 0;
  const cases = [];

  partie.lignes.forEach((l, i) => {
    partie.colonnes.forEach((c, j) => {
      const saisie = $(`#grille-jeu input[data-r="${i}"][data-c="${j}"]`).value.trim();
      const attendu = l * c;
      const juste = saisie !== '' && Number(saisie) === attendu;
      if (juste) note++;
      cases.push({ saisie, attendu, juste });
    });
  });

  const resultat = {
    id: Date.now(),
    eleve: partie.eleve,
    date: new Date().toISOString(),
    note, temps
  };
  resultats.push(resultat);
  ecrire(CLES.resultats, resultats);

  afficherResultat(resultat, cases);
}

function afficherResultat(res, cases) {
  $('#res-note').textContent   = res.note;
  $('#res-temps').textContent  = formatTemps(res.temps);
  $('#res-erreurs').textContent = 100 - res.note;

  const perso = resultats.filter(r => r.eleve === res.eleve);
  const best = meilleur(perso);
  const record = best.id === res.id && perso.length > 1;

  $('#res-titre').textContent = res.note === 100
    ? `Sans faute, bravo ${res.eleve} ! 🎉`
    : `Résultat de ${res.eleve}`;
  $('#res-message').textContent = record
    ? '🥇 Nouveau record personnel !'
    : `Meilleur score : ${best.note}/100 en ${formatTemps(best.temps)}.`;

  // Grille de correction
  let html = '<tr><th class="coin">X</th>' +
    partie.colonnes.map(c => `<th>${c}</th>`).join('') + '</tr>';
  let k = 0;
  partie.lignes.forEach(l => {
    html += `<tr><th>${l}</th>`;
    partie.colonnes.forEach(() => {
      const { saisie, attendu, juste } = cases[k++];
      html += juste
        ? `<td class="juste">${attendu}</td>`
        : `<td class="faux"><span class="barre">${saisie || '—'}</span>` +
          `<span class="attendu">${attendu}</span></td>`;
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
    .sort((a, b) => b.note - a.note || a.temps - b.temps);

  $('#podium').innerHTML = parEleve.length
    ? parEleve.map((r, i) => `
        <div class="podium-place p${i+1}">
          <div class="podium-nom">${['🥇','🥈','🥉'][i] || ''} ${echapper(r.eleve)}</div>
          <div class="podium-detail">${r.note}/100 en ${formatTemps(r.temps)}</div>
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
        <td>${formatTemps(r.temps)}</td>
        <td><button class="sup" data-id="${r.id}" title="Supprimer">✕</button></td>
      </tr>`).join('')
    : '<tr><td colspan="5" class="vide">Rien à afficher.</td></tr>';
}

$('#filtre-eleve').addEventListener('change', afficherScores);

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
  const lignes = melanger(TABLES), colonnes = melanger(TABLES);
  let grille = '<tr><th class="coin">X</th>' +
    colonnes.map(c => `<th>${c}</th>`).join('') + '</tr>';
  lignes.forEach(l => {
    grille += `<tr><th>${l}</th>` + colonnes.map(() => '<td></td>').join('') + '</tr>';
  });

  return `<div class="feuille">
    <div class="nom-ligne">Nom : ______________________</div>
    <div class="entete">
      <table>
        <tr><td>début :</td><td class="champ"></td></tr>
        <tr><td>Fin :</td><td class="champ"></td></tr>
        <tr><td>Temps :</td><td class="champ"></td></tr>
      </table>
      <table>
        <tr><td>NOTE :</td><td class="champ note-case">/100</td></tr>
      </table>
    </div>
    <table class="grille">${grille}</table>
  </div>`;
}

function genererFeuilles() {
  const nb = Math.min(10, Math.max(1, Number($('#nb-grilles').value) || 1));
  $('#feuilles').innerHTML = Array.from({ length: nb }, feuilleHTML).join('');
}

$('#btn-generer').addEventListener('click', genererFeuilles);
$('#nb-grilles').addEventListener('change', genererFeuilles);
$('#btn-imprimer').addEventListener('click', () => window.print());

/* ------------------------------------------------------------------ */
rafraichirEleves();
})();
