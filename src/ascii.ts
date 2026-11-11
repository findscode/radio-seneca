export function asciiField(cols: number, rows: number): string {
  const lines: string[] = [];

  for (let y = 0; y < rows; y += 1) {
    let line = "";
    for (let x = 0; x < cols; x += 1) {
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
