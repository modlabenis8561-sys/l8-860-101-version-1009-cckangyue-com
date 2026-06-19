(function () {
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (header) {
    const onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const keyword = input ? input.value.trim() : '';
      if (keyword) {
        window.location.href = './search.html?q=' + encodeURIComponent(keyword);
      } else {
        window.location.href = './search.html';
      }
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    const showSlide = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  const filterList = document.querySelector('[data-filter-list]');
  if (filterList) {
    const cards = Array.from(filterList.querySelectorAll('.movie-card'));
    const searchInput = document.querySelector('.page-search');
    const sortSelect = document.querySelector('.sort-select');
    const applyFilter = function () {
      const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        const text = card.dataset.search || '';
        card.classList.toggle('hidden-card', keyword && !text.includes(keyword));
      });
    };
    const applySort = function () {
      if (!sortSelect) {
        return;
      }
      const value = sortSelect.value;
      const sorted = cards.slice().sort(function (a, b) {
        if (value === 'rating') {
          return Number(b.dataset.rating) - Number(a.dataset.rating);
        }
        if (value === 'views') {
          return Number(b.dataset.views) - Number(a.dataset.views);
        }
        if (value === 'year') {
          return Number(b.dataset.year) - Number(a.dataset.year);
        }
        if (value === 'title') {
          return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
        }
        return 0;
      });
      sorted.forEach(function (card) {
        filterList.appendChild(card);
      });
    };
    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', applySort);
    }
  }

  const searchResults = document.getElementById('searchResults');
  if (searchResults && window.SiteMovies) {
    const params = new URLSearchParams(window.location.search);
    const keyword = (params.get('q') || '').trim();
    const form = document.querySelector('[data-search-page-form]');
    const formInput = form ? form.querySelector('input[name="q"]') : null;
    const title = document.querySelector('[data-search-title]');
    if (formInput) {
      formInput.value = keyword;
    }
    const renderMovies = function (items) {
      searchResults.innerHTML = items.slice(0, 80).map(function (movie) {
        const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
          return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
          '<article class="movie-card">',
          '<a class="movie-poster" href="' + movie.url + '">',
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '在线观看" loading="lazy">',
          '<span class="poster-gradient"></span>',
          '<span class="poster-year">' + escapeHtml(movie.year) + '</span>',
          '<span class="poster-play">▶</span>',
          '</a>',
          '<div class="movie-card-body">',
          '<div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.category) + '</span></div>',
          '<h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
          '<p>' + escapeHtml(movie.oneLine) + '</p>',
          '<div class="movie-tags">' + tags + '</div>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');
    };
    const runSearch = function (value) {
      const normalized = value.trim().toLowerCase();
      let results = window.SiteMovies;
      if (normalized) {
        results = window.SiteMovies.filter(function (movie) {
          return movie.search.includes(normalized);
        });
      }
      if (title) {
        title.textContent = normalized ? '“' + value.trim() + '”相关影片' : '精选影片';
      }
      renderMovies(results);
    };
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const value = formInput ? formInput.value.trim() : '';
        const url = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
        window.history.replaceState({}, '', url);
        runSearch(value);
      });
    }
    runSearch(keyword);
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }
})();
