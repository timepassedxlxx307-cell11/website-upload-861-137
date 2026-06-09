
(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('.video-overlay');

        if (!video || !overlay) {
            return;
        }

        var stream = video.getAttribute('data-stream');
        var loaded = false;
        var hls = null;

        function bindStream() {
            if (loaded || !stream) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    backBufferLength: 30
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                return;
            }

            video.src = stream;
        }

        function playVideo() {
            bindStream();
            overlay.classList.add('is-hidden');
            video.controls = true;
            var promise = video.play();

            if (promise && promise.catch) {
                promise.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('ended', function () {
            overlay.classList.remove('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    });
})();
