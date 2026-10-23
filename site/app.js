/* CodePixel Web — interactions */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const BN = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const bn = (n) => String(n).replace(/\d/g, (d) => BN[+d]);
  const pad = (n) => String(Math.floor(n)).padStart(2, "0");
  const fmt = (sec) => {
    if (!isFinite(sec) || sec < 0) sec = 0;
    return `${bn(pad(sec / 60))}:${bn(pad(sec % 60))}`;
  };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------- nav */
  const nav = $("#nav");
  const progress = $("#navProgress");
  const burger = $("#burger");
  const navLinks = $("#navLinks");
  const mobileCta = $("#mobileCta");

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-stuck", y > 24);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${h > 0 ? Math.min(100, (y / h) * 100) : 0}%`;
    if (mobileCta) mobileCta.classList.toggle("is-show", y > 700);
    // active link
    const secs = $$("main section[id]");
    let cur = "";
    for (const s of secs) if (s.getBoundingClientRect().top <= 140) cur = s.id;
    $$(".nav-links a").forEach((a) =>
      a.classList.toggle("is-active", a.getAttribute("href") === `#${cur}`)
    );
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  burger?.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!open));
    navLinks.classList.toggle("is-open", !open);
  });
  $$(".nav-links a").forEach((a) =>
    a.addEventListener("click", () => {
      burger?.setAttribute("aria-expanded", "false");
      navLinks.classList.remove("is-open");
    })
  );

  /* --------------------------------------------------------- reveal */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* --------------------------------------------------- hero parallax */
  const visual = $("[data-parallax]");
  if (visual && !reduce && window.matchMedia("(pointer:fine)").matches) {
    const layers = $$("[data-depth]", visual);
    let raf = 0;
    visual.addEventListener("mousemove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = visual.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        layers.forEach((l) => {
          const d = parseFloat(l.dataset.depth) || 0.04;
          l.style.translate = `${(-dx * d * 90).toFixed(2)}px ${(-dy * d * 90).toFixed(2)}px`;
        });
        raf = 0;
      });
    });
    visual.addEventListener("mouseleave", () => {
      layers.forEach((l) => (l.style.translate = "0 0"));
    });
  }

  /* ------------------------------------------------------------ video */
  const player = $("#player");
  const video = $("#promo");
  const posterCta = $("#posterCta");
  const fill = $("#fill");
  const buffer = $("#buffer");
  const knob = $("#knob");
  const scrub = $("#scrub");
  const tCur = $("#tCur");
  const tDur = $("#tDur");
  const puChapter = $("#puChapter");
  const chapters = $$(".chapter");
  const marks = $("#marks");
  const btnPlay = $("#btnPlay");
  const btnMute = $("#btnMute");
  const btnRate = $("#btnRate");
  const btnFs = $("#btnFs");
  const rateLabel = $("#rateLabel");

  let loaded = false;

  const CHAPTERS = chapters.map((c) => ({
    el: c,
    t: parseFloat(c.dataset.t),
    name: $(".ch-name", c)?.textContent || "",
  }));

  if (marks) {
    marks.innerHTML = CHAPTERS.slice(1)
      .map((c) => {
        const d = parseFloat(video?.dataset.duration || 492.356);
        return `<i style="left:${((c.t / d) * 100).toFixed(2)}%"></i>`;
      })
      .join("");
  }

  const ensureLoad = () => {
    if (loaded || !video) return;
    const src = video.dataset.src;
    if (src && !video.src) {
      video.src = src;
      video.load();
      loaded = true;
    }
  };

  const paint = () => {
    if (!video) return;
    const d = video.duration || 492.356;
    const p = d ? video.currentTime / d : 0;
    fill.style.width = `${p * 100}%`;
    knob.style.left = `${p * 100}%`;
    tCur.textContent = fmt(video.currentTime);
    scrub.setAttribute("aria-valuenow", String(Math.round(video.currentTime)));
    let name = CHAPTERS[0]?.name || "";
    for (const c of CHAPTERS) if (video.currentTime >= c.t - 0.05) name = c.name;
    if (puChapter) puChapter.textContent = name;
    CHAPTERS.forEach((c) => c.el.classList.toggle("is-active", c.name === name));
    try {
      if (video.buffered.length) {
        buffer.style.width = `${(video.buffered.end(video.buffered.length - 1) / d) * 100}%`;
      }
    } catch {}
  };

  const play = async () => {
    ensureLoad();
    player?.classList.add("is-active");
    try {
      await video.play();
    } catch {
      /* autoplay blocked */
    }
  };

  const seekTo = async (t, autoPlay = true) => {
    ensureLoad();
    player?.classList.add("is-active");
    const go = () => {
      video.currentTime = Math.min(Math.max(0, t), video.duration || t);
      paint();
      if (autoPlay) play();
    };
    if (video.readyState >= 1) go();
    else video.addEventListener("loadedmetadata", go, { once: true });
  };

  posterCta?.addEventListener("click", (e) => {
    e.stopPropagation();
    seekTo(0, true);
  });

  player?.addEventListener("click", (e) => {
    if (e.target.closest(".player-ui") || e.target.closest(".poster-cta")) return;
    if (!loaded) return seekTo(0, true);
    video.paused ? play() : video.pause();
  });

  video?.addEventListener("play", () => {
    player.classList.add("is-playing");
    posterCta?.classList.add("is-hidden");
  });
  video?.addEventListener("pause", () => player.classList.remove("is-playing"));
  video?.addEventListener("timeupdate", paint);
  video?.addEventListener("progress", paint);
  video?.addEventListener("loadedmetadata", () => {
    if (tDur && video.duration) tDur.textContent = fmt(video.duration);
    paint();
  });
  video?.addEventListener("ended", () => {
    player.classList.remove("is-playing");
    posterCta?.classList.remove("is-hidden");
  });

  btnPlay?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!loaded) return seekTo(0, true);
    video.paused ? play() : video.pause();
  });

  btnMute?.addEventListener("click", (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    player.classList.toggle("is-muted", video.muted);
  });

  const RATES = [1, 1.25, 1.5, 2, 0.75];
  let rateIdx = 0;
  btnRate?.addEventListener("click", (e) => {
    e.stopPropagation();
    rateIdx = (rateIdx + 1) % RATES.length;
    video.playbackRate = RATES[rateIdx];
    rateLabel.textContent = `${bn(String(RATES[rateIdx]).replace(".", "·"))}×`;
  });

  btnFs?.addEventListener("click", (e) => {
    e.stopPropagation();
    const el = player;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.().catch(() => {});
  });

  // scrubbing
  if (scrub) {
    let dragging = false;
    const seekFromEvent = (ev, setPaused) => {
      const r = scrub.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
      const d = video.duration || 492.356;
      const t = p * d;
      video.currentTime = t;
      paint();
      if (setPaused) video.pause();
    };
    scrub.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      dragging = true;
      ensureLoad();
      player.classList.add("is-active");
      scrub.setPointerCapture(e.pointerId);
      seekFromEvent(e, true);
    });
    scrub.addEventListener("pointermove", (e) => {
      if (dragging) seekFromEvent(e, true);
    });
    scrub.addEventListener("pointerup", (e) => {
      dragging = false;
      e.stopPropagation();
    });
    scrub.addEventListener("keydown", (e) => {
      const d = video.duration || 492.356;
      if (e.key === "ArrowRight") video.currentTime = Math.min(d, video.currentTime + 5);
      if (e.key === "ArrowLeft") video.currentTime = Math.max(0, video.currentTime - 5);
      if (e.key === " ") {
        e.preventDefault();
        video.paused ? play() : video.pause();
      }
      paint();
    });
  }

  chapters.forEach((c) =>
    c.addEventListener("click", () => {
      seekTo(parseFloat(c.dataset.t), true);
      player.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    })
  );

  $$(".scene").forEach((s) =>
    s.addEventListener("click", () => {
      seekTo(parseFloat(s.dataset.t), true);
      player.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    })
  );

  $$("[data-play-video]").forEach((b) =>
    b.addEventListener("click", () => {
      $("#video")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      setTimeout(() => seekTo(0, true), reduce ? 0 : 620);
    })
  );

  // keep player chapter list in sync while idle
  paint();

  /* ------------------------------------------------------- admin tabs */
  const adNav = $("#adNav");
  adNav?.addEventListener("click", (e) => {
    const btn = e.target.closest(".ad-item");
    if (!btn) return;
    $$(".ad-item", adNav).forEach((b) => b.classList.toggle("is-active", b === btn));
    const tab = btn.dataset.tab;
    $$(".ad-panel").forEach((p) => p.classList.toggle("is-active", p.dataset.panel === tab));
  });

  /* ------------------------------------------------------------ toast */
  const toastEl = $("#toast");
  let toastTimer = 0;
  const toast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2600);
  };

  $$("[data-copy]").forEach((b) =>
    b.addEventListener("click", async () => {
      const num = b.dataset.copy;
      try {
        await navigator.clipboard.writeText(num);
        toast(`নম্বর কপি হয়েছে: ${num}`);
        const lbl = $(".copy-label", b);
        if (lbl) {
          const old = lbl.textContent;
          lbl.textContent = "কপি হয়েছে ✓";
          setTimeout(() => (lbl.textContent = old), 2200);
        }
      } catch {
        toast(`নম্বর: ${num}`);
      }
    })
  );

  /* ------------------------------------------------------------- misc */
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();

  // smooth anchor offset handled by CSS scroll-padding
  $$('a[href^="#"]:not(.skip)').forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const t = $(id);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", id);
    })
  );

  // pause the promo when it leaves the viewport
  if ("IntersectionObserver" in window && video) {
    const vio = new IntersectionObserver(
      (en) => {
        en.forEach((x) => {
          if (!x.isIntersecting && !video.paused) video.pause();
        });
      },
      { threshold: 0.15 }
    );
    vio.observe(player);
  }
})();
