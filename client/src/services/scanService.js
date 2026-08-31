import { apiRequest } from "./api";

export async function startWebsiteScan(websiteId) {
  const response = await apiRequest(`/websites/${websiteId}/scans`, {
    method: "POST",
    body: JSON.stringify({ authorizationConfirmed: true })
  });
  return response.data;
}

export async function getScan(scanId) {
  const response = await apiRequest(`/scans/${scanId}`);
  return response.data;
}

export async function getQuestionnaire(scanId) {
  const response = await apiRequest(`/scans/${scanId}/questions`);
  return response.data.questionnaire;
}

export async function submitAnswers(scanId, answers) {
  const response = await apiRequest(`/scans/${scanId}/answers`, {
    method: "POST",
    body: JSON.stringify({ answers })
  });
  return response.data.questionnaire;
}

export async function analyzeScan(scanId) {
  const response = await apiRequest(`/scans/${scanId}/analyze`, {
    method: "POST",
    body: JSON.stringify({})
  });
  return response.data.analysis;
}

export async function getReport(scanId) {
  const response = await apiRequest(`/scans/${scanId}/report`);
  return response.data.report;
}

export async function generateReport(scanId) {
  const response = await apiRequest(`/scans/${scanId}/report`, { method: "POST", body: JSON.stringify({}) });
  return response.data.report;
}

export async function deleteAssessmentData(scanId) {
  const response = await apiRequest(`/scans/${scanId}/data`, { method: "DELETE" });
  return response.data;
}
