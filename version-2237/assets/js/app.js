(function () {
  function toggleMobileNav() {
    var button = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      button.textContent = panel.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function restart(nextIndex) {
      window.clearInterval(timer);
      show(nextIndex);
      play();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        restart(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (prev) prev.addEventListener('click', function () { restart(index - 1); });
    if (next) next.addEventListener('click', function () { restart(index + 1); });
    play();
  }

  function setupLocalFilter() {
    var input = document.querySelector('[data-filter-input]');
    var grid = document.querySelector('[data-filter-grid]');
    if (!input || !grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search-text') || '').toLowerCase();
        card.style.display = !keyword || text.indexOf(keyword) !== -1 ? '' : 'none';
      });
    });
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.movieSearchIndex) return;
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-page-input]');
    var title = document.querySelector('[data-search-title]');
    var subtitle = document.querySelector('[data-search-subtitle]');
    if (input) input.value = keyword;

    var normalized = keyword.toLowerCase();
    var list = window.movieSearchIndex.filter(function (item) {
      if (!normalized) return item.hot;
      return item.searchText.toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 120);

    if (title) title.textContent = keyword ? '搜索结果' : '热门搜索';
    if (subtitle) subtitle.textContent = keyword ? '与“' + keyword + '”相关的高清内容' : '近期值得观看的精选内容';

    results.innerHTML = list.map(function (item) {
      return '<article class="movie-card">' +
        '<a class="movie-poster" href="' + item.file + '" aria-label="观看 ' + escapeHtml(item.title) + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="play-hover">▶</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<div class="movie-meta-line"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
        '<h3><a href="' + item.file + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p>' + escapeHtml(item.oneLine) + '</p>' +
        '<div class="tag-list"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.genre) + '</span></div>' +
        '</div>' +
        '</article>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function setupPlayers() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-player-box]'));
    boxes.forEach(function (box) {
      var video = box.querySelector('video');
      var cover = box.querySelector('[data-player-start]');
      if (!video || !cover) return;
      var source = video.getAttribute('data-m3u8');
      var started = false;
      var hlsInstance = null;

      function start() {
        if (!source) return;
        cover.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        if (!started) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls();
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          } else {
            video.src = source;
          }
          started = true;
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            video.setAttribute('controls', 'controls');
          });
        }
      }

      cover.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (!started) start();
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) hlsInstance.destroy();
      });
    });
  }

  toggleMobileNav();
  setupHero();
  setupLocalFilter();
  setupSearchPage();
  setupPlayers();
})();
