import { useEffect, useState } from "react";
import { api } from "../api.js";
import PlaceCard from "./PlaceCard.jsx";
import PlaceDetailModal from "./PlaceDetailModal.jsx";
import { CATEGORY_ORDER, categoryMeta } from "../categories.js";

export default function PlacesExplorer() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategorie, setActiveCategorie] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  function reload() {
    setLoading(true);
    api
      .getPlaces()
      .then(setPlaces)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(reload, []);

  const visible = activeCategorie
    ? places.filter((p) => p.categorie === activeCategorie)
    : places;

  const availableCategories = [...new Set(places.map((p) => p.categorie))].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
  );

  if (loading) return <p className="loading-dots">Chargement des lieux…</p>;
  if (error) return <div className="error-banner">Impossible de charger les lieux : {error}</div>;

  return (
    <div>
      <div className="places-toolbar">
        <div className="filter-chips">
          <button
            className={`filter-chip ${activeCategorie === null ? "filter-chip--active" : ""}`}
            style={activeCategorie === null ? { background: "var(--color-ink)", color: "#fff" } : {}}
            onClick={() => setActiveCategorie(null)}
          >
            Tous ({places.length})
          </button>
          {availableCategories.map((cat) => {
            const meta = categoryMeta(cat);
            const count = places.filter((p) => p.categorie === cat).length;
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
          <p className="empty-state__title">Aucun lieu ici</p>
          <p>Essaie une autre categorie.</p>
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
