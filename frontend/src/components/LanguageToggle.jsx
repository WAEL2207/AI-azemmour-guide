import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="lang-toggle" role="group" aria-label="Language / Langue">
      <button
        className={`lang-toggle__btn ${language === "fr" ? "lang-toggle__btn--active" : ""}`}
        onClick={() => setLanguage("fr")}
        aria-pressed={language === "fr"}
      >
        FR
      </button>
      <button
        className={`lang-toggle__btn ${language === "en" ? "lang-toggle__btn--active" : ""}`}
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
      >
        EN
      </button>
    </div>
  );
}
