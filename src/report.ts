export function retryDelayMs(attempt: number): number {
  return Math.min(30_000, 1000 * 2 ** attempt);
}

export function reportClientEvent(kind: "error" | "reconnect", detail: string) {
  console.error(`[seneca] ${kind}: ${detail}`);
}
