import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  ChartLineUp,
  CheckCircle,
  CirclesThree,
  Crosshair,
  Database,
  Fingerprint,
  GlobeHemisphereWest,
  List,
  LockKey,
  Pulse,
  ShieldCheck,
  ShieldWarning,
  Sparkle,
  Stack,
  TrendUp,
  UserFocus,
  X,
} from "@phosphor-icons/react";
import Brand from "../components/emerald/Brand";
import EmeraldGlobe from "../components/emerald/EmeraldGlobe";
import GlobalSignalMap from "../components/emerald/GlobalSignalMap";
import LandingDashboardPreview from "../components/emerald/LandingDashboardPreview";
import TiltCard from "../components/emerald/TiltCard";
import CodeRain from "../components/emerald/CodeRain";
import { useEmeraldMotion } from "../hooks/useEmeraldMotion";
import securityExposureVisual from "../assets/security-exposure-glass.webp";

const signalRail = [
  [ShieldCheck, "Safe URL validation"],
  [GlobeHemisphereWest, "HTTP + TLS"],
  [LockKey, "Security headers"],
  [Fingerprint, "Cookie signals"],
  [UserFocus, "Owner context"],
  [ChartLineUp, "Rule-based scoring"],
  [Brain, "Minimized AI context"],
];

const benefits = [
  [Crosshair, "Passive by design", "Focused checks that observe public configuration without destructive exploitation."],
  [Database, "Evidence minimized", "Only the fields needed for scoring and explanation move through the pipeline."],
  [ChartLineUp, "Score by code", "Deterministic rules keep the score reproducible and separate from the AI layer."],
  [Pulse, "Progress you can see", "Rescans and history make improvement visible instead of leaving a static report behind."],
  [ShieldWarning, "Manual review stays honest", "Uncertain signals are labelled for review rather than inflated into false claims."],
  [Stack, "Layered authorization", "Supabase RLS and server ownership checks protect every user-owned assessment."],
];

const faqs = [
  ["Is this an aggressive penetration test?", "No. Cyber AI Tracker is designed around passive, authorization-confirmed checks. It does not brute-force accounts, exploit databases or run destructive attacks."],
  ["Does AI decide whether my website is secure?", "No. The scanner and deterministic risk rules produce the evidence and score. AI can explain the result and structure a roadmap, but it cannot change the score."],
  ["What happens to my assessment data?", "Detailed findings, answers and AI reports are designed to expire within 48 hours. You can also request deletion immediately."],
  ["Can the tool prove a site is fully secure?", "No scanner can make that promise. The product surfaces useful signals, owner context and practical next actions while clearly identifying its limits."],
];

function SignalRail() {
  const items = [...signalRail, ...signalRail];
  return (
    <div className="em-signal-rail" aria-label="CyberTracker assessment layers">
      <div className="em-signal-track">
        {items.map(([Icon, label], index) => (
          <span key={`${label}-${index}`} aria-hidden={index >= signalRail.length ? "true" : undefined}>
            <Icon weight="duotone" />{label}
          </span>
        ))}
      </div>
    </div>
  );
}

function LandingPage() {
  const rootRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  useEmeraldMotion(rootRef);

  return (
    <div ref={rootRef} className="em-site">
      <CodeRain />
      <header className="em-navbar">
        <div className="em-container em-navbar-inner">
          <Brand />
          <button className="em-mobile-menu" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="em-primary-nav" aria-label="Toggle navigation">
            {menuOpen ? <X /> : <List />}
          </button>
          <nav id="em-primary-nav" className={menuOpen ? "open" : ""} aria-label="Primary navigation">
            <a href="#platform" onClick={() => setMenuOpen(false)}>Platform</a>
            <a href="#workflow" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#privacy" onClick={() => setMenuOpen(false)}>Privacy</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          </nav>
          <div className="em-navbar-actions">
            <Link to="/login">Log in</Link>
            <Link className="em-button em-button-small em-button-light" to="/register">Start assessment <ArrowUpRight /></Link>
          </div>
        </div>
      </header>

      <main>
        <section className="em-hero" id="top">
          <div className="em-container em-hero-grid">
            <div className="em-hero-copy">
              <div className="em-kicker" data-em-hero><span />DEFENSIVE WEBSITE SECURITY INTELLIGENCE</div>
              <h1 data-em-hero>Know what your website is quietly exposing.</h1>
              <p data-em-hero>Turn passive technical signals, owner context and deterministic rules into a security picture you can understand—and a roadmap you can actually use.</p>
              <div className="em-hero-actions" data-em-hero>
                <Link className="em-button em-button-light" to="/register">Start a safe assessment <ArrowRight /></Link>
                <a className="em-button em-button-ghost" href="#workflow">See the workflow <ArrowUpRight /></a>
              </div>
              <div className="em-hero-proof" data-em-hero>
                <span><CheckCircle weight="fill" />Passive checks only</span>
                <span><CheckCircle weight="fill" />Score stays deterministic</span>
                <span><CheckCircle weight="fill" />No secrets sent to AI</span>
              </div>
            </div>
            <div className="em-hero-visual">
              <EmeraldGlobe />
              <div className="em-orbit-card em-orbit-card-one"><small>SIGNALS NORMALIZED</small><b>12 checks</b><span><Pulse /> Live</span></div>
              <div className="em-orbit-card em-orbit-card-two"><small>RISK ENGINE</small><b>Evidence first</b><span><ShieldCheck /> Protected</span></div>
            </div>
          </div>
          <div className="em-container em-hero-metrics" data-em-hero>
            <div><b>10–15</b><span>reliable passive checks</span></div>
            <div><b>15–25</b><span>adaptive owner questions</span></div>
            <div><b>48h</b><span>maximum detailed-data window</span></div>
          </div>
        </section>

        <SignalRail />

        <section className="em-section" id="platform">
          <div className="em-container">
            <div className="em-section-heading em-section-heading-center" data-em-reveal>
              <span className="em-section-label">THE PLATFORM</span>
              <h2>Security intelligence built for the questions small teams actually have.</h2>
              <p>Not a wall of scanner jargon. A connected flow from public configuration to owner context, score and next action.</p>
            </div>
            <div className="em-solution-grid" data-em-stagger>
              <TiltCard className="em-solution-card em-solution-card-wide" data-em-item>
                <div className="em-card-icon"><GlobeHemisphereWest weight="duotone" /></div>
                <div><span>01 / PASSIVE SCANNER</span><h3>See the public security signals your website already exposes.</h3><p>HTTP, TLS, headers, cookies, redirects, forms and public metadata—normalized into a consistent finding format.</p></div>
                <figure className="em-security-exposure-visual"><img src={securityExposureVisual} alt="Illustrative glass interface showing public security headers, cookie flags, TLS configuration, redirects, exposed metadata, and a public endpoint"/><figcaption>Explanatory visualization · Live findings appear only after your authorized assessment</figcaption></figure>
              </TiltCard>
              <TiltCard className="em-solution-card" data-em-item>
                <div className="em-card-icon"><CirclesThree weight="duotone" /></div>
                <span>02 / OWNER CONTEXT</span><h3>The scanner does not pretend it can see behind your login.</h3><p>Adaptive questions add the context public checks cannot know.</p>
                <div className="em-context-chips"><span>MFA</span><span>Backups</span><span>Payments</span><span>Data</span></div>
              </TiltCard>
              <TiltCard className="em-solution-card" data-em-item>
                <div className="em-card-icon"><ChartLineUp weight="duotone" /></div>
                <span>03 / DETERMINISTIC SCORE</span><h3>AI explains the result. It does not rewrite the evidence.</h3><p>The same findings and answers always produce the same score.</p>
                <div className="em-score-chip"><strong>84</strong><small>LOWER RISK</small><i /></div>
              </TiltCard>
            </div>
          </div>
        </section>

        <section className="em-section em-map-section" id="workflow">
          <div className="em-container em-map-grid">
            <div className="em-section-heading" data-em-reveal>
              <span className="em-section-label">FROM SIGNAL TO DECISION</span>
              <h2>A clearer path from “something looks wrong” to “this is what we fix first.”</h2>
              <p>CyberTracker connects technical evidence to product context without turning either one into a black box.</p>
              <ol className="em-workflow-list">
                <li><b>01</b><span><strong>Confirm ownership</strong><small>Every scan starts with explicit authorization.</small></span></li>
                <li><b>02</b><span><strong>Observe safe signals</strong><small>Passive checks are normalized and stored.</small></span></li>
                <li><b>03</b><span><strong>Add what only you know</strong><small>Adaptive questions complete the context.</small></span></li>
                <li><b>04</b><span><strong>Act on a ranked roadmap</strong><small>Today, this week and this month.</small></span></li>
              </ol>
            </div>
            <div data-em-reveal><GlobalSignalMap /></div>
          </div>
        </section>

        <section className="em-section em-benefits-section">
          <div className="em-container">
            <div className="em-benefit-globe" data-em-reveal>
              <EmeraldGlobe className="em-globe-secondary" label="Connected assessment signal layers" />
              <p>One assessment surface.<br />Seven connected layers.</p>
            </div>
            <div className="em-benefit-grid" data-em-stagger>
              {benefits.map(([Icon, title, description]) => (
                <article key={title} data-em-item><Icon weight="duotone" /><h3>{title}</h3><p>{description}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className="em-section em-dashboard-section">
          <div className="em-container">
            <div className="em-section-heading em-section-heading-center" data-em-reveal>
              <span className="em-section-label">YOUR SECURITY WORKSPACE</span>
              <h2>Useful information, not a complicated control room.</h2>
              <p>Scores, progress, priority signals and recent assessments stay visible in one calm dashboard.</p>
            </div>
            <div data-em-reveal><LandingDashboardPreview /></div>
            <div className="em-dashboard-cta" data-em-reveal>
              <div><TrendUp weight="duotone" /><span><strong>Review the full interactive workspace</strong><small>Preview the dashboard with realistic demo data.</small></span></div>
              <Link className="em-button em-button-outline" to="/preview/dashboard">Open dashboard preview <ArrowUpRight /></Link>
            </div>
          </div>
        </section>

        <section className="em-section em-proof-section">
          <div className="em-container em-proof-grid">
            <blockquote data-em-reveal>
              <Sparkle weight="fill" />
              <p>“A useful security product should make the limits of its evidence visible. CyberTracker is designed around that principle: facts first, context second, explanation last.”</p>
              <footer><span>EA</span><div><b>Product principle</b><small>AI Cyber Tracker learning build</small></div></footer>
            </blockquote>
            <div className="em-proof-numbers" data-em-stagger>
              <article data-em-item><b>100%</b><span>deterministic scoring</span></article>
              <article data-em-item><b>02</b><span>authorization layers</span></article>
              <article data-em-item><b>0</b><span>frontend AI secrets</span></article>
            </div>
          </div>
        </section>

        <section className="em-section" id="privacy">
          <div className="em-container">
            <div className="em-section-heading em-section-heading-center" data-em-reveal>
              <span className="em-section-label">BUILT FOR DIFFERENT LEVELS OF OWNERSHIP</span>
              <h2>Start with one site. Grow into a clearer security practice.</h2>
              <p>These are product paths—not paid plan claims. The 40-day MVP is focused on a reliable core assessment loop.</p>
            </div>
            <div className="em-path-grid" data-em-stagger>
              <TiltCard className="em-path-card" data-em-item><span>STARTER PATH</span><h3>One website</h3><p>Learn the complete scan-to-roadmap flow.</p><ul><li><CheckCircle />Passive assessment</li><li><CheckCircle />Owner questionnaire</li><li><CheckCircle />Action roadmap</li></ul><Link to="/register">Start assessment <ArrowRight /></Link></TiltCard>
              <TiltCard className="em-path-card featured" data-em-item><span>TEAM PATH</span><h3>Product portfolio</h3><p>Compare websites and focus the team's next security change.</p><ul><li><CheckCircle />Dashboard overview</li><li><CheckCircle />Score history</li><li><CheckCircle />Rescan comparison</li></ul><Link to="/preview/dashboard">Preview workspace <ArrowRight /></Link></TiltCard>
              <TiltCard className="em-path-card" data-em-item><span>LEARNING PATH</span><h3>40-day build</h3><p>Understand every layer from React to RLS and safe scanning.</p><ul><li><CheckCircle />Documented architecture</li><li><CheckCircle />Security boundaries</li><li><CheckCircle />Testable modules</li></ul><a href="#faq">See common questions <ArrowRight /></a></TiltCard>
            </div>
          </div>
        </section>

        <section className="em-section em-faq-section" id="faq">
          <div className="em-container em-faq-grid">
            <div className="em-section-heading" data-em-reveal><span className="em-section-label">FREQUENTLY ASKED QUESTIONS</span><h2>Know exactly what the product does—and what it refuses to claim.</h2><p>That boundary is part of the security design.</p><Link className="em-text-link" to="/register">Start a safe assessment <ArrowUpRight /></Link></div>
            <div className="em-faq-list" data-em-reveal>
              {faqs.map(([question, answer], index) => (
                <article className={openFaq === index ? "open" : ""} key={question}>
                  <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}><span>{question}</span><i>{openFaq === index ? "−" : "+"}</i></button>
                  <div><p>{answer}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="em-final-cta">
          <div className="em-container em-final-cta-inner" data-em-reveal>
            <div><span className="em-section-label">BRIDGE THE GAP BETWEEN SIGNAL AND ACTION</span><h2>Now see what your website has to say.</h2><p>Start with an authorized, passive assessment. Keep the evidence. Understand the next move.</p></div>
            <div><Link className="em-button em-button-light" to="/register">Create free account <ArrowRight /></Link><Link className="em-button em-button-ghost" to="/preview/dashboard">Preview dashboard <ArrowUpRight /></Link></div>
          </div>
        </section>
      </main>

      <footer className="em-footer">
        <div className="em-container"><Brand /><p>Defensive website security intelligence for learning teams and small product owners.</p><nav><a href="#platform">Platform</a><a href="#workflow">Workflow</a><a href="#privacy">Privacy</a><a href="#faq">FAQ</a></nav><small>Use only on websites you own or are explicitly authorized to assess.</small></div>
      </footer>
    </div>
  );
}

export default LandingPage;
