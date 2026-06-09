(function () {
  var input = document.querySelector("[data-search-input]");
  var year = document.querySelector("[data-search-year]");
  var type = document.querySelector("[data-search-type]");
  var button = document.querySelector("[data-search-button]");
  var resultGrid = document.querySelector("[data-search-results]");
  var empty = document.querySelector("[data-empty-result]");
  var movies = window.SEARCH_MOVIES || [];

  function escapeHtml(value) {
    return String(value).replace(/[&<>\"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[character];
    });
  }

  function card(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-mask\">立即观看</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"tag-list\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function applySearch() {
    if (!resultGrid) {
      return;
    }

    var keyword = input ? input.value.trim().toLowerCase() : "";
    var selectedYear = year ? year.value : "";
    var selectedType = type ? type.value : "";

    var matched = movies.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.genre, movie.oneLine, movie.tags.join(" ")].join(" ").toLowerCase();

      if (keyword && text.indexOf(keyword) === -1) {
        return false;
      }

      if (selectedYear && movie.year !== selectedYear) {
        return false;
      }

      if (selectedType && movie.type !== selectedType) {
        return false;
      }

      return true;
    }).slice(0, 120);

    resultGrid.innerHTML = matched.map(card).join("");

    if (empty) {
      empty.style.display = matched.length ? "none" : "block";
    }
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";

  if (input && query) {
    input.value = query;
  }

  if (input) {
    input.addEventListener("input", applySearch);
  }

  if (year) {
    year.addEventListener("change", applySearch);
  }

  if (type) {
    type.addEventListener("change", applySearch);
  }

  if (button) {
    button.addEventListener("click", applySearch);
  }

  applySearch();
})();
