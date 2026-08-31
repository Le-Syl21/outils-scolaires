/* Base de pangrammes français.
   Chaque phrase est vérifiée : elle contient les 26 lettres de l'alphabet, elle a un sens,
   son découpage grammatical se recompose exactement en la phrase d'origine.
   Fonctions : sujet, verbe, cod (complément d'objet direct), coi (indirect),
   cc (complément circonstanciel), neutre (liaisons et ponctuation). */
const PANGRAMMES = [
  {
    "texte": "Portez ce vieux whisky au juge blond qui fume.",
    "signes": 46,
    "niveau": "court",
    "temps": "impératif présent",
    "quand": "On donne un ordre ou un conseil. Le sujet n'est pas écrit : c'est « tu » ou « vous ».",
    "sens": "On demande d'apporter un verre au juge. C'est le pangramme français le plus célèbre : aucune de ses consonnes n'est répétée.",
    "mots": [],
    "segments": [
      {
        "t": "Portez",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "ce vieux whisky",
        "f": "cod"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "au juge blond qui fume",
        "f": "coi"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Voyez le brick géant que j'examine près du wharf.",
    "signes": 49,
    "niveau": "court",
    "temps": "impératif présent",
    "quand": "On donne un ordre ou on attire l'attention. Le sujet n'est pas écrit.",
    "sens": "Quelqu'un montre un grand voilier qu'il observe depuis le quai.",
    "mots": [
      {
        "mot": "brick",
        "sens": "Voilier à deux mâts."
      },
      {
        "mot": "wharf",
        "sens": "Quai sur pilotis qui avance dans la mer pour accoster."
      }
    ],
    "segments": [
      {
        "t": "Voyez",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "le brick géant",
        "f": "cod"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "que j'examine",
        "f": "neutre"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "près du wharf",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Monsieur Jack, vous dactylographiez bien mieux que Wolf.",
    "signes": 56,
    "niveau": "moyen",
    "temps": "présent de l'indicatif",
    "quand": "L'action se passe maintenant.",
    "sens": "On félicite monsieur Jack : il tape à la machine mieux que son ami Wolf.",
    "mots": [
      {
        "mot": "dactylographier",
        "sens": "Taper un texte à la machine à écrire."
      }
    ],
    "segments": [
      {
        "t": "Monsieur Jack, ",
        "f": "neutre"
      },
      {
        "t": "vous",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "dactylographiez",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "bien mieux que Wolf",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Voyez ce grand wombat joyeux qui pique dix kiwis chez le fakir.",
    "signes": 63,
    "niveau": "moyen",
    "temps": "impératif présent",
    "quand": "On donne un ordre ou on attire l'attention. Le sujet n'est pas écrit.",
    "sens": "Un wombat chapardeur se sert chez le fakir.",
    "mots": [
      {
        "mot": "wombat",
        "sens": "Petit marsupial australien, trapu, qui creuse des terriers."
      },
      {
        "mot": "fakir",
        "sens": "En Inde, un ascète ; dans les spectacles, celui qui s'allonge sur des clous."
      }
    ],
    "segments": [
      {
        "t": "Voyez",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "ce grand wombat joyeux",
        "f": "cod"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "qui pique dix kiwis",
        "f": "neutre"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "chez le fakir",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Un quetzal réfugié en kimono achète dix pyjamas verts sur le Web.",
    "signes": 65,
    "niveau": "moyen",
    "temps": "présent de l'indicatif",
    "quand": "L'action se passe maintenant.",
    "sens": "Un oiseau habillé en kimono fait ses courses sur Internet.",
    "mots": [
      {
        "mot": "quetzal",
        "sens": "Oiseau d'Amérique centrale aux longues plumes vertes ; c'est aussi la monnaie du Guatemala."
      },
      {
        "mot": "kimono",
        "sens": "Vêtement traditionnel japonais, à longues manches."
      }
    ],
    "segments": [
      {
        "t": "Un quetzal réfugié en kimono",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "achète",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "dix pyjamas verts",
        "f": "cod"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "sur le Web",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Voix ambiguë d'un cœur qui, au zéphyr, préfère les jattes de kiwis.",
    "signes": 67,
    "niveau": "moyen",
    "temps": "phrase nominale",
    "quand": "Cette phrase n'a pas de verbe principal : elle est construite autour d'un nom. Le seul verbe, « préfère », appartient à la partie qui commence par « qui ».",
    "sens": "Un cœur hésitant préfère les fruits au vent doux. Cette phrase contient aussi les accents et la ligature du français.",
    "mots": [
      {
        "mot": "ambiguë",
        "sens": "Qui peut se comprendre de deux façons."
      },
      {
        "mot": "zéphyr",
        "sens": "Vent doux et tiède qui vient de l'ouest ; du nom du dieu grec Zéphyr."
      },
      {
        "mot": "jatte",
        "sens": "Large récipient rond et sans anse."
      }
    ],
    "segments": [
      {
        "t": "Voix ambiguë d'un cœur",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "qui, au zéphyr, ",
        "f": "neutre"
      },
      {
        "t": "préfère",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "les jattes de kiwis",
        "f": "cod"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Jacques le kiwi voyageur emporte dix bonbons zébrés au phoque affamé.",
    "signes": 69,
    "niveau": "moyen",
    "temps": "présent de l'indicatif",
    "quand": "L'action se passe maintenant.",
    "sens": "Un oiseau apporte des friandises à un phoque qui a faim.",
    "mots": [
      {
        "mot": "kiwi",
        "sens": "Ici, l'oiseau de Nouvelle-Zélande, qui ne vole pas — et non le fruit."
      },
      {
        "mot": "zébré",
        "sens": "Rayé, comme la robe d'un zèbre."
      }
    ],
    "segments": [
      {
        "t": "Jacques le kiwi voyageur",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "emporte",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "dix bonbons zébrés",
        "f": "cod"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "au phoque affamé",
        "f": "coi"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Wilfrid, le yak boxeur, mange quinze prunes juteuses chez son voisin.",
    "signes": 69,
    "niveau": "moyen",
    "temps": "présent de l'indicatif",
    "quand": "L'action se passe maintenant.",
    "sens": "Un yak qui fait de la boxe s'invite chez le voisin pour se régaler.",
    "mots": [
      {
        "mot": "yak",
        "sens": "Grand bœuf à longs poils des hautes montagnes d'Asie."
      }
    ],
    "segments": [
      {
        "t": "Wilfrid, le yak boxeur,",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "mange",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "quinze prunes juteuses",
        "f": "cod"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "chez son voisin",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Zoé a joyeusement croqué dix kiwis frais et grimpé vers le beau chêne.",
    "signes": 70,
    "niveau": "moyen",
    "temps": "passé composé",
    "quand": "L'action est finie. Le verbe s'écrit en deux mots ; ici, un seul auxiliaire pour deux participes.",
    "sens": "Zoé a mangé des fruits, puis elle est montée dans l'arbre.",
    "mots": [],
    "segments": [
      {
        "t": "Zoé",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "a joyeusement croqué",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "dix kiwis frais",
        "f": "cod"
      },
      {
        "t": " et ",
        "f": "neutre"
      },
      {
        "t": "grimpé",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "vers le beau chêne",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Zoé, le wombat joyeux, croque dix kiwis frais et grimpe vers le chêne.",
    "signes": 70,
    "niveau": "moyen",
    "temps": "présent de l'indicatif",
    "quand": "L'action se passe maintenant. Deux verbes se suivent, reliés par « et ».",
    "sens": "La même scène, mais racontée pendant qu'elle se produit. Zoé est un wombat.",
    "mots": [
      {
        "mot": "wombat",
        "sens": "Petit marsupial australien, trapu, qui creuse des terriers."
      }
    ],
    "segments": [
      {
        "t": "Zoé, le wombat joyeux,",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "croque",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "dix kiwis frais",
        "f": "cod"
      },
      {
        "t": " et ",
        "f": "neutre"
      },
      {
        "t": "grimpe",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "vers le chêne",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Ce fakir joyeux dompte quinze wombats pygmées avec un bol de chocolat.",
    "signes": 70,
    "niveau": "moyen",
    "temps": "présent de l'indicatif",
    "quand": "L'action se passe maintenant.",
    "sens": "Un fakir apprivoise des animaux — non pas avec des clous, mais avec du chocolat.",
    "mots": [
      {
        "mot": "fakir",
        "sens": "En Inde, un ascète ; dans les spectacles, celui qui s'allonge sur des clous."
      },
      {
        "mot": "dompter",
        "sens": "Apprivoiser un animal sauvage et lui apprendre à obéir."
      },
      {
        "mot": "wombat",
        "sens": "Petit marsupial australien, trapu, qui creuse des terriers."
      }
    ],
    "segments": [
      {
        "t": "Ce fakir joyeux",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "dompte",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "quinze wombats pygmées",
        "f": "cod"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "avec un bol de chocolat",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Demain, ce wombat joyeux fabriquera quinze kiwis géants pour la chèvre.",
    "signes": 71,
    "niveau": "moyen",
    "temps": "futur simple",
    "quand": "L'action n'a pas encore eu lieu. Le verbe garde son infinitif et prend -ra.",
    "sens": "Le wombat prévoit de bricoler de faux fruits pour offrir à la chèvre.",
    "mots": [],
    "segments": [
      {
        "t": "Demain",
        "f": "cc"
      },
      {
        "t": ", ",
        "f": "neutre"
      },
      {
        "t": "ce wombat joyeux",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "fabriquera",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "quinze kiwis géants",
        "f": "cod"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "pour la chèvre",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Voyez ce koala fou qui mange des journaux et des photos dans un bungalow.",
    "signes": 73,
    "niveau": "long",
    "temps": "impératif présent",
    "quand": "On donne un ordre ou on attire l'attention.",
    "sens": "Un koala complètement fou dévore des papiers dans sa petite maison.",
    "mots": [
      {
        "mot": "bungalow",
        "sens": "Petite maison de plain-pied, souvent en bois."
      }
    ],
    "segments": [
      {
        "t": "Voyez",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "ce koala fou",
        "f": "cod"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "qui mange des journaux et des photos",
        "f": "neutre"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "dans un bungalow",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Mon zèbre joyeux a fabriqué dix kiwis géants avec du papier washi violet.",
    "signes": 73,
    "niveau": "long",
    "temps": "passé composé",
    "quand": "L'action est finie. Il faut deux mots : l'auxiliaire « avoir » ou « être », puis le participe passé.",
    "sens": "Un zèbre bricoleur a fabriqué de faux fruits en papier japonais.",
    "mots": [
      {
        "mot": "washi",
        "sens": "Papier japonais fabriqué à la main, très solide."
      }
    ],
    "segments": [
      {
        "t": "Mon zèbre joyeux",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "a fabriqué",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "dix kiwis géants",
        "f": "cod"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "avec du papier washi violet",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Douze wagons chargés de kiwis exquis filent joyeusement vers le beau parc.",
    "signes": 74,
    "niveau": "long",
    "temps": "présent de l'indicatif",
    "quand": "L'action se passe maintenant.",
    "sens": "Un train entier de fruits fonce vers le parc.",
    "mots": [],
    "segments": [
      {
        "t": "Douze wagons chargés de kiwis exquis",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "filent",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "joyeusement",
        "f": "cc"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "vers le beau parc",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Chaque jeudi, le wombat pygmée dévorait quinze kiwis exquis chez son frère.",
    "signes": 75,
    "niveau": "long",
    "temps": "imparfait",
    "quand": "L'action se répétait dans le passé : c'était une habitude.",
    "sens": "Toutes les semaines, le petit wombat allait se régaler chez son frère.",
    "mots": [
      {
        "mot": "wombat",
        "sens": "Petit marsupial australien, trapu, qui creuse des terriers."
      },
      {
        "mot": "pygmée",
        "sens": "De très petite taille, pour son espèce."
      },
      {
        "mot": "exquis",
        "sens": "Délicieux."
      }
    ],
    "segments": [
      {
        "t": "Chaque jeudi",
        "f": "cc"
      },
      {
        "t": ", ",
        "f": "neutre"
      },
      {
        "t": "le wombat pygmée",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "dévorait",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "quinze kiwis exquis",
        "f": "cod"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "chez son frère",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Ce vieux wagon jaune emporte quinze kiwis frais chez le joyeux phoque blond.",
    "signes": 76,
    "niveau": "long",
    "temps": "présent de l'indicatif",
    "quand": "L'action se passe maintenant.",
    "sens": "Un train livre des fruits à un phoque.",
    "mots": [],
    "segments": [
      {
        "t": "Ce vieux wagon jaune",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "emporte",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "quinze kiwis frais",
        "f": "cod"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "chez le joyeux phoque blond",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Le yak joyeux avait mangé dix bonbons puis visé quinze kiwis frais chez Zoé.",
    "signes": 76,
    "niveau": "long",
    "temps": "plus-que-parfait",
    "quand": "Une action déjà finie avant une autre action du passé. L'auxiliaire est à l'imparfait : « avait » suivi du participe passé.",
    "sens": "Avant qu'on arrive, le yak s'était déjà servi.",
    "mots": [
      {
        "mot": "yak",
        "sens": "Grand bœuf à longs poils des hautes montagnes d'Asie."
      }
    ],
    "segments": [
      {
        "t": "Le yak joyeux",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "avait mangé",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "dix bonbons",
        "f": "cod"
      },
      {
        "t": " puis ",
        "f": "neutre"
      },
      {
        "t": "visé",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "quinze kiwis frais",
        "f": "cod"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "chez Zoé",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Wilfrid, emmène ce yak boxeur et quinze prunes juteuses chez ton grand voisin.",
    "signes": 78,
    "niveau": "long",
    "temps": "impératif présent",
    "quand": "On donne un ordre. Le sujet n'est pas écrit : c'est « tu ».",
    "sens": "On confie à Wilfrid un yak et des prunes à livrer.",
    "mots": [
      {
        "mot": "yak",
        "sens": "Grand bœuf à longs poils des hautes montagnes d'Asie."
      }
    ],
    "segments": [
      {
        "t": "Wilfrid, ",
        "f": "neutre"
      },
      {
        "t": "emmène",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "ce yak boxeur et quinze prunes juteuses",
        "f": "cod"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "chez ton grand voisin",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Dans un wagon bleu, tout en mangeant cinq kiwis frais, vous jouez du xylophone.",
    "signes": 79,
    "niveau": "long",
    "temps": "présent de l'indicatif",
    "quand": "L'action se passe maintenant.",
    "sens": "Dans un train, quelqu'un joue de la musique tout en mangeant des fruits.",
    "mots": [
      {
        "mot": "xylophone",
        "sens": "Instrument à lames de bois que l'on frappe avec des baguettes."
      }
    ],
    "segments": [
      {
        "t": "Dans un wagon bleu",
        "f": "cc"
      },
      {
        "t": ", ",
        "f": "neutre"
      },
      {
        "t": "tout en mangeant cinq kiwis frais",
        "f": "cc"
      },
      {
        "t": ", ",
        "f": "neutre"
      },
      {
        "t": "vous",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "jouez",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "du xylophone",
        "f": "coi"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Jacky, le phoque, dévore six gaufres, quinze kiwis et un bonbon en pyjama vert.",
    "signes": 79,
    "niveau": "long",
    "temps": "présent de l'indicatif",
    "quand": "L'action se passe maintenant.",
    "sens": "Un phoque en pyjama fait un festin.",
    "mots": [],
    "segments": [
      {
        "t": "Jacky, le phoque,",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "dévore",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "six gaufres, quinze kiwis et un bonbon",
        "f": "cod"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "en pyjama vert",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Jacky, le phoque, dévora six gaufres, quinze kiwis et un bonbon en pyjama vert.",
    "signes": 79,
    "niveau": "long",
    "temps": "passé simple",
    "quand": "Le temps du récit : l'action est arrivée une fois, dans le passé. On le lit dans les livres plus qu'on ne le parle.",
    "sens": "Le même festin, raconté comme dans un livre.",
    "mots": [],
    "segments": [
      {
        "t": "Jacky, le phoque,",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "dévora",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "six gaufres, quinze kiwis et un bonbon",
        "f": "cod"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "en pyjama vert",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Quinze bijoux exquis dorment dans le pyjama chic du vieux fakir wallon grognon.",
    "signes": 79,
    "niveau": "long",
    "temps": "présent de l'indicatif",
    "quand": "L'action se passe maintenant.",
    "sens": "Un fakir belge cache son trésor dans son pyjama.",
    "mots": [
      {
        "mot": "exquis",
        "sens": "Délicieux."
      },
      {
        "mot": "fakir",
        "sens": "En Inde, un ascète ; dans les spectacles, celui qui s'allonge sur des clous."
      },
      {
        "mot": "wallon",
        "sens": "De Wallonie, la partie francophone de la Belgique."
      }
    ],
    "segments": [
      {
        "t": "Quinze bijoux exquis",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "dorment",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "dans le pyjama chic du vieux fakir wallon grognon",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Ce vieux wagon jaune emporterait quinze kiwis frais chez le joyeux phoque blond.",
    "signes": 80,
    "niveau": "long",
    "temps": "conditionnel présent",
    "quand": "L'action n'est pas sûre : elle dépend d'autre chose. Le verbe prend -rait.",
    "sens": "La même livraison, mais seulement si tout se passe bien.",
    "mots": [],
    "segments": [
      {
        "t": "Ce vieux wagon jaune",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "emporterait",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "quinze kiwis frais",
        "f": "cod"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "chez le joyeux phoque blond",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Le grand Kevin emportera bientôt douze kiwis exquis chez le fameux phoque joyeux.",
    "signes": 81,
    "niveau": "long",
    "temps": "futur simple",
    "quand": "L'action n'a pas encore eu lieu. Le verbe garde son infinitif et prend -ra.",
    "sens": "Kevin ira bientôt porter des fruits au phoque, qui est célèbre.",
    "mots": [
      {
        "mot": "exquis",
        "sens": "Délicieux."
      }
    ],
    "segments": [
      {
        "t": "Le grand Kevin",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "emportera",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "bientôt",
        "f": "cc"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "douze kiwis exquis",
        "f": "cod"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "chez le fameux phoque joyeux",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "Le yak farceur, joyeux, mange dix bonbons puis vise quinze petits kiwis chez Zoé.",
    "signes": 81,
    "niveau": "long",
    "temps": "présent de l'indicatif",
    "quand": "L'action se passe maintenant. Deux verbes se suivent, reliés par « puis ».",
    "sens": "Le yak se sert en bonbons et lorgne déjà les fruits.",
    "mots": [
      {
        "mot": "yak",
        "sens": "Grand bœuf à longs poils des hautes montagnes d'Asie."
      }
    ],
    "segments": [
      {
        "t": "Le yak farceur, joyeux,",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "mange",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "dix bonbons",
        "f": "cod"
      },
      {
        "t": " puis ",
        "f": "neutre"
      },
      {
        "t": "vise",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "quinze petits kiwis",
        "f": "cod"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "chez Zoé",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  },
  {
    "texte": "La voiture Xantia a roulé sur les zébras du Y, klaxonné cinq fois, puis foncé chez mon jeune garagiste wallon.",
    "signes": 110,
    "niveau": "long",
    "temps": "passé composé",
    "quand": "L'action est finie. Le verbe s'écrit en deux mots ; ici, un seul auxiliaire « a » commande trois participes passés.",
    "sens": "Une voiture franchit les hachures d'un carrefour en Y, klaxonne, puis file chez le garagiste.",
    "mots": [
      {
        "mot": "zébras",
        "sens": "Bandes blanches peintes en biais sur la route, qu'on ne doit pas franchir."
      },
      {
        "mot": "Xantia",
        "sens": "Un modèle de voiture des années 1990."
      },
      {
        "mot": "wallon",
        "sens": "De Wallonie, la partie francophone de la Belgique."
      }
    ],
    "segments": [
      {
        "t": "La voiture Xantia",
        "f": "sujet"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "a roulé",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "sur les zébras du Y",
        "f": "cc"
      },
      {
        "t": ", ",
        "f": "neutre"
      },
      {
        "t": "klaxonné",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "cinq fois",
        "f": "cc"
      },
      {
        "t": ", puis ",
        "f": "neutre"
      },
      {
        "t": "foncé",
        "f": "verbe"
      },
      {
        "t": " ",
        "f": "neutre"
      },
      {
        "t": "chez mon jeune garagiste wallon",
        "f": "cc"
      },
      {
        "t": ".",
        "f": "neutre"
      }
    ]
  }
];
