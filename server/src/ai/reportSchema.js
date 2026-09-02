export const AI_REPORT_SHAPE = Object.freeze({
  summary: "string",
  score: "number (must exactly match supplied deterministic score)",
  priorities: [{ findingCode: "one supplied finding code", explanation: "string" }],
  roadmap: {
    today: [{ sourceType: "finding|owner_context", sourceCode: "allowed source code", action: "string" }],
    thisWeek: [{ sourceType: "finding|owner_context", sourceCode: "allowed source code", action: "string" }],
    thisMonth: [{ sourceType: "finding|owner_context", sourceCode: "allowed source code", action: "string" }]
  },
  manualReview: [{ findingCode: "one supplied finding code", reason: "string" }]
});

const roadmapItem = {
  type: "object",
  additionalProperties: false,
  required: ["sourceType", "sourceCode", "action"],
  properties: {
    sourceType: { type: "string", enum: ["finding", "owner_context"] },
    sourceCode: { type: "string", minLength: 1, maxLength: 120 },
    action: { type: "string", minLength: 1, maxLength: 300 }
  }
};

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
          today: { type: "array", maxItems: 6, items: roadmapItem },
          thisWeek: { type: "array", maxItems: 8, items: roadmapItem },
          thisMonth: { type: "array", maxItems: 8, items: roadmapItem }
        }
      },
      manualReview: {
        type: "array", maxItems: 6,
        items: { type: "object", additionalProperties: false, required: ["findingCode", "reason"], properties: { findingCode: { type: "string" }, reason: { type: "string", minLength: 1, maxLength: 500 } } }
      }
    }
  }
});
