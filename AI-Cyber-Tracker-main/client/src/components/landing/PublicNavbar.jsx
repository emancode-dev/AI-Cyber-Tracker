import { useState } from "react";
import { Link } from "react-router-dom";

function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return (
    <header className="public-header"><nav className="public-nav page-width" aria-label="Public navigation">
      <Link className="public-brand" to="/" onClick={closeMenu}><span className="brand-mark">A</span><span>AI Cyber Tracker</span></Link>
      <button className="menu-button" type="button" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-controls="public-nav-links">Menu</button>
      <div id="public-nav-links" className={`public-nav-links ${menuOpen ? "public-nav-links-open" : ""}`.trim()}>
        <a href="#problem" onClick={closeMenu}>Problem</a><a href="#features" onClick={closeMenu}>Features</a><a href="#faq" onClick={closeMenu}>FAQ</a>
        <Link to="/login" onClick={closeMenu}>Login</Link><Link className="button button-primary nav-cta" to="/register" onClick={closeMenu}>Create account</Link>
      </div>
    </nav></header>
  );
}
export default PublicNavbar;
