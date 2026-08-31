export const AI_REPORT_SHAPE = Object.freeze({
  summary: "string",
  score: "number (must exactly match supplied deterministic score)",
  priorities: [
    {
      findingCode: "one supplied finding code",
      explanation: "string"
    }
  ],
  roadmap: {
    today: ["string"],
    thisWeek: ["string"],
    thisMonth: ["string"]
  },
  manualReview: [
    {
      findingCode: "one supplied finding code",
      reason: "string"
    }
  ]
});

export const AI_REPORT_JSON_SCHEMA = Object.freeze({
  name: "cyber_tracker_report",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["summary", "score", "priorities", "roadmap", "manualReview"],
    properties: {
      summary: { type: "string", minLength: 1, maxLength: 1200 },
      score: { type: "number", minimum: 0, maximum: 100 },
      priorities: {
        type: "array", maxItems: 6,
        items: { type: "object", additionalProperties: false, required: ["findingCode", "explanation"], properties: { findingCode: { type: "string" }, explanation: { type: "string", minLength: 1, maxLength: 600 } } }
      },
      roadmap: {
        type: "object", additionalProperties: false, required: ["today", "thisWeek", "thisMonth"],
        properties: {
          today: { type: "array", maxItems: 6, items: { type: "string", minLength: 1, maxLength: 300 } },
          thisWeek: { type: "array", maxItems: 8, items: { type: "string", minLength: 1, maxLength: 300 } },
          thisMonth: { type: "array", maxItems: 8, items: { type: "string", minLength: 1, maxLength: 300 } }
        }
      },
      manualReview: {
        type: "array", maxItems: 6,
        items: { type: "object", additionalProperties: false, required: ["findingCode", "reason"], properties: { findingCode: { type: "string" }, reason: { type: "string", minLength: 1, maxLength: 500 } } }
      }
    }
  }
});
