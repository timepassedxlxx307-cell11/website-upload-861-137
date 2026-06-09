(function () {
  window.initMoviePlayer = function (videoId, buttonId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    var loaded = false;
    var hls = null;

    if (!video || !button || !overlay || !streamUrl) {
      return;
    }

    function loadStream() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = streamUrl;
      }
    }

    function startPlay() {
      loadStream();
      overlay.classList.add("is-hidden");
      video.controls = true;
      var result = video.play();

      if (result && typeof result.catch === "function") {
        result.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      startPlay();
    });

    overlay.addEventListener("click", function () {
      startPlay();
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlay();
      }
    });

    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
