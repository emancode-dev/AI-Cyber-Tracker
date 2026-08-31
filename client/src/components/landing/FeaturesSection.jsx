import FeatureCard from "./FeatureCard";
const features = [
  { id: 1, number: "01", title: "Safe website assessment", description: "Inspect a focused set of passive public signals with SSRF-oriented URL protections." },
  { id: 2, number: "02", title: "Real ownership boundaries", description: "Supabase Auth, backend identity checks, and RLS keep each user's website data separated." },
  { id: 3, number: "03", title: "Normalized findings", description: "Headers, cookies, TLS, redirects, and metadata all become one predictable finding shape." },
  { id: 4, number: "04", title: "Evidence before AI", description: "The later AI layer explains verified evidence; it does not invent findings or decide the score." }
];
function FeaturesSection() { return <section className="section page-width" id="features"><div className="section-heading"><p className="eyebrow">Learn by building</p><h2>The product grows one reliable layer at a time.</h2></div><div className="feature-grid">{features.map((feature) => <FeatureCard key={feature.id} {...feature} />)}</div></section>; }
export default FeaturesSection;
