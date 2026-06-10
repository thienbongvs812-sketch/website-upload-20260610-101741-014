(function () {
  const script = document.currentScript;
  const source = script ? script.getAttribute('data-src') : '';
  const video = document.querySelector('[data-player-video]');
  const trigger = document.querySelector('[data-player-trigger]');
  let ready = false;
  let hls = null;

  const prepare = function () {
    if (!video || !source || ready) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (globalThis.Hls && globalThis.Hls.isSupported()) {
      hls = new globalThis.Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  };

  const start = function () {
    if (!video) {
      return;
    }
    prepare();
    if (trigger) {
      trigger.classList.add('is-hidden');
    }
    video.controls = true;
    const playback = video.play();
    if (playback && typeof playback.catch === 'function') {
      playback.catch(function () {
        if (trigger) {
          trigger.classList.remove('is-hidden');
        }
      });
    }
  };

  if (trigger) {
    trigger.addEventListener('click', start);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  }
  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
})();
