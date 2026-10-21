#!/usr/bin/env node
/**
 * Wiring smoke-test for the *browser* render pipeline.
 *
 * There is no Chrome in this sandbox, so the real WebCodecs encoders cannot be
 * exercised here. This harness installs minimal WebCodecs stubs, loads the exact
 * browser modules, draws real scene frames with @napi-rs/canvas and pushes them
 * through mp4-muxer. It proves: module graph, font bootstrap path, schedule math,
 * encoder loop, audio packetization, chunked streaming target and blob assembly.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createCanvas, Image as NapiImage } from '@napi-rs/canvas';

/* ------------------------------------------------------------- DOM stubs */
class FakeFontFace {
  constructor(family, source, opts = {}) { this.family = family; this.source = source; this.weight = opts.weight; this.status = 'loaded'; }
  load() { return Promise.resolve(this); }
}
const fakeDoc = {
  createElement(tag) {
    if (tag === 'canvas') return createCanvas(1080, 1920);
    return {};
  },
  fonts: { add() {}, load: () => Promise.resolve([]), ready: Promise.resolve() },
};
globalThis.document = fakeDoc;
globalThis.window = globalThis;
globalThis.FontFace = FakeFontFace;
// Load the same bundled photographs as a real browser, using local files here.
globalThis.Image = class extends NapiImage {
  set src(value) { super.src = value.startsWith('file:') ? new URL(value).pathname : value; }
  get src() { return super.src; }
};

/* ------------------------------------------------------- WebCodecs stubs */
class Chunk {
  constructor(type, init) {
    this.type = type;
    this.timestamp = init.timestamp;
    this.duration = init.duration;
    this.data = init.data;
    this.byteLength = init.data.byteLength;
  }
  copyTo(dest) { dest.set(this.data); }
}
globalThis.EncodedVideoChunk = class extends Chunk { constructor(init) { super(init.type, init); } };
globalThis.EncodedAudioChunk = class extends Chunk { constructor(init) { super(init.type, init); } };
globalThis.VideoFrame = class { constructor(canvas, init) { this.timestamp = init.timestamp; this.duration = init.duration; } close() {} };
globalThis.AudioData = class {
  constructor(init) { this.frames = init.numberOfFrames; this.channels = init.numberOfChannels; this.data = init.data; }
  close() {}
};

const AVC_DESCRIPTION = new Uint8Array([1, 0x4d, 0x00, 0x2a, 0xff, 0xe1, 0x00, 0x04, 0x67, 0x4d, 0x00, 0x2a, 0x01, 0x00, 0x04, 0x68, 0xee, 0x3c, 0x80]);
const AAC_DESCRIPTION = new Uint8Array([0x11, 0x90]);

globalThis.VideoEncoder = class extends EventTarget {
  static async isConfigSupported(config) { return { supported: true, config }; }
  constructor({ output, error }) { super(); this.output = output; this.error = error; this.encodeQueueSize = 0; this.packets = 0; }
  configure(config) { this.config = config; }
  encode(frame, opts = {}) {
    this.packets += 1;
    const key = !!opts.keyFrame;
    this.output(
      new globalThis.EncodedVideoChunk({
        type: key ? 'key' : 'delta',
        timestamp: frame.timestamp,
        duration: frame.duration,
        data: new Uint8Array([0, 0, 0, 2, 0x65, 0x88]),
      }),
      { decoderConfig: { codec: this.config.codec, description: AVC_DESCRIPTION } },
    );
  }
  async flush() {}
  close() {}
};

globalThis.AudioEncoder = class extends EventTarget {
  static async isConfigSupported(config) { return { supported: true, config }; }
  constructor({ output }) { super(); this.output = output; this.encodeQueueSize = 0; }
  configure(config) { this.config = config; }
  encode(audioData) {
    this.output(
      new globalThis.EncodedAudioChunk({
        type: 'key',
        timestamp: Math.round((audioData.frames / 48000) * 0),
        duration: 21333,
        data: new Uint8Array([0x21, 0x10, 0x05, 0x60]),
      }),
      { decoderConfig: { codec: 'mp4a.40.2', description: AAC_DESCRIPTION } },
    );
  }
  async flush() {}
  close() {}
};

/* --------------------------------------------------------------- the test */
const { PLATFORM_READY } = await import('../src/render/platform.mjs');
await PLATFORM_READY;

const { Compositor } = await import('../src/render/frame.mjs');
const { SCENES } = await import('../src/scenes/timeline.mjs');
const { renderMp4 } = await import('../src/browser/encode.js');

const schedule = {
  totalFrames: 45,
  duration: 1.5,
  fps: 30,
  scenes: [
    { ...SCENES[0], f0: 0, f1: 15 },
    { ...SCENES[3], f0: 15, f1: 30 },
    { ...SCENES[68], f0: 30, f1: 45 },
  ],
};

const frames = 48000;
const audio = {
  planar: new Float32Array(frames * 2),
  frames,
  sampleRate: 48000,
  channels: 2,
};

const compositor = new Compositor({ preview: true });
const seen = [];
const result = await renderMp4({
  compositor,
  schedule,
  audio,
  onStage: (phase) => { seen.push(`stage:${phase}`); console.log('stage', phase); },
  onProgress: (p, i) => { if (p >= 1) seen.push('progress:1'); if (i && i.frame % 6 === 0) console.log('frame', i.frame, i.total); },
});

const out = path.join('/tmp', 'smoke.mp4');
fs.writeFileSync(out, Buffer.from(await result.blob.arrayBuffer()));
const head = fs.readFileSync(out).subarray(0, 24);
console.log(JSON.stringify({
  bytes: result.bytes,
  frames: result.frames,
  stages: seen,
  ftyp: head.toString('ascii', 4, 8),
  wroteBytes: fs.statSync(out).size,
}, null, 2));
if (result.bytes < 1000) throw new Error('SMOKE_FAILED: muxer produced no data');
console.log('SMOKE OK');
