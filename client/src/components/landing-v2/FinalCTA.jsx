import { Link } from "react-router-dom";
import Reveal from "./Reveal";

function FinalCTA() {
  return <section className="final-cta-section"><div className="page-width"><Reveal className="final-cta-card"><div className="final-cta-glow"/><span className="cyber-kicker"><span/>YOUR TURN</span><h2>You’ve seen how it works.<br/>Now see what your website has to say.</h2><p>Start with an authorized website and turn technical signals into a clearer security conversation.</p><div><Link className="cyber-button cyber-button-solid" to="/register">Start assessment</Link><Link className="cyber-button cyber-button-ghost" to="/login">Login</Link></div></Reveal></div></section>;
}

export default FinalCTA;
