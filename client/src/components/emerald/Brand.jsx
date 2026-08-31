import { Link } from "react-router-dom";
import { ShieldChevron } from "@phosphor-icons/react";

function Brand({ compact = false, to = "/" }) {
  return (
    <Link className={`em-brand ${compact ? "em-brand-compact" : ""}`} to={to} aria-label="Cyber AI Tracker home">
      <span className="em-brand-icon" aria-hidden="true">
        <ShieldChevron weight="fill" />
      </span>
      <span className="em-brand-copy">
        <strong>Cyber AI Tracker</strong>
        {!compact ? <small>Evidence-first security</small> : null}
      </span>
    </Link>
  );
}

export default Brand;
