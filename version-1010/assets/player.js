function initMoviePlayer(url) {
  var video = document.getElementById("movie-player");
  var layer = document.getElementById("player-cover");
  var button = document.getElementById("play-button");
  var started = false;
  var hlsInstance = null;

  if (!video || !layer || !button || !url) {
    return;
  }

  function begin() {
    if (!started) {
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
      video.setAttribute("controls", "controls");
      layer.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function() {});
    }
  }

  button.addEventListener("click", begin);
  layer.addEventListener("click", begin);
  layer.addEventListener("keydown", function(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      begin();
    }
  });
  video.addEventListener("click", function() {
    if (!started) {
      begin();
    }
  });
  window.addEventListener("pagehide", function() {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
