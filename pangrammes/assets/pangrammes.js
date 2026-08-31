/* Base de pangrammes français. Chaque phrase a été vérifiée : elle contient
   bien les 26 lettres de l'alphabet. Les mots peu courants sont expliqués. */
const PANGRAMMES = [
  {
    "texte": "Whisky vert : jugez cinq fox d'aplomb.",
    "signes": 38,
    "niveau": "court",
    "mots": [
      {
        "mot": "fox",
        "sens": "Un fox-terrier : petit chien de chasse au poil dur."
      },
      {
        "mot": "d'aplomb",
        "sens": "Bien droit, en équilibre, d'aplomb sur ses pattes."
      }
    ]
  },
  {
    "texte": "Vif juge, trempez ce blond whisky aqueux.",
    "signes": 41,
    "niveau": "court",
    "mots": [
      {
        "mot": "aqueux",
        "sens": "Qui contient beaucoup d'eau."
      }
    ]
  },
  {
    "texte": "Grimpez quand ce whisky flatte vos bijoux.",
    "signes": 42,
    "niveau": "court",
    "mots": []
  },
  {
    "texte": "Buvez de ce whisky que le patron juge fameux.",
    "signes": 45,
    "niveau": "court",
    "mots": []
  },
  {
    "texte": "Portez ce vieux whisky au juge blond qui fume.",
    "signes": 46,
    "niveau": "court",
    "mots": [
      {
        "mot": "hétéroconsonantique",
        "sens": "Le plus célèbre des pangrammes français : aucune de ses consonnes n'est répétée."
      }
    ]
  },
  {
    "texte": "Portez au juge cinq bols de vos fameux whisky.",
    "signes": 46,
    "niveau": "court",
    "mots": []
  },
  {
    "texte": "Voyez le brick géant que j'examine près du wharf.",
    "signes": 49,
    "niveau": "moyen",
    "mots": [
      {
        "mot": "brick",
        "sens": "Voilier à deux mâts."
      },
      {
        "mot": "wharf",
        "sens": "Quai sur pilotis qui avance dans la mer pour accoster."
      }
    ]
  },
  {
    "texte": "Bâchez la queue du wagon-taxi avec les pyjamas du fakir.",
    "signes": 56,
    "niveau": "moyen",
    "mots": [
      {
        "mot": "bâcher",
        "sens": "Couvrir avec une bâche, une grande toile."
      },
      {
        "mot": "fakir",
        "sens": "En Inde, un ascète ; dans les spectacles, celui qui s'allonge sur des clous."
      }
    ]
  },
  {
    "texte": "Le vif zéphyr jubile sur les kumquats du clown gracieux.",
    "signes": 56,
    "niveau": "moyen",
    "mots": [
      {
        "mot": "zéphyr",
        "sens": "Vent doux et tiède qui vient de l'ouest ; du nom du dieu grec Zéphyr."
      },
      {
        "mot": "kumquat",
        "sens": "Petit agrume orange, long comme une olive, qui se mange avec la peau."
      },
      {
        "mot": "jubiler",
        "sens": "Se réjouir très fort."
      }
    ]
  },
  {
    "texte": "Monsieur Jack, vous dactylographiez bien mieux que Wolf.",
    "signes": 56,
    "niveau": "moyen",
    "mots": [
      {
        "mot": "dactylographier",
        "sens": "Taper un texte à la machine à écrire."
      }
    ]
  },
  {
    "texte": "Mon pauvre zébu ankylosé choque deux fois ton wagon jaune.",
    "signes": 58,
    "niveau": "moyen",
    "mots": [
      {
        "mot": "zébu",
        "sens": "Grand bœuf d'Asie et d'Afrique, reconnaissable à sa bosse."
      },
      {
        "mot": "ankylosé",
        "sens": "Engourdi, raide, qui n'arrive plus à bouger."
      }
    ]
  },
  {
    "texte": "Un quetzal réfugié en kimono achète dix pyjamas verts sur le Web.",
    "signes": 65,
    "niveau": "moyen",
    "mots": [
      {
        "mot": "quetzal",
        "sens": "Oiseau d'Amérique centrale aux longues plumes vertes ; c'est aussi la monnaie du Guatemala."
      },
      {
        "mot": "kimono",
        "sens": "Vêtement traditionnel japonais, à longues manches."
      }
    ]
  },
  {
    "texte": "Voix ambiguë d'un cœur qui, au zéphyr, préfère les jattes de kiwis.",
    "signes": 67,
    "niveau": "long",
    "mots": [
      {
        "mot": "ambiguë",
        "sens": "Qui peut se comprendre de deux façons."
      },
      {
        "mot": "jatte",
        "sens": "Large récipient rond et sans anse."
      },
      {
        "mot": "zéphyr",
        "sens": "Vent doux et tiède qui vient de l'ouest."
      }
    ]
  },
  {
    "texte": "Voyez ce koala fou qui mange des journaux et des photos dans un bungalow.",
    "signes": 73,
    "niveau": "long",
    "mots": [
      {
        "mot": "bungalow",
        "sens": "Petite maison de plain-pied, souvent en bois."
      }
    ]
  },
  {
    "texte": "Joyeux, ivre, fatigué, le nez qui pique, le clown Harry skie dans l'ombre.",
    "signes": 74,
    "niveau": "long",
    "mots": []
  },
  {
    "texte": "Dans un wagon bleu, tout en mangeant cinq kiwis frais, vous jouez du xylophone.",
    "signes": 79,
    "niveau": "long",
    "mots": [
      {
        "mot": "xylophone",
        "sens": "Instrument à lames de bois que l'on frappe avec des baguettes."
      }
    ]
  },
  {
    "texte": "Dès Noël, où un zéphyr haï me vêt de glaçons würmiens, je dîne d'exquis rôtis de bœuf au kir, à l'aÿ d'âge mûr, et cætera.",
    "signes": 122,
    "niveau": "long",
    "mots": [
      {
        "mot": "würmien",
        "sens": "De la glaciation de Würm, la dernière grande période glaciaire."
      },
      {
        "mot": "kir",
        "sens": "Apéritif fait de vin blanc et de crème de cassis."
      },
      {
        "mot": "aÿ",
        "sens": "Vin de Champagne du village d'Aÿ."
      },
      {
        "mot": "et cætera",
        "sens": "« Et le reste », en latin."
      },
      {
        "mot": "record",
        "sens": "Ce pangramme contient aussi tous les accents et ligatures du français."
      }
    ]
  }
];
