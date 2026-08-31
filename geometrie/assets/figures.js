/* Les figures du défi géométrique.

   Chaque figure est une suite de points posés sur les nœuds d'un quadrillage,
   comptés depuis le coin haut gauche : [colonne, ligne]. « ferme » relie le
   dernier point au premier. Le nom et la couleur ne servent qu'à la
   récompense : ils n'apparaissent qu'une fois la figure reproduite.

   Paliers : 1 la roue (traits droits), 2 la maison (diagonales à 45°),
   3 l'atelier, 4 le vaisseau. */
const FIGURES = [
  {
    nom: 'Le carré', palier: 1, grille: 6, couleur: '#e8501e',
    points: [[1, 1], [4, 1], [4, 4], [1, 4]], ferme: true,
  },
  {
    nom: 'La porte', palier: 1, grille: 6, couleur: '#b06a1a',
    points: [[1, 0], [4, 0], [4, 5], [1, 5]], ferme: true,
  },
  {
    nom: 'La marche', palier: 1, grille: 6, couleur: '#1f8a4c',
    points: [[1, 4], [1, 2], [3, 2], [3, 1], [5, 1], [5, 4]], ferme: true,
  },
  {
    nom: 'Le coin', palier: 1, grille: 6, couleur: '#1a56b0',
    points: [[1, 1], [2, 1], [2, 3], [4, 3], [4, 4], [1, 4]], ferme: true,
  },
  {
    nom: 'Le pilier', palier: 1, grille: 6, couleur: '#7a3fa8',
    points: [[1, 1], [4, 1], [4, 2], [3, 2], [3, 3], [4, 3], [4, 4], [1, 4],
             [1, 3], [2, 3], [2, 2], [1, 2]], ferme: true,
  },
  {
    nom: 'La croix', palier: 1, grille: 7, couleur: '#c0392b',
    points: [[2, 1], [4, 1], [4, 2], [5, 2], [5, 4], [4, 4], [4, 5], [2, 5],
             [2, 4], [1, 4], [1, 2], [2, 2]], ferme: true,
  },

  /* ---- Palier 2 : la maison — les diagonales à 45° entrent en jeu ---- */
  {
    nom: 'La maison', palier: 2, grille: 8, couleur: '#c0562b',
    points: [[1, 7], [1, 4], [4, 1], [7, 4], [7, 7]], ferme: true,
  },
  {
    nom: 'La flèche', palier: 2, grille: 8, couleur: '#1a56b0',
    points: [[1, 4], [4, 1], [4, 3], [7, 3], [7, 5], [4, 5], [4, 7]], ferme: true,
  },
  {
    /* deux contours : la coque, puis la voile posée sur le pont */
    nom: 'Le bateau', palier: 2, grille: 8, couleur: '#1f7a8c',
    contours: [[[0, 5], [1, 7], [7, 7], [8, 5]],
               [[4, 1], [8, 5], [4, 5]]], ferme: true,
  },
  {
    nom: 'Le sapin', palier: 2, grille: 8, couleur: '#1f8a4c',
    points: [[4, 1], [6, 3], [5, 3], [7, 5], [5, 5], [5, 6], [3, 6], [3, 5],
             [1, 5], [3, 3], [2, 3]], ferme: true,
  },

  /* ---- Palier 3 : difficile — figures à plusieurs contours ---- */
  {
    nom: 'Le poisson', palier: 3, grille: 10, couleur: '#1f7a8c',
    contours: [[[2, 5], [5, 2], [8, 5], [5, 8]],          // le corps
               [[8, 5], [10, 3], [10, 7]],                 // la queue
               [[4, 4], [5, 4], [5, 5], [4, 5]]],          // l'œil
    ferme: true,
  },
  {
    nom: 'Le camion', palier: 3, grille: 10, couleur: '#c0562b',
    contours: [[[1, 7], [1, 5], [3, 5], [3, 3], [6, 3], [6, 5], [9, 5], [9, 7]],
               [[2, 7], [3, 7], [3, 8], [2, 8]],           // roue avant
               [[7, 7], [8, 7], [8, 8], [7, 8]]],          // roue arrière
    ferme: true,
  },
  {
    nom: 'Le château', palier: 3, grille: 10, couleur: '#7a5c3f',
    contours: [[[1, 9], [1, 4], [2, 4], [2, 3], [3, 3], [3, 4], [4, 4], [4, 3],
                [5, 3], [5, 4], [6, 4], [6, 3], [7, 3], [7, 4], [8, 4], [8, 9]],
               [[4, 9], [4, 6], [5, 6], [5, 9]]],          // la porte
    ferme: true,
  },
  {
    nom: 'La clé', palier: 3, grille: 10, couleur: '#a8641a',
    contours: [[[1, 3], [4, 3], [4, 6], [1, 6]],           // l'anneau
               [[4, 4], [9, 4], [9, 6], [8, 6], [8, 5], [7, 5], [7, 6],
                [6, 6], [6, 5], [4, 5]]],                  // la tige et les dents
    ferme: true,
  },

  /* ---- Palier 4 : expert — obliques quelconques, grandes figures ---- */
  {
    nom: 'La fusée', palier: 4, grille: 12, couleur: '#c62828',
    contours: [[[6, 0], [8, 4], [8, 8], [6, 10], [4, 8], [4, 4]],   // le corps
               [[4, 7], [2, 10], [4, 10]],                          // aileron gauche
               [[8, 7], [10, 10], [8, 10]],                         // aileron droit
               [[5, 4], [7, 4], [7, 6], [5, 6]]],                   // le hublot
    ferme: true,
  },
  {
    /* vu de dessus : fuselage vertical, deux ailes en flèche, l'empennage */
    nom: 'L’avion', palier: 4, grille: 12, couleur: '#1a56b0',
    contours: [[[6, 1], [7, 3], [7, 10], [6, 11], [5, 10], [5, 3]],  // le fuselage
               [[5, 4], [1, 8], [1, 9], [5, 7]],                     // aile gauche
               [[7, 4], [11, 8], [11, 9], [7, 7]],                   // aile droite
               [[5, 9], [3, 11], [3, 12], [5, 11]],                  // empennage gauche
               [[7, 9], [9, 11], [9, 12], [7, 11]]],                 // empennage droit
    ferme: true,
  },
  {
    nom: 'Le vaisseau spatial', palier: 4, grille: 14, couleur: '#5b3fc4',
    contours: [[[1, 8], [4, 6], [10, 6], [13, 8], [10, 10], [4, 10]],  // la soucoupe
               [[5, 6], [6, 3], [8, 3], [9, 6]],                       // le dôme
               [[5, 8], [6, 8], [6, 9], [5, 9]],                       // hublot gauche
               [[8, 8], [9, 8], [9, 9], [8, 9]],                       // hublot droit
               [[2, 11], [3, 13], [5, 13]],                            // réacteur gauche
               [[12, 11], [11, 13], [9, 13]]],                         // réacteur droit
    ferme: true,
  },
];

/* Les figures à reconnaître : ici le nom n'est plus une récompense, c'est la
   réponse. Toutes sont posées sur les nœuds du quadrillage, ce qui exclut le
   triangle équilatéral et les polygones réguliers, qui n'y tombent pas juste. */
const FORMES = [
  { nom: 'Le carré', grille: 6, couleur: '#e8501e',
    points: [[1, 1], [4, 1], [4, 4], [1, 4]],
    indice: 'Quatre côtés égaux, quatre angles droits.' },
  { nom: 'Le rectangle', grille: 6, couleur: '#b06a1a',
    points: [[1, 1], [5, 1], [5, 3], [1, 3]],
    indice: 'Quatre angles droits, mais les côtés vont deux par deux.' },
  { nom: 'Le triangle rectangle', grille: 6, couleur: '#1f8a4c',
    points: [[1, 1], [1, 5], [5, 5]],
    indice: 'Trois côtés, et un angle droit.' },
  { nom: 'Le triangle isocèle', grille: 6, couleur: '#1a56b0',
    points: [[3, 1], [5, 5], [1, 5]],
    indice: 'Trois côtés, dont deux de même longueur.' },
  { /* diagonales inégales : sinon ce serait un carré posé sur la pointe */
    nom: 'Le losange', grille: 6, couleur: '#7a3fa8',
    points: [[3, 0], [5, 3], [3, 6], [1, 3]],
    indice: 'Quatre côtés égaux, mais pas d’angle droit.' },
  { nom: 'Le parallélogramme', grille: 7, couleur: '#c62828',
    points: [[1, 4], [3, 1], [6, 1], [4, 4]],
    indice: 'Les côtés opposés sont parallèles, deux à deux.' },
  { nom: 'Le trapèze', grille: 7, couleur: '#1f7a8c',
    points: [[1, 4], [2, 1], [5, 1], [6, 4]],
    indice: 'Deux côtés parallèles seulement.' },
  { nom: 'Le pentagone', grille: 6, couleur: '#a8641a',
    points: [[3, 1], [5, 2], [4, 5], [2, 5], [1, 2]],
    indice: 'Cinq côtés.' },
  { nom: 'L’hexagone', grille: 6, couleur: '#5b3fc4',
    points: [[2, 1], [4, 1], [5, 3], [4, 5], [2, 5], [1, 3]],
    indice: 'Six côtés.' },
];
