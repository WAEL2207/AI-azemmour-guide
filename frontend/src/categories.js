// Metadonnees partagees pour les 10 categories de lieux.
// Chaque categorie a une couleur (utilisee pour le "tampon" qui remplace
// la photo tant qu'aucune vraie image n'est disponible) et un libelle FR.

export const CATEGORY_META = {
  monument: { label: "Monument", color: "var(--cat-monument)" },
  religieux: { label: "Religieux", color: "var(--cat-religieux)" },
  plage: { label: "Plage", color: "var(--cat-plage)" },
  nature: { label: "Nature", color: "var(--cat-nature)" },
  artisanat: { label: "Artisanat", color: "var(--cat-artisanat)" },
  art: { label: "Art", color: "var(--cat-art)" },
  evenementiel: { label: "Evenement", color: "var(--cat-evenementiel)" },
  restaurant: { label: "Restaurant", color: "var(--cat-restaurant)" },
  cafe: { label: "Cafe", color: "var(--cat-cafe)" },
  hotel: { label: "Hotel", color: "var(--cat-hotel)" },
};

export const CATEGORY_ORDER = [
  "monument",
  "religieux",
  "plage",
  "nature",
  "artisanat",
  "art",
  "evenementiel",
  "restaurant",
  "cafe",
  "hotel",
];

export function categoryMeta(categorie) {
  return CATEGORY_META[categorie] || { label: categorie || "?", color: "var(--color-ink-soft)" };
}
