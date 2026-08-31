import { useEffect, useRef } from "react";

function CodeRain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let width = 0;
    let height = 0;
    let columns = [];
    let last = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth; height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Array.from({ length: Math.max(18, Math.floor(width / 34)) }, (_, index) => ({ x: index * 34 + Math.random() * 14, y: Math.random() * height, speed: 16 + Math.random() * 26, length: 5 + Math.floor(Math.random() * 13), alpha: .025 + Math.random() * .055 }));
    }
    function draw(time = 0) {
      const delta = Math.min(0.05, (time - last) / 1000 || 0); last = time;
      context.clearRect(0, 0, width, height);
      context.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
      columns.forEach((column, columnIndex) => {
        for (let index = 0; index < column.length; index += 1) {
          const y = column.y - index * 17;
          if (y < -20 || y > height + 20) continue;
          const lead = index === 0;
          context.fillStyle = `rgba(${lead ? "218,255,239" : "85,245,179"},${column.alpha * (1 - index / column.length)})`;
          const glyph = ((columnIndex * 11 + index * 5 + Math.floor(time / 480)) % 2).toString();
          context.fillText(glyph, column.x, y);
        }
        if (!reduceMotion) column.y += column.speed * delta;
        if (column.y - column.length * 17 > height + 30) column.y = -Math.random() * 320;
      });
      if (!reduceMotion) frame = requestAnimationFrame(draw);
    }
    resize(); draw();
    const observer = new ResizeObserver(resize); observer.observe(canvas);
    return () => { observer.disconnect(); if (frame) cancelAnimationFrame(frame); };
  }, []);
  return <canvas ref={canvasRef} className="em-code-rain" aria-hidden="true"/>;
}

export default CodeRain;
