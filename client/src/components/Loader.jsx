function Loader({ label = "Loading...", compact = false }) {
  return (
    <span className={`loader ${compact ? "loader-compact" : ""}`.trim()} role="status" aria-live="polite">
      <span className="loader-spinner" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
export default Loader;
