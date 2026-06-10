(function () {
  var panel = document.getElementById('mobile-panel');
  var toggle = document.querySelector('.menu-toggle');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.getElementById('hero-carousel');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide') || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('.movie-filter-input'));
  var lists = Array.prototype.slice.call(document.querySelectorAll('.searchable-list'));

  filterInputs.forEach(function (input) {
    input.value = query;
    input.addEventListener('input', function () {
      filterCards(input.value.trim());
    });
  });

  function normalize(text) {
    return String(text || '').toLowerCase();
  }

  function filterCards(value) {
    var needle = normalize(value);
    lists.forEach(function (list) {
      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
      var visibleCount = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category'),
          card.getAttribute('data-genre')
        ].join(' '));
        var visible = !needle || haystack.indexOf(needle) !== -1;
        card.hidden = !visible;
        if (visible) {
          visibleCount += 1;
        }
      });
      var empty = list.parentElement ? list.parentElement.querySelector('.empty-state') : null;
      if (!empty) {
        empty = document.querySelector('.empty-state');
      }
      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    });
  }

  if (query) {
    filterCards(query);
  }

  var video = document.getElementById('video-player');
  var overlay = document.querySelector('.play-overlay');
  var hlsInstance = null;
  var isPrepared = false;

  function prepareVideo() {
    if (!video || isPrepared) {
      return;
    }
    var streamUrl = video.getAttribute('data-stream-url');
    if (!streamUrl) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      isPrepared = true;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      isPrepared = true;
      return;
    }
    video.src = streamUrl;
    isPrepared = true;
  }

  function playVideo() {
    if (!video) {
      return;
    }
    prepareVideo();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (overlay && video) {
    overlay.addEventListener('click', playVideo);
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        overlay.classList.remove('is-hidden');
      }
    });
    video.addEventListener('ended', function () {
      overlay.classList.remove('is-hidden');
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
