(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.from((scope || document).querySelectorAll(selector));
    }

    function openSearch() {
        var modal = qs('.search-modal');
        var input = qs('.global-search-input');
        if (!modal) {
            return;
        }
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        setTimeout(function () {
            if (input) {
                input.focus();
            }
        }, 30);
    }

    function closeSearch() {
        var modal = qs('.search-modal');
        if (!modal) {
            return;
        }
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function renderSearch(keyword) {
        var resultBox = qs('.global-search-results');
        if (!resultBox) {
            return;
        }
        var key = normalize(keyword);
        if (!key) {
            resultBox.innerHTML = '<p class="search-empty">输入片名、地区、类型或标签开始搜索。</p>';
            return;
        }
        var data = window.SEARCH_MOVIES || [];
        var items = data.filter(function (item) {
            var pool = [item.title, item.region, item.type, item.genre, (item.tags || []).join(' '), item.desc].join(' ');
            return normalize(pool).indexOf(key) !== -1;
        }).slice(0, 18);
        if (!items.length) {
            resultBox.innerHTML = '<p class="search-empty">没有找到相关影片。</p>';
            return;
        }
        resultBox.innerHTML = items.map(function (item) {
            return '<a class="search-result-item" href="' + item.url + '">' +
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
                '<span><strong>' + escapeHtml(item.title) + '</strong>' +
                '<span>' + escapeHtml(item.year + ' · ' + item.type + ' · ' + item.region) + '</span>' +
                '<span>' + escapeHtml(item.desc || '') + '</span></span>' +
                '</a>';
        }).join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupHero() {
        var slides = qsa('.hero-slide');
        var dots = qsa('.hero-dot');
        var prev = qs('.hero-prev');
        var next = qs('.hero-next');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('active', current === index);
            });
        }
        function start() {
            stop();
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide') || 0));
                start();
            });
        });
        start();
    }

    function setupLocalFilters() {
        var scope = qs('[data-filter-scope]');
        var list = qs('.local-filter-list');
        if (!scope || !list) {
            return;
        }
        var input = qs('.local-filter-input', scope);
        var selects = qsa('.local-filter-select', scope);
        var cards = qsa('.movie-card', list);
        function apply() {
            var key = normalize(input ? input.value : '');
            var selected = {};
            selects.forEach(function (select) {
                selected[select.getAttribute('data-filter-field')] = normalize(select.value);
            });
            cards.forEach(function (card) {
                var searchText = normalize(card.getAttribute('data-search') || card.getAttribute('data-title'));
                var visible = !key || searchText.indexOf(key) !== -1;
                Object.keys(selected).forEach(function (field) {
                    if (selected[field]) {
                        visible = visible && normalize(card.getAttribute('data-' + field)).indexOf(selected[field]) !== -1;
                    }
                });
                card.classList.toggle('is-filter-hidden', !visible);
            });
        }
        if (input) {
            input.addEventListener('input', apply);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
    }

    function setupNavigation() {
        var toggle = qs('.menu-toggle');
        var mobile = qs('.mobile-nav');
        if (toggle && mobile) {
            toggle.addEventListener('click', function () {
                mobile.classList.toggle('open');
            });
        }
        qsa('.search-open').forEach(function (button) {
            button.addEventListener('click', openSearch);
        });
        var close = qs('.search-close');
        if (close) {
            close.addEventListener('click', closeSearch);
        }
        var modal = qs('.search-modal');
        if (modal) {
            modal.addEventListener('click', function (event) {
                if (event.target === modal) {
                    closeSearch();
                }
            });
        }
        var input = qs('.global-search-input');
        if (input) {
            input.addEventListener('input', function () {
                renderSearch(input.value);
            });
        }
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeSearch();
            }
        });
        renderSearch('');
    }

    window.setupMoviePlayer = function (sourceUrl) {
        var video = qs('#playerVideo');
        var overlay = qs('#playerOverlay');
        if (!video || !sourceUrl) {
            return;
        }
        var started = false;
        function attachSource() {
            if (started) {
                return;
            }
            started = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }
        function play() {
            attachSource();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('click', play);
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupNavigation();
        setupHero();
        setupLocalFilters();
    });
})();
