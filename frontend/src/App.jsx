import { useState } from "react";
import PlacesExplorer from "./components/PlacesExplorer.jsx";
import ItineraryPlanner from "./components/ItineraryPlanner.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import LanguageToggle from "./components/LanguageToggle.jsx";
import { useLanguage } from "./i18n/LanguageContext.jsx";

const TAB_IDS = ["explorer", "itineraire"];

export default function App() {
  const [tab, setTab] = useState("explorer");
  const { strings } = useLanguage();

  const tabLabels = {
    explorer: strings.navExplorer,
    itineraire: strings.navItinerary,
  };

  return (
    <div className="app">
      <header className="app-header" style={{ "--hero-image": "url(/static/photos/1/1.jpg)" }}>
        <LanguageToggle />
        <p className="app-header__eyebrow">{strings.eyebrow}</p>
        <h1 className="app-header__title">
          <em>Azemmour</em>
          {strings.titleSuffix}
        </h1>
        <p className="app-header__sub">{strings.subtitle}</p>
        <div className="app-header__badges">
          <span className="hero-badge">{strings.badgeItineraries}</span>
          <span className="hero-badge">{strings.badgeAI}</span>
          <span className="hero-badge">{strings.badgeLocation}</span>
        </div>
        <hr className="stitch-rule" />
      </header>

      <nav className="nav-tabs">
        {TAB_IDS.map((id) => (
          <button
            key={id}
            className={`nav-tab ${tab === id ? "nav-tab--active" : ""}`}
            onClick={() => setTab(id)}
          >
            {tabLabels[id]}
          </button>
        ))}
      </nav>

      <ErrorBoundary key={tab}>
        {tab === "explorer" && <PlacesExplorer />}
        {tab === "itineraire" && <ItineraryPlanner />}
      </ErrorBoundary>

      <footer className="app-footer">
        <p>{strings.footerText(new Date().getFullYear())}</p>
      </footer>
    </div>
  );
}
