(function () {
    var header = document.querySelector('[data-header]');
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navMenu = document.querySelector('[data-nav-menu]');

    function setHeaderState() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    setHeaderState();
    window.addEventListener('scroll', setHeaderState, { passive: true });

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 6000);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var filterControls = Array.prototype.slice.call(document.querySelectorAll('[data-filter-name]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    function valueOf(card, name) {
        return (card.getAttribute('data-' + name) || '').toString().toLowerCase();
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var filters = {};

        filterControls.forEach(function (control) {
            filters[control.getAttribute('data-filter-name')] = control.value.trim().toLowerCase();
        });

        cards.forEach(function (card) {
            var haystack = [
                valueOf(card, 'title'),
                valueOf(card, 'region'),
                valueOf(card, 'type'),
                valueOf(card, 'year'),
                valueOf(card, 'genre'),
                valueOf(card, 'tags')
            ].join(' ');
            var visible = !query || haystack.indexOf(query) !== -1;

            Object.keys(filters).forEach(function (name) {
                var expected = filters[name];
                if (expected && valueOf(card, name).indexOf(expected) === -1) {
                    visible = false;
                }
            });

            card.classList.toggle('is-filter-hidden', !visible);
        });
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            searchInput.value = q;
        }
        searchInput.addEventListener('input', filterCards);
    }

    filterControls.forEach(function (control) {
        control.addEventListener('change', filterCards);
    });

    filterCards();

    window.initVideoPlayer = function (sourceUrl) {
        var video = document.getElementById('videoPlayer');
        var overlay = document.querySelector('[data-play-overlay]');
        var attached = false;
        var hlsInstance = null;

        function bindSource() {
            if (!video || attached) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                attached = true;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                attached = true;
            } else {
                video.src = sourceUrl;
                attached = true;
            }
        }

        function start() {
            if (!video) {
                return;
            }
            bindSource();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    };
})();
