function ScanProgress({ steps, activeIndex }) {
  return <ol className="scan-progress" aria-label="Scan progress">{steps.map((step, index) => <li key={step} className={index < activeIndex ? "done" : index === activeIndex ? "active" : ""}><span>{index < activeIndex ? "✓" : index + 1}</span>{step}</li>)}</ol>;
}
export default ScanProgress;
