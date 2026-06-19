import { H as Hls } from './hls-vendor.js';

const players = document.querySelectorAll('[data-player]');

players.forEach(function (player) {
  const video = player.querySelector('video');
  const overlay = player.querySelector('.player-cover');
  const config = player.querySelector('.player-config');
  let src = '';
  let loaded = false;
  let hls = null;

  try {
    src = JSON.parse(config.textContent).url;
  } catch (error) {
    src = '';
  }

  const loadVideo = function () {
    if (!video || !src || loaded) {
      return Promise.resolve();
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      return new Promise(function (resolve) {
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        window.setTimeout(resolve, 1200);
      });
    }

    video.src = src;
    return Promise.resolve();
  };

  const startPlayback = function () {
    loadVideo().then(function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    });
  };

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
});
