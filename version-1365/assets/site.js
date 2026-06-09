
(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var active = 0;
        var timer = null;

        function showSlide(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5600);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                showSlide(i);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-card-search-form]'));

    forms.forEach(function (form) {
        var input = form.querySelector('[data-card-search]');
        var scope = document.querySelector('[data-card-scope]');

        if (!input || !scope) {
            return;
        }

        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

        function applySearch() {
            var value = input.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.textContent
                ].join(' ').toLowerCase();

                card.classList.toggle('hidden-card', value && text.indexOf(value) === -1);
            });
        }

        input.addEventListener('input', applySearch);
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            applySearch();
        });
    });
})();
