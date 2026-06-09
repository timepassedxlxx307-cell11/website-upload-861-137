(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    ready(function () {
        var menuToggle = document.querySelector("[data-menu-toggle]");
        var mobilePanel = document.querySelector("[data-mobile-panel]");
        if (menuToggle && mobilePanel) {
            menuToggle.addEventListener("click", function () {
                mobilePanel.classList.toggle("is-open");
            });
        }

        var slider = document.querySelector("[data-hero-slider]");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var index = 0;
            var timer = null;

            function showSlide(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function startTimer() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    showSlide(index + 1);
                }, 5200);
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    showSlide(dotIndex);
                    startTimer();
                });
            });

            if (slides.length > 1) {
                startTimer();
            }
        }

        var grid = document.querySelector("[data-filter-grid]");
        var controls = document.querySelector("[data-filter-controls]");
        if (grid && controls) {
            var input = controls.querySelector("[data-filter-input]");
            var typeSelect = controls.querySelector("[data-type-filter]");
            var yearSelect = controls.querySelector("[data-year-filter]");
            var sortSelect = controls.querySelector("[data-sort-filter]");
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q");

            if (initialQuery && input) {
                input.value = initialQuery;
            }

            function applyFilters() {
                var query = normalize(input ? input.value : "");
                var typeValue = typeSelect ? typeSelect.value : "all";
                var yearValue = yearSelect ? yearSelect.value : "all";
                var sortValue = sortSelect ? sortSelect.value : "default";

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(" "));
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesType = typeValue === "all" || card.dataset.type === typeValue;
                    var matchesYear = yearValue === "all" || card.dataset.year === yearValue;
                    card.classList.toggle("is-hidden", !(matchesQuery && matchesType && matchesYear));
                });

                var sorted = cards.slice().sort(function (a, b) {
                    if (sortValue === "views") {
                        return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                    }
                    if (sortValue === "likes") {
                        return Number(b.dataset.likes || 0) - Number(a.dataset.likes || 0);
                    }
                    if (sortValue === "year") {
                        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                    }
                    return cards.indexOf(a) - cards.indexOf(b);
                });

                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
            }

            [input, typeSelect, yearSelect, sortSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });

            applyFilters();
        }

        var player = document.querySelector("[data-player]");
        var configNode = document.getElementById("video-config");
        if (player && configNode) {
            var video = player.querySelector("video");
            var cover = document.getElementById("player-cover");
            var button = document.getElementById("player-play-button");
            var config = {};
            var attached = false;

            try {
                config = JSON.parse(configNode.textContent || "{}");
            } catch (error) {
                config = {};
            }

            function attachMedia() {
                if (attached || !video || !config.url) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = config.url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(config.url);
                    hls.attachMedia(video);
                } else {
                    video.src = config.url;
                }
            }

            function playVideo(event) {
                if (event) {
                    event.preventDefault();
                }
                attachMedia();
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                if (video) {
                    video.controls = true;
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(function () {});
                    }
                }
            }

            if (button) {
                button.addEventListener("click", playVideo);
            }
            if (cover) {
                cover.addEventListener("click", playVideo);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        playVideo();
                    }
                });
            }
        }
    });
})();
