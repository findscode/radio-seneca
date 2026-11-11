export const GLYPHS = ["x", "+", "o", "~"] as const;

const DRIFT: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [0, 1],
  [1, 1],
  [-1, 0],
];

export function createField(cols: number, rows: number, random: () => number): Uint8Array {
  const cells = new Uint8Array(cols * rows);
  const picks: number[] = [];
  for (let i = 0; i < cells.length; i += 1) {
    if (random() < 0.2) picks.push(i);
  }
  while (picks.length < Math.min(4, cells.length)) picks.push(picks.length);
  for (let n = 0; n < picks.length; n += 1) {
    const swapAt = n + Math.floor(random() * (picks.length - n));
    const held = picks[n];
    picks[n] = picks[swapAt];
    picks[swapAt] = held;
  }
  for (let n = 0; n < picks.length; n += 1) cells[picks[n]] = (n % GLYPHS.length) + 1;
  return cells;
}

export function stepField(
  cells: Uint8Array,
  cols: number,
  rows: number,
  random: () => number,
): Uint8Array {
  const next = new Uint8Array(cells.length);
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const here = cells[y * cols + x];
      const near = [0, 0, 0, 0, 0];
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const value = cells[wrap(y + dy, rows) * cols + wrap(x + dx, cols)];
          near[value] += 1;
        }
      }
      const total = near[1] + near[2] + near[3] + near[4];
      if (here === 0) {
        for (let species = 1; species <= GLYPHS.length; species += 1) {
          if (near[species] === 2 && total === 2) next[y * cols + x] = species;
        }
        continue;
      }
      const same = near[here];
      let rival = 0;
      let rivalCount = 0;
      for (let species = 1; species <= GLYPHS.length; species += 1) {
        if (species !== here && near[species] > rivalCount) {
          rival = species;
          rivalCount = near[species];
        }
      }
      if (same >= 5) next[y * cols + x] = 0;
      else if (rivalCount >= 2 && rivalCount > same) next[y * cols + x] = rival;
      else if (total === 0) next[y * cols + x] = 0;
      else next[y * cols + x] = here;
    }
  }
  balance(next, random);
  drift(next, cols, rows, random);
  return next;
}

export function speciesCounts(cells: Uint8Array): number[] {
  const counts = [0, 0, 0, 0, 0];
  for (let i = 0; i < cells.length; i += 1) counts[cells[i]] += 1;
  return counts;
}

function balance(cells: Uint8Array, random: () => number) {
  const groups: number[][] = [[], [], [], [], []];
  for (let i = 0; i < cells.length; i += 1) groups[cells[i]].push(i);
  let live = cells.length - groups[0].length;
  const maxLive = Math.max(4, Math.floor(cells.length * 0.28));
  const minLive = Math.min(maxLive, Math.max(4, Math.floor(cells.length * 0.14)));

  while (live > maxLive && groups[majority(groups)].length > 0) {
    move(cells, groups, majority(groups), 0, random);
    live -= 1;
  }
  while (live < minLive && groups[0].length > 0) {
    move(cells, groups, 0, rarest(groups, random), random);
    live += 1;
  }

  const floor = Math.max(1, Math.floor(live * 0.12));
  const cap = Math.max(floor, Math.floor(live * 0.4));
  for (let pass = 0; pass < cells.length; pass += 1) {
    const crowded = majority(groups);
    const scarce = rarest(groups, random);
    if (groups[crowded].length <= cap && groups[scarce].length >= floor) break;
    if (groups[crowded].length <= floor) break;
    const destination = groups[scarce].length < floor ? scarce : rarest(groups, random);
    if (destination === crowded) break;
    move(cells, groups, crowded, destination, random);
  }
}

function drift(cells: Uint8Array, cols: number, rows: number, random: () => number) {
  const moved = new Uint8Array(cells.length);
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const index = y * cols + x;
      const species = cells[index];
      if (species === 0 || moved[index] || random() > 0.45) continue;
      const [dx, dy] = DRIFT[species - 1];
      const nextIndex = wrap(y + dy, rows) * cols + wrap(x + dx, cols);
      if (cells[nextIndex] !== 0 || moved[nextIndex]) continue;
      cells[nextIndex] = species;
      cells[index] = 0;
      moved[index] = 1;
      moved[nextIndex] = 1;
    }
  }
}

function move(cells: Uint8Array, groups: number[][], from: number, to: number, random: () => number) {
  const list = groups[from];
  const pick = Math.floor(random() * list.length);
  const index = list[pick];
  list[pick] = list[list.length - 1];
  list.pop();
  cells[index] = to;
  groups[to].push(index);
}

function majority(groups: number[][]): number {
  let species = 1;
  for (let i = 2; i <= GLYPHS.length; i += 1) {
    if (groups[i].length > groups[species].length) species = i;
  }
  return species;
}

function rarest(groups: number[][], random: () => number): number {
  let best = 1;
  const ties: number[] = [1];
  for (let i = 2; i <= GLYPHS.length; i += 1) {
    if (groups[i].length < groups[best].length) {
      best = i;
      ties.length = 0;
      ties.push(i);
    } else if (groups[i].length === groups[best].length) ties.push(i);
  }
  return ties[Math.floor(random() * ties.length)] ?? best;
}

function wrap(value: number, size: number): number {
  return (value + size) % size;
}
