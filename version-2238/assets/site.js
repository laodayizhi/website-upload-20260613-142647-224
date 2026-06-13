(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function query(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[type='search'], input[type='text']");
        var value = input ? input.value.trim() : "";
        if (value) {
          window.location.href = "./search.html?q=" + encodeURIComponent(value);
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupScrollRows() {
    document.querySelectorAll("[data-scroll-box]").forEach(function (box) {
      var row = box.querySelector("[data-scroll-row]");
      var left = box.querySelector("[data-scroll-left]");
      var right = box.querySelector("[data-scroll-right]");
      if (!row) {
        return;
      }
      if (left) {
        left.addEventListener("click", function () {
          row.scrollBy({ left: -420, behavior: "smooth" });
        });
      }
      if (right) {
        right.addEventListener("click", function () {
          row.scrollBy({ left: 420, behavior: "smooth" });
        });
      }
    });
  }

  function setupCardFilters() {
    document.querySelectorAll("[data-card-filter]").forEach(function (panel) {
      var target = document.querySelector(panel.getAttribute("data-card-filter"));
      if (!target) {
        return;
      }
      var input = panel.querySelector("[data-filter-keyword]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(target.querySelectorAll("[data-movie-card]"));

      function apply() {
        var keyword = normalize(input && input.value);
        var yearValue = normalize(year && year.value);
        var typeValue = normalize(type && type.value);
        cards.forEach(function (card) {
          var hay = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre")
          ].join(" "));
          var ok = true;
          if (keyword && hay.indexOf(keyword) === -1) {
            ok = false;
          }
          if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
            ok = false;
          }
          if (typeValue && normalize(card.getAttribute("data-type")) !== typeValue) {
            ok = false;
          }
          card.classList.toggle("hidden-card", !ok);
        });
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function createSearchCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.setAttribute("data-movie-card", "");
    article.setAttribute("data-title", movie.title);
    article.setAttribute("data-year", movie.year);
    article.setAttribute("data-region", movie.region);
    article.setAttribute("data-type", movie.type);
    article.setAttribute("data-genre", movie.genre);
    var title = escapeHtml(movie.title);
    var link = escapeHtml(movie.link);
    var cover = escapeHtml(movie.cover);
    var year = escapeHtml(movie.year);
    var region = escapeHtml(movie.region);
    var type = escapeHtml(movie.type);
    var oneLine = escapeHtml(movie.oneLine);
    article.innerHTML = [
      '<a class="poster-link" href="' + link + '">',
      '<img class="poster-img" src="' + cover + '" alt="' + title + '" loading="lazy">',
      '<span class="year-badge">' + year + '</span>',
      '<span class="poster-shade"><span class="play-circle">▶</span></span>',
      '</a>',
      '<div class="card-body">',
      '<h3 class="card-title"><a href="' + link + '">' + title + '</a></h3>',
      '<p class="card-desc">' + oneLine + '</p>',
      '<div class="card-meta"><span class="meta-pill">' + region + '</span><span class="meta-pill">' + type + '</span></div>',
      '</div>'
    ].join("");
    return article;
  }

  function setupSearchPage() {
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-search-empty]");
    if (!input || !results || !window.MovieSearchData) {
      return;
    }
    var initial = query("q");
    if (initial) {
      input.value = initial;
    }

    function render() {
      var keyword = normalize(input.value);
      results.innerHTML = "";
      if (!keyword) {
        window.MovieSearchData.slice(0, 60).forEach(function (movie) {
          results.appendChild(createSearchCard(movie));
        });
        if (empty) {
          empty.classList.remove("show");
        }
        return;
      }
      var matched = window.MovieSearchData.filter(function (movie) {
        var hay = normalize(movie.title + " " + movie.region + " " + movie.type + " " + movie.year + " " + movie.genre + " " + movie.tags + " " + movie.oneLine);
        return hay.indexOf(keyword) !== -1;
      }).slice(0, 120);
      matched.forEach(function (movie) {
        results.appendChild(createSearchCard(movie));
      });
      if (empty) {
        empty.classList.toggle("show", matched.length === 0);
      }
    }

    input.addEventListener("input", render);
    render();
  }

  function setupPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video[data-player-src]");
      var cover = player.querySelector("[data-player-cover]");
      if (!video) {
        return;
      }
      var streamUrl = video.getAttribute("data-player-src");
      var attached = false;
      var hls = null;

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function play() {
        attach();
        if (cover) {
          cover.classList.add("hidden");
        }
        var result = video.play();
        if (result && result.catch) {
          result.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupSearchForms();
    setupHero();
    setupScrollRows();
    setupCardFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
