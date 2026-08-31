function CategoryScores({ scores = {} }) {
  const entries = Object.entries(scores).sort(([a], [b]) => a.localeCompare(b));

  if (!entries.length) return null;

  return (
    <section className="analysis-section">
      <p className="eyebrow">Category breakdown</p>
      <div className="category-score-grid">
        {entries.map(([category, score]) => (
          <article className="category-score-card" key={category}>
            <span>{category.replaceAll("_", " ")}</span>
            <strong>{score}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CategoryScores;
