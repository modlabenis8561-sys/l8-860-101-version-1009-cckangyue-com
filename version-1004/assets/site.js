(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-nav]');

    if (navToggle && nav) {
        navToggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
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
    }

    if (slides.length) {
        showSlide(0);
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-movie-search]'));
    var genreFilter = document.querySelector('[data-genre-filter]');
    var regionFilter = document.querySelector('[data-region-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
        if (!cards.length) {
            return;
        }
        var keyword = normalize(searchInputs.map(function (input) { return input.value; }).filter(Boolean).pop() || '');
        var genreValue = normalize(genreFilter ? genreFilter.value : '');
        var regionValue = normalize(regionFilter ? regionFilter.value : '');

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search-text'));
            var genre = normalize(card.getAttribute('data-genre'));
            var region = normalize(card.getAttribute('data-region'));
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchedGenre = !genreValue || genre.indexOf(genreValue) !== -1;
            var matchedRegion = !regionValue || region.indexOf(regionValue) !== -1;
            card.classList.toggle('is-hidden', !(matchedKeyword && matchedGenre && matchedRegion));
        });
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', applyFilter);
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                applyFilter();
            }
        });
    });

    if (genreFilter) {
        genreFilter.addEventListener('change', applyFilter);
    }

    if (regionFilter) {
        regionFilter.addEventListener('change', applyFilter);
    }

    var playerCards = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    function bindPlayer(player) {
        var video = player.querySelector('video');
        var layer = player.querySelector('[data-play-layer]');
        var source = player.getAttribute('data-source');
        var started = false;

        function start() {
            if (!video || !source) {
                return;
            }
            if (layer) {
                layer.classList.add('hidden');
            }
            if (!started) {
                started = true;
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            hls.destroy();
                            video.src = source;
                            video.play().catch(function () {});
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.play().catch(function () {});
                } else {
                    video.src = source;
                    video.play().catch(function () {});
                }
            } else {
                video.play().catch(function () {});
            }
        }

        if (layer) {
            layer.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
        }
    }

    playerCards.forEach(bindPlayer);
})();
