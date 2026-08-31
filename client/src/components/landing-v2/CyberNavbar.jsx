import { useState } from "react";
import { Link } from "react-router-dom";

function CyberNavbar() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <header className="cyber-nav-shell">
      <nav className="cyber-nav page-width" aria-label="Main navigation">
        <Link className="cyber-brand" to="/" onClick={close}>
          <span className="cyber-brand-mark" aria-hidden="true"><i/><i/><i/></span>
          <span>Cyber AI Tracker</span>
        </Link>

        <button
          type="button"
          className="cyber-menu-button"
          aria-expanded={open}
          aria-controls="cyber-nav-links"
          onClick={() => setOpen((current) => !current)}
        >
          Menu
        </button>

        <div id="cyber-nav-links" className={`cyber-nav-links ${open ? "is-open" : ""}`.trim()}>
          <a href="#product" onClick={close}>Product</a>
          <a href="#how-it-works" onClick={close}>How it works</a>
          <a href="#privacy" onClick={close}>Privacy</a>
          <a href="#faq" onClick={close}>FAQ</a>
          <Link to="/preview/dashboard" onClick={close}>UI preview</Link>
          <Link to="/login" onClick={close}>Login</Link>
          <Link className="cyber-button cyber-button-solid" to="/register" onClick={close}>Start assessment</Link>
        </div>
      </nav>
    </header>
  );
}

export default CyberNavbar;
