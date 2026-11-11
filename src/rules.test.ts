import assert from "node:assert/strict";
import test from "node:test";
import { createField, glyphFrames, speciesCounts, stepField } from "./ascii.ts";
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

function randomFrom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

test("the field starts at random and keeps four symbols in motion", () => {
  const cols = 36;
  const rows = 18;
  const first = createField(cols, rows, randomFrom(1));
  const second = createField(cols, rows, randomFrom(2));
  assert.notDeepEqual(first, second);

  let field = first;
  let moved = false;
  for (let step = 0; step < 16; step += 1) {
    const next = stepField(field, cols, rows, randomFrom(100 + step));
    for (let i = 0; i < next.length; i += 1) {
      if (next[i] !== field[i]) moved = true;
    }
    field = next;
    const counts = speciesCounts(field);
    const live = counts[1] + counts[2] + counts[3] + counts[4];
    const largest = Math.max(counts[1], counts[2], counts[3], counts[4]);
    assert.ok(counts[1] > 0 && counts[2] > 0 && counts[3] > 0 && counts[4] > 0);
    assert.ok(largest <= live * 0.45);
    assert.ok(live <= Math.floor(cols * rows * 0.28));
  }
  assert.equal(moved, true);
});

test("a symbol slides into the next cell and a new one fades in", () => {
  const cols = 4;
  const prev = new Uint8Array(cols * 3);
  const next = new Uint8Array(cols * 3);
  prev[1] = 1;
  next[2] = 1;
  next[cols + 1] = 2;
  const frames = glyphFrames(prev, next, cols, 3);
  const slide = frames.find((item) => item.species === 1);
  const birth = frames.find((item) => item.species === 2);
  assert.equal(slide?.fromCol, 1);
  assert.equal(slide?.toCol, 2);
  assert.equal(slide?.fromAlpha, 1);
  assert.equal(slide?.toAlpha, 1);
  assert.equal(birth?.fromAlpha, 0);
  assert.equal(birth?.toAlpha, 1);
});
