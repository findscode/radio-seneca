import { useEffect, useRef } from "react";
import { createField, GLYPHS, stepField } from "./ascii";

const SHADES = ["#181818", "#1a1a1a", "#1c1c1c", "#1e1e1e"];
const TICK_MS = 650;

export function AsciiField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const stage = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !stage || !context) return;

    let cols = 0;
    let rows = 0;
    let cells: Uint8Array<ArrayBufferLike> = new Uint8Array(0);
    let timer = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const draw = () => {
      const style = getComputedStyle(canvas);
      const fontSize = Number.parseFloat(style.fontSize) || 16;
      const lineHeight = fontSize * 1.15;
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.font = `400 ${fontSize}px ${style.fontFamily}`;
      const charWidth = context.measureText("0").width || fontSize * 0.6;
      const nextCols = Math.max(1, Math.ceil(width / charWidth));
      const nextRows = Math.max(1, Math.ceil(height / lineHeight));
      if (nextCols !== cols || nextRows !== rows || cells.length === 0) {
        cols = nextCols;
        rows = nextRows;
        cells = createField(cols, rows, Math.random);
      }
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const species = cells[y * cols + x];
          if (species === 0) continue;
          context.fillStyle = SHADES[species - 1];
          context.fillText(GLYPHS[species - 1], x * charWidth, y * lineHeight + fontSize);
        }
      }
    };

    const tick = () => {
      cells = stepField(cells, cols, rows, Math.random);
      draw();
    };

    draw();
    document.fonts?.ready.then(draw).catch(() => undefined);
    const observer = new ResizeObserver(draw);
    observer.observe(stage);
    if (!reduced) timer = window.setInterval(tick, TICK_MS);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return <canvas ref={ref} className="ascii" aria-hidden="true" />;
}
