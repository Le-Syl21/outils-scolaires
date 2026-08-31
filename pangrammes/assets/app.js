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

/* Une ligne vierge : une ligne de hauteur normale, sans texte. */
const ligneVide = () =>
  '<p class="ligne libre"><span class="calque-reglure">&nbsp;</span></p>';

/* Une ligne à repasser : la police porte à la fois la réglure et le modèle. */
const ligneRepasse = (txt) =>
  `<p class="ligne repasse"><span class="calque-reglure">${txt}</span></p>`;

const MARGE_MM = 7;     // marges de la feuille, identiques à l'écran et à l'impression
let tirage = [];        // ordre de passage des phrases sur la feuille
let generation = 0;     // annule un remplissage encore en cours

const melanger = (tab) => {
  const t = [...tab];
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
};

const nouveauTirage = () => { tirage = melanger(PANGRAMMES.map((_, i) => i)); };

/* La phrase avec chaque groupe souligné selon sa fonction */
const phraseAnalysee = (p) => p.segments.map(s =>
  s.f === 'neutre' ? echapper(s.t) : `<span class="g-${s.f}">${echapper(s.t)}</span>`).join('');

const FONCTIONS = {
  sujet:'sujet', verbe:'verbe', cod:"complément d'objet direct",
  coi:"complément d'objet indirect", cc:'complément circonstanciel',
};
const legendeHTML = () => Object.entries(FONCTIONS)
  .map(([cle, nom]) => `<span class="g-${cle}">${nom}</span>`).join(' · ');

/* Un bloc : la phrase analysée, ce qu'elle raconte, puis les lignes à écrire */
function blocHTML(p, repasses, libres, avecMots, avecGrammaire, avecChrono) {
  const grammaire = avecGrammaire
    ? `<p class="analyse"><strong>Temps du verbe :</strong> ${echapper(p.temps)} — `
      + `${echapper(p.quand)}</p>`
    : '';
  const sens = avecMots
    ? `<p class="sens"><strong>Explication de texte :</strong> ${echapper(p.sens)}</p>`
    : '';
  /* tous les mots à la suite, pour tenir sur une ou deux lignes */
  const capitale = (mot) => mot.charAt(0).toUpperCase() + mot.slice(1);
  const mots = (avecMots && p.mots.length)
    ? `<p class="explication"><strong>Mots rares :</strong> ${p.mots.map(m =>
        `<strong>${echapper(capitale(m.mot))}</strong> — ${echapper(m.sens)}`).join(' ')}</p>`
    : '';
  /* de quoi noter l'heure de départ et d'arrivée sur chaque phrase :
     l'enfant écrit loin de l'ordinateur, le temps se relève au crayon */
  const chrono = avecChrono
    ? '<span class="chrono-champs">début <b></b> fin <b></b></span>' : '';
  return `<section class="bloc">
    <p class="phrase-ref">${chrono}${avecGrammaire ? phraseAnalysee(p) : echapper(p.texte)}</p>
    ${grammaire}${sens}${mots}
    <div class="lignes">
      ${Array.from({ length: repasses }, () => ligneRepasse(echapper(p.texte))).join('')}
      ${Array.from({ length: libres }, ligneVide).join('')}
    </div>
  </section>`;
}

const MM = 96 / 25.4;                       // 1 mm en pixels CSS
const HAUTEUR_PAGE = (297 - 2 * MARGE_MM) * MM;

function enteteHTML(numero, total) {
  if (numero > 0) {
    return `<header class="feuille-entete suite">
      <p class="feuille-titre">Le défi des pangrammes
        <small>page ${numero + 1} sur ${total}</small></p></header>`;
  }
  const champs = $('#opt-chrono').checked ? `
    <div class="feuille-champs">
      <div class="champ-boite"><span>Temps total</span></div>
      <div class="champ-boite"><span>Lisibilité — /10</span></div>
    </div>` : '';
  const legende = $('#opt-grammaire').checked
    ? `<span class="legende">${legendeHTML()}</span>` : '';
  return `<header class="feuille-entete">
      <p class="feuille-titre">Le défi des pangrammes
        <small>Nom : ______________________  Date : ____________</small></p>
      ${champs}
    </header>
    <p class="consigne">Chaque phrase contient les 26 lettres de l'alphabet.
       Lis-la, puis repasse dessus en soignant le tracé. ${legende}</p>`;
}

async function construireFeuille() {
  const moi = ++generation;
  const interligne = $('#taille').value;
  const repasses = Math.max(0, Math.min(10, Number($('#nb-repasse').value) || 0));
  const libres   = Math.max(0, Math.min(10, Number($('#nb-libres').value) || 0));
  const pages    = Math.max(1, Math.min(5, Number($('#nb-pages').value) || 1));
  const avecMots = $('#opt-mots').checked;
  const avecGrammaire = $('#opt-grammaire').checked;
  const avecChrono = $('#opt-chrono').checked;
  const uneSeule = $('#mode-phrases').value === 'une';

  $('#champ-choix').classList.toggle('hidden', !uneSeule);

  const feuille = $('#feuille');
  feuille.style.setProperty('--interligne', interligne + 'mm');
  feuille.className = 'feuille reglure-' + $('#couleur-reglure').value;
  /* agrandissement d'affichage : la page reste une A4, elle est seulement
     montrée plus grande, jusqu'à la largeur disponible */
  const largeurA4 = 210 * MM;
  const zoom = Math.min(1.6, Math.max(1, (feuille.clientWidth || largeurA4) / largeurA4));
  feuille.style.setProperty('--zoom', zoom.toFixed(3));
  feuille.innerHTML = '';

  /* Les mesures n'ont de sens qu'une fois Marelle chargée. `ready` seul ne
     suffit pas : il peut se résoudre avant que le navigateur n'ait réclamé la
     police du contenu inséré, et l'on mesurerait les lignes de la police de
     repli, bien plus larges. */
  if (document.fonts) {
    try {
      await Promise.all([
        document.fonts.load(`${interligne}mm "Marelle"`),
      ]);
    } catch { /* ignore */ }
    await document.fonts.ready;
    if (moi !== generation) return;
  }

  let file = [...tirage];
  const parPage = [];

  for (let n = 0; n < pages; n++) {
    if (uneSeule) file = [indexCourant];     // la même phrase sur chaque page
    const page = document.createElement('section');
    page.className = 'page';
    page.innerHTML = enteteHTML(n, pages) + '<div class="zone-ecriture"></div>';
    feuille.appendChild(page);
    const zone = page.querySelector('.zone-ecriture');
    const entete = page.querySelector('.feuille-entete');
    const consigne = page.querySelector('.consigne');
    /* les mesures sont prises à l'écran, donc agrandies : on les ramène à
       l'échelle réelle de la page. Le facteur est mesuré plutôt que supposé,
       ce qui reste juste si le navigateur ignore l'agrandissement. */
    const echelle = page.getBoundingClientRect().width / (210 * MM);
    const mesure = (el) => el.getBoundingClientRect().height / echelle;
    const hautEntete = mesure(entete) + (consigne ? mesure(consigne) : 0);
    const dispo = HAUTEUR_PAGE - hautEntete;

    /* On remplit la page en essayant les phrases une à une. Celle qui ne
       tient pas n'arrête pas le remplissage : elle repart en fin de file et
       l'on tente la suivante, souvent plus courte. Sans cela, une phrase
       longue laissait un quart de page blanc.
       Deux bornes évitent toute boucle sans fin : le nombre de blocs posés
       et le nombre d'essais infructueux d'affilée. */
    let garde = 0, echecs = 0;
    while (garde++ < 40 && echecs < 8) {
      if (!file.length) {
        if (uneSeule) break;
        nouveauTirage();                     // la collection est épuisée : on la remélange
        file = [...tirage];
      }
      const i = file.shift();
      zone.insertAdjacentHTML('beforeend',
        blocHTML(PANGRAMMES[i], repasses, libres, avecMots, avecGrammaire, avecChrono));
      if (mesure(zone) > dispo) {
        if (zone.children.length === 1) break;   // même seule, elle déborde
        zone.removeChild(zone.lastElementChild);
        if (uneSeule) break;
        file.push(i);                        // reportée : on essaie la suivante
        echecs++;
        continue;
      }
      echecs = 0;
      if (uneSeule && !file.length) break;
    }
    parPage.push(zone.children.length);
  }

  compenserAgrandissement(zoom);
  majJauge(parPage);
  majPhraseChrono();
}

/* transform ne pousse pas ce qui suit : on rend à chaque page la hauteur
   qu'elle occupe réellement une fois agrandie. */
function compenserAgrandissement(zoom) {
  $$('#feuille .page').forEach(page => {
    const surplus = page.offsetHeight * (zoom - 1);
    page.style.marginBottom = (24 + Math.max(0, surplus)) + 'px';
  });
}

function majJauge(parPage) {
  const jauge = $('#jauge');
  if (document.fonts && !document.fonts.check('16px "Marelle"')) {
    jauge.textContent = 'La police Marelle ne s’est pas chargée : les lignes Seyes manquent.';
    jauge.className = 'jauge trop';
    return;
  }
  const total = parPage.reduce((a, b) => a + b, 0);
  jauge.textContent = parPage.length > 1
    ? `${total} phrases sur ${parPage.length} pages (${parPage.join(' + ')}) ✓`
    : `${total} phrase${total > 1 ? 's' : ''} sur la page ✓`;
  jauge.className = 'jauge ok';
}

function memoriserReglages() {
  reglages = {
    mode: $('#mode-phrases').value,
    couleur: $('#couleur-reglure').value,
    pages: $('#nb-pages').value,
    taille: $('#taille').value,
    repasse: $('#nb-repasse').value,
    libres: $('#nb-libres').value,
    mots: $('#opt-mots').checked,
    grammaire: $('#opt-grammaire').checked,
    chrono: $('#opt-chrono').checked,
  };
  ecrire(CLES.reglages, reglages);
}

function appliquerReglages() {
  if (reglages.mode)    $('#mode-phrases').value = reglages.mode;
  if (reglages.couleur) $('#couleur-reglure').value = reglages.couleur;
  if (reglages.pages)   $('#nb-pages').value     = reglages.pages;
  if (reglages.taille)  $('#taille').value       = reglages.taille;
  if (reglages.repasse) $('#nb-repasse').value   = reglages.repasse;
  if (reglages.libres)  $('#nb-libres').value    = reglages.libres;
  if ('mots' in reglages)      $('#opt-mots').checked      = reglages.mots;
  if ('grammaire' in reglages) $('#opt-grammaire').checked = reglages.grammaire;
  if ('chrono' in reglages)    $('#opt-chrono').checked    = reglages.chrono;
}

$$('#mode-phrases, #nb-pages, #couleur-reglure, #taille, #nb-repasse, #nb-libres, #opt-mots, #opt-grammaire, #opt-chrono')
  .forEach(el => el.addEventListener('change', () => {
    memoriserReglages();
    construireFeuille();
  }));

$('#choix-pangramme').addEventListener('change', (e) => {
  indexCourant = Number(e.target.value);
  construireFeuille();
});

$('#btn-tirage').addEventListener('click', () => {
  nouveauTirage();
  if ($('#mode-phrases').value === 'une') {
    indexCourant = tirage[0];
    $('#choix-pangramme').value = String(indexCourant);
  }
  construireFeuille();
});

$('#btn-imprimer').addEventListener('click', () => window.print());
window.addEventListener('resize', construireFeuille);

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
      <p class="phrase-ref">${phraseAnalysee(p)}</p>
      <p class="infos">
        <span class="badge">${p.niveau}</span>
        <span>${p.signes} signes</span>
      </p>
      <p class="sens"><strong>Explication de texte :</strong> ${echapper(p.sens)}</p>
      <p class="analyse"><strong>Temps du verbe :</strong> ${echapper(p.temps)} —
        ${echapper(p.quand)}</p>
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
$('#legende').innerHTML = 'Soulignés : ' + legendeHTML();
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

/* La phrase chronométrée : celle choisie dans la liste, sinon la première
   de la feuille — utile quand on saisit un temps relevé après coup. */
function phraseChrono() {
  const choisie = Number($('#phrase-chrono').value);
  if (Number.isInteger(choisie) && PANGRAMMES[choisie]) return PANGRAMMES[choisie];
  return PANGRAMMES[indexCourant];
}

/* Cale la liste sur la première phrase de la feuille, tant que l'utilisateur
   n'en a pas choisi une autre lui-même */
let phraseChoisieALaMain = false;
function majPhraseChrono() {
  const liste = $('#phrase-chrono');
  if (!liste.options || !liste.options.length) {
    liste.innerHTML = PANGRAMMES.map((p, i) =>
      `<option value="${i}">${echapper(p.texte)}</option>`).join('');
  }
  if (phraseChoisieALaMain) return;
  const premier = $('.zone-ecriture .phrase-ref');
  const texte = premier ? premier.textContent.trim() : PANGRAMMES[indexCourant].texte;
  const i = PANGRAMMES.findIndex(p => p.texte === texte);
  liste.value = String(i >= 0 ? i : indexCourant);
}

$('#phrase-chrono').addEventListener('change', () => { phraseChoisieALaMain = true; });

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

/* Temps relevé sur la feuille, saisi après coup */
$('#btn-temps-manuel').addEventListener('click', () => {
  if (!$('#select-eleve').value) {
    alert('Choisis d’abord un élève (bouton « + Nouveau »).');
    return;
  }
  const secondes = Math.max(1,
    (Number($('#temps-min').value) || 0) * 60 + (Number($('#temps-sec').value) || 0));
  clearInterval(minuteur); minuteur = null;
  tempsFinal = secondes;
  $('#chrono-affichage').textContent = formatTemps(secondes);
  $('#btn-chrono').textContent = 'Démarrer ▶';
  $('#bloc-lisibilite').classList.remove('hidden');
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
  const p = phraseChrono();
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
nouveauTirage();
indexCourant = tirage[0];
appliquerReglages();
remplirChoixPangrammes();
construireFeuille();
afficherCollection();
majPhraseChrono();
rafraichirEleves();
$('#lisibilite-texte').textContent = MOTS_LISIBILITE[Number($('#lisibilite').value)];
/* le remplissage définitif attend le chargement de Marelle (voir construireFeuille) */
})();
