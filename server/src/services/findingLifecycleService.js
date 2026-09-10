const ACTIONABLE = new Set(["needs_attention", "manual_review"]);

/**
 * Pure lifecycle classifier used by tests and non-database callers.
 * When detector methodology is not comparable, current actionable findings
 * establish a baseline and no resolved/regressed claims are made.
 */
export function classifyFindingLifecycle(previousEvents, findings, { methodologyComparable = true } = {}) {
  const current = findings.filter((finding) => ACTIONABLE.has(finding.status));

  if (!methodologyComparable) {
    return current.map((finding) => ({ finding, lifecycleState: "baseline" }));
  }

  const previousByCode = new Map();
  for (const event of previousEvents || []) {
    if (!previousByCode.has(event.finding_code)) previousByCode.set(event.finding_code, event);
  }

  const currentCodes = new Set(current.map((finding) => finding.code));
  const events = [];

  for (const finding of current) {
    const previous = previousByCode.get(finding.code);
    const lifecycleState = !previous
      ? "new"
      : previous.lifecycle_state === "resolved"
        ? "regressed"
        : "existing";
    events.push({ finding, lifecycleState });
  }

  for (const previous of previousByCode.values()) {
    if (previous.lifecycle_state === "resolved" || currentCodes.has(previous.finding_code)) continue;
    events.push({
      finding: {
        code: previous.finding_code,
        category: previous.category,
        severity: previous.severity,
        title: previous.title
      },
      lifecycleState: "resolved"
    });
  }

  return events;
}

export function summarizeLifecycle(events) {
  const summary = { baseline: 0, new: 0, existing: 0, resolved: 0, regressed: 0 };
  for (const event of events) {
    if (Object.prototype.hasOwnProperty.call(summary, event.lifecycleState)) {
      summary[event.lifecycleState] += 1;
    }
  }
  return summary;
}
