(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = './all.html';
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        startHero();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterList = document.querySelector('[data-filter-list]');
    var cards = filterList ? Array.prototype.slice.call(filterList.querySelectorAll('[data-card]')) : [];

    function runFilter(value) {
        var query = String(value || '').trim().toLowerCase();
        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' ').toLowerCase();
            card.classList.toggle('hidden', query && haystack.indexOf(query) === -1);
        });
    }

    if (filterInput && cards.length) {
        var queryValue = new URLSearchParams(window.location.search).get('q') || '';
        if (queryValue) {
            filterInput.value = queryValue;
            runFilter(queryValue);
        }

        filterInput.addEventListener('input', function () {
            runFilter(filterInput.value);
        });

        document.querySelectorAll('[data-filter-value]').forEach(function (button) {
            button.addEventListener('click', function () {
                document.querySelectorAll('[data-filter-value]').forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                var value = button.getAttribute('data-filter-value') || '';
                filterInput.value = value;
                runFilter(value);
            });
        });
    }

    document.querySelectorAll('[data-player]').forEach(function (box) {
        var video = box.querySelector('[data-video]');
        var trigger = box.querySelector('[data-play-trigger]');
        var loaded = false;
        var player = null;

        function attachVideo() {
            if (!video || loaded) {
                return;
            }
            loaded = true;
            var stream = video.getAttribute('data-stream');
            if (!stream) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                player = new window.Hls({
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                player.loadSource(stream);
                player.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function playVideo() {
            attachVideo();
            box.classList.add('is-playing');
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    box.classList.remove('is-playing');
                });
            }
        }

        if (trigger) {
            trigger.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener('play', function () {
                box.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    box.classList.remove('is-playing');
                }
            });
        }
    });
})();
