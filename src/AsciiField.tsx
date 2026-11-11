import { useEffect, useRef, useState } from "react";
import { asciiField } from "./ascii";

export function AsciiField() {
  const ref = useRef<HTMLPreElement>(null);
  const [pattern, setPattern] = useState("");

  useEffect(() => {
    const node = ref.current;
    const stage = node?.parentElement;
    if (!node || !stage) return;

    const measure = () => {
      const style = getComputedStyle(node);
      const fontSize = Number.parseFloat(style.fontSize) || 16;
      const lineHeight = Number.parseFloat(style.lineHeight) || fontSize * 1.15;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return;
      context.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
      const charWidth = context.measureText("0").width || fontSize * 0.6;
      const cols = Math.ceil(stage.clientWidth / charWidth) + 2;
      const rows = Math.ceil(stage.clientHeight / lineHeight) + 2;
      setPattern(asciiField(cols, rows));
    };

    measure();
    document.fonts?.ready.then(measure).catch(() => undefined);
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return (
    <pre ref={ref} className="ascii" aria-hidden="true">
      {pattern}
    </pre>
  );
}
