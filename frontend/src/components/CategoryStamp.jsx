import CategoryIcon from "./CategoryIcon.jsx";
import { categoryMeta } from "../categories.js";

/**
 * Le "tampon de passeport" qui tient lieu de photo tant qu'aucune vraie
 * image n'est disponible pour un lieu. size: "sm" | "md" | "lg".
 */
export default function CategoryStamp({ categorie, size = "lg", showLabel = true }) {
  const meta = categoryMeta(categorie);
  return (
    <div
      className={`stamp stamp--${size}`}
      style={{ "--stamp-color": meta.color }}
      title={meta.label}
    >
      <CategoryIcon categorie={categorie} className="stamp__icon" />
      {showLabel && size === "lg" && <span className="stamp__label">{meta.label}</span>}
    </div>
  );
}
