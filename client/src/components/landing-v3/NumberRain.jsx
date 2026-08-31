import { useEffect, useRef } from "react";

function NumberRain({ density = 0.72 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d", { alpha: true });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let width = 0;
    let height = 0;
    let columns = [];
    const fontSize = 12;

    const reset = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(14, Math.floor((width / 30) * density));
      columns = Array.from({ length: count }, (_, index) => ({
        x: (index / Math.max(1, count - 1)) * width,
        y: Math.random() * height,
        speed: 0.26 + Math.random() * 0.72,
        length: 6 + Math.floor(Math.random() * 16),
        opacity: 0.06 + Math.random() * 0.08
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = "center";
      columns.forEach((col, colIndex) => {
        for (let i = 0; i < col.length; i += 1) {
          const y = col.y - i * 18;
          if (y < -20 || y > height + 20) continue;
          const fade = 1 - i / col.length;
          ctx.fillStyle = `rgba(${i === 0 ? "196,181,253" : "139,92,246"},${col.opacity * fade})`;
          const digit = (Math.floor((colIndex * 7 + i * 3 + col.y / 20)) % 2).toString();
          ctx.fillText(digit, col.x, y);
        }
        if (!reduceMotion) {
          col.y += col.speed;
          if (col.y - col.length * 18 > height + 30) {
            col.y = -Math.random() * 240;
          }
        }
      });
      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };

    reset();
    draw();
    window.addEventListener("resize", reset);
    return () => {
      window.removeEventListener("resize", reset);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [density]);

  return <canvas ref={canvasRef} className="v3-number-rain" aria-hidden="true" />;
}

export default NumberRain;
