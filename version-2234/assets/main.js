(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileMenu = document.querySelector(".mobile-menu");
    if (toggle && mobileMenu) {
      toggle.addEventListener("click", function () {
        var open = mobileMenu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var hero = document.querySelector(".hero-carousel");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
      var prev = hero.querySelector(".hero-control.prev");
      var next = hero.querySelector(".hero-control.next");
      var index = 0;
      var timer = null;
      var show = function (target) {
        if (!slides.length) {
          return;
        }
        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      };
      var start = function () {
        clearInterval(timer);
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }
      show(0);
      start();
    }

    var grid = document.querySelector(".filter-grid");
    if (grid) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
      var search = document.querySelector("[data-filter-search]");
      var category = document.querySelector("[data-filter-category]");
      var sort = document.querySelector("[data-filter-sort]");
      var empty = document.querySelector(".empty-state");
      var params = new URLSearchParams(window.location.search);
      if (search && params.get("search")) {
        search.value = params.get("search");
      }
      var apply = function () {
        var query = search ? search.value.trim().toLowerCase() : "";
        var cat = category ? category.value : "all";
        var visible = 0;
        cards.forEach(function (card) {
          var matchedText = !query || (card.getAttribute("data-search") || "").indexOf(query) !== -1;
          var matchedCategory = cat === "all" || card.getAttribute("data-category") === cat;
          var showCard = matchedText && matchedCategory;
          card.style.display = showCard ? "" : "none";
          if (showCard) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      };
      var order = function () {
        if (!sort) {
          return;
        }
        var value = sort.value;
        var sorted = cards.slice();
        if (value === "rating") {
          sorted.sort(function (a, b) {
            return parseFloat(b.getAttribute("data-rating") || "0") - parseFloat(a.getAttribute("data-rating") || "0");
          });
        } else if (value === "year") {
          sorted.sort(function (a, b) {
            return (b.getAttribute("data-year") || "").localeCompare(a.getAttribute("data-year") || "");
          });
        } else if (value === "title") {
          sorted.sort(function (a, b) {
            return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
          });
        } else {
          sorted = cards.slice();
        }
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
        apply();
      };
      if (search) {
        search.addEventListener("input", apply);
      }
      if (category) {
        category.addEventListener("change", apply);
      }
      if (sort) {
        sort.addEventListener("change", order);
      }
      order();
      apply();
    }
  });
})();
