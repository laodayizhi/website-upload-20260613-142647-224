const menuButton = document.querySelector('[data-menu-button]');
const mobilePanel = document.querySelector('[data-mobile-panel]');

if (menuButton && mobilePanel) {
  menuButton.addEventListener('click', () => {
    mobilePanel.classList.toggle('open');
  });
}

const backTop = document.querySelector('[data-back-top]');

if (backTop) {
  window.addEventListener('scroll', () => {
    backTop.classList.toggle('show', window.scrollY > 320);
  });

  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

const carousel = document.querySelector('[data-hero-carousel]');

if (carousel) {
  const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
  const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
  const prev = carousel.querySelector('[data-hero-prev]');
  const next = carousel.querySelector('[data-hero-next]');
  let activeIndex = 0;
  let timer = null;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, position) => {
      slide.classList.toggle('active', position === activeIndex);
    });
    dots.forEach((dot, position) => {
      dot.classList.toggle('active', position === activeIndex);
    });
  };

  const start = () => {
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
  };

  const restart = () => {
    if (timer) window.clearInterval(timer);
    start();
  };

  if (prev) {
    prev.addEventListener('click', () => {
      showSlide(activeIndex - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      showSlide(activeIndex + 1);
      restart();
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.heroDot));
      restart();
    });
  });

  start();
}

const filterForm = document.querySelector('[data-filter-form]');
const movieGrid = document.querySelector('[data-movie-grid]');

if (filterForm && movieGrid) {
  const cards = Array.from(movieGrid.querySelectorAll('.movie-card'));
  const searchInput = filterForm.querySelector('[data-filter-search]');
  const categorySelect = filterForm.querySelector('[data-filter-category]');
  const regionSelect = filterForm.querySelector('[data-filter-region]');
  const typeSelect = filterForm.querySelector('[data-filter-type]');
  const yearSelect = filterForm.querySelector('[data-filter-year]');
  const sortSelect = filterForm.querySelector('[data-filter-sort]');
  const emptyState = document.querySelector('[data-empty-state]');
  const params = new URLSearchParams(window.location.search);

  if (params.get('q') && searchInput) searchInput.value = params.get('q');
  if (params.get('category') && categorySelect) categorySelect.value = params.get('category');
  if (params.get('region') && regionSelect) regionSelect.value = params.get('region');
  if (params.get('type') && typeSelect) typeSelect.value = params.get('type');
  if (params.get('year') && yearSelect) yearSelect.value = params.get('year');

  const applyFilter = () => {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const category = categorySelect?.value || '';
    const region = regionSelect?.value || '';
    const type = typeSelect?.value || '';
    const year = yearSelect?.value || '';
    const sort = sortSelect?.value || 'default';
    let visible = 0;

    cards.forEach((card) => {
      const matched =
        (!query || card.dataset.search.includes(query)) &&
        (!category || card.dataset.category === category) &&
        (!region || card.dataset.region === region) &&
        (!type || card.dataset.type === type) &&
        (!year || card.dataset.year === year);
      card.classList.toggle('hidden', !matched);
      if (matched) visible += 1;
    });

    const sortedCards = [...cards].sort((a, b) => {
      if (sort === 'rating') return Number(b.dataset.rating) - Number(a.dataset.rating);
      if (sort === 'year') return String(b.dataset.year).localeCompare(String(a.dataset.year));
      if (sort === 'title') return String(a.dataset.title).localeCompare(String(b.dataset.title), 'zh-CN');
      return Number(a.dataset.index) - Number(b.dataset.index);
    });

    sortedCards.forEach((card) => movieGrid.appendChild(card));

    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  };

  filterForm.addEventListener('input', applyFilter);
  filterForm.addEventListener('change', applyFilter);
  filterForm.addEventListener('reset', () => {
    window.setTimeout(applyFilter, 0);
  });

  applyFilter();
}
