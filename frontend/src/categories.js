// Metadonnees partagees pour les 10 categories de lieux.
// Chaque categorie a une couleur (utilisee pour le "tampon" qui remplace
// la photo tant qu'aucune vraie image n'est disponible) et un libelle FR/EN.

export const CATEGORY_META = {
  monument: { label: { fr: "Monument", en: "Monument" }, color: "var(--cat-monument)" },
  religieux: { label: { fr: "Religieux", en: "Religious site" }, color: "var(--cat-religieux)" },
  plage: { label: { fr: "Plage", en: "Beach" }, color: "var(--cat-plage)" },
  nature: { label: { fr: "Nature", en: "Nature" }, color: "var(--cat-nature)" },
  artisanat: { label: { fr: "Artisanat", en: "Crafts" }, color: "var(--cat-artisanat)" },
  art: { label: { fr: "Art", en: "Art" }, color: "var(--cat-art)" },
  evenementiel: { label: { fr: "Evenement", en: "Events" }, color: "var(--cat-evenementiel)" },
  restaurant: { label: { fr: "Restaurant", en: "Restaurant" }, color: "var(--cat-restaurant)" },
  cafe: { label: { fr: "Cafe", en: "Cafe" }, color: "var(--cat-cafe)" },
  hotel: { label: { fr: "Hotel", en: "Hotel" }, color: "var(--cat-hotel)" },
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

export function categoryMeta(categorie, language = "fr") {
  const entry = CATEGORY_META[categorie];
  if (!entry) return { label: categorie || "?", color: "var(--color-ink-soft)" };
  return { label: entry.label[language] || entry.label.fr, color: entry.color };
}
