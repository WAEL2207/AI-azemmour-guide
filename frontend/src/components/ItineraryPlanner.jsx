import { useState } from "react";
import { api } from "../api.js";
import { CATEGORY_ORDER, categoryMeta } from "../categories.js";
import CategoryIcon from "./CategoryIcon.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translatePlace } from "../i18n/placeTranslations.js";

export default function ItineraryPlanner() {
  const [selected, setSelected] = useState(new Set(["monument", "religieux", "artisanat"]));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { language, strings } = useLanguage();

  function toggle(cat) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  async function generer() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.itineraire([...selected]);
      setResult(res);
    } catch (e) {
      setError(e.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="itinerary-controls">
        <p className="itinerary-controls__label">{strings.itineraryChoose}</p>
        <div className="category-toggle-grid">
          {CATEGORY_ORDER.map((cat) => {
            const meta = categoryMeta(cat, language);
            const active = selected.has(cat);
            return (
              <button
                key={cat}
                className={`category-toggle ${active ? "category-toggle--active" : ""}`}
                style={{ "--toggle-color": meta.color }}
                onClick={() => toggle(cat)}
              >
                <CategoryIcon categorie={cat} style={{ width: 16, height: 16 }} />
                {meta.label}
              </button>
            );
          })}
        </div>
        <button className="btn" onClick={generer} disabled={selected.size === 0 || loading}>
          {loading ? strings.computing : strings.generate}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {result && (
        <>
          <div className="itinerary-summary">
            <div className="summary-figure" style={{ "--figure-color": "var(--color-terracotta)" }}>
              <div className="summary-figure__value">{result.nb_lieux}</div>
              <div className="summary-figure__label">{strings.summaryPlaces}</div>
            </div>
            <div className="summary-figure" style={{ "--figure-color": "var(--color-teal)" }}>
              <div className="summary-figure__value">{result.duree_visites_min} min</div>
              <div className="summary-figure__label">{strings.summaryVisitTime}</div>
            </div>
            <div className="summary-figure" style={{ "--figure-color": "var(--color-gold)" }}>
              <div className="summary-figure__value">{result.duree_trajets_min} min</div>
              <div className="summary-figure__label">{strings.summaryTravelTime}</div>
            </div>
            <div className="summary-figure" style={{ "--figure-color": "var(--color-terracotta-deep)" }}>
              <div className="summary-figure__value">{result.duree_totale_h} h</div>
              <div className="summary-figure__label">{strings.summaryTotalTime}</div>
            </div>
          </div>

          <div className="route">
            {result.etapes.map((etapeRaw, i) => {
              const etape = translatePlace(etapeRaw, language);
              const meta = categoryMeta(etape.categorie, language);
              const isLast = i === result.etapes.length - 1;
              return (
                <div key={etape.id}>
                  {i > 0 && (
                    <p className="route-travel-note">
                      {strings.travelNote(etape.trajet_depuis_precedent_km, etape.trajet_depuis_precedent_min)}
                    </p>
                  )}
                  <div className="route-stop" style={{ animationDelay: `${Math.min(i, 10) * 60}ms` }}>
                    {!isLast && <div className="route-stop__connector" />}
                    <div className="route-stop__number" style={{ "--stop-color": meta.color }}>
                      {etape.ordre}
                    </div>
                    <div className="route-stop__content">
                      {etape.photo_url && (
                        <img className="route-stop__thumb" src={etape.photo_url} alt={etape.nom} />
                      )}
                      <div className="route-stop__text">
                        <h4 className="route-stop__name">{etape.nom}</h4>
                        <div className="route-stop__meta">
                          <span style={{ color: meta.color }}>{meta.label}</span>
                          <span>{strings.visitDuration(etape.duree_visite_min)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
