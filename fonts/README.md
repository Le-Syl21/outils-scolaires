# Polices

**Marelle** — police cursive libre pour l'enseignement de l'écriture à l'école élémentaire,
version 1.005.

- `Marelle-Regular.woff2` — la cursive seule

Marelle publie aussi des variantes qui intègrent la réglure Seyes aux glyphes. Elles ne sont pas
utilisées ici : leurs traits mesurent 0,062 mm à l'interligne de 2 mm, ce qui s'affiche
parfaitement à l'écran et dans un PDF, mais ne sort pas d'une imprimante laser — test à l'appui.
La réglure est donc tracée en CSS, où son épaisseur est maîtrisée.

De cette police, on retient en revanche la géométrie exacte : hauteur d'x de 0,48 em, un trait
tous les 0,48 em, cinq interlignes par ligne d'écriture — d'où `font-size = interligne / 0,48`
et `line-height: 2.4`.

Copyright 2026 Ministère de l'Éducation nationale, de l'Enseignement supérieur et de la
Recherche, Laurent Bourcellier, Jonathan Fabreguettes et Rosalie Wagner, nom de fonte
réservé « Marelle ». Distribuée sous SIL Open Font License 1.1 : voir
[LICENSE-Marelle-OFL.txt](LICENSE-Marelle-OFL.txt).

Site du projet : <https://marelle.forge.apps.education.fr/>

Cette licence est distincte de la GPL v3 qui couvre le code de ce dépôt.
