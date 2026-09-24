(function () {
  "use strict";

  function el(id) {
    return document.getElementById(id);
  }

  var audio = el("audio");
  var playBtn = el("playBtn");
  var iconPlay = el("iconPlay");
  var iconPause = el("iconPause");
  var seek = el("seek");
  var currentEl = el("current");
  var durationEl = el("duration");
  var coverBtn = el("coverBtn");
  var modal = el("modal");
  var modalClose = el("modalClose");
  var subCurrent = el("subCurrent");
  var subNext = el("subNext");
  var pageSubCurrent = el("pageSubCurrent");
  var pageSubNext = el("pageSubNext");

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
    var playing = audio && !audio.paused && !audio.ended;
    if (iconPlay) iconPlay.hidden = playing;
    if (iconPause) iconPause.hidden = !playing;
  }

  function updateLyrics(time) {
    var idx = -1;
    for (var i = 0; i < lyrics.length; i++) {
      if (time >= lyrics[i].t) idx = i;
      else break;
    }
    var currentLine = "";
    var nextLine = "";
    if (idx >= 0) {
      currentLine = lyrics[idx].line;
      nextLine = idx + 1 < lyrics.length ? lyrics[idx + 1].line : "";
    }
    if (subCurrent) subCurrent.textContent = currentLine;
    if (subNext) subNext.textContent = nextLine;
    if (pageSubCurrent) pageSubCurrent.textContent = currentLine;
    if (pageSubNext) pageSubNext.textContent = nextLine;
  }

  function enterFullscreen() {
    var el0 = document.documentElement;
    var req =
      el0.requestFullscreen ||
      el0.webkitRequestFullscreen ||
      el0.msRequestFullscreen;
    return req ? req.call(el0) : Promise.reject(new Error("no fullscreen"));
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
    if (!modal) return;
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
    if (modal) modal.classList.remove("open");
    if (inFullscreen()) exitFullscreen();
  }

  if (playBtn) playBtn.addEventListener("click", function () {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  });

  if (audio) {
    audio.addEventListener("play", syncButtons);
    audio.addEventListener("pause", syncButtons);
    audio.addEventListener("ended", syncButtons);
    audio.addEventListener("loadedmetadata", function () {
      if (seek) seek.max = audio.duration || 0;
      if (durationEl) durationEl.textContent = formatTime(audio.duration);
      if (seek) seek.max = audio.duration;
    });
    audio.addEventListener("timeupdate", function () {
      if (seek) {
        seek.value = audio.currentTime;
        if (seek.max !== audio.duration) seek.max = audio.duration;
      }
      if (currentEl) currentEl.textContent = formatTime(audio.currentTime);
      updateLyrics(audio.currentTime);
    });
  }

  if (seek) {
    seek.addEventListener("input", function () {
      if (audio) audio.currentTime = parseFloat(seek.value);
      if (currentEl) currentEl.textContent = formatTime(seek.value);
      updateLyrics(parseFloat(seek.value));
    });
  }

  if (coverBtn) coverBtn.addEventListener("click", openImage);
  if (modalClose) modalClose.addEventListener("click", closeImage);
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeImage();
    });
  }

  document.addEventListener("fullscreenchange", function () {
    if (!inFullscreen()) {
      if (modal) {
        modal.classList.remove("open");
        modal.classList.remove("kiosk");
      }
    }
  });
  document.addEventListener("webkitfullscreenchange", function () {
    if (!inFullscreen()) {
      if (modal) {
        modal.classList.remove("open");
        modal.classList.remove("kiosk");
      }
    }
  });
  document.addEventListener("MSFullscreenChange", function () {
    if (!inFullscreen()) {
      if (modal) {
        modal.classList.remove("open");
        modal.classList.remove("kiosk");
      }
    }
  });

  syncButtons();
})();