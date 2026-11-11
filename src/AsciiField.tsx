import { useEffect, useRef } from "react";
import { createField, GLYPHS, glyphFrames, stepField, type GlyphFrame } from "./ascii";

const SHADES = ["#181818", "#1a1a1a", "#1c1c1c", "#1e1e1e"];
const STEP_MS = 1100;

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
    let frames: GlyphFrame[] = [];
    let stepStart = 0;
    let raf = 0;
    let charWidth = 10;
    let fontSize = 16;
    let lineHeight = 18;
    let viewWidth = 0;
    let viewHeight = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const begin = (now: number) => {
      const next = stepField(cells, cols, rows, Math.random);
      frames = glyphFrames(cells, next, cols, rows);
      cells = next;
      stepStart = now;
    };

    const layout = () => {
      const style = getComputedStyle(canvas);
      fontSize = Number.parseFloat(style.fontSize) || 16;
      lineHeight = fontSize * 1.15;
      viewWidth = stage.clientWidth;
      viewHeight = stage.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(viewWidth * dpr));
      const height = Math.max(1, Math.floor(viewHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.font = `400 ${fontSize}px ${style.fontFamily}`;
      charWidth = context.measureText("0").width || fontSize * 0.6;
      const nextCols = Math.max(1, Math.ceil(viewWidth / charWidth));
      const nextRows = Math.max(1, Math.ceil(viewHeight / lineHeight));
      if (nextCols !== cols || nextRows !== rows || cells.length === 0) {
        cols = nextCols;
        rows = nextRows;
        cells = createField(cols, rows, Math.random);
        if (reduced) {
          frames = glyphFrames(cells, cells, cols, rows);
        } else {
          begin(performance.now());
        }
      }
    };

    const paint = (now: number) => {
      const elapsed = reduced ? 1 : Math.min(1, (now - stepStart) / STEP_MS);
      const ease = elapsed * elapsed * (3 - 2 * elapsed);
      context.clearRect(0, 0, viewWidth, viewHeight);
      for (let i = 0; i < frames.length; i += 1) {
        const item = frames[i];
        const alpha = item.fromAlpha + (item.toAlpha - item.fromAlpha) * ease;
        if (alpha < 0.04) continue;
        const col = item.fromCol + (item.toCol - item.fromCol) * ease;
        const row = item.fromRow + (item.toRow - item.fromRow) * ease;
        context.globalAlpha = alpha;
        context.fillStyle = SHADES[item.species - 1];
        context.fillText(GLYPHS[item.species - 1], col * charWidth, row * lineHeight + fontSize);
      }
      context.globalAlpha = 1;
      if (reduced) return;
      if (elapsed >= 1) begin(now);
      raf = window.requestAnimationFrame(paint);
    };

    layout();
    document.fonts?.ready.then(() => {
      layout();
      if (reduced) paint(0);
    }).catch(() => undefined);
    const observer = new ResizeObserver(() => {
      layout();
      if (reduced) paint(0);
    });
    observer.observe(stage);
    if (reduced) paint(0);
    else raf = window.requestAnimationFrame(paint);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} className="ascii" aria-hidden="true" />;
}
