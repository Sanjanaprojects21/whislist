import {
  BookOpen,
  Gem,
  Gift,
  Heart,
  LogIn,
  Plus,
  Search,
  Shirt,
  ShoppingBag,
  Sparkles
} from "lucide-react";
import HeroSearch from "./HeroSearch";

const purchaseCategories = [
  {
    title: "Clothes",
    description: "Seasonal outfits, daily basics, and occasion wear.",
    count: "8 items",
    budget: "$240 planned",
    Icon: Shirt,
    color: "#b98961"
  },
  {
    title: "Cosmetics",
    description: "Skincare, makeup refills, and personal care picks.",
    count: "6 items",
    budget: "$135 planned",
    Icon: Sparkles,
    color: "#c9a17c"
  },
  {
    title: "Books",
    description: "Reading list favorites, study material, and journals.",
    count: "12 items",
    budget: "$95 planned",
    Icon: BookOpen,
    color: "#8f6a50"
  },
  {
    title: "Jewellery",
    description: "Elegant pieces, gift options, and timeless accessories.",
    count: "4 items",
    budget: "$310 planned",
    Icon: Gem,
    color: "#d2b08d"
  }
];

export default function Home() {
  return (
    <main className="shell">
      <nav className="topbar" aria-label="Primary">
        <a className="brand" href="#">
          <span className="brandMark">
            <Heart size={18} fill="currentColor" />
          </span>
          <span>Wishlist</span>
        </a>
        <div className="navActions">
          <button className="iconButton" aria-label="Search wishlist">
            <Search size={18} />
          </button>
          <a className="secondaryButton" href="/login">
            <LogIn size={18} />
            Sign in
          </a>
          <button className="addButton">
            <Plus size={18} />
            Add item
          </button>
        </div>
      </nav>

      <section className="hero" aria-labelledby="page-title">
        <div className="heroCopy">
          <p className="eyebrow">Curated purchases</p>
          <h1 id="page-title">Wishlist</h1>
          <p>
            Keep meaningful finds organized by priority, savings progress, and the
            moments they are meant for.
          </p>
          <div className="heroActions">
            <button className="primaryButton">
              <ShoppingBag size={18} />
              Review list
            </button>
            <button className="secondaryButton">
              <Gift size={18} />
              Gift ideas
            </button>
          </div>

          <div className="heroFooter">
            <HeroSearch />
          </div>
        </div>

      </section>

      <section className="content" aria-label="Wishlist dashboard">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Saved items</p>
            <h2>Planned purchases</h2>
          </div>
          <a className="textButton" href="/categories">View all</a>
        </div>

        <div className="itemGrid">
          {purchaseCategories.map(({ Icon, ...category }) => (
            <a className="itemCard categoryCard" href="/categories" key={category.title}>
              <div className="itemVisual categoryVisual" style={{ backgroundColor: category.color }}>
                <Icon size={34} strokeWidth={1.9} />
              </div>
              <div className="itemBody">
                <div>
                  <p>Category</p>
                  <h3>{category.title}</h3>
                  <p className="categoryDescription">{category.description}</p>
                </div>
                <div className="itemMeta">
                  <span>{category.count}</span>
                  <span>{category.budget}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
