(function () {
  function initMoviePlayer(source) {
    var player = document.querySelector(".movie-player");
    if (!player) {
      return;
    }
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    if (!video) {
      return;
    }
    var attached = false;
    var attach = function () {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    };
    var hide = function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    };
    var show = function () {
      if (overlay && video.paused && video.currentTime === 0) {
        overlay.classList.remove("is-hidden");
      }
    };
    var play = function () {
      attach();
      hide();
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          show();
        });
      }
    };
    attach();
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    player.querySelectorAll("[data-play-button]").forEach(function (button) {
      button.addEventListener("click", play);
    });
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", hide);
    video.addEventListener("ended", show);
  }

  window.initMoviePlayer = initMoviePlayer;
})();
