import PublicNavbar from "../components/landing/PublicNavbar";
import Hero from "../components/landing/Hero";
import ProblemSection from "../components/landing/ProblemSection";
import SolutionSection from "../components/landing/SolutionSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import FAQSection from "../components/landing/FAQSection";
import CTASection from "../components/landing/CTASection";
import BackendStatus from "../components/BackendStatus";
function LandingPage() { return <div className="public-page"><PublicNavbar/><main><Hero/><ProblemSection/><SolutionSection/><FeaturesSection/><FAQSection/><CTASection/></main><footer className="site-footer"><div className="page-width footer-inner"><p>AI Cyber Tracker · Phase 1–4 learning build</p><BackendStatus/></div></footer></div>; }
export default LandingPage;
