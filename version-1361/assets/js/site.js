(function () {
    var body = document.body;
    var navToggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (navToggle && nav) {
        navToggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
            body.classList.toggle('menu-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5600);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
                play();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                play();
            });
        }

        showSlide(0);
        play();
    }

    var redirectForm = document.querySelector('[data-search-redirect]');
    if (redirectForm) {
        redirectForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = redirectForm.querySelector('input');
            var query = input ? input.value.trim() : '';
            var target = './search.html';
            if (query) {
                target += '?q=' + encodeURIComponent(query);
            }
            window.location.href = target;
        });
    }

    var searchInput = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
    var noResult = document.querySelector('[data-no-result]');
    var activeCategory = 'all';

    function readQuery() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function applyFilter() {
        if (!cards.length) {
            return;
        }
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = (card.getAttribute('data-search') || '').toLowerCase();
            var category = card.getAttribute('data-category') || '';
            var matchedText = !keyword || haystack.indexOf(keyword) !== -1;
            var matchedCategory = activeCategory === 'all' || category === activeCategory;
            var show = matchedText && matchedCategory;
            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });

        if (noResult) {
            noResult.classList.toggle('is-visible', visible === 0);
        }
    }

    if (searchInput) {
        var initial = readQuery();
        if (initial) {
            searchInput.value = initial;
        }
        searchInput.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            activeCategory = chip.getAttribute('data-filter-chip') || 'all';
            chips.forEach(function (item) {
                item.classList.toggle('is-active', item === chip);
            });
            applyFilter();
        });
    });

    applyFilter();
})();
