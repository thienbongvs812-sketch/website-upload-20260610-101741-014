(function () {
    const menuButton = document.querySelector(".mobile-menu-button");
    const mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    const backTop = document.querySelector(".back-top");

    if (backTop) {
        window.addEventListener("scroll", function () {
            if (window.scrollY > 320) {
                backTop.classList.add("show");
            } else {
                backTop.classList.remove("show");
            }
        });

        backTop.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-index]"));
    let heroIndex = 0;
    let heroTimer = null;

    function setHero(index) {
        if (!slides.length) {
            return;
        }

        heroIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, current) {
            slide.classList.toggle("active", current === heroIndex);
        });

        dots.forEach(function (dot, current) {
            dot.classList.toggle("active", current === heroIndex);
        });
    }

    function startHero() {
        if (slides.length <= 1) {
            return;
        }

        heroTimer = window.setInterval(function () {
            setHero(heroIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            window.clearInterval(heroTimer);
            setHero(Number(dot.getAttribute("data-hero-index")) || 0);
            startHero();
        });
    });

    startHero();

    const searchInput = document.querySelector(".movie-search-input");
    const clearButton = document.querySelector(".search-clear");
    const filters = Array.from(document.querySelectorAll(".movie-filter"));
    const cards = Array.from(document.querySelectorAll(".movie-list .movie-card, .movie-list .compact-card"));

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
        const keyword = normalize(searchInput ? searchInput.value : "");
        const selected = {};

        filters.forEach(function (select) {
            selected[select.getAttribute("data-filter")] = normalize(select.value);
        });

        cards.forEach(function (card) {
            const content = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-type"),
                card.getAttribute("data-category"),
                card.textContent
            ].join(" "));

            let visible = !keyword || content.includes(keyword);

            Object.keys(selected).forEach(function (key) {
                if (!selected[key]) {
                    return;
                }

                const value = normalize(card.getAttribute("data-" + key));
                if (!value.includes(selected[key])) {
                    visible = false;
                }
            });

            card.classList.toggle("hidden-by-filter", !visible);
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    filters.forEach(function (select) {
        select.addEventListener("change", applyFilters);
    });

    if (clearButton) {
        clearButton.addEventListener("click", function () {
            if (searchInput) {
                searchInput.value = "";
            }

            filters.forEach(function (select) {
                select.value = "";
            });

            applyFilters();
        });
    }

    const playerBoxes = Array.from(document.querySelectorAll("[data-player]"));

    playerBoxes.forEach(function (box) {
        const video = box.querySelector("video");
        const source = video ? video.querySelector("source") : null;
        const overlay = box.querySelector(".play-overlay");
        const src = source ? source.getAttribute("src") : "";
        let prepared = false;
        let hls = null;

        function prepare() {
            if (!video || !src || prepared) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
                prepared = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                prepared = true;
                return;
            }

            video.src = src;
            prepared = true;
        }

        function play() {
            prepare();

            if (overlay) {
                overlay.classList.add("hidden");
            }

            if (video) {
                video.play().catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
        }
    });
})();
