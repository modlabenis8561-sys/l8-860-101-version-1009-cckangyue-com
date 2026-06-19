(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuToggle && mobilePanel) {
      menuToggle.addEventListener('click', function () {
        mobilePanel.hidden = !mobilePanel.hidden;
      });

      mobilePanel.querySelectorAll('.mobile-nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
          mobilePanel.hidden = true;
        });
      });
    }

    document.querySelectorAll('[data-back-top]').forEach(function (button) {
      button.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var index = 0;
      var timer = null;

      function show(next) {
        index = next;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }

      function start() {
        if (slides.length > 1) {
          timer = window.setInterval(function () {
            show((index + 1) % slides.length);
          }, 5000);
        }
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          if (timer) {
            window.clearInterval(timer);
          }
          show(dotIndex);
          start();
        });
      });

      show(0);
      start();
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (panel) {
      var container = panel.parentElement || document;
      var input = panel.querySelector('[data-search-input]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var result = panel.querySelector('[data-filter-result]');
      var cards = Array.prototype.slice.call(container.querySelectorAll('[data-movie-card]'));
      var empty = container.querySelector('[data-empty-state]');

      function matches(card, keyword, typeValue, yearValue) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        var typeOk = !typeValue || cardType.indexOf(typeValue) !== -1 || haystack.indexOf(typeValue.toLowerCase()) !== -1;
        var yearOk = !yearValue || cardYear === yearValue;
        return keywordOk && typeOk && yearOk;
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var ok = matches(card, keyword, typeValue, yearValue);
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (result) {
          result.textContent = visible ? '已显示匹配影片' : '未找到匹配影片';
        }
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  });
})();
