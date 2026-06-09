const mobileToggle = document.querySelector("[data-mobile-toggle]");
const mobilePanel = document.querySelector("[data-mobile-panel]");

if (mobileToggle && mobilePanel) {
  mobileToggle.addEventListener("click", () => {
    mobilePanel.classList.toggle("is-open");
  });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const previous = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let current = 0;
  let timer = null;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => showSlide(current + 1), 6500);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  previous?.addEventListener("click", () => {
    showSlide(current - 1);
    start();
  });

  next?.addEventListener("click", () => {
    showSlide(current + 1);
    start();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      start();
    });
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  start();
}

const localFilterForms = document.querySelectorAll("[data-local-filter]");

localFilterForms.forEach((form) => {
  const input = form.querySelector("input");
  const cards = Array.from(document.querySelectorAll("[data-card]"));

  if (!input || cards.length === 0) {
    return;
  }

  input.addEventListener("input", () => {
    const keyword = input.value.trim().toLowerCase();
    cards.forEach((card) => {
      const haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags,
      ]
        .join(" ")
        .toLowerCase();
      card.style.display = haystack.includes(keyword) ? "" : "none";
    });
  });
});

const searchResults = document.querySelector("[data-search-results]");
const searchSummary = document.querySelector("[data-search-summary]");

if (searchResults && Array.isArray(window.MOVIE_INDEX)) {
  const params = new URLSearchParams(window.location.search);
  const query = (params.get("q") || "").trim();
  const input = document.querySelector('.search-page-form input[name="q"]');

  if (input) {
    input.value = query;
  }

  const normalizedQuery = query.toLowerCase();
  const source = window.MOVIE_INDEX;
  const results = normalizedQuery
    ? source.filter((movie) => {
        const haystack = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          movie.line,
          ...(movie.tags || []),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : source.slice(0, 120);

  searchSummary.textContent = normalizedQuery
    ? `与“${query}”相关的影片`
    : "推荐浏览的影片";

  const fragment = document.createDocumentFragment();
  results.slice(0, 240).forEach((movie) => {
    const card = document.createElement("article");
    card.className = "movie-card";
    card.dataset.card = "";
    card.dataset.title = movie.title;
    card.dataset.region = movie.region;
    card.dataset.year = movie.year;
    card.dataset.genre = movie.genre;
    card.dataset.tags = (movie.tags || []).join(" ");

    const tags = (movie.tags || [])
      .slice(0, 3)
      .map((tag) => `<span>${escapeHtml(tag)}</span>`)
      .join("");

    card.innerHTML = `
      <a class="poster-frame" href="${movie.url}">
        <img src="${movie.cover}" alt="${escapeHtml(movie.title)} 海报" loading="lazy">
        <span class="poster-shade"></span>
        <span class="poster-type">${escapeHtml(movie.type)}</span>
        <span class="poster-year">${escapeHtml(movie.year)}</span>
      </a>
      <div class="movie-card-body">
        <a class="movie-card-title" href="${movie.url}">${escapeHtml(movie.title)}</a>
        <p class="movie-meta">${escapeHtml(movie.region)} · ${escapeHtml(movie.genre)}</p>
        <p class="movie-line">${escapeHtml(movie.line || "")}</p>
        <div class="tag-row">${tags}</div>
      </div>
    `;
    fragment.appendChild(card);
  });

  searchResults.replaceChildren(fragment);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const players = document.querySelectorAll("[data-player]");

players.forEach((player) => {
  const video = player.querySelector("video");
  const button = player.querySelector("[data-play-trigger]");
  const source = player.dataset.src;
  let prepared = false;

  const setMessage = (text, isError = false) => {
    if (!button) {
      return;
    }
    button.innerHTML = `<span class="play-icon">▶</span><strong class="${isError ? "player-error" : ""}">${escapeHtml(text)}</strong><em>${isError ? "请稍后重试" : "正在准备播放"}</em>`;
  };

  const prepare = async () => {
    if (!video || !source || prepared) {
      return;
    }

    prepared = true;
    setMessage("正在打开播放器");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    const module = await import("./video-vendor.js");
    const Hls = module.H;

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    throw new Error("unsupported");
  };

  const play = async () => {
    try {
      await prepare();
      button?.classList.add("is-hidden");
      video.controls = true;
      await video.play();
    } catch (error) {
      prepared = false;
      button?.classList.remove("is-hidden");
      setMessage("当前浏览器暂不支持此视频播放", true);
    }
  };

  button?.addEventListener("click", play);

  player.addEventListener("click", (event) => {
    if (event.target === video && video.paused) {
      play();
    }
  });
});
