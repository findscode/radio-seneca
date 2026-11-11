export function createLife(cols: number, rows: number, seed: number): Uint8Array {
  const cells = new Uint8Array(cols * rows);
  let state = (seed >>> 0) || 1;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  };
  for (let i = 0; i < cells.length; i += 1) {
    if (next() % 8 === 0) cells[i] = 1 + (next() % 4);
  }
  return cells;
}

export function stepLife(cells: Uint8Array, cols: number, rows: number): Uint8Array {
  const next = new Uint8Array(cells.length);
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      let neighbors = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          if (cells[ny * cols + nx] > 0) neighbors += 1;
        }
      }
      const age = cells[y * cols + x];
      if (age > 0 && (neighbors === 2 || neighbors === 3)) {
        next[y * cols + x] = Math.min(6, age + 1);
      } else if (age === 0 && neighbors === 3) {
        next[y * cols + x] = 1;
      }
    }
  }
  return next;
}

export function liveCount(cells: Uint8Array): number {
  let count = 0;
  for (let i = 0; i < cells.length; i += 1) {
    if (cells[i] > 0) count += 1;
  }
  return count;
}
