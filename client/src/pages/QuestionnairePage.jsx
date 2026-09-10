import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { getQuestionnaire, submitAnswers } from "../services/scanService";

function humanizeOption(option) {
  return String(option).replaceAll("_", " ");
}

function QuestionnairePage() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getQuestionnaire(scanId)
      .then((result) => { if (active) setState(result); })
      .catch((requestError) => { if (active) setError(requestError.message || "Could not load the questionnaire."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [scanId]);

  const currentQuestion = useMemo(() => {
    if (!state) return null;
    return state.questions.find((question) => !Object.prototype.hasOwnProperty.call(state.answers, question.code));
  }, [state]);

  async function answer(value) {
    if (!currentQuestion) return;
    try {
      setSaving(true);
      setError("");
      setState(await submitAnswers(scanId, [{ code: currentQuestion.code, value }]));
    } catch (requestError) {
      setError(requestError.message || "Could not save your answer.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="centered-page product-flow-page"><Loader label="Loading adaptive questions..." /></main>;

  const answered = state?.progress?.answered || 0;
  const total = state?.progress?.total || 0;

  return (
    <main className="centered-page questionnaire-page product-flow-page">
      <section className="dashboard-panel questionnaire-panel product-flow-panel">
        <div className="flow-topbar"><Button variant="secondary" onClick={() => navigate("/dashboard")}>← Dashboard</Button><span className="flow-status"><i/>Context stays controlled</span></div>

        <header className="flow-hero questionnaire-flow-hero">
          <p className="eyebrow">OWNER CONTEXT</p>
          <h1>Tell us what the scanner can’t see from outside.</h1>
          <p className="muted">Questions come from a fixed, versioned bank. The AI layer does not invent assessment questions.</p>
        </header>

        {error ? <p className="alert alert-error" role="alert">{error}</p> : null}

        {state ? <>
          <div className="question-progress question-progress-v2" aria-label="Questionnaire progress">
            <div className="question-progress-copy"><span>QUESTION {Math.min(answered + 1, total || 1)}</span><span>{answered} / {total} answered</span></div>
            <div className="question-progress-track"><span style={{ width: `${total ? (answered / total) * 100 : 0}%` }} /></div>
          </div>

          {state.progress.complete ? (
            <div className="next-step-card next-step-card-v2 complete-card-v2"><div><p className="eyebrow">CONTEXT COMPLETE</p><h2>Now owner context can refine priority without changing the external score.</h2><p className="muted">The external score stays evidence-based; the same verified findings and owner answers produce the same deterministic priority.</p></div><Button onClick={() => navigate(`/analysis/${scanId}`)}>Calculate score →</Button></div>
          ) : currentQuestion ? (
            <article className="question-card question-card-v2">
              <div className="question-number-v2">{String(answered + 1).padStart(2, "0")}</div>
              <p className="eyebrow">{currentQuestion.category}</p>
              <h2>{currentQuestion.text}</h2>
              {currentQuestion.answerType === "yes_no" ? <div className="answer-grid answer-grid-v2"><Button disabled={saving} onClick={() => answer(true)}>Yes</Button><Button disabled={saving} variant="secondary" onClick={() => answer(false)}>No</Button></div> : <div className="answer-grid answer-grid-options answer-grid-v2">{currentQuestion.options.map((option) => <Button key={option} disabled={saving} variant="secondary" onClick={() => answer(option)}>{humanizeOption(option)}</Button>)}</div>}
              {saving ? <Loader label="Saving answer..." compact /> : null}
            </article>
          ) : <p className="alert alert-error">No applicable unanswered question was found. Reload the page to resume.</p>}
        </> : null}
      </section>
    </main>
  );
}

export default QuestionnairePage;
