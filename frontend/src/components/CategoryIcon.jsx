// Petites icones "au trait" dessinees a la main pour chaque categorie.
// Volontairement simples (SVG inline) pour ne pas dependre d'une librairie
// d'icones externe.

const ICONS = {
  monument: (
    <path d="M4 21h16M6 21V10l6-5 6 5v11M9 21v-6h2v6M13 21v-6h2v6M6 10h12" />
  ),
  religieux: (
    <path d="M12 2v20M5 8c0-3 3-5 7-5s7 2 7 5M4 21c1-6 4-9 8-9s7 3 8 9" />
  ),
  plage: (
    <path d="M3 18c2 1 4 1 6 0s4-1 6 0 4 1 6 0M3 13c2 1 4 1 6 0s4-1 6 0 4 1 6 0M13 3l-3 8h6l-3-8ZM7 21l3-6M17 21l-3-6" />
  ),
  nature: (
    <path d="M12 22v-7M12 15c-4 0-7-3-7-7 3 0 5 1 7 3 2-2 4-3 7-3 0 4-3 7-7 7Z" />
  ),
  artisanat: (
    <path d="M4 8c2-3 5-5 8-5s6 2 8 5M4 8c0 6 3 11 8 11s8-5 8-11M9 8v3M15 8v3" />
  ),
  art: (
    <path d="M12 3a9 9 0 1 0 0 18c1 0 2-.6 2-2 0-1-.6-1.4-.6-2.2 0-1 .8-1.8 1.8-1.8H17c2 0 4-1.6 4-4.5C21 6 17 3 12 3Z M7.5 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z M11 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z M15 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
  ),
  evenementiel: (
    <path d="M5 3v18M5 4h10l-2 3 2 3H5" />
  ),
  restaurant: (
    <path d="M7 2v6a2 2 0 1 1-4 0V2M5 8v14M10 2v7c0 1.7 1.3 3 3 3M13 2v7M13 12v10M17 2c-1.1 1.5-1.5 3.3-1.5 6s.4 4.5 1.5 6M17 2v18" />
  ),
  cafe: (
    <path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8ZM17 9h1a3 3 0 0 1 0 6h-1M8 2c0 1-1 1.2-1 2.2S8 5.5 8 6.5M12.5 2c0 1-1 1.2-1 2.2s1 1.3 1 2.3" />
  ),
  hotel: (
    <path d="M3 21V6M3 12h15a3 3 0 0 1 3 3v6M3 12V9a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v3M6.5 9a2 2 0 1 1 0 4" />
  ),
};

export default function CategoryIcon({ categorie, className, style }) {
  const path = ICONS[categorie] || <circle cx="12" cy="12" r="8" />;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}
