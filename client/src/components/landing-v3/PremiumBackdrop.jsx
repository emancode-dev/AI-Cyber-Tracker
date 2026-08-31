import NumberRain from "./NumberRain";

function PremiumBackdrop() {
  return (
    <div className="v3-backdrop" aria-hidden="true">
      <NumberRain />
      <div className="v3-noise" />
      <div className="v3-grid-plane" />
      <div className="v3-ambient v3-ambient-a" />
      <div className="v3-ambient v3-ambient-b" />
    </div>
  );
}

export default PremiumBackdrop;
