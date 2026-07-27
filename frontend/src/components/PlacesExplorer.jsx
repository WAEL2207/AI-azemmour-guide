import { useEffect, useState } from "react";
import { api } from "../api.js";
import PlaceCard from "./PlaceCard.jsx";
import PlaceDetailModal from "./PlaceDetailModal.jsx";
import { CATEGORY_ORDER, categoryMeta } from "../categories.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translatePlace } from "../i18n/placeTranslations.js";

export default function PlacesExplorer() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategorie, setActiveCategorie] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const { language, strings } = useLanguage();

  function reload() {
    setLoading(true);
    api
      .getPlaces()
      .then(setPlaces)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(reload, []);

  const displayPlaces = places.map((p) => translatePlace(p, language));

  const visible = activeCategorie
    ? displayPlaces.filter((p) => p.categorie === activeCategorie)
    : displayPlaces;

  const availableCategories = [...new Set(displayPlaces.map((p) => p.categorie))].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
  );

  if (loading) return <p className="loading-dots">{strings.loadingPlaces}</p>;
  if (error)
    return (
      <div className="error-banner">
        {strings.loadErrorPrefix} {error}
      </div>
    );

  return (
    <div>
      <div className="places-toolbar">
        <div className="filter-chips">
          <button
            className={`filter-chip ${activeCategorie === null ? "filter-chip--active" : ""}`}
            style={activeCategorie === null ? { background: "var(--color-ink)", color: "#fff" } : {}}
            onClick={() => setActiveCategorie(null)}
          >
            {strings.filterAll} ({displayPlaces.length})
          </button>
          {availableCategories.map((cat) => {
            const meta = categoryMeta(cat, language);
            const count = displayPlaces.filter((p) => p.categorie === cat).length;
            const active = activeCategorie === cat;
            return (
              <button
                key={cat}
                className={`filter-chip ${active ? "filter-chip--active" : ""}`}
                style={active ? { background: meta.color } : {}}
                onClick={() => setActiveCategorie(active ? null : cat)}
              >
                {meta.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">{strings.emptyTitle}</p>
          <p>{strings.emptyText}</p>
        </div>
      ) : (
        <div className="places-grid">
          {visible.map((place, i) => (
            <PlaceCard
              key={place.id}
              place={place}
              onClick={() => setSelectedPlace(place)}
              style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
            />
          ))}
        </div>
      )}

      {selectedPlace && (
        <PlaceDetailModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />
      )}
    </div>
  );
}
