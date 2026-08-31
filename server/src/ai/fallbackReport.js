const actionFor = (item) => `Review ${item.title || item.code} and verify the recommended configuration in staging before release.`;

export function buildFallbackReport(analysis) {
  const priorities = (analysis.prioritizedFindings || []).slice(0, 6);
  const codes = priorities.map((item) => item.code);
  return {
    summary: priorities.length
      ? `The deterministic assessment scored this website ${analysis.score}/100. Start with the highest-impact verified signals below, then rescan to measure the change.`
      : `The deterministic assessment scored this website ${analysis.score}/100. No penalized scanner findings were available for an AI roadmap, so continue routine review and rescan after material changes.`,
    score: analysis.score,
    priorities: priorities.map((item) => ({ findingCode: item.code, explanation: `${item.title || item.code} contributed ${item.penalty} point${item.penalty === 1 ? "" : "s"} of deterministic risk.` })),
    roadmap: {
      today: priorities.slice(0, 2).map(actionFor),
      thisWeek: priorities.slice(2, 4).map(actionFor),
      thisMonth: priorities.slice(4, 6).map(actionFor)
    },
    manualReview: codes.slice(0, 3).map((findingCode) => ({ findingCode, reason: "Confirm the scanner observation against the application and infrastructure configuration." }))
  };
}
