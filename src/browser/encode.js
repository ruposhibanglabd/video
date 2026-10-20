/**
 * Browser MP4 encoder — WebCodecs (H.264 + AAC) muxed with mp4-muxer.
 * Everything happens locally in the tab: no upload, no server, no timeout.
 */
import { Muxer, StreamTarget } from 'mp4-muxer';

export const FPS = 30;

const VIDEO_CONFIGS = [
  { codec: 'avc1.4d002a', level: '4.2', profile: 'main' },
  { codec: 'avc1.42002a', level: '4.2', profile: 'baseline' },
  { codec: 'avc1.64002a', level: '4.2', profile: 'high' },
];

export function capabilities() {
  const hasVideo = typeof window.VideoEncoder === 'function';
  const hasAudio = typeof window.AudioEncoder === 'function';
  const hasFrame = typeof window.VideoFrame === 'function';
  return { hasVideo, hasAudio, hasFrame, ok: hasVideo && hasAudio && hasFrame };
}

async function pickVideoConfig(width, height, bitrate) {
  for (const c of VIDEO_CONFIGS) {
    const config = {
      codec: c.codec,
      width,
      height,
      bitrate,
      framerate: FPS,
      avc: { format: 'avc' },
      latencyMode: 'quality',
    };
    try {
      const res = await VideoEncoder.isConfigSupported(config);
      if (res.supported) return { config: res.config || config, label: c.profile };
    } catch { /* try next */ }
  }
  throw new Error('H264_UNSUPPORTED');
}

const yieldToUi = () =>
  new Promise((resolve) => {
    const ch = new MessageChannel();
    ch.port1.onmessage = () => resolve();
    ch.port2.postMessage(0);
  });

/**
 * Render + encode. Returns { blob, bytes, frames, duration }.
 */
export async function renderMp4({
  compositor,
  schedule,
  audio,
  bitrate = 3_000_000,
  onProgress = () => {},
  onStage = () => {},
  shouldStop = () => false,
}) {
  const width = compositor.width;
  const height = compositor.height;
  const { config: videoConfig, label } = await pickVideoConfig(width, height, bitrate);

  const audioConfig = {
    codec: 'mp4a.40.2',
    sampleRate: audio.sampleRate,
    numberOfChannels: audio.channels,
    bitrate: 160_000,
  };
  const aSupport = await AudioEncoder.isConfigSupported(audioConfig);
  if (!aSupport.supported) throw new Error('AAC_UNSUPPORTED');

  const chunks = [];
  let totalBytes = 0;
  const target = new StreamTarget({
    chunked: true,
    onData: (data, _position) => {
      chunks.push(data);
      totalBytes += data.byteLength;
    },
  });

  const muxer = new Muxer({
    target,
    fastStart: false,
    video: { codec: 'avc', width, height, frameRate: FPS },
    audio: { codec: 'aac', numberOfChannels: audio.channels, sampleRate: audio.sampleRate },
  });

  let encoderError = null;
  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (err) => { encoderError = err; },
  });
  videoEncoder.configure(videoConfig);

  const audioEncoder = new AudioEncoder({
    output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
    error: (err) => { encoderError = err; },
  });
  audioEncoder.configure(audioConfig);

  /* ---------------------------------------------------------------- audio */
  onStage('audio', 'অডিও এনকোড হচ্ছে');
  const slice = 4800; // 0.1 s per AudioData packet
  for (let off = 0; off < audio.frames; off += slice) {
    if (shouldStop()) throw new Error('CANCELLED');
    const n = Math.min(slice, audio.frames - off);
    const data = new Float32Array(n * audio.channels);
    data.set(audio.planar.subarray(off, off + n), 0);
    data.set(audio.planar.subarray(audio.frames + off, audio.frames + off + n), n);
    const audioData = new AudioData({
      format: 'f32-planar',
      sampleRate: audio.sampleRate,
      numberOfFrames: n,
      numberOfChannels: audio.channels,
      timestamp: Math.round((off / audio.sampleRate) * 1e6),
      data,
    });
    audioEncoder.encode(audioData);
    audioData.close();
    if (audioEncoder.encodeQueueSize > 40) await yieldToUi();
  }
  await audioEncoder.flush();
  onProgress(0.06);

  /* ---------------------------------------------------------------- video */
  onStage('video', 'দৃশ্য রেন্ডার ও এনকোড হচ্ছে');
  const total = schedule.totalFrames;
  const started = performance.now();
  const canvas = compositor.canvas;

  for (let i = 0; i < total; i++) {
    if (shouldStop()) throw new Error('CANCELLED');
    if (encoderError) throw encoderError;

    compositor.drawFrame(schedule, i);
    const frame = new VideoFrame(canvas, {
      timestamp: Math.round((i * 1e6) / FPS),
      duration: Math.round(1e6 / FPS),
    });
    videoEncoder.encode(frame, { keyFrame: i % (FPS * 2) === 0 });
    frame.close();

    if (videoEncoder.encodeQueueSize > 6) {
      await new Promise((resolve) => {
        const onDequeue = () => {
          videoEncoder.removeEventListener('dequeue', onDequeue);
          resolve();
        };
        videoEncoder.addEventListener('dequeue', onDequeue);
      });
    }

    if (i % 6 === 0) {
      const elapsed = (performance.now() - started) / 1000;
      const fps = i > 0 ? i / elapsed : 0;
      onProgress(0.06 + 0.9 * (i / total), {
        frame: i,
        total,
        fps,
        eta: fps > 0 ? Math.round((total - i) / fps) : null,
      });
      await yieldToUi();
    }
  }

  onStage('finalize', 'MP4 ফাইনাল হচ্ছে');
  await videoEncoder.flush();
  if (encoderError) throw encoderError;
  videoEncoder.close();
  audioEncoder.close();
  muxer.finalize();

  const parts = chunks.map((c) => (c.byteOffset === 0 && c.byteLength === c.buffer.byteLength ? c : c.slice()));
  const blob = new Blob(parts, { type: 'video/mp4' });
  onProgress(1);
  return {
    blob,
    bytes: blob.size,
    frames: total,
    duration: schedule.duration,
    videoProfile: label,
    videoCodec: videoConfig.codec,
  };
}
