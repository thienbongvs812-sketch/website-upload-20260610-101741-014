(function() {
  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function(form) {
    form.addEventListener('submit', function(event) {
      const input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        return;
      }
      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }
  }

  const searchPage = document.querySelector('[data-search-page]');
  if (searchPage) {
    const params = new URLSearchParams(window.location.search);
    const input = searchPage.querySelector('[data-filter-text]');
    const category = searchPage.querySelector('[data-filter-category]');
    const region = searchPage.querySelector('[data-filter-region]');
    const type = searchPage.querySelector('[data-filter-type]');
    const year = searchPage.querySelector('[data-filter-year]');
    const cards = Array.from(searchPage.querySelectorAll('[data-movie-card]'));
    const form = searchPage.querySelector('[data-filter-panel]');

    if (input && params.get('q')) {
      input.value = params.get('q');
    }
    if (category && params.get('category')) {
      category.value = params.get('category');
    }

    function matchText(card, text) {
      if (!text) {
        return true;
      }
      const haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.category
      ].join(' ').toLowerCase();
      return haystack.indexOf(text.toLowerCase()) !== -1;
    }

    function apply() {
      const text = input ? input.value.trim() : '';
      const selectedCategory = category ? category.value : '';
      const selectedRegion = region ? region.value : '';
      const selectedType = type ? type.value : '';
      const selectedYear = year ? year.value : '';

      cards.forEach(function(card) {
        const ok = matchText(card, text) &&
          (!selectedCategory || card.dataset.category === selectedCategory) &&
          (!selectedRegion || card.dataset.region === selectedRegion) &&
          (!selectedType || card.dataset.type === selectedType) &&
          (!selectedYear || card.dataset.year === selectedYear);
        card.style.display = ok ? '' : 'none';
      });
    }

    [input, category, region, type, year].forEach(function(el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });

    if (form) {
      form.addEventListener('reset', function() {
        window.setTimeout(apply, 0);
      });
    }

    apply();
  }
})();
