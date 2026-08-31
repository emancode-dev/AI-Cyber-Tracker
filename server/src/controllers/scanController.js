import { startScan, readScan } from "../services/scanService.js";
import {
  getQuestionnaire,
  saveQuestionnaireAnswers
} from "../services/questionnaireService.js";
import { analyzeOwnedScan } from "../services/riskService.js";
import { generateOwnedReport, readOwnedReport, removeOwnedAssessment } from "../services/reportService.js";

export async function startScanController(req, res) {
  const data = await startScan(req.supabase, req.ownedWebsite);
  res.status(201).json({ success: true, data });
}

export async function getScanController(req, res) {
  const data = await readScan(req.supabase, req.params.id);
  res.json({ success: true, data });
}

export async function getQuestionsController(req, res) {
  const questionnaire = await getQuestionnaire(req.supabase, req.params.id);
  res.json({ success: true, data: { questionnaire } });
}

export async function submitAnswersController(req, res) {
  const questionnaire = await saveQuestionnaireAnswers(
    req.supabase,
    req.params.id,
    req.body.answers
  );
  res.json({ success: true, data: { questionnaire } });
}

export async function analyzeScanController(req, res) {
  const analysis = await analyzeOwnedScan(req.supabase, req.params.id);
  res.json({ success: true, data: { analysis } });
}

export async function generateReportController(req, res) {
  const report = await generateOwnedReport(req.supabase, req.params.id, req.user.id);
  res.json({ success: true, data: { report } });
}

export async function getReportController(req, res) {
  const report = await readOwnedReport(req.supabase, req.params.id);
  res.json({ success: true, data: { report } });
}

export async function deleteAssessmentController(req, res) {
  const data = await removeOwnedAssessment(req.supabase, req.params.id);
  res.json({ success: true, data });
}
