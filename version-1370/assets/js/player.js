import { H as Hls } from "./hls.js";

export function initMoviePlayer(options) {
  var video = document.querySelector(options.video);
  var button = document.querySelector(options.button);
  var url = options.url;
  var hls = null;
  var ready = false;

  function load() {
    if (!video || ready) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      ready = true;
      return;
    }
    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      ready = true;
      return;
    }
    video.src = url;
    ready = true;
  }

  function play() {
    if (!video) {
      return;
    }
    load();
    if (button) {
      button.classList.add("is-hidden");
    }
    var attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", play);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (!ready) {
        play();
      }
    });
  }

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
