import { useState } from "react";
import PlacesExplorer from "./components/PlacesExplorer.jsx";
import ItineraryPlanner from "./components/ItineraryPlanner.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

const TABS = [
  { id: "explorer", label: "Explorer" },
  { id: "itineraire", label: "Itineraire" },
];

export default function App() {
  const [tab, setTab] = useState("explorer");

  return (
    <div className="app">
      <header className="app-header" style={{ "--hero-image": "url(/static/photos/1/1.jpg)" }}>
        <p className="app-header__eyebrow">Guide touristique · IA</p>
        <h1 className="app-header__title">
          <em>Azemmour</em>, a decouvrir
        </h1>
        <p className="app-header__sub">
          Decouvre les plus beaux lieux de la medina et de ses environs, et compose
          facilement ton itineraire de visite ideal.
        </p>
        <div className="app-header__badges">
          <span className="hero-badge">🗺️ Itineraires sur mesure</span>
          <span className="hero-badge">🤖 Recommandations par IA</span>
          <span className="hero-badge">📍 Azemmour, Maroc</span>
        </div>
        <hr className="stitch-rule" />
      </header>

      <nav className="nav-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`nav-tab ${tab === t.id ? "nav-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <ErrorBoundary key={tab}>
        {tab === "explorer" && <PlacesExplorer />}
        {tab === "itineraire" && <ItineraryPlanner />}
      </ErrorBoundary>
    </div>
  );
}
