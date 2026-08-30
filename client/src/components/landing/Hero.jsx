import { Link } from "react-router-dom";
import heroImage from "../../assets/hero.png";
function Hero() {
  return <section className="hero-section page-width"><div className="hero-copy"><p className="eyebrow">Defensive website-security assessment</p><h1>Understand the risks your website may be quietly carrying.</h1><p className="hero-lead">AI Cyber Tracker is being built to turn verified technical findings into understandable evidence and practical next steps.</p><div className="hero-actions"><Link className="button button-primary" to="/register">Start with an account</Link><a className="button button-secondary" href="#features">See how it works</a></div></div><div className="hero-visual" aria-hidden="true"><div className="hero-orbit hero-orbit-one"/><div className="hero-orbit hero-orbit-two"/><img src={heroImage} alt="" /></div></section>;
}
export default Hero;
