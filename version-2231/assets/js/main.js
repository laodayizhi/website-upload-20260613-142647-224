document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector(".menu-toggle");
    var navLinks = document.querySelector(".nav-links");

    if (menuButton && navLinks) {
        menuButton.addEventListener("click", function () {
            var isOpen = navLinks.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var current = 0;

        var showSlide = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5200);
        }
    }

    var filterInput = document.querySelector(".movie-filter-input");
    var clearButton = document.querySelector(".filter-clear");

    if (filterInput) {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var runFilter = function () {
            var value = filterInput.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                card.style.display = !value || haystack.indexOf(value) !== -1 ? "" : "none";
            });
        };

        filterInput.addEventListener("input", runFilter);

        if (clearButton) {
            clearButton.addEventListener("click", function () {
                filterInput.value = "";
                runFilter();
                filterInput.focus();
            });
        }
    }
});
