import { useEffect, useRef } from "react";
import { createLife, liveCount, stepLife } from "./ascii";

const SHADES = ["#1a1a1a", "#1e1e1e", "#222222", "#262626", "#2a2a2a", "#2e2e2e"];
const GLYPHS = [".", "+", "/", "."];
const TICK_MS = 700;

export function AsciiField({ seed }: { seed: number }) {
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
        cells = createLife(cols, rows, seed);
      }
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const age = cells[y * cols + x];
          if (age === 0) continue;
          context.fillStyle = SHADES[Math.min(SHADES.length - 1, age - 1)];
          context.fillText(
            GLYPHS[age % GLYPHS.length],
            x * charWidth,
            y * lineHeight + fontSize,
          );
        }
      }
    };

    let generation = 0;
    const tick = () => {
      generation += 1;
      const next = stepLife(cells, cols, rows);
      let same = true;
      for (let i = 0; i < next.length; i += 1) {
        if (next[i] !== cells[i]) {
          same = false;
          break;
        }
      }
      if (same) {
        const index = (seed + generation * 17) % next.length;
        next[index] = 1;
        if (index + 1 < next.length) next[index + 1] = 1;
        if (index + cols < next.length) next[index + cols] = 1;
      }
      const count = liveCount(next);
      cells =
        count < Math.max(8, Math.floor((cols * rows) / 25))
          ? createLife(cols, rows, seed + generation)
          : next;
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
  }, [seed]);

  return <canvas ref={ref} className="ascii" aria-hidden="true" />;
}
