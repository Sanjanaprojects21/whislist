import { Heart } from "lucide-react";
import CategoriesBoard from "./CategoriesBoard";

export default function CategoriesPage() {
  return (
    <main className="shell">
      <nav className="topbar" aria-label="Primary">
        <a className="brand" href="/">
          <span className="brandMark">
            <Heart size={18} fill="currentColor" />
          </span>
          <span>Wishlist</span>
        </a>
        <a className="secondaryButton" href="/">
          Add product
        </a>
      </nav>

      <section className="content categoryPage" aria-labelledby="categories-title">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Saved items</p>
            <h1 id="categories-title">Categories</h1>
          </div>
        </div>
        <CategoriesBoard />
      </section>
    </main>
  );
}
