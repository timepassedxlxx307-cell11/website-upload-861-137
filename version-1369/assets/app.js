(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      document.body.classList.toggle('menu-open', mobileNav.classList.contains('open'));
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

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var searchInput = document.querySelector('[data-movie-search]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

  function filterCards() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var typeValue = typeSelect ? typeSelect.value : '';
    var yearValue = yearSelect ? yearSelect.value : '';

    cards.forEach(function (card) {
      var text = card.getAttribute('data-search') || '';
      var cardType = card.getAttribute('data-type') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchedType = !typeValue || cardType === typeValue;
      var matchedYear = !yearValue || cardYear === yearValue;

      card.classList.toggle('is-hidden', !(matchedKeyword && matchedType && matchedYear));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', filterCards);
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', filterCards);
  }
})();
