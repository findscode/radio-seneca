import assert from "node:assert/strict";
import test from "node:test";
import { payloadFromSocketMessage, toBroadcast } from "./nowPlaying.ts";

const persuasion = {
  listeners: { current: 3 },
  now_playing: {
    song: {
      id: "now-1",
      title: "Persuasion",
      artist: "Guardians Of Dalliance",
      art: "http://radio.example/persuasion.jpg",
    },
  },
  song_history: [
    { sh_id: 5, song: { title: "Sixth Sense", artist: "B.C. & Neil Trix", art: "" } },
  ],
};

test("maps the current track, history, and listener count", () => {
  const broadcast = toBroadcast(persuasion);
  assert.equal(broadcast.current.title, "Persuasion");
  assert.equal(broadcast.current.artist, "Guardians Of Dalliance");
  assert.equal(broadcast.current.art, "http://radio.example/persuasion.jpg");
  assert.equal(broadcast.history.length, 1);
  assert.equal(broadcast.history[0]?.art, null);
  assert.equal(broadcast.listenersNow, 3);
  assert.equal(broadcast.listeners24h, null);
});

test("a later payload replaces the track without keeping the old one", () => {
  const next = toBroadcast({
    listeners: { current: 4 },
    now_playing: {
      song: { id: "now-2", title: "Fever", artist: "Tango", art: "http://radio.example/fever.jpg" },
    },
    song_history: [
      { sh_id: 6, song: { title: "Persuasion", artist: "Guardians Of Dalliance", art: "http://radio.example/persuasion.jpg" } },
      { sh_id: 5, song: { title: "Sixth Sense", artist: "B.C. & Neil Trix" } },
      { sh_id: 4, song: { title: "Visions", artist: "Vext" } },
      { sh_id: 3, song: { title: "Cascade", artist: "Carlito" } },
      { sh_id: 2, song: { title: "Revolution", artist: "Neil Trix" } },
      { sh_id: 1, song: { title: "Extra", artist: "Skip" } },
    ],
  });

  assert.equal(next.current.title, "Fever");
  assert.equal(next.history.length, 5);
  assert.equal(next.history[0]?.title, "Persuasion");
  assert.equal(next.history[4]?.title, "Revolution");
});

test("reads the initial websocket publication", () => {
  const payload = payloadFromSocketMessage({
    connect: {
      subs: {
        "station:seneca": {
          publications: [{ data: { np: persuasion } }],
        },
      },
    },
  });
  assert.equal(payload?.now_playing?.song?.title, "Persuasion");
});

test("reads a later websocket publication", () => {
  const payload = payloadFromSocketMessage({
    pub: { data: { np: { now_playing: { song: { title: "Fever" } } } } },
  });
  assert.equal(payload?.now_playing?.song?.title, "Fever");
});

test("ignores websocket pings", () => {
  assert.equal(payloadFromSocketMessage({}), null);
});
