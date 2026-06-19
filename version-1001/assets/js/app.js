(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var mobile = document.querySelector(".mobile-nav");
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener("click", function () {
      mobile.classList.toggle("is-open");
      toggle.textContent = mobile.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function setupSearchForms() {
    document.querySelectorAll(".site-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    if (slides.length < 2) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll(".hero-thumb"));
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle("is-active", thumbIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        startTimer();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("mouseenter", function () {
        show(Number(thumb.getAttribute("data-hero-thumb")) || 0);
      });
    });

    startTimer();
  }

  function setupFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll("[data-filter-grid]"));
    grids.forEach(function (grid) {
      var panel = grid.parentElement.querySelector(".filter-panel");
      if (!panel) {
        return;
      }
      var input = panel.querySelector("[data-filter-input]");
      var select = panel.querySelector("[data-sort-select]");
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card-wrap"));

      function normalize(value) {
        return String(value || "").toLowerCase();
      }

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var visible = cards.filter(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-category")
          ].join(" ").toLowerCase();
          var matched = !keyword || haystack.indexOf(keyword) !== -1;
          card.classList.toggle("is-hidden", !matched);
          return matched;
        });
        var sort = select ? select.value : "default";
        visible.sort(function (a, b) {
          if (sort === "latest") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }
          if (sort === "oldest") {
            return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
          }
          if (sort === "title") {
            return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
          }
          return Number(a.getAttribute("data-index")) - Number(b.getAttribute("data-index"));
        });
        visible.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
    });
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    var input = document.querySelector("[data-search-page-input]");
    if (!results || !summary || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var keyword = query.toLowerCase();
    var matched = window.SEARCH_INDEX.filter(function (item) {
      return [
        item.title,
        item.oneLine,
        item.summary,
        item.category,
        item.region,
        item.type,
        item.genre,
        (item.tags || []).join(" ")
      ].join(" ").toLowerCase().indexOf(keyword) !== -1;
    });
    summary.innerHTML = '<p class="eyebrow">搜索结果</p><h2>“' + escapeHtml(query) + '”</h2>';
    if (!matched.length) {
      results.innerHTML = '<div class="content-card"><h2>未找到相关影片</h2><p>可以尝试更换影片名、地区、题材或标签关键词。</p></div>';
      return;
    }
    results.innerHTML = matched.slice(0, 240).map(function (item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return '<article class="movie-card-wrap">' +
        '<a class="movie-card" href="./' + escapeHtml(item.file) + '">' +
        '<div class="poster-frame"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="poster-shine"></span></div>' +
        '<div class="card-body"><div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
        '<h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.oneLine) + '</p><div class="tag-row">' + tags + '</div></div>' +
        '</a></article>';
    }).join("");
  }

  function setupPlayers() {
    document.querySelectorAll("[data-stream]").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-layer");
      var stream = shell.getAttribute("data-stream");
      var hls = null;
      var bound = false;
      if (!video || !stream) {
        return;
      }

      function hideButton() {
        if (button) {
          button.classList.add("is-hidden");
        }
      }

      function showButton() {
        if (button) {
          button.classList.remove("is-hidden");
        }
      }

      function playVideo() {
        hideButton();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            showButton();
          });
        }
      }

      function bindStream() {
        if (bound) {
          return;
        }
        bound = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.load();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls();
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          return;
        }
        video.src = stream;
        video.load();
      }

      function start() {
        bindStream();
        playVideo();
      }

      if (button) {
        button.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", hideButton);
      video.addEventListener("pause", function () {
        if (!video.ended) {
          showButton();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
