import { H as Hls } from './hls-vendor-dru42stk.js';

const players = document.querySelectorAll('[data-player]');

players.forEach((player) => {
  const video = player.querySelector('video');
  const cover = player.querySelector('[data-player-cover]');
  const source = video?.querySelector('source');
  const src = source?.getAttribute('src') || video?.getAttribute('src');
  let hls = null;

  if (!video || !src) return;

  const loadVideo = () => {
    if (video.dataset.ready === '1') return;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }

    video.dataset.ready = '1';
  };

  const startVideo = () => {
    loadVideo();
    if (cover) cover.classList.add('is-hidden');
    video.controls = true;
    const playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(() => {});
    }
  };

  if (cover) {
    cover.addEventListener('click', startVideo);
  }

  video.addEventListener('click', () => {
    if (video.paused) startVideo();
  });

  video.addEventListener('play', () => {
    if (cover) cover.classList.add('is-hidden');
  });

  video.addEventListener('ended', () => {
    if (cover) cover.classList.remove('is-hidden');
  });

  window.addEventListener('beforeunload', () => {
    if (hls) hls.destroy();
  });
});
