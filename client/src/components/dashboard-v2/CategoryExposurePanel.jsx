import { ShieldCheck } from "@phosphor-icons/react";

function titleFor(category) {
  return category.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function CategoryExposurePanel({ categories = [], demo = false }) {
  return <article className="dashboard-v2-panel em-category-panel"><div className="dashboard-v2-panel-heading"><div><small>EXPOSURE CATEGORIES</small><h3>Retained security profile</h3></div><ShieldCheck weight="duotone"/></div><p className="em-panel-method">{demo ? "Illustrative category scores for the preview." : "Newest retained deterministic category score per owned website—no decorative map data."}</p><div className="em-category-bars">{categories.length ? categories.slice(0, 7).map((item) => <div key={item.category}><span><b>{titleFor(item.category)}</b><small>{item.sampleSize || 1} site{(item.sampleSize || 1) === 1 ? "" : "s"}</small></span><i><em style={{ width: `${item.score}%` }}/></i><strong>{item.score}</strong></div>) : <div className="dashboard-v2-empty">Generate a report to retain category history.</div>}</div></article>;
}

export default CategoryExposurePanel;
