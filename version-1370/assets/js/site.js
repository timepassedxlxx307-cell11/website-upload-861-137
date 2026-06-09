(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
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

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-search-scope]'));
  scopes.forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var genre = scope.querySelector('[data-genre-filter]');
    var category = scope.querySelector('[data-category-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('[data-empty-state]');

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var genreValue = genre ? genre.value : '';
      var categoryValue = category ? category.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search-text') || '').toLowerCase();
        var cardGenre = card.getAttribute('data-genre') || '';
        var cardCategory = card.getAttribute('data-category') || '';
        var matched = true;
        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (genreValue && cardGenre !== genreValue) {
          matched = false;
        }
        if (categoryValue && cardCategory !== categoryValue) {
          matched = false;
        }
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (genre) {
      genre.addEventListener('change', apply);
    }
    if (category) {
      category.addEventListener('change', apply);
    }
    apply();
  });

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (q) {
    var searchInput = document.querySelector('[data-search-input]');
    if (searchInput) {
      searchInput.value = q;
      searchInput.dispatchEvent(new Event('input'));
    }
  }
})();
