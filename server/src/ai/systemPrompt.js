import { FINDING_CODE_SET } from "../../../shared/findingCodes.js";
import { AI_REPORT_SHAPE } from "./reportSchema.js";

export const SYSTEM_PROMPT = `You are the explanation layer of AI Cyber Tracker, a defensive website-security posture product.

Hard rules:
1. Use only the minimized facts supplied in the user JSON. Never invent a finding, vulnerability, exploit, breach, credential issue, or configuration state.
2. The numeric external posture score is deterministic application logic. Repeat it exactly and never recalculate, increase, decrease, or reinterpret it.
3. Owner context risk is separate from the external posture score. Treat questionnaire answers and contextFacts as owner-reported context, not independently verified scanner facts.
4. priorities[].findingCode must come only from allowedPriorityFindingCodes. manualReview[].findingCode must come only from allowedReviewFindingCodes. Passed/informational findings are never priorities.
5. Every roadmap item must include sourceType, sourceCode and action. sourceType=finding must reference allowedRoadmapFindingCodes; sourceType=owner_context must reference allowedContextCodes.
6. Prefer the supplied deterministic remediation/verification facts instead of inventing technical instructions.
7. Coverage is assessment-scope coverage, not the percentage of the application that is secure.
8. Do not claim the website is 100% secure or completely insecure.
9. Do not ask for, infer, or output passwords, API keys, tokens, raw cookies, customer data, URLs, raw headers, or other secrets.
10. Return JSON only, with no markdown fences or extra prose.`;

export function buildReportMessages(context) {
  const allowedFindingCodes = context.findingCodes.filter((code) => FINDING_CODE_SET.has(code));
  const allowedPriorityFindingCodes = (context.priorityFindingCodes || []).filter((code) => FINDING_CODE_SET.has(code));
  const allowedReviewFindingCodes = (context.reviewFindingCodes || []).filter((code) => FINDING_CODE_SET.has(code));
  const allowedRoadmapFindingCodes = (context.roadmapFindingCodes || []).filter((code) => FINDING_CODE_SET.has(code));
  const allowedContextCodes = (context.contextCodes || []).filter((code) => /^CTX_[A-Z0-9_]+$/.test(code));
  const userPayload = {
    task: "Explain the verified/minimized assessment facts and produce a practical remediation roadmap grounded only in supplied finding/context codes and deterministic remediation facts.",
    allowedFindingCodes,
    allowedPriorityFindingCodes,
    allowedReviewFindingCodes,
    allowedRoadmapFindingCodes,
    allowedContextCodes,
    requiredOutputShape: AI_REPORT_SHAPE,
    facts: context
  };
  return [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: JSON.stringify(userPayload) }];
}
