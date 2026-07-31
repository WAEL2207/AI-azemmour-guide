// Traductions anglaises du contenu des lieux (nom + description). Le
// backend reste la source de verite en francais (voir backend/data/
// places_store.json) ; ce fichier ne fait que fournir une couche
// d'affichage EN cote frontend, indexee par id de lieu.
const PLACE_TRANSLATIONS_EN = {
  1: {
    nom: "Old Medina-Kasbah of Azemmour",
    description:
      "Fortified old town blending Portuguese, Arab and Andalusian influences, with whitewashed alleys and colorful murals.",
  },
  2: {
    nom: "Ramparts and Bab La Kasbah",
    description:
      "Gate and ramparts built by the Portuguese between 1513 and 1541, leading into the historic medina and overlooking the river.",
  },
  3: {
    nom: "Kasbah-Ibn Nafii Mosque",
    description: "Old kasbah mosque named after the region's first Muslim governor.",
  },
  4: {
    nom: "Shrine of Rabbi Abraham Moul Niss",
    description:
      "Jewish pilgrimage site housing the tombs of two revered saints, a testament to the town's Judeo-Moroccan past.",
  },
  6: {
    nom: "El Haouzia Beach",
    description: "Large fine-sand beach bordered by a forest, known for surfing and walks.",
  },
  7: {
    nom: "Azemmour Corniche",
    description: "Waterfront promenade with views over the Oum Er-Rbia river and the fortified medina.",
  },
  8: {
    nom: "House of Crafts (Dar Sanii)",
    description:
      "Whitewashed arcaded building housing local artisans, notably Azemmour's traditional embroidery.",
  },
  9: {
    nom: "El Hani Mohamed Art's Gallery",
    description: "Contemporary art exhibition space located in the medina.",
  },
  10: {
    nom: "Moulay Bouchaib Mausoleum and Cemetery",
    description:
      "Mausoleum of Azemmour's patron saint, Moulay Bouchaib, adjoining a historic cemetery - a place of pilgrimage and quiet reflection.",
  },
  11: {
    nom: "Mohammed VI Exhibition Park",
    description: "Exhibition center a few kilometers from the medina, hosting events and golfers.",
  },
  12: {
    nom: "Ibiza Hotel",
    description:
      "3-star hotel on the main boulevard, with its own restaurant and cafe, warm atmosphere near the medina.",
  },
  13: {
    nom: "Riad7",
    description: "Charming guesthouse in the old medina, with spa, rooftop terrace and its own restaurant.",
  },
  14: {
    nom: "Honey House",
    description: "Friendly restaurant serving Moroccan cuisine and pizzas, well loved for its warm welcome.",
  },
  22: {
    nom: "Medina Murals",
    description:
      "Street art trail through the medina's alleys, a legacy of the mural festival that earned Azemmour its nickname as the city of artists.",
  },
  23: {
    nom: "Dar Kbira",
    description: "Guesthouse and restaurant with a terrace overlooking the Oued Oum Er-Rbia.",
  },
};

/**
 * Renvoie `place` (ou un objet plus leger comme une etape d'itineraire) avec
 * son nom (et sa description si presente) traduits en anglais lorsque
 * `language === "en"` et qu'une traduction existe. Sinon renvoie l'objet
 * inchange (francais par defaut, ou traduction manquante).
 */
export function translatePlace(place, language) {
  if (language !== "en" || !place) return place;
  const tr = PLACE_TRANSLATIONS_EN[place.id];
  if (!tr) return place;
  return {
    ...place,
    nom: tr.nom,
    ...(place.description !== undefined ? { description: tr.description } : {}),
  };
}
