import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary.jsx";

function Bomb() {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // React (et notre componentDidCatch) logguent l'erreur sur console.error ;
    // on la masque pour garder la sortie de test propre sans cacher un vrai echec.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children normally when nothing throws", () => {
    render(
      <ErrorBoundary>
        <p>Tout va bien</p>
      </ErrorBoundary>
    );
    expect(screen.getByText("Tout va bien")).toBeInTheDocument();
  });

  it("shows a fallback instead of crashing the whole page when a child throws", () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText("Un probleme est survenu")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /recharger/i })).toBeInTheDocument();
  });
});
