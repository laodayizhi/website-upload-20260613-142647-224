(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupMenu() {
    var button = qs('[data-menu-button]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var value = input ? input.value.trim() : '';
        var url = './search.html';
        if (value) {
          url += '?q=' + encodeURIComponent(value);
        }
        window.location.href = url;
      });
    });
  }

  function setupFiltering() {
    var cards = qsa('[data-movie-card]');
    var searchInput = qs('[data-card-search]');
    var filters = qsa('[data-filter]');
    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (searchInput && initial) {
      searchInput.value = initial;
    }

    function matches(card) {
      var query = normalize(searchInput ? searchInput.value : '');
      var haystack = normalize([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.tags
      ].join(' '));
      if (query && haystack.indexOf(query) === -1) {
        return false;
      }
      for (var i = 0; i < filters.length; i += 1) {
        var filter = filters[i];
        var value = normalize(filter.value);
        var key = filter.getAttribute('data-filter');
        if (!value) {
          continue;
        }
        if (normalize(card.dataset[key]).indexOf(value) === -1) {
          return false;
        }
      }
      return true;
    }

    function apply() {
      cards.forEach(function (card) {
        card.classList.toggle('is-hidden', !matches(card));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', apply);
    }
    filters.forEach(function (filter) {
      filter.addEventListener('change', apply);
    });
    apply();
  }

  function setupHero() {
    var hero = qs('[data-hero-slider]');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    hero.classList.add('is-ready');

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        activate(i);
      });
    });
    activate(0);
    if (slides.length > 1) {
      window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }
  }

  function setupBackTop() {
    var button = qs('[data-back-top]');
    if (!button) {
      return;
    }
    window.addEventListener('scroll', function () {
      button.classList.toggle('is-visible', window.scrollY > 480);
    }, { passive: true });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var button = qs('[data-play-button]', player);
      var video = qs('video', player);
      var source = player.getAttribute('data-video-src');
      var hlsInstance = null;
      if (!button || !video || !source) {
        return;
      }

      function startPlayback() {
        button.classList.add('is-hidden');
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      }

      function attachSource() {
        if (video.dataset.ready === 'true') {
          startPlayback();
          return;
        }
        video.dataset.ready = 'true';
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', startPlayback, { once: true });
          video.load();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, startPlayback);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              if (hlsInstance) {
                hlsInstance.destroy();
              }
              video.dataset.ready = 'false';
              button.classList.remove('is-hidden');
            }
          });
          return;
        }
        video.src = source;
        video.addEventListener('loadedmetadata', startPlayback, { once: true });
        video.load();
      }

      button.addEventListener('click', attachSource);
      player.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          attachSource();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupSearchForms();
    setupFiltering();
    setupHero();
    setupBackTop();
    setupPlayers();
  });
}());
