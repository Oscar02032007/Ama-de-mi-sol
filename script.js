(function () {
  "use strict";

  var audio = document.getElementById("audio");
  var playBtn = document.getElementById("playBtn");
  var pauseBtn = document.getElementById("pauseBtn");
  var seek = document.getElementById("seek");
  var currentEl = document.getElementById("current");
  var durationEl = document.getElementById("duration");
  var coverBtn = document.getElementById("coverBtn");
  var modal = document.getElementById("modal");
  var modalClose = document.getElementById("modalClose");
  var subCurrent = document.getElementById("subCurrent");
  var subNext = document.getElementById("subNext");

  var lyrics = window.LYRICS || [];

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

  function syncButtons() {
    var playing = !audio.paused && !audio.ended;
    playBtn.hidden = playing;
    pauseBtn.hidden = !playing;
  }

  function updateLyrics(time) {
    var idx = -1;
    for (var i = 0; i < lyrics.length; i++) {
      if (time >= lyrics[i].t) idx = i;
      else break;
    }
    if (idx < 0 || idx >= lyrics.length) {
      subCurrent.textContent = "";
      subNext.textContent = "";
      return;
    }
    subCurrent.textContent = lyrics[idx].line;
    subNext.textContent =
      idx + 1 < lyrics.length ? lyrics[idx + 1].line : "";
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
    if (fn && inFullscreen()) fn.call(d);
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

  playBtn.addEventListener("click", function () {
    audio.play();
  });

  pauseBtn.addEventListener("click", function () {
    audio.pause();
  });

  audio.addEventListener("play", syncButtons);
  audio.addEventListener("pause", syncButtons);
  audio.addEventListener("ended", syncButtons);

  audio.addEventListener("loadedmetadata", function () {
    seek.max = audio.duration || 0;
    durationEl.textContent = formatTime(audio.duration);
    seek.max = audio.duration;
  });

  audio.addEventListener("timeupdate", function () {
    seek.value = audio.currentTime;
    currentEl.textContent = formatTime(audio.currentTime);
    if (seek.max !== audio.duration) seek.max = audio.duration;
    updateLyrics(audio.currentTime);
  });

  seek.addEventListener("input", function () {
    audio.currentTime = parseFloat(seek.value);
    currentEl.textContent = formatTime(seek.value);
    updateLyrics(audio.currentTime);
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