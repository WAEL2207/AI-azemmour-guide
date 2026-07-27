import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import LanguageToggle from "./LanguageToggle.jsx";
import { LanguageProvider, useLanguage } from "../i18n/LanguageContext.jsx";

function CurrentLanguage() {
  const { language } = useLanguage();
  return <span data-testid="current-lang">{language}</span>;
}

function renderToggle() {
  return render(
    <LanguageProvider>
      <LanguageToggle />
      <CurrentLanguage />
    </LanguageProvider>
  );
}

describe("LanguageToggle", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to french when nothing is stored", () => {
    renderToggle();
    expect(screen.getByTestId("current-lang")).toHaveTextContent("fr");
    expect(screen.getByRole("button", { name: "FR" })).toHaveAttribute("aria-pressed", "true");
  });

  it("switches to english when EN is clicked, and persists the choice", () => {
    renderToggle();
    fireEvent.click(screen.getByRole("button", { name: "EN" }));

    expect(screen.getByTestId("current-lang")).toHaveTextContent("en");
    expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "FR" })).toHaveAttribute("aria-pressed", "false");
    expect(localStorage.getItem("lang")).toBe("en");
  });

  it("starts in english if that was the last stored choice", () => {
    localStorage.setItem("lang", "en");
    renderToggle();
    expect(screen.getByTestId("current-lang")).toHaveTextContent("en");
  });
});
