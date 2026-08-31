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

const MARGE_MM = 10;    // marges de la feuille, identiques à l'écran et à l'impression
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
function blocHTML(p, repasses, libres, avecMots, avecGrammaire) {
  const grammaire = avecGrammaire
    ? `<p class="analyse"><strong>${echapper(p.temps)}</strong> — ${echapper(p.quand)}</p>`
    : '';
  const sens = avecMots
    ? `<p class="sens"><strong>Explication de texte :</strong> ${echapper(p.sens)}</p>`
    : '';
  const mots = (avecMots && p.mots.length)
    ? `<p class="explication">${p.mots.map(m =>
        `<span class="mot"><strong>${echapper(m.mot)}</strong> : ${echapper(m.sens)}</span>`
      ).join('')}</p>`
    : '';
  return `<section class="bloc">
    <p class="phrase-ref">${avecGrammaire ? phraseAnalysee(p) : echapper(p.texte)}</p>
    ${grammaire}${sens}${mots}
    ${Array.from({ length: repasses }, () => ligneRepasse(echapper(p.texte))).join('')}
    ${Array.from({ length: libres }, ligneVide).join('')}
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
      <div class="champ-boite"><span>Début</span></div>
      <div class="champ-boite"><span>Fin</span></div>
      <div class="champ-boite"><span>Temps</span></div>
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
  const uneSeule = $('#mode-phrases').value === 'une';

  $('#champ-choix').classList.toggle('hidden', !uneSeule);

  const feuille = $('#feuille');
  feuille.style.setProperty('--interligne', interligne + 'mm');
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
    const hautEntete = entete.getBoundingClientRect().height
                     + (consigne ? consigne.getBoundingClientRect().height : 0);
    const dispo = HAUTEUR_PAGE - hautEntete;

    /* Borne dure : si la mesure de hauteur ne dépassait jamais le seuil,
       cette boucle tournerait sans fin et figerait la page. */
    let garde = 0;
    while (garde++ < 40) {
      if (!file.length) {
        if (uneSeule) break;
        nouveauTirage();                     // la collection est épuisée : on la remélange
        file = [...tirage];
      }
      const i = file.shift();
      zone.insertAdjacentHTML('beforeend',
        blocHTML(PANGRAMMES[i], repasses, libres, avecMots, avecGrammaire));
      if (zone.getBoundingClientRect().height > dispo) {
        if (zone.children.length > 1) {      // ce bloc ira sur la page suivante
          zone.removeChild(zone.lastElementChild);
          file.unshift(i);
        }
        break;
      }
      if (uneSeule && !file.length) break;
    }
    parPage.push(zone.children.length);
  }

  majJauge(parPage);
  majPhraseChrono();
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
  if (reglages.pages)   $('#nb-pages').value     = reglages.pages;
  if (reglages.taille)  $('#taille').value       = reglages.taille;
  if (reglages.repasse) $('#nb-repasse').value   = reglages.repasse;
  if (reglages.libres)  $('#nb-libres').value    = reglages.libres;
  if ('mots' in reglages)      $('#opt-mots').checked      = reglages.mots;
  if ('grammaire' in reglages) $('#opt-grammaire').checked = reglages.grammaire;
  if ('chrono' in reglages)    $('#opt-chrono').checked    = reglages.chrono;
}

$$('#mode-phrases, #nb-pages, #taille, #nb-repasse, #nb-libres, #opt-mots, #opt-grammaire, #opt-chrono')
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
        <span class="badge badge-temps">${echapper(p.temps)}</span>
        <span>${p.signes} signes</span>
      </p>
      <p class="sens">${echapper(p.sens)}</p>
      <p class="analyse">${echapper(p.quand)}</p>
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

/* Le chrono porte sur la première phrase de la feuille */
function phraseChrono() {
  const premier = $('.zone-ecriture .phrase-ref');
  const texte = premier ? premier.textContent.trim() : PANGRAMMES[indexCourant].texte;
  return PANGRAMMES.find(p => p.texte === texte) || PANGRAMMES[indexCourant];
}
const majPhraseChrono = () => { $('#chrono-phrase').textContent = phraseChrono().texte; };

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
