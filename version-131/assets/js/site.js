(function () {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    let active = 0;
    const show = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    setInterval(function () {
      show(active + 1);
    }, 5200);
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const categorySelect = document.querySelector('[data-filter-category]');
  const yearSelect = document.querySelector('[data-filter-year]');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const emptyState = document.querySelector('[data-empty-state]');
  const runFilter = function () {
    if (!cards.length) {
      return;
    }
    const query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    const category = categorySelect ? categorySelect.value : '';
    const year = yearSelect ? yearSelect.value : '';
    let visible = 0;
    cards.forEach(function (card) {
      const terms = (card.getAttribute('data-terms') || '').toLowerCase();
      const cardCategory = card.getAttribute('data-category') || '';
      const cardYear = card.getAttribute('data-year') || '';
      const matched = (!query || terms.indexOf(query) !== -1) && (!category || cardCategory === category) && (!year || cardYear === year);
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.style.display = visible ? 'none' : 'block';
    }
  };
  [filterInput, categorySelect, yearSelect].forEach(function (element) {
    if (element) {
      element.addEventListener('input', runFilter);
      element.addEventListener('change', runFilter);
    }
  });
  runFilter();

  const searchRoot = document.querySelector('[data-search-root]');
  if (searchRoot && globalThis.MOVIE_SEARCH_INDEX) {
    const form = searchRoot.querySelector('[data-search-form]');
    const input = searchRoot.querySelector('[data-search-query]');
    const results = searchRoot.querySelector('[data-search-results]');
    const params = new URLSearchParams(location.search);
    const initial = params.get('q') || '';
    const escapeHtml = function (value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char];
      });
    };
    const render = function (query) {
      const normalized = query.trim().toLowerCase();
      const pool = normalized ? globalThis.MOVIE_SEARCH_INDEX.filter(function (item) {
        return item.terms.toLowerCase().indexOf(normalized) !== -1;
      }) : globalThis.MOVIE_SEARCH_INDEX.slice(0, 36);
      const items = pool.slice(0, 80).map(function (item) {
        return '<article class="movie-card"><a href="' + escapeHtml(item.url) + '"><div class="movie-poster"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '"><span class="type-badge">' + escapeHtml(item.type) + '</span><span class="year-badge">' + escapeHtml(item.year) + '</span></div><div class="movie-info"><span class="movie-kicker">' + escapeHtml(item.category) + '</span><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.one_line) + '</p><div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.rating) + '</span></div></div></a></article>';
      }).join('');
      results.innerHTML = items || '<div class="empty-state" style="display:block">暂无相关影片</div>';
    };
    if (input) {
      input.value = initial;
    }
    render(initial);
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const value = input ? input.value : '';
        const nextUrl = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
        history.replaceState(null, '', nextUrl);
        render(value);
      });
    }
  }
})();
