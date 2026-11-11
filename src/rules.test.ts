import assert from "node:assert/strict";
import test from "node:test";
import { createLife, liveCount, stepLife } from "./ascii.ts";
import { languageFrom, textFor } from "./i18n.ts";
import { quoteAt } from "./quotes.ts";
import { retryDelayMs } from "./report.ts";

test("language follows the saved choice, then the browser", () => {
  assert.equal(languageFrom(null, "ru-RU"), "ru");
  assert.equal(languageFrom(null, "en-US"), "en");
  assert.equal(languageFrom(null, "de-DE"), "en");
  assert.equal(languageFrom("en", "ru-RU"), "en");
  assert.equal(languageFrom("ru", "en-US"), "ru");
  assert.equal(languageFrom("fr", "ru-BY"), "ru");
});

test("the quote is the same for one UTC hour and changes on the next hour", () => {
  const hour = new Date("2026-06-01T14:10:00Z");
  const later = new Date("2026-06-01T14:59:00Z");
  const nextHour = new Date("2026-06-01T15:00:00Z");
  const nextDay = new Date("2026-06-02T14:10:00Z");

  assert.equal(quoteAt(hour, "en"), quoteAt(later, "en"));
  assert.equal(quoteAt(hour, "en"), quoteAt(nextDay, "en"));
  assert.notEqual(quoteAt(hour, "en"), quoteAt(nextHour, "en"));
  assert.notEqual(quoteAt(hour, "en"), quoteAt(hour, "ru"));
});

test("retry waits double the previous delay and stops at 30 seconds", () => {
  assert.equal(retryDelayMs(0), 1_000);
  assert.equal(retryDelayMs(1), 2_000);
  assert.equal(retryDelayMs(2), 4_000);
  assert.equal(retryDelayMs(3), 8_000);
  assert.equal(retryDelayMs(4), 16_000);
  assert.equal(retryDelayMs(5), 30_000);
  assert.equal(retryDelayMs(9), 30_000);
});

test("NOW stays NOW in both languages", () => {
  assert.equal(textFor("en").now, "NOW");
  assert.equal(textFor("ru").now, "NOW");
});

test("life changes a blinker and is seeded by the hour", () => {
  const cols = 5;
  const cells = new Uint8Array(cols * 5);
  cells[1 * cols + 2] = 1;
  cells[2 * cols + 2] = 1;
  cells[3 * cols + 2] = 1;
  const next = stepLife(cells, cols, 5);
  assert.equal(next[2 * cols + 1] > 0, true);
  assert.equal(next[2 * cols + 2] > 0, true);
  assert.equal(next[2 * cols + 3] > 0, true);
  assert.equal(next[1 * cols + 2], 0);
  assert.notEqual(liveCount(createLife(20, 12, 1)), 0);
  assert.notDeepEqual(createLife(20, 12, 1), createLife(20, 12, 2));
});
