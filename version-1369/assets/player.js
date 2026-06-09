import { H as Hls } from './hls.js';

function bindPlayer() {
  var shell = document.querySelector('[data-video-url]');

  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var button = shell.querySelector('.player-start');
  var source = shell.getAttribute('data-video-url');
  var loaded = false;
  var hls = null;

  function loadVideo() {
    if (loaded || !video || !source) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        lowLatencyMode: true,
        enableWorker: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    }
  }

  function startVideo() {
    loadVideo();

    if (button) {
      button.classList.add('is-hidden');
    }

    shell.classList.add('is-playing');

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        shell.classList.remove('is-playing');

        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }
  }

  if (button) {
    button.addEventListener('click', startVideo);
  }

  video.addEventListener('click', function () {
    if (!loaded || video.paused) {
      startVideo();
    }
  });

  video.addEventListener('play', function () {
    shell.classList.add('is-playing');

    if (button) {
      button.classList.add('is-hidden');
    }
  });

  video.addEventListener('ended', function () {
    shell.classList.remove('is-playing');

    if (button) {
      button.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', bindPlayer);
