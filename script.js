(function () {
  "use strict";

  var audio = document.getElementById("audio");
  var playBtn = document.getElementById("playBtn");
  var iconPlay = document.getElementById("iconPlay");
  var iconPause = document.getElementById("iconPause");
  var seek = document.getElementById("seek");
  var currentEl = document.getElementById("current");
  var durationEl = document.getElementById("duration");
  var coverBtn = document.getElementById("coverBtn");
  var modal = document.getElementById("modal");
  var modalClose = document.getElementById("modalClose");

  var MOBILE_MAX = 767;

  function isMobile() {
    return window.matchMedia("(max-width: " + MOBILE_MAX + "px)").matches;
  }

  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return "0:00";
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function togglePlay() {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }

  function syncPlayIcon() {
    var playing = !audio.paused && !audio.ended;
    iconPlay.hidden = playing;
    iconPause.hidden = !playing;
  }

  function enterFullscreen() {
    var el = document.documentElement;
    var req =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.msRequestFullscreen;
    return req ? req.call(el) : Promise.reject(new Error("no fullscreen"));
  }

  function exitFullscreen() {
    var d = document;
    var fn =
      d.exitFullscreen ||
      d.webkitExitFullscreen ||
      d.msExitFullscreen;
    if (fn && d.fullscreenElement) fn.call(d);
  }

  function inFullscreen() {
    return Boolean(
      document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
    );
  }

  function openImage() {
    modal.classList.add("open");
    if (isMobile()) {
      modal.classList.add("kiosk");
      enterFullscreen().catch(function () {
        // Sin soporte de pantalla completa: el modal ya cubre toda la pantalla.
      });
    } else {
      modal.classList.remove("kiosk");
    }
  }

  function closeImage() {
    modal.classList.remove("open");
    if (inFullscreen()) exitFullscreen();
  }

  playBtn.addEventListener("click", togglePlay);
  audio.addEventListener("play", syncPlayIcon);
  audio.addEventListener("pause", syncPlayIcon);
  audio.addEventListener("ended", syncPlayIcon);

  audio.addEventListener("loadedmetadata", function () {
    seek.max = audio.duration || 0;
    durationEl.textContent = formatTime(audio.duration);
    seek.max = audio.duration;
  });

  audio.addEventListener("timeupdate", function () {
    seek.value = audio.currentTime;
    currentEl.textContent = formatTime(audio.currentTime);
    if (seek.max !== audio.duration) seek.max = audio.duration;
  });

  seek.addEventListener("input", function () {
    audio.currentTime = parseFloat(seek.value);
    currentEl.textContent = formatTime(seek.value);
  });

  coverBtn.addEventListener("click", openImage);
  modalClose.addEventListener("click", closeImage);

  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeImage();
  });

  document.addEventListener("fullscreenchange", function () {
    if (!inFullscreen()) {
      modal.classList.remove("open");
      modal.classList.remove("kiosk");
    }
  });
  document.addEventListener("webkitfullscreenchange", function () {
    if (!inFullscreen()) {
      modal.classList.remove("open");
      modal.classList.remove("kiosk");
    }
  });
  document.addEventListener("MSFullscreenChange", function () {
    if (!inFullscreen()) {
      modal.classList.remove("open");
      modal.classList.remove("kiosk");
    }
  });
})();