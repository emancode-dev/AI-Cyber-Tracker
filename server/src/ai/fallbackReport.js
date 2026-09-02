function findingStep(item, action) {
  return { sourceType: "finding", sourceCode: item.code, action };
}

function contextStep(item) {
  return { sourceType: "owner_context", sourceCode: item.code, action: `Review the owner-reported condition: ${item.reason}` };
}

export function buildFallbackReport(analysis) {
  const priorities = (analysis.prioritizedFindings || []).slice(0, 6);
  const context = (analysis.contextAdjustments || []).slice(0, 4);
  const today = priorities.slice(0, 2).map((item) => findingStep(item, item.remediation || `Review ${item.title || item.code}.`));
  if (today.length < 2 && context.length) today.push(...context.slice(0, 2 - today.length).map(contextStep));
  return {
    summary: priorities.length || context.length
      ? `The deterministic external posture score is ${analysis.score}/100 with ${analysis.contextRiskLevel} owner-context risk. Start with the highest-impact observed signals and owner-reported priorities below, then rescan to verify technical changes.`
      : `The deterministic external posture score is ${analysis.score}/100 with ${analysis.contextRiskLevel} owner-context risk. No penalized scanner findings or owner-context adjustments require a remediation roadmap from the current scope.`,
    score: analysis.score,
    priorities: priorities.map((item) => ({ findingCode: item.code, explanation: `${item.title || item.code} contributed ${item.penalty} point${item.penalty === 1 ? "" : "s"} of deterministic external-posture penalty.` })),
    roadmap: {
      today,
      thisWeek: priorities.slice(2, 4).map((item) => findingStep(item, item.remediation || `Review ${item.title || item.code}.`)),
      thisMonth: priorities.slice(4, 6).map((item) => findingStep(item, item.verification || `Rescan and verify ${item.title || item.code}.`))
    },
    manualReview: (analysis.reviewFindings || []).slice(0, 6).map((item) => ({ findingCode: item.code, reason: item.reason || "Confirm the observation against the application and infrastructure configuration." }))
  };
}
