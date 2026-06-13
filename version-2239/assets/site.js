(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initMissingImages() {
        document.querySelectorAll('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('image-missing');
            }, { once: true });
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(i);
                start();
            });
        });

        start();
    }

    function initLocalSearch() {
        var input = document.querySelector('[data-local-search]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var empty = document.querySelector('[data-empty-state]');
        if (!input || !cards.length) {
            return;
        }

        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = card.getAttribute('data-search') || '';
                var matched = !keyword || text.indexOf(keyword) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        });
    }

    function createSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '' +
            '<article class="movie-card">' +
            '<a class="poster-link" href="' + escapeAttribute(movie.url) + '">' +
            '<img src="' + escapeAttribute(movie.poster) + '" alt="' + escapeAttribute(movie.title) + '封面" loading="lazy" />' +
            '<span class="play-chip">播放</span>' +
            '</a>' +
            '<div class="movie-card-body">' +
            '<div class="card-meta-line">' +
            '<a href="' + escapeAttribute(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a>' +
            '<span>' + escapeHtml(movie.year) + '</span>' +
            '</div>' +
            '<h3><a href="' + escapeAttribute(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
            '</article>';
    }

    function initSearchPage() {
        var form = document.querySelector('[data-search-page-form]');
        var results = document.querySelector('[data-search-results]');
        var summary = document.querySelector('[data-search-summary]');
        if (!form || !results || !window.SEARCH_MOVIES) {
            return;
        }
        var input = form.querySelector('input[name="q"]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;

        function render(keyword) {
            var query = keyword.trim().toLowerCase();
            if (!query) {
                results.innerHTML = '';
                if (summary) {
                    summary.textContent = '请输入关键词开始搜索';
                }
                return;
            }
            var matched = window.SEARCH_MOVIES.filter(function (movie) {
                return movie.search.indexOf(query) !== -1;
            }).slice(0, 120);
            results.innerHTML = matched.map(createSearchCard).join('');
            initMissingImages();
            if (summary) {
                summary.textContent = matched.length ? '找到 ' + matched.length + ' 个相关结果' : '没有找到相关影片';
            }
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            render(input.value);
            var url = new URL(window.location.href);
            url.searchParams.set('q', input.value.trim());
            window.history.replaceState({}, '', url.toString());
        });

        input.addEventListener('input', function () {
            render(input.value);
        });

        render(initial);
    }

    function initPlayer() {
        var shell = document.querySelector('[data-video-player]');
        if (!shell) {
            return;
        }
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('[data-play-overlay]');
        if (!video) {
            return;
        }
        var hlsSource = video.getAttribute('data-hls');
        var mp4Source = video.getAttribute('data-mp4');
        var bound = false;
        var hlsInstance = null;

        function fallbackToMp4() {
            if (mp4Source && video.getAttribute('src') !== mp4Source) {
                video.src = mp4Source;
                video.load();
            }
        }

        function bindSource() {
            if (bound) {
                return;
            }
            bound = true;
            if (hlsSource && window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(hlsSource);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                    if (data && data.fatal) {
                        hlsInstance.destroy();
                        fallbackToMp4();
                    }
                });
            } else if (hlsSource && video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = hlsSource;
            } else {
                fallbackToMp4();
            }
        }

        function playVideo() {
            bindSource();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    video.setAttribute('controls', 'controls');
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function escapeAttribute(value) {
        return escapeHtml(value).replace(/`/g, '&#096;');
    }

    ready(function () {
        initMenu();
        initMissingImages();
        initHero();
        initLocalSearch();
        initSearchPage();
        initPlayer();
    });
}());
