/*
 * Static interactions: mobile navigation, hero carousel, movie filters and HLS playback.
 */
(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function setupNavigation() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-site-nav]');

        if (!button || !nav) {
            return;
        }

        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');

        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var search = document.querySelector('[data-movie-search]');
        var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
        var counter = document.querySelector('[data-results-count]');
        var clear = document.querySelector('[data-clear-filters]');
        var empty = document.querySelector('[data-empty-state]');

        if (!cards.length) {
            return;
        }

        function text(card, name) {
            return (card.getAttribute('data-' + name) || '').toLowerCase();
        }

        function filter() {
            var keyword = search ? search.value.trim().toLowerCase() : '';
            var filters = {};

            selects.forEach(function (select) {
                filters[select.getAttribute('data-filter-select')] = select.value.trim().toLowerCase();
            });

            var shown = 0;

            cards.forEach(function (card) {
                var haystack = [
                    text(card, 'title'),
                    text(card, 'region'),
                    text(card, 'region-group'),
                    text(card, 'type'),
                    text(card, 'year'),
                    text(card, 'genre'),
                    text(card, 'tags')
                ].join(' ');

                var matched = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }

                Object.keys(filters).forEach(function (key) {
                    if (!filters[key]) {
                        return;
                    }
                    if (text(card, key) !== filters[key]) {
                        matched = false;
                    }
                });

                card.classList.toggle('hidden-by-filter', !matched);

                if (matched) {
                    shown += 1;
                }
            });

            if (counter) {
                counter.textContent = String(shown);
            }

            if (empty) {
                empty.classList.toggle('visible', shown === 0);
            }
        }

        if (search) {
            search.addEventListener('input', filter);
        }

        selects.forEach(function (select) {
            select.addEventListener('change', filter);
        });

        if (clear) {
            clear.addEventListener('click', function () {
                if (search) {
                    search.value = '';
                }
                selects.forEach(function (select) {
                    select.value = '';
                });
                filter();
            });
        }

        filter();
    }

    function setupPlayer() {
        var shell = document.querySelector('[data-player]');

        if (!shell) {
            return;
        }

        var video = shell.querySelector('video');
        var playButton = shell.querySelector('[data-play-button]');
        var status = shell.querySelector('[data-player-status]');
        var source = shell.getAttribute('data-src');
        var hasStarted = false;
        var hlsInstance = null;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function startPlayer() {
            if (!video || !source) {
                setStatus('播放源未配置');
                return;
            }

            shell.classList.add('playing');

            if (hasStarted) {
                video.play().catch(function () {
                    setStatus('请再次点击播放器继续播放');
                });
                return;
            }

            hasStarted = true;
            setStatus('正在加载 HLS 播放源...');

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('播放源已就绪');
                    video.play().catch(function () {
                        setStatus('浏览器阻止自动播放，请点击视频开始');
                    });
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus('播放遇到网络或解码问题，请刷新后重试');
                    }
                });
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    setStatus('播放源已就绪');
                    video.play().catch(function () {
                        setStatus('浏览器阻止自动播放，请点击视频开始');
                    });
                }, { once: true });
                return;
            }

            video.src = source;
            video.play().then(function () {
                setStatus('播放源已就绪');
            }).catch(function () {
                setStatus('当前浏览器可能需要 HLS 支持，请更换现代浏览器');
            });
        }

        if (playButton) {
            playButton.addEventListener('click', startPlayer);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!hasStarted || video.paused) {
                    startPlayer();
                    return;
                }
                video.pause();
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayer();
    });
}());
