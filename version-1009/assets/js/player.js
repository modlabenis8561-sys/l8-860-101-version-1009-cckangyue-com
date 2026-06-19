import { H as Hls } from './hls-vendor-dru42stk.js';

function beginPlayer(container) {
  var video = container.querySelector('video');
  var trigger = container.querySelector('[data-play-trigger]');
  var src = container.getAttribute('data-src');
  var started = false;
  var hls = null;

  function play() {
    if (!video || !src) {
      return;
    }

    container.classList.add('is-playing');
    video.controls = true;

    if (!started) {
      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = src;
      }
    }

    video.play().catch(function () {});
  }

  if (trigger) {
    trigger.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!started) {
        play();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

document.querySelectorAll('[data-player]').forEach(beginPlayer);
