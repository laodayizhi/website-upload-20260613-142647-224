(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;

        const showSlide = function (index) {
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
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        showSlide(0);
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    const rail = document.querySelector('[data-rail]');
    const prev = document.querySelector('[data-rail-prev]');
    const next = document.querySelector('[data-rail-next]');

    if (rail && prev && next) {
        prev.addEventListener('click', function () {
            rail.scrollBy({ left: -420, behavior: 'smooth' });
        });
        next.addEventListener('click', function () {
            rail.scrollBy({ left: 420, behavior: 'smooth' });
        });
    }

    const panels = Array.from(document.querySelectorAll('[data-local-filter]'));

    panels.forEach(function (panel) {
        const input = panel.querySelector('[data-filter-input]');
        const buttons = Array.from(panel.querySelectorAll('[data-filter-value]'));
        const grid = panel.parentElement ? panel.parentElement.querySelector('.searchable-grid') : null;
        const cards = grid ? Array.from(grid.querySelectorAll('[data-search-card]')) : [];
        const empty = document.querySelector('[data-empty-state]');
        let buttonValue = '';

        const applyFilter = function () {
            const inputValue = input ? input.value.trim().toLowerCase() : '';
            const activeValue = buttonValue.toLowerCase();
            let visibleCount = 0;

            cards.forEach(function (card) {
                const content = [
                    card.dataset.title,
                    card.dataset.tags,
                    card.dataset.region,
                    card.dataset.year,
                    card.textContent
                ].join(' ').toLowerCase();
                const inputMatch = !inputValue || content.indexOf(inputValue) !== -1;
                const buttonMatch = !activeValue || content.indexOf(activeValue) !== -1;
                const matched = inputMatch && buttonMatch;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visibleCount === 0);
            }
        };

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                buttonValue = button.dataset.filterValue || '';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilter();
            });
        });

        const params = new URLSearchParams(window.location.search);
        const query = params.get('q') || '';
        const globalInput = document.querySelector('[data-global-search-input]');

        if (query && input) {
            input.value = query;
            if (globalInput) {
                globalInput.value = query;
            }
            applyFilter();
        }
    });
})();

function initMoviePlayer(source) {
    const video = document.getElementById('video-player');
    const button = document.getElementById('movie-play-button');

    if (!video || !button || !source) {
        return;
    }

    let loaded = false;
    let hls = null;

    const loadSource = function () {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        video.src = source;
    };

    const start = function () {
        loadSource();
        button.classList.add('is-hidden');
        video.controls = true;
        const result = video.play();

        if (result && typeof result.catch === 'function') {
            result.catch(function () {});
        }
    };

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });
    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
