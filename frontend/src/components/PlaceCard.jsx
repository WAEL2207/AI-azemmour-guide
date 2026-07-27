import CategoryStamp from "./CategoryStamp.jsx";
import { categoryMeta } from "../categories.js";

export default function PlaceCard({ place, onClick, style }) {
  const meta = categoryMeta(place.categorie);
  return (
    <button className="place-card" onClick={onClick} style={style}>
      <div className="place-card__photo">
        {place.photo_url ? (
          <img className="place-card__image" src={place.photo_url} alt={place.nom} />
        ) : (
          <CategoryStamp categorie={place.categorie} size="lg" />
        )}
        {place.photo_url && (
          <span className="place-card__category-chip" style={{ background: meta.color }}>
            {meta.label}
          </span>
        )}
        {place.photo_url && place.note != null && (
          <span className="place-card__rating-badge">★ {place.note.toFixed(1)}</span>
        )}
      </div>
      <div className="place-card__body">
        <h3 className="place-card__name">{place.nom}</h3>
        <p className="place-card__desc">{place.description}</p>
        <div className="place-card__meta">
          <span style={{ color: meta.color }}>{meta.label}</span>
          <span>{place.note != null ? `★ ${place.note.toFixed(1)}` : "sans note"}</span>
        </div>
      </div>
    </button>
  );
}
