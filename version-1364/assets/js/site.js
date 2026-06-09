(function() {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function() {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function(form) {
    form.addEventListener('submit', function(event) {
      const input = form.querySelector('input[name="q"], input[type="search"]');
      const value = input ? input.value.trim() : '';
      if (!value) {
        event.preventDefault();
        window.location.href = 'search.html';
      }
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function() {
        showSlide(current + 1);
      }, 5600);
    }
  }

  const listing = document.querySelector('[data-listing]');
  if (listing) {
    const cards = Array.from(listing.querySelectorAll('[data-movie-card]'));
    const filterInput = document.querySelector('[data-list-search] input');
    const filterButtons = Array.from(document.querySelectorAll('[data-filter-button]'));
    const emptyState = document.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    let activeFilter = '';

    if (filterInput && initialQuery) {
      filterInput.value = initialQuery;
    }

    function normalize(text) {
      return (text || '').toString().trim().toLowerCase();
    }

    function applyFilters() {
      const query = normalize(filterInput ? filterInput.value : '');
      let visible = 0;

      cards.forEach(function(card) {
        const haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.textContent
        ].join(' '));
        const filterMatched = !activeFilter || haystack.indexOf(normalize(activeFilter)) !== -1;
        const queryMatched = !query || haystack.indexOf(query) !== -1;
        const matched = filterMatched && queryMatched;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyFilters);
    }

    filterButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        activeFilter = button.getAttribute('data-filter-button') || '';
        filterButtons.forEach(function(item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilters();
      });
    });

    applyFilters();
  }
})();
