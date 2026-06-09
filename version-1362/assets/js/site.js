(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

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

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var forms = Array.prototype.slice.call(document.querySelectorAll('[data-nav-search]'));

  forms.forEach(function (form) {
    form.addEventListener('submit', function () {
      var input = form.querySelector('input[name="q"]');
      if (input) {
        input.value = input.value.trim();
      }
    });
  });

  var filterForm = document.querySelector('[data-filter-form]');

  if (filterForm) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var params = new URLSearchParams(window.location.search);
    var q = filterForm.querySelector('[name="q"]');
    var type = filterForm.querySelector('[name="type"]');
    var year = filterForm.querySelector('[name="year"]');

    if (q && params.get('q')) {
      q.value = params.get('q');
    }

    function applyFilter() {
      var query = q ? q.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-meta') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchType = !typeValue || cardType === typeValue;
        var matchYear = !yearValue || cardYear === yearValue;

        card.classList.toggle('is-hidden', !(matchQuery && matchType && matchYear));
      });
    }

    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    ['input', 'change'].forEach(function (eventName) {
      filterForm.addEventListener(eventName, applyFilter);
    });

    applyFilter();
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var hlsInstance = null;
    var loaded = false;

    function prepareVideo() {
      if (!video || loaded) {
        return;
      }

      var stream = video.getAttribute('data-stream');

      if (!stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      loaded = true;
    }

    function startVideo() {
      prepareVideo();

      if (button) {
        button.classList.add('is-hidden');
      }

      if (video) {
        video.controls = true;
        var result = video.play();

        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        }
      }
    }

    if (button) {
      button.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo();
        }
      });

      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
})();
