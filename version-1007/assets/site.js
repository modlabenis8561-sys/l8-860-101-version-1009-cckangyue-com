(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = select('[data-menu-toggle]');
    var panel = select('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupSearchForms() {
    selectAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = select('input[name="q"]', form);
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });
  }

  function setupFilters() {
    var input = select('[data-filter-input]');
    var list = select('[data-filter-list]');
    if (!input || !list) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q') || '';
    if (input.hasAttribute('data-query-source') && queryValue) {
      input.value = queryValue;
    }
    var empty = select('[data-filter-empty]');
    var bar = input.closest('.filter-bar');
    var items = selectAll('[data-filter-item]', list);

    function filter() {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;
      items.forEach(function (item) {
        var text = (item.getAttribute('data-filter-text') || item.textContent || '').toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        item.classList.toggle('hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (bar) {
        bar.classList.toggle('empty', visible === 0);
      }
      if (empty) {
        empty.style.display = visible === 0 ? 'inline-flex' : '';
      }
    }

    input.addEventListener('input', filter);
    filter();
  }

  function setupHero() {
    var carousel = select('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', carousel);
    var dots = selectAll('[data-hero-dot]', carousel);
    var next = select('[data-hero-next]', carousel);
    var prev = select('[data-hero-prev]', carousel);
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    show(0);
    restart();
  }

  function setupPlayer() {
    var box = select('[data-player]');
    if (!box) {
      return;
    }
    var video = select('video', box);
    var button = select('[data-player-button]', box);
    var source = box.getAttribute('data-video-url');
    var loaded = false;

    function attach() {
      if (!video || !source || loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      attach();
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
      box.classList.add('is-playing');
    }

    if (button) {
      button.addEventListener('click', play);
    }
    box.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      play(event);
    });
    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        box.classList.remove('is-playing');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupSearchForms();
    setupFilters();
    setupHero();
    setupPlayer();
  });
})();
