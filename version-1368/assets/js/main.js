(function () {
  var toggle = document.querySelector(".mobile-toggle");
  var panel = document.querySelector(".mobile-panel");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var opened = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
      dot.setAttribute("aria-current", dotIndex === activeIndex ? "true" : "false");
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var filterInput = document.querySelector("[data-filter-input]");
  var yearSelect = document.querySelector("[data-filter-year]");
  var typeSelect = document.querySelector("[data-filter-type]");
  var filterCards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));

  function applyFilters() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
    var year = yearSelect ? yearSelect.value : "";
    var type = typeSelect ? typeSelect.value : "";

    filterCards.forEach(function (card) {
      var text = (card.getAttribute("data-keywords") || "").toLowerCase();
      var cardYear = card.getAttribute("data-year") || "";
      var cardType = card.getAttribute("data-type") || "";
      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      if (type && cardType !== type) {
        matched = false;
      }

      card.style.display = matched ? "" : "none";
    });
  }

  if (filterInput) {
    filterInput.addEventListener("input", applyFilters);
  }

  if (yearSelect) {
    yearSelect.addEventListener("change", applyFilters);
  }

  if (typeSelect) {
    typeSelect.addEventListener("change", applyFilters);
  }
})();
