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
];
