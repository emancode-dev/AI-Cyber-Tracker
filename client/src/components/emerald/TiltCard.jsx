import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

function TiltCard({ as = "article", className = "", children, ...props }) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const smoothX = useSpring(x, { stiffness: 170, damping: 22 });
  const smoothY = useSpring(y, { stiffness: 170, damping: 22 });
  const rotateY = useTransform(smoothX, [0, 1], [-5, 5]);
  const rotateX = useTransform(smoothY, [0, 1], [5, -5]);
  const Component = motion[as] || motion.article;

  function handlePointerMove(event) {
    if (reduceMotion || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width);
    y.set((event.clientY - rect.top) / rect.height);
  }

  function reset() {
    x.set(0.5);
    y.set(0.5);
  }

  return (
    <Component
      {...props}
      className={`em-tilt-card ${className}`.trim()}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      onBlur={reset}
      style={reduceMotion ? undefined : { rotateX, rotateY, transformPerspective: 1000 }}
    >
      <span className="em-card-shine" aria-hidden="true" />
      {children}
    </Component>
  );
}

export default TiltCard;
