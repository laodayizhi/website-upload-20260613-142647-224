function initMoviePlayer(videoUrl, videoId, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var isReady = false;

    if (!video || !videoUrl) {
        return;
    }

    var loadVideo = function () {
        if (isReady) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoUrl;
            isReady = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
            isReady = true;
            return;
        }

        video.src = videoUrl;
        isReady = true;
    };

    var startVideo = function () {
        loadVideo();

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        var playTask = video.play();

        if (playTask && typeof playTask.catch === "function") {
            playTask.catch(function () {});
        }
    };

    if (overlay) {
        overlay.addEventListener("click", startVideo);
    }

    video.addEventListener("click", function () {
        if (!isReady || video.paused) {
            startVideo();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });
}
