(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                var active = slideIndex === current;
                slide.classList.toggle('active', active);
                slide.setAttribute('aria-hidden', active ? 'false' : 'true');
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var typeFilter = document.querySelector('[data-filter-type]');
    var yearFilter = document.querySelector('[data-filter-year]');
    var emptyResult = document.querySelector('[data-empty-result]');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }
        var keyword = normalize(searchInputs.map(function (input) {
            return input.value;
        }).filter(Boolean).pop() || '');
        var typeValue = typeFilter ? normalize(typeFilter.value) : '';
        var yearValue = yearFilter ? normalize(yearFilter.value) : '';
        var visibleCount = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search-text'));
            var type = normalize(card.getAttribute('data-type'));
            var year = normalize(card.getAttribute('data-year'));
            var matched = (!keyword || text.indexOf(keyword) !== -1) && (!typeValue || type.indexOf(typeValue) !== -1) && (!yearValue || year === yearValue);
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visibleCount += 1;
            }
        });

        if (emptyResult) {
            emptyResult.classList.toggle('is-visible', visibleCount === 0);
        }
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            searchInputs.forEach(function (other) {
                if (other !== input) {
                    other.value = input.value;
                }
            });
            filterCards();
        });
    });

    if (typeFilter) {
        typeFilter.addEventListener('change', filterCards);
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', filterCards);
    }
})();
