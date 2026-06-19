(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function renderSearch(form, query) {
    var panel = form.querySelector(".search-panel");
    if (!panel) {
      return;
    }
    var text = normalize(query);
    if (!text || !window.MOVIE_INDEX) {
      panel.classList.remove("is-open");
      panel.innerHTML = "";
      return;
    }
    var matched = window.MOVIE_INDEX.filter(function (item) {
      return normalize(item.title + " " + item.genre + " " + item.region + " " + item.year).indexOf(text) !== -1;
    }).slice(0, 8);
    if (!matched.length) {
      panel.classList.add("is-open");
      panel.innerHTML = '<div class="search-result"><span><strong>暂无匹配内容</strong><span>换一个关键词试试</span></span></div>';
      return;
    }
    panel.classList.add("is-open");
    panel.innerHTML = matched.map(function (item) {
      return '<a class="search-result" href="./' + item.url + '"><img src="' + item.cover + '" alt="' + item.title + '"><span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span></span></a>';
    }).join("");
  }

  function bindSearch() {
    document.querySelectorAll(".site-search").forEach(function (form) {
      var input = form.querySelector(".search-input");
      if (!input) {
        return;
      }
      input.addEventListener("input", function () {
        renderSearch(form, input.value);
      });
      input.addEventListener("focus", function () {
        renderSearch(form, input.value);
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var first = form.querySelector(".search-result[href]");
        if (first) {
          window.location.href = first.getAttribute("href");
        }
      });
    });
    document.addEventListener("click", function (event) {
      document.querySelectorAll(".site-search").forEach(function (form) {
        if (!form.contains(event.target)) {
          var panel = form.querySelector(".search-panel");
          if (panel) {
            panel.classList.remove("is-open");
          }
        }
      });
    });
  }

  function bindMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function bindCardFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var input = panel.querySelector("[data-filter-text]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var reset = panel.querySelector("[data-filter-reset]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    function apply() {
      var text = normalize(input && input.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      cards.forEach(function (card) {
        var haystack = normalize(card.dataset.title + " " + card.dataset.genre + " " + card.dataset.region + " " + card.dataset.year + " " + card.dataset.type);
        var okText = !text || haystack.indexOf(text) !== -1;
        var okType = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
        var okYear = !yearValue || normalize(card.dataset.year) === yearValue;
        card.style.display = okText && okType && okYear ? "" : "none";
      });
    }
    [input, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (type) {
          type.value = "";
        }
        if (year) {
          year.value = "";
        }
        apply();
      });
    }
  }

  var playerMap = new WeakMap();

  window.startMoviePlayer = function (video, url, overlay) {
    if (!video || !url) {
      return;
    }
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (!playerMap.has(video)) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        playerMap.set(video, true);
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        playerMap.set(video, hls);
      } else {
        video.src = url;
        playerMap.set(video, true);
      }
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  };

  ready(function () {
    bindSearch();
    bindMenu();
    bindHero();
    bindCardFilters();
  });
}());
