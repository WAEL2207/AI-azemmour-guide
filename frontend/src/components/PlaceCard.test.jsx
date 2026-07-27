import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PlaceCard from "./PlaceCard.jsx";

const BASE_PLACE = {
  id: 1,
  nom: "Medina d'Azemmour",
  categorie: "monument",
  description: "Vieille ville fortifiee.",
  note: 3.9,
  photo_url: null,
};

describe("PlaceCard", () => {
  it("shows the category stamp placeholder when there is no photo", () => {
    render(<PlaceCard place={BASE_PLACE} onClick={() => {}} />);
    expect(screen.getByText("Medina d'Azemmour")).toBeInTheDocument();
    expect(document.querySelector(".stamp")).toBeInTheDocument();
    expect(document.querySelector(".place-card__image")).not.toBeInTheDocument();
  });

  it("shows the photo plus rating badge and category chip when a photo exists", () => {
    render(
      <PlaceCard
        place={{ ...BASE_PLACE, photo_url: "/static/photos/1/1.jpg" }}
        onClick={() => {}}
      />
    );
    expect(screen.getByRole("img", { name: "Medina d'Azemmour" })).toHaveAttribute(
      "src",
      "/static/photos/1/1.jpg"
    );
    // La note apparait deux fois par design : le badge flottant sur la photo,
    // et la ligne meta en bas de carte.
    expect(document.querySelector(".place-card__rating-badge")).toHaveTextContent("★ 3.9");
    expect(document.querySelector(".place-card__category-chip")).toHaveTextContent("Monument");
  });

  it("shows 'sans note' when the place has no rating", () => {
    render(<PlaceCard place={{ ...BASE_PLACE, note: null }} onClick={() => {}} />);
    expect(screen.getByText("sans note")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<PlaceCard place={BASE_PLACE} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
