import { useEffect, useState } from "react";
import CategoryStamp from "./CategoryStamp.jsx";
import { categoryMeta } from "../categories.js";
import { api } from "../api.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function PlaceDetailModal({ place, onClose }) {
  const [duree, setDuree] = useState(place.duree_visite_estimee_min ?? null);
  const [activePhoto, setActivePhoto] = useState(0);
  const { language, strings } = useLanguage();
  const meta = categoryMeta(place.categorie, language);
  const photos = place.photos?.length ? place.photos : place.photo_url ? [place.photo_url] : [];

  useEffect(() => {
    if (duree != null) return; // deja connue (lieu ajoute par l'utilisateur)
    api
      .predictDuration({ categorie: place.categorie, note: place.note, description: place.description })
      .then((r) => setDuree(r.duree_visite_estimee_min))
      .catch(() => {});
  }, [place]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (photos.length > 1 && e.key === "ArrowRight") {
        setActivePhoto((i) => (i + 1) % photos.length);
      }
      if (photos.length > 1 && e.key === "ArrowLeft") {
        setActivePhoto((i) => (i - 1 + photos.length) % photos.length);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, photos.length]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label={strings.close}>
          ×
        </button>

        <div className="modal-gallery">
          {photos.length > 0 ? (
            <div className="modal-gallery__hero">
              <img className="modal-gallery__image" src={photos[activePhoto]} alt={place.nom} />
              {photos.length > 1 && (
                <>
                  <button
                    className="modal-gallery__nav modal-gallery__nav--prev"
                    onClick={() => setActivePhoto((i) => (i - 1 + photos.length) % photos.length)}
                    aria-label={strings.prevPhoto}
                  >
                    ‹
                  </button>
                  <button
                    className="modal-gallery__nav modal-gallery__nav--next"
                    onClick={() => setActivePhoto((i) => (i + 1) % photos.length)}
                    aria-label={strings.nextPhoto}
                  >
                    ›
                  </button>
                  <span className="modal-gallery__counter">
                    {activePhoto + 1} / {photos.length}
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="modal-gallery__placeholder">
              <CategoryStamp categorie={place.categorie} size="lg" showLabel={false} />
            </div>
          )}

          {photos.length > 1 && (
            <div className="modal-gallery__thumbs">
              {photos.map((url, i) => (
                <button
                  key={url}
                  className={`modal-gallery__thumb ${i === activePhoto ? "modal-gallery__thumb--active" : ""}`}
                  onClick={() => setActivePhoto(i)}
                  aria-label={strings.photoN(i + 1)}
                >
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="modal-body">
          <h2 className="modal-title">{place.nom}</h2>
          <p className="modal-address">{place.adresse || place.ville}</p>

          <p className="modal-desc">{place.description}</p>

          <div className="modal-stats">
            <span className="stat-pill" style={{ color: meta.color }}>
              {meta.label}
            </span>
            {place.note != null && <span className="stat-pill">★ {place.note.toFixed(1)}</span>}
            <span className="stat-pill">
              {duree != null ? strings.visitDuration(duree) : strings.visitDurationLoading}
            </span>
            <span className="stat-pill">
              {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
