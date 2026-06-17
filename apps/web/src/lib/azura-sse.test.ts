import { describe, expect, it } from 'vitest';
import type { AzuraStationNowPlaying } from '@radio-seneca/shared';
import { extractNowPlayingFromSseMessage, mergeNowPlaying } from './azura-sse';

const sampleNowPlaying = {
  station: { shortcode: 'test_radio', listen_url: 'https://example.com/listen/test/radio.mp3' },
  listeners: { total: 1, unique: 1, current: 1 },
  live: { is_live: false, streamer_name: '', broadcast_start: null, art: null },
  now_playing: {
    sh_id: 1,
    played_at: 1,
    duration: 200,
    playlist: 'default',
    streamer: '',
    is_request: false,
    song: {
      id: '1',
      art: '',
      custom_fields: {},
      text: 'Artist - Title',
      artist: 'Artist',
      title: 'Title',
      album: '',
      genre: '',
      isrc: '',
      lyrics: '',
    },
    elapsed: 10,
    remaining: 190,
  },
  playing_next: null,
  song_history: [
    {
      sh_id: 0,
      played_at: 0,
      duration: 180,
      playlist: 'default',
      streamer: '',
      is_request: false,
      song: {
        id: '0',
        art: '',
        custom_fields: {},
        text: 'Prev - Song',
        artist: 'Prev',
        title: 'Song',
        album: '',
        genre: '',
        isrc: '',
        lyrics: '',
      },
    },
  ],
  is_online: true,
  cache: 'event',
} as unknown as AzuraStationNowPlaying;

describe('extractNowPlayingFromSseMessage', () => {
  it('ignores empty ping messages', () => {
    expect(extractNowPlayingFromSseMessage('{}')).toBeNull();
  });

  it('ignores connect-only messages without now playing data', () => {
    expect(
      extractNowPlayingFromSseMessage(
        JSON.stringify({ connect: { client: 'abc', version: '6.8.3', ping: 25 } }),
      ),
    ).toBeNull();
  });

  it('parses publication payloads', () => {
    const message = JSON.stringify({
      pub: { data: { np: sampleNowPlaying } },
    });

    expect(extractNowPlayingFromSseMessage(message)?.now_playing.song.title).toBe('Title');
  });

  it('parses cached connect publications', () => {
    const message = JSON.stringify({
      connect: {
        subs: {
          'station:test_radio': {
            publications: [{ data: { np: sampleNowPlaying } }],
          },
        },
      },
    });

    expect(extractNowPlayingFromSseMessage(message)?.song_history).toHaveLength(1);
  });
});

describe('mergeNowPlaying', () => {
  it('keeps song history when update omits it', () => {
    const update = {
      ...sampleNowPlaying,
      song_history: [],
      now_playing: {
        ...sampleNowPlaying.now_playing,
        song: { ...sampleNowPlaying.now_playing.song, title: 'Updated' },
      },
    };

    const merged = mergeNowPlaying(sampleNowPlaying, update);

    expect(merged.now_playing.song.title).toBe('Updated');
    expect(merged.song_history).toHaveLength(1);
  });
});
