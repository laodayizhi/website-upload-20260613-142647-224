(function () {
  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  var menuButton = document.querySelector('.menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobileMenu.hidden = expanded;
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var scopeSelector = panel.getAttribute('data-filter-scope') || 'body';
    var scope = document.querySelector(scopeSelector) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var keywordInput = panel.querySelector('[data-filter-keyword]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var empty = scope.querySelector('[data-empty-state]');

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-keywords')
      ].join(' '));
    }

    function apply() {
      var keyword = normalize(keywordInput ? keywordInput.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var shown = 0;

      cards.forEach(function (card) {
        var matched = true;
        if (keyword && cardText(card).indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          matched = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          matched = false;
        }
        if (region && card.getAttribute('data-region').indexOf(region) === -1) {
          matched = false;
        }
        card.hidden = !matched;
        if (matched) {
          shown += 1;
        }
      });

      if (empty) {
        empty.style.display = shown ? 'none' : 'block';
      }
    }

    [keywordInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && keywordInput) {
      keywordInput.value = query;
    }
    apply();
  });
})();
