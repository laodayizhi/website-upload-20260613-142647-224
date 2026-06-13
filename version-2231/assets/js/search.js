document.addEventListener("DOMContentLoaded", function () {
    var input = document.getElementById("siteSearchInput");
    var button = document.getElementById("siteSearchButton");
    var results = document.getElementById("searchResults");

    if (!input || !button || !results || !window.SEARCH_MOVIES) {
        return;
    }

    var escapeHtml = function (text) {
        return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    var cardTemplate = function (movie) {
        var tagHtml = movie.tags.slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return "<article class=\"movie-card\" data-search=\"" + escapeHtml(movie.search) + "\">" +
            "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
            "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" decoding=\"async\">" +
            "<span class=\"poster-play\">▶</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div>" +
            "<h2><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h2>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"tag-row\">" + tagHtml + "</div>" +
            "</div>" +
            "</article>";
    };

    var render = function (items) {
        if (!items.length) {
            results.innerHTML = "<div class=\"empty-result\">未找到相关影片</div>";
            return;
        }

        results.innerHTML = items.slice(0, 96).map(cardTemplate).join("");
    };

    var runSearch = function () {
        var value = input.value.trim().toLowerCase();

        if (!value) {
            render(window.SEARCH_MOVIES.slice(0, 48));
            return;
        }

        var words = value.split(/\s+/).filter(Boolean);
        var matched = window.SEARCH_MOVIES.filter(function (movie) {
            var haystack = movie.search.toLowerCase();
            return words.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
        });

        render(matched);
    };

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query) {
        input.value = query;
    }

    input.addEventListener("input", runSearch);
    button.addEventListener("click", runSearch);
    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            runSearch();
        }
    });

    runSearch();
});
