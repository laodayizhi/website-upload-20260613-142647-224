(function () {
  function canUseNativeHls(video) {
    return Boolean(video.canPlayType('application/vnd.apple.mpegurl'));
  }

  function setStatus(player, text) {
    var status = player.querySelector('[data-player-status]');
    if (status) {
      status.textContent = text;
    }
  }

  function playVideo(video, player, overlay) {
    var hlsSource = player.getAttribute('data-hls');
    var mp4Source = player.getAttribute('data-mp4');
    var isFile = window.location.protocol === 'file:';

    function start() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setStatus(player, '请再次点击播放');
        });
      }
    }

    function useMp4() {
      if (video.getAttribute('src') !== mp4Source) {
        video.src = mp4Source;
      }
      setStatus(player, '正在播放');
      start();
    }

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    if (!isFile && window.Hls && window.Hls.isSupported() && hlsSource) {
      if (!video._siteHls) {
        video._siteHls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        video._siteHls.loadSource(hlsSource);
        video._siteHls.attachMedia(video);
        video._siteHls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            video._siteHls.destroy();
            video._siteHls = null;
            useMp4();
          }
        });
      }
      setStatus(player, '正在播放');
      start();
      return;
    }

    if (!isFile && hlsSource && canUseNativeHls(video)) {
      if (video.getAttribute('src') !== hlsSource) {
        video.src = hlsSource;
      }
      setStatus(player, '正在播放');
      start();
      return;
    }

    useMp4();
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-cover]');

    if (!video) {
      return;
    }

    if (overlay) {
      overlay.addEventListener('click', function () {
        playVideo(video, player, overlay);
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo(video, player, overlay);
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      setStatus(player, '正在播放');
    });

    video.addEventListener('pause', function () {
      setStatus(player, '已暂停');
    });

    video.addEventListener('error', function () {
      var mp4Source = player.getAttribute('data-mp4');
      if (mp4Source && video.getAttribute('src') !== mp4Source) {
        video.src = mp4Source;
        playVideo(video, player, overlay);
      } else {
        setStatus(player, '请稍后重试');
      }
    });
  });
})();
