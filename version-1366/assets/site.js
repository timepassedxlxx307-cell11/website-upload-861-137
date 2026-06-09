(function () {
  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function debounce(fn, wait) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function normalize(text) {
    return (text || "").toLowerCase();
  }

  function setupMenu() {
    const toggle = qs("[data-menu-toggle]");
    const nav = qs("[data-nav]");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }

  function setupHeroCarousel() {
    const hero = qs("[data-hero-carousel]");
    if (!hero) return;
    const slides = qsa("[data-hero-slide]", hero);
    if (slides.length <= 1) return;

    const dots = qsa("[data-hero-dot]");
    let active = 0;
    let timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, idx) => {
        slide.style.opacity = idx === active ? "1" : "0";
        slide.style.pointerEvents = idx === active ? "auto" : "none";
        slide.style.zIndex = idx === active ? "2" : "1";
      });
      dots.forEach((dot, idx) => dot.classList.toggle("active", idx === active));
    }

    function start() {
      timer = window.setInterval(() => show(active + 1), 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    slides.forEach((slide, idx) => {
      slide.style.transition = "opacity .55s ease";
      slide.style.position = "absolute";
      slide.style.inset = "0";
      slide.style.opacity = idx === 0 ? "1" : "0";
      slide.style.zIndex = idx === 0 ? "2" : "1";
      slide.style.pointerEvents = idx === 0 ? "auto" : "none";
    });

    dots.forEach((dot, idx) => {
      dot.addEventListener("click", () => {
        stop();
        show(idx);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupCardFilters() {
    const filterRoot = qs("[data-filter-root]");
    if (!filterRoot) return;

    const cards = qsa("[data-filter-card]", filterRoot);
    const input = qs("[data-filter-input]");
    const chips = qsa("[data-filter-chip]", filterRoot);
    const emptyState = qs("[data-filter-empty]", filterRoot);
    if (!cards.length) return;

    let activeChip = "";

    function apply() {
      const query = normalize(input ? input.value.trim() : "");
      let visible = 0;

      cards.forEach((card) => {
        const title = normalize(card.getAttribute("data-title"));
        const tags = normalize(card.getAttribute("data-tags"));
        const bucket = normalize(card.getAttribute("data-bucket"));
        const text = `${title} ${tags} ${bucket}`;
        const matchQuery = !query || text.includes(query);
        const matchChip = !activeChip || bucket === normalize(activeChip);
        const show = matchQuery && matchChip;
        card.classList.toggle("hidden", !show);
        if (show) visible += 1;
      });

      if (emptyState) {
        emptyState.classList.toggle("hidden", visible !== 0);
      }
    }

    if (input) {
      input.addEventListener("input", debounce(apply, 120));
    }

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        activeChip = chip.getAttribute("data-filter-chip") || "";
        chips.forEach((btn) => btn.classList.toggle("active", btn === chip));
        apply();
      });
    });

    apply();
  }

  async function fetchMovies() {
    const res = await fetch("assets/movies.json", { cache: "no-store" });
    return await res.json();
  }

  function setupSearchPage() {
    const root = qs("[data-search-page]");
    if (!root) return;

    const input = qs("[data-search-query]", root);
    const results = qs("[data-search-results]", root);
    const stats = qs("[data-search-stats]", root);

    let movies = [];
    let ready = false;

    const renderCard = (movie) => {
      const tags = movie.tags.slice(0, 3).map((tag) => `<span class="tag">${tag}</span>`).join("");
      return `
        <a class="card" href="${movie.url}">
          <div class="card-poster">
            <img src="${movie.poster}" alt="${movie.title}">
          </div>
          <div class="card-body">
            <h3 class="card-title">${movie.title}</h3>
            <div class="card-meta">
              <span>${movie.year || ""}</span>
              <span>·</span>
              <span>${movie.type || ""}</span>
            </div>
            <div class="card-tags">${tags}</div>
            <div class="snippet">${movie.one_line || ""}</div>
          </div>
        </a>
      `;
    };

    function render(list) {
      if (!results) return;
      results.innerHTML = list.map(renderCard).join("");
      if (stats) stats.textContent = `共找到 ${list.length} 部影片`;
    }

    function apply() {
      const q = normalize((input && input.value) || new URLSearchParams(location.search).get("q") || "");
      if (!q) {
        render(movies.slice(0, 60));
        return;
      }
      const list = movies.filter((movie) => {
        const hay = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.genre,
          movie.tags.join(" "),
          movie.one_line,
          movie.summary,
          movie.review
        ].join(" "));
        return hay.includes(q);
      });
      render(list.slice(0, 200));
    }

    (async () => {
      movies = await fetchMovies();
      ready = true;
      if (input) {
        input.value = new URLSearchParams(location.search).get("q") || "";
        input.addEventListener("input", debounce(apply, 100));
      }
      apply();
    })().catch(() => {
      if (stats) stats.textContent = "搜索索引加载失败";
      if (results) results.innerHTML = `<div class="detail-block">搜索索引加载失败，请稍后重试。</div>`;
    });
  }

  function setupPlayer() {
    const page = window.__MOVIE_PAGE__;
    const video = qs("[data-player-video]");
    const poster = qs("[data-player-poster]");
    const sourceButtons = qsa("[data-source-button]");
    const currentLabel = qs("[data-current-source]");
    if (!page || !video) return;

    let hlsInstance = null;
    let activeSource = null;

    function cleanupHls() {
      if (hlsInstance) {
        try {
          hlsInstance.destroy();
        } catch (err) {}
        hlsInstance = null;
      }
    }

    function setSource(index) {
      const source = page.sources[index] || page.sources[0];
      if (!source) return;
      activeSource = index;
      cleanupHls();
      if (poster) poster.style.display = "none";

      sourceButtons.forEach((btn) => {
        btn.classList.toggle("active", Number(btn.getAttribute("data-source-button")) === index);
      });

      if (currentLabel) currentLabel.textContent = source.label || source.url;

      const url = source.url;
      const type = source.type || "";
      if (url.endsWith(".m3u8")) {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function () {
            // keep native fallback source below if HLS init fails
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else {
          video.src = page.sources[0].url;
        }
      } else {
        video.src = url;
      }
    }

    sourceButtons.forEach((btn) => {
      btn.addEventListener("click", () => setSource(Number(btn.getAttribute("data-source-button")) || 0));
    });

    if (window.Hls) {
      setSource(0);
    } else {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
      script.defer = true;
      script.onload = () => setSource(0);
      script.onerror = () => setSource(0);
      document.head.appendChild(script);
    }

    if (page.autoplay) {
      video.addEventListener("loadedmetadata", () => {
        try {
          video.play().catch(() => {});
        } catch (err) {}
      }, { once: true });
    }
  }

  function setupBackToTop() {
    const btn = qs("[data-back-to-top]");
    if (!btn) return;
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function setupLazyPosterFallbacks() {
    qsa("img[data-fallback]").forEach((img) => {
      img.addEventListener("error", () => {
        img.src = img.getAttribute("data-fallback");
      }, { once: true });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupMenu();
    setupHeroCarousel();
    setupCardFilters();
    setupSearchPage();
    setupPlayer();
    setupBackToTop();
    setupLazyPosterFallbacks();
  });
})();
