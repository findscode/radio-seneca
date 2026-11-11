const COLS = 72;
const ROWS = 42;

export function asciiField(): string {
  const lines: string[] = [];

  for (let y = 0; y < ROWS; y += 1) {
    let line = "";
    for (let x = 0; x < COLS; x += 1) {
      const slot = (x + 2 * y) % 10;
      if (slot === 0) line += "/";
      else if (slot === 3) line += "+";
      else if (slot === 7) line += ".";
      else line += " ";
    }
    lines.push(line);
  }

  return lines.join("\n");
}
