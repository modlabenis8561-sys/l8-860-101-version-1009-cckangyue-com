(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");

    if (toggle && nav) {
      toggle.addEventListener("click", function() {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide(current + 1);
      }, 6200);
    }

    function applyFilters(targetSelector) {
      var target = document.querySelector(targetSelector);
      if (!target) {
        return;
      }
      var input = document.querySelector('[data-card-search="' + targetSelector + '"]');
      var group = document.querySelector('[data-card-filter="' + targetSelector + '"]');
      var cards = Array.prototype.slice.call(target.querySelectorAll(".searchable-card"));
      var activeValue = "all";

      function update() {
        var query = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function(card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var kind = (card.getAttribute("data-kind") || "").toLowerCase();
          var okQuery = !query || text.indexOf(query) !== -1;
          var okFilter = activeValue === "all" || kind.indexOf(activeValue.toLowerCase()) !== -1 || text.indexOf(activeValue.toLowerCase()) !== -1;
          card.classList.toggle("is-hidden", !(okQuery && okFilter));
        });
      }

      if (input) {
        input.addEventListener("input", update);
      }

      if (group) {
        group.addEventListener("click", function(event) {
          var button = event.target.closest("button[data-filter-value]");
          if (!button) {
            return;
          }
          activeValue = button.getAttribute("data-filter-value") || "all";
          Array.prototype.slice.call(group.querySelectorAll(".filter-chip")).forEach(function(item) {
            item.classList.toggle("active", item === button);
          });
          update();
        });
      }
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-card-search]")).forEach(function(input) {
      applyFilters(input.getAttribute("data-card-search"));
    });
  });
})();
