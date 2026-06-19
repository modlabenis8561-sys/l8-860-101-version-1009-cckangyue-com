(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initHeader() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".menu-toggle");
    var mobile = document.querySelector(".mobile-nav");
    function updateHeader() {
      if (!header) {
        return;
      }
      if (window.scrollY > 16) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        var opened = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!opened));
        mobile.hidden = opened;
        toggle.textContent = opened ? "☰" : "×";
      });
    }
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    inputs.forEach(function (input) {
      var targetSelector = input.getAttribute("data-filter-input") || ".searchable-card";
      var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
      var noResult = document.querySelector(".no-result");
      function apply() {
        var query = normalizeText(input.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalizeText([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year"),
            card.textContent
          ].join(" "));
          var matched = !query || haystack.indexOf(query) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (noResult) {
          noResult.classList.toggle("is-visible", visible === 0);
        }
      }
      input.addEventListener("input", apply);
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && !input.value) {
        input.value = q;
      }
      apply();
    });
  }

  function initPlayer(videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !source) {
      return;
    }
    var started = false;
    var hlsInstance = null;
    function playVideo() {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    function start() {
      if (started) {
        playVideo();
        return;
      }
      started = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        playVideo();
        return;
      }
      video.src = source;
      playVideo();
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initHeader();
    initHero();
    initFilters();
  });

  window.MovieSite = {
    initPlayer: initPlayer
  };
})();
