const companies = [
  {
    name: "Excited to Eat",
    type: "Social Campaign",
    views: "3 reels",
    shape: "excited",
    image: "company1.svg",
    morphPathIndex: 0,
    videos: [
      { title: "Video 1", src: "video1.mp4" },
      { title: "Video 2", src: "video2.mp4" },
      { title: "Video 3", src: "video3.mp4" },
    ],
  },
];

const MEDIA_VOLUME_SCALE = 0.25;

function capMediaVolume(media) {
  if (!media) return;

  media.volume = MEDIA_VOLUME_SCALE;
  media.addEventListener("volumechange", () => {
    if (media.volume > MEDIA_VOLUME_SCALE) media.volume = MEDIA_VOLUME_SCALE;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin, DrawSVGPlugin);
  initSignatureDrawState();

  renderCompanies();
  syncWorkLength();
  initEasedSnapScroll();
  initHeader();
  initActiveNav();
  initReveals();
  initSignatureScene();
  initContactForm();
  initVideoDialog();

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    initHeroDrawTimeline();
    initMorphScrollTriggers();
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(["#draw-gavin", "#draw-i-dot", "#signature-art",
              ".hero .eyebrow", ".hero h1", ".work-cta"], { opacity: 1, y: 0 });
    gsap.set("#draw-gavin", { drawSVG: "100%" });
    const p = document.querySelector("#path1");
    const m = document.querySelector("#morph-path");
    if (p && m) m.setAttribute("d", p.getAttribute("d"));
  });
});

function renderCompanies() {
  const track = document.querySelector("#company-track");
  if (!track) return;

  const fragment = document.createDocumentFragment();

  companies.forEach((company, index) => {
    const panel = document.createElement("article");
    panel.className = "company-panel";
    panel.id = `company-${index}`;

    const content = document.createElement("div");
    content.className = "company-content";

    if (company.image) {
      const logoSlot = document.createElement("div");
      logoSlot.className = "company-logo-slot";
      logoSlot.setAttribute("aria-hidden", "true");
      content.appendChild(logoSlot);
    }

    const title = document.createElement("h3");
    title.className = "company-name";
    title.textContent = company.name;

    const meta = document.createElement("p");
    meta.className = "video-meta";
    meta.textContent = `${company.type} · ${company.views}`;

    const grid = document.createElement("div");
    grid.className = "video-grid";

    company.videos.filter((video) => video.src).forEach((video, videoIndex) => {
      grid.appendChild(createVideoCard(company, video, index, videoIndex));
    });

    content.append(title, meta, grid);
    panel.appendChild(content);
    fragment.appendChild(panel);
  });

  track.appendChild(fragment);
}

function syncWorkLength() {
  const workSection = document.querySelector("#work");
  if (!workSection) return;

  workSection.style.setProperty("--work-min-height", `${Math.max(1, companies.length) * 100}svh`);
}

function initEasedSnapScroll() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const snapViewport = window.matchMedia("(min-width: 761px)");
  if (!snapViewport.matches) return;

  const panelSelector = ".hero, .company-panel, .contact";
  const ignoredSelector = "dialog, input, textarea, select, [contenteditable='true']";
  let isAnimating = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchHasSnapped = false;

  const getPanels = () => Array.from(document.querySelectorAll(panelSelector));
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const maxScrollY = () =>
    Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  const setScrollY = (top) => {
    window.scrollTo(0, top);
  };

  const getPanelTop = (panel) =>
    clamp(panel.getBoundingClientRect().top + window.scrollY, 0, maxScrollY());

  const getClosestPanelIndex = () => {
    const panels = getPanels();
    const viewportAnchor = window.scrollY + window.innerHeight * 0.45;

    return panels.reduce((closestIndex, panel, index) => {
      const currentDistance = Math.abs(getPanelTop(panel) - viewportAnchor);
      const closestDistance = Math.abs(getPanelTop(panels[closestIndex]) - viewportAnchor);
      return currentDistance < closestDistance ? index : closestIndex;
    }, 0);
  };

  const shouldIgnore = (target) => {
    if (document.querySelector("dialog[open]")) return true;
    const element = target instanceof Element ? target : null;
    return Boolean(element?.closest(ignoredSelector));
  };

  const shouldIgnoreKey = (target) => {
    const element = target instanceof Element ? target : null;
    return shouldIgnore(target) || Boolean(element?.closest("button"));
  };

  const shouldUsePanelSnap = () => {
    return snapViewport.matches;
  };

  const scrollToPanel = (index) => {
    const panels = getPanels();
    if (!panels.length) return;

    const targetIndex = clamp(index, 0, panels.length - 1);
    const startY = window.scrollY;
    const endY = getPanelTop(panels[targetIndex]);
    const distance = endY - startY;

    if (Math.abs(distance) < 2) return;

    const duration = clamp(Math.abs(distance) * 0.48, 560, 920);
    const startedAt = performance.now();
    isAnimating = true;

    const tick = (now) => {
      const progress = clamp((now - startedAt) / duration, 0, 1);
      const eased = easeOutCubic(progress);
      setScrollY(startY + distance * eased);

      if (progress < 1) {
        requestAnimationFrame(tick);
        return;
      }

      setScrollY(endY);
      isAnimating = false;
    };

    requestAnimationFrame(tick);
  };

  const getAdjacentPanelIndex = (direction) => {
    const panels = getPanels();
    if (!panels.length) return null;

    const targetIndex = getClosestPanelIndex() + direction;
    return targetIndex >= 0 && targetIndex < panels.length ? targetIndex : null;
  };

  const goToAdjacentPanel = (direction) => {
    const targetIndex = getAdjacentPanelIndex(direction);
    if (targetIndex === null) return false;

    scrollToPanel(targetIndex);
    return true;
  };

  window.addEventListener(
    "wheel",
    (event) => {
      if (shouldIgnore(event.target) || event.ctrlKey || event.metaKey) return;
      if (!shouldUsePanelSnap()) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      const direction = event.deltaY > 0 ? 1 : -1;
      if (!isAnimating && getAdjacentPanelIndex(direction) === null) return;

      event.preventDefault();
      if (isAnimating) return;

      goToAdjacentPanel(direction);
    },
    { passive: false }
  );

  window.addEventListener(
    "keydown",
    (event) => {
      if (shouldIgnoreKey(event.target) || event.altKey || event.ctrlKey || event.metaKey) return;
      if (!shouldUsePanelSnap()) return;

      const downKeys = ["ArrowDown", "PageDown"];
      const upKeys = ["ArrowUp", "PageUp"];
      const isSpace = event.key === " ";

      if (!downKeys.includes(event.key) && !upKeys.includes(event.key) && !isSpace) return;

      const direction = upKeys.includes(event.key) || (isSpace && event.shiftKey) ? -1 : 1;
      if (!isAnimating && getAdjacentPanelIndex(direction) === null) return;

      event.preventDefault();
      if (isAnimating) return;

      goToAdjacentPanel(direction);
    }
  );

  window.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchHasSnapped = false;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      if (shouldIgnore(event.target) || isAnimating || touchHasSnapped) return;
      if (!shouldUsePanelSnap()) return;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      if (Math.abs(deltaY) < 18 || Math.abs(deltaY) <= Math.abs(deltaX)) return;

      const direction = deltaY < 0 ? 1 : -1;
      if (!isAnimating && getAdjacentPanelIndex(direction) === null) return;

      event.preventDefault();
      touchHasSnapped = true;
      goToAdjacentPanel(direction);
    },
    { passive: false }
  );

  document.addEventListener("click", (event) => {
    const clicked = event.target instanceof Element ? event.target : null;
    const link = clicked?.closest('a[href^="#"]');
    if (!link || shouldIgnore(event.target)) return;
    if (!shouldUsePanelSnap()) return;

    const target = document.querySelector(link.getAttribute("href"));
    if (!target?.matches(panelSelector) && !target?.closest(panelSelector)) return;

    event.preventDefault();
    scrollToPanel(getPanels().findIndex((panel) => panel === target || panel.contains(target)));
  });
}

function createVideoCard(company, video, companyIndex, videoIndex) {
  const button = document.createElement("button");
  button.className = "video-card";
  button.type = "button";
  button.dataset.company = company.name;
  button.dataset.title = video.title;
  button.dataset.src = video.src || "";
  button.dataset.companyIndex = companyIndex;
  button.dataset.videoIndex = videoIndex;
  button.classList.toggle("has-video", Boolean(video.src));
  button.setAttribute("aria-label", `Open reel #${videoIndex + 1} for ${company.name}`);

  if (video.src) {
    const preview = document.createElement("video");
    preview.className = "video-preview";
    preview.src = video.src;
    preview.muted = true;
    preview.loop = true;
    preview.playsInline = true;
    preview.preload = "metadata";
    preview.setAttribute("aria-hidden", "true");

    button.addEventListener("mouseenter", () => {
      preview.play().catch(() => {});
    });
    button.addEventListener("mouseleave", () => {
      preview.pause();
      preview.currentTime = 0;
    });

    button.appendChild(preview);
  }

  const playMark = document.createElement("span");
  playMark.className = "play-mark";
  playMark.setAttribute("aria-hidden", "true");
  playMark.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>';

  const label = document.createElement("span");
  label.className = "video-card-cta";
  label.textContent = "View Reel →";

  button.append(playMark, label);
  return button;
}

function initHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return;

  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 16);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

function initActiveNav() {
  const links = Array.from(document.querySelectorAll(".nav-link"));
  const sections = ["#about", "#work", "#contact"];
  if (!links.length) return;

  const setActive = (id) =>
    links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === id));

  setActive("#about");
  sections.forEach((id) => {
    ScrollTrigger.create({
      trigger: id,
      start: "top 35%",
      end: "bottom 35%",
      onToggle: (self) => { if (self.isActive) setActive(id); },
    });
  });
}

function initReveals() {
  const panels = [...document.querySelectorAll(".company-panel")];
  if (!panels.length) return;

  const revealViewport = window.matchMedia("(min-width: 761px)");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !revealViewport.matches) {
    panels.forEach((panel) => panel.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    { threshold: 0.42 }
  );

  panels.forEach((panel) => observer.observe(panel));
}

function initSignatureScene() {
  const workSection = document.querySelector("#work");
  const contactSection = document.querySelector("#contact");
  const mobileWorkViewport = window.matchMedia("(max-width: 760px)");
  if (!workSection) return;

  const getActiveLogoSlot = () => {
    const slots = [...document.querySelectorAll(".company-logo-slot")];
    if (!slots.length) return null;

    const viewportAnchor = window.innerHeight * 0.24;
    return slots.reduce((closest, slot) => {
      const rect = slot.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - viewportAnchor);
      return !closest || distance < closest.distance
        ? { slot, distance }
        : closest;
    }, null)?.slot;
  };

  const update = () => {
    const workRect = workSection.getBoundingClientRect();
    const contactRect = contactSection?.getBoundingClientRect();
    const keepWorkArtwork =
      workRect.top <= window.innerHeight * 0.58 &&
      (!contactRect || contactRect.top > 0);
    const enteringContact = contactRect
      ? contactRect.top <= window.innerHeight * 0.72
      : false;

    document.body.classList.toggle("is-work-scene", keepWorkArtwork);

    let signatureY = keepWorkArtwork ? "23svh" : "32svh";
    if (keepWorkArtwork && mobileWorkViewport.matches) {
      const logoSlot = getActiveLogoSlot();
      if (logoSlot) {
        const slotRect = logoSlot.getBoundingClientRect();
        signatureY = `${Math.round(slotRect.top + slotRect.height / 2)}px`;
      }
    }

    document.documentElement.style.setProperty(
      "--signature-y", signatureY
    );
    document.documentElement.style.setProperty(
      "--signature-width", keepWorkArtwork ? "min(34vw, 430px)" : "min(62vw, 860px)"
    );
    document.documentElement.style.setProperty(
      "--signature-min-width", keepWorkArtwork ? "0px" : "min(78vw, 430px)"
    );
    document.documentElement.style.setProperty(
      "--signature-opacity", enteringContact ? "0" : "1"
    );
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  mobileWorkViewport.addEventListener("change", update);
}

function initSignatureDrawState() {
  gsap.set("#signature-art", { opacity: 1 });
  gsap.set("#draw-gavin", { opacity: 1, drawSVG: "0%" });
  gsap.set("#draw-i-dot", { opacity: 0, scale: 0, transformOrigin: "center" });
  gsap.set(".hero .eyebrow, .hero h1, .work-cta", { opacity: 0, y: 20 });
}

function initHeroDrawTimeline() {
  initSignatureDrawState();

  const dotStartTime = 1.4;
  const dotDuration = 0.25;

  const tl = gsap.timeline();
  tl.to("#draw-gavin", { drawSVG: "100%", duration: 2.6, ease: "power2.inOut" })
    .fromTo(
      "#draw-i-dot",
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: dotDuration, transformOrigin: "center", ease: "power2.out" },
      dotStartTime
    )
    .to(
      ".hero .eyebrow, .hero h1, .work-cta",
      { opacity: 1, y: 0, stagger: 0.18, duration: 0.6, ease: "power2.out" },
      dotStartTime + dotDuration + 0.2
    );
}

async function initMorphScrollTriggers() {
  const sourcePath = document.querySelector("#path1");
  const morphPath = document.querySelector("#morph-path");
  if (!sourcePath || !morphPath) return;

  const signaturePath = sourcePath.getAttribute("d");
  morphPath.setAttribute("d", signaturePath);

  const targetDByCompany = await Promise.all(
    companies.map(async (c) => {
      const res = await fetch(c.image);
      const text = await res.text();
      const doc = new DOMParser().parseFromString(text, "image/svg+xml");
      const path = doc.querySelectorAll("path")[c.morphPathIndex ?? 0];
      return normalizeExternalSvgPath(doc.documentElement, path);
    })
  );

  companies.forEach((_company, i) => {
    const prevD = i === 0 ? signaturePath : targetDByCompany[i - 1];
    gsap
      .timeline({
        scrollTrigger: {
          trigger: `#company-${i}`,
          start: "top 80%",
          end: "top 20%",
          scrub: 1,
        },
      })
      .fromTo(
        "#morph-path",
        { morphSVG: prevD },
        { morphSVG: { shape: targetDByCompany[i], shapeIndex: "auto" }, ease: "power3.inOut" }
      );
  });
}

function normalizeExternalSvgPath(svg, path) {
  if (!svg || !path) return "";

  const d = path.getAttribute("d");
  const viewBox = parseViewBox(svg.getAttribute("viewBox"));
  if (!d || !viewBox) return d || "";

  const isDesktop = window.matchMedia("(min-width: 761px)").matches;
  const targetWidth = isDesktop ? 72 : 48;
  const targetHeight = isDesktop ? 81 : 54;
  const target = {
    x: 112 - targetWidth / 2,
    y: 124 - targetHeight / 2,
    width: targetWidth,
    height: targetHeight,
  };
  const scale = Math.min(target.width / viewBox.width, target.height / viewBox.height);
  const sourceCenter = {
    x: viewBox.x + viewBox.width / 2,
    y: viewBox.y + viewBox.height / 2,
  };
  const targetCenter = {
    x: target.x + target.width / 2,
    y: target.y + target.height / 2,
  };

  const transformX = (x, relative) => relative ? x * scale : targetCenter.x + (x - sourceCenter.x) * scale;
  const transformY = (y, relative) => relative ? y * scale : targetCenter.y + (y - sourceCenter.y) * scale;

  return transformPathData(d, transformX, transformY);
}

function parseViewBox(viewBox) {
  const values = viewBox?.trim().split(/[\s,]+/).map(Number);
  if (!values || values.length !== 4 || values.some((value) => !Number.isFinite(value))) {
    return null;
  }

  return { x: values[0], y: values[1], width: values[2], height: values[3] };
}

function transformPathData(d, transformX, transformY) {
  const tokens = d.match(/[a-zA-Z]|[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi) || [];
  const output = [];
  let index = 0;
  let command = "";

  const isCommand = (token) => /^[a-zA-Z]$/.test(token);
  const read = () => Number(tokens[index++]);
  const write = (value) => output.push(Number(value.toFixed(3)).toString());

  while (index < tokens.length) {
    if (isCommand(tokens[index])) {
      command = tokens[index++];
      output.push(command);
    }

    const lower = command.toLowerCase();
    const relative = command === lower;

    if (lower === "z") continue;

    if (lower === "h") {
      while (index < tokens.length && !isCommand(tokens[index])) write(transformX(read(), relative));
      continue;
    }

    if (lower === "v") {
      while (index < tokens.length && !isCommand(tokens[index])) write(transformY(read(), relative));
      continue;
    }

    if (lower === "a") {
      while (index < tokens.length && !isCommand(tokens[index])) {
        const rx = read();
        const ry = read();
        const rotation = read();
        const largeArc = read();
        const sweep = read();
        const x = read();
        const y = read();
        write(transformX(rx, true));
        write(transformY(ry, true));
        write(rotation);
        write(largeArc);
        write(sweep);
        write(transformX(x, relative));
        write(transformY(y, relative));
      }
      continue;
    }

    while (index < tokens.length && !isCommand(tokens[index])) {
      write(transformX(read(), relative));
      if (index < tokens.length && !isCommand(tokens[index])) write(transformY(read(), relative));
    }
  }

  return output.join(" ");
}

function initContactForm() {
  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#form-status");
  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "Thanks. Gavin can connect this form once the delivery target is set.";
    form.reset();
  });
}

function initVideoDialog() {
  const dialog = document.querySelector("#video-dialog");
  if (!dialog) return;

  const company = dialog.querySelector("#dialog-company");
  const title = dialog.querySelector("#dialog-title");
  const meta = dialog.querySelector("#dialog-meta");
  const count = dialog.querySelector("#dialog-count");
  const prevButton = dialog.querySelector("#dialog-prev");
  const nextButton = dialog.querySelector("#dialog-next");
  const prevLabel = dialog.querySelector("#dialog-prev-label");
  const nextLabel = dialog.querySelector("#dialog-next-label");
  const copy = dialog.querySelector("#dialog-copy");
  const video = dialog.querySelector("#dialog-video");
  const closeButton = dialog.querySelector(".dialog-close");
  let activeCompanyIndex = 0;
  let activeVideoIndex = 0;

  capMediaVolume(video);

  const getActiveVideos = () =>
    (companies[activeCompanyIndex]?.videos || []).filter((reel) => reel.src);

  const loadReel = (videoIndex) => {
    const activeCompany = companies[activeCompanyIndex];
    const reels = getActiveVideos();
    const reel = reels[videoIndex];
    if (!activeCompany || !reel || !video) return;

    activeVideoIndex = videoIndex;
    company.textContent = activeCompany.name;
    title.textContent = `#${activeVideoIndex + 1}`;
    if (meta) meta.textContent = `${activeCompany.type} · ${activeCompany.views}`;
    if (count) count.textContent = `${activeVideoIndex + 1} / ${reels.length}`;

    const previousIndex = activeVideoIndex - 1;
    const nextIndex = activeVideoIndex + 1;
    if (prevButton && prevLabel) {
      prevButton.hidden = previousIndex < 0;
      if (previousIndex >= 0) {
        prevButton.setAttribute("aria-label", `Open reel #${previousIndex + 1}`);
        prevLabel.textContent = `#${previousIndex + 1}`;
      }
    }
    if (nextButton && nextLabel) {
      nextButton.hidden = nextIndex >= reels.length;
      if (nextIndex < reels.length) {
        nextButton.setAttribute("aria-label", `Open reel #${nextIndex + 1}`);
        nextLabel.textContent = `#${nextIndex + 1}`;
      }
    }

    video.hidden = false;
    video.src = reel.src;
    video.volume = MEDIA_VOLUME_SCALE;
    video.load();
    video.play().catch(() => {});
    copy.hidden = true;
    copy.textContent = "";
  };

  document.addEventListener("click", (event) => {
    const card = event.target.closest(".video-card");
    if (!card) return;

    activeCompanyIndex = Number(card.dataset.companyIndex || 0);
    loadReel(Number(card.dataset.videoIndex || 0));

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  });

  prevButton?.addEventListener("click", () => loadReel(Math.max(0, activeVideoIndex - 1)));
  nextButton?.addEventListener("click", () => {
    const reels = getActiveVideos();
    loadReel(Math.min(reels.length - 1, activeVideoIndex + 1));
  });

  closeButton?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    if (!video) return;
    video.pause();
    video.removeAttribute("src");
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}
