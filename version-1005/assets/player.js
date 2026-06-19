function initMoviePlayer(videoId, coverId, sourceUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var hlsInstance = null;

    if (!video || !cover || !sourceUrl) {
        return;
    }

    function prepareVideo() {
        if (video.getAttribute('data-ready') === '1') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
        } else {
            video.src = sourceUrl;
        }

        video.setAttribute('data-ready', '1');
    }

    function startPlayback() {
        prepareVideo();
        cover.classList.add('is-hidden');
        video.play().catch(function () {});
    }

    cover.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });
    video.addEventListener('ended', function () {
        if (hlsInstance && hlsInstance.stopLoad) {
            hlsInstance.stopLoad();
        }
    });
}
