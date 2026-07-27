// Client API minimaliste : toutes les routes du backend Flask passent par ici.
// En dev, Vite proxie /api/* vers http://localhost:5000 (voir vite.config.js).

async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data && data.erreur) || `Erreur HTTP ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  health: () => request("/api/health"),
  categories: () => request("/api/categories"),

  getPlaces: (categorie) =>
    request(`/api/places${categorie ? `?categorie=${encodeURIComponent(categorie)}` : ""}`),
  getPlace: (id) => request(`/api/places/${id}`),

  classify: (payload) => request("/api/classify", { method: "POST", body: JSON.stringify(payload) }),
  predictDuration: (payload) =>
    request("/api/predict-duration", { method: "POST", body: JSON.stringify(payload) }),

  itineraire: (categories) =>
    request("/api/itineraire", { method: "POST", body: JSON.stringify({ categories }) }),
};
