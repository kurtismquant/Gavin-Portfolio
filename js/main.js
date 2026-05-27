const companies = [
  {
    name: "Luxe Beauty",
    type: "Product Launch",
    views: "2.1M",
    shape: "luxe",
    videos: [{ title: "Teaser" }, { title: "Unboxing" }, { title: "Tutorial" }],
  },
  {
    name: "Nova Tech",
    type: "Brand Awareness",
    views: "4.7M",
    shape: "nova",
    videos: [{ title: "Launch" }, { title: "Demo" }, { title: "Story" }, { title: "BTS" }],
  },
  {
    name: "Apex Fitness",
    type: "UGC Campaign",
    views: "1.8M",
    shape: "apex",
    videos: [{ title: "Before/After" }, { title: "Routine" }],
  },
];

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.addEventListener("DOMContentLoaded", () => {
  renderCompanies();
  initHeader();
  initActiveNav();
  initReveals();
  initMorphingSignature();
  initContactForm();
  initVideoDialog();
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

    const title = document.createElement("h3");
    title.className = "company-name";
    title.textContent = company.name;

    const meta = document.createElement("p");
    meta.className = "video-meta";
    meta.textContent = `${company.type} \u00b7 ${company.views} views`;

    const grid = document.createElement("div");
    grid.className = "video-grid";

    company.videos.forEach((video) => {
      grid.appendChild(createVideoCard(company, video));
    });

    content.append(title, meta, grid);
    panel.appendChild(content);
    fragment.appendChild(panel);
  });

  track.appendChild(fragment);
}

function createVideoCard(company, video) {
  const button = document.createElement("button");
  button.className = "video-card";
  button.type = "button";
  button.dataset.company = company.name;
  button.dataset.title = video.title;

  const playMark = document.createElement("span");
  playMark.className = "play-mark";
  playMark.setAttribute("aria-hidden", "true");
  playMark.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>';

  const label = document.createElement("span");
  label.textContent = video.title;

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
  const sections = [...document.querySelectorAll("main > section[id]")];
  const links = [...document.querySelectorAll(".nav-link")];
  if (!sections.length || !links.length) return;

  const updateActiveLink = () => {
    const current = sections.reduce((active, section) => {
      const distance = Math.abs(section.getBoundingClientRect().top - window.innerHeight * 0.22);
      return distance < active.distance ? { id: section.id, distance } : active;
    }, { id: sections[0].id, distance: Infinity });

    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${current.id}`);
    });
  };

  updateActiveLink();
  window.addEventListener("scroll", updateActiveLink, { passive: true });
}

function initReveals() {
  const panels = [...document.querySelectorAll(".company-panel")];
  if (!panels.length) return;

  if (prefersReducedMotion.matches) {
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

function initMorphingSignature() {
  const sourcePath = document.querySelector("#path1");
  const morphPath = document.querySelector("#morph-path");
  const workSection = document.querySelector("#work");
  if (!sourcePath || !morphPath || !workSection) return;

  const sourceSegments = parsePathToAbsolute(sourcePath.getAttribute("d"));
  if (!sourceSegments.length) return;

  const shapeSegments = companies.map((company) => createTargetSegments(sourceSegments, company.shape));
  const states = [sourceSegments, ...shapeSegments, sourceSegments];

  morphPath.setAttribute("d", segmentsToD(sourceSegments));

  if (prefersReducedMotion.matches) {
    return;
  }

  let ticking = false;

  const updateMorph = () => {
    ticking = false;

    const scrollable = Math.max(1, workSection.offsetHeight - window.innerHeight);
    const progress = clamp(-workSection.getBoundingClientRect().top / scrollable, 0, 1);
    const scaled = progress * (states.length - 1);
    const index = Math.min(states.length - 2, Math.floor(scaled));
    const localProgress = easeInOutCubic(scaled - index);

    morphPath.setAttribute("d", segmentsToD(interpolateSegments(states[index], states[index + 1], localProgress)));
  };

  const requestMorph = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateMorph);
  };

  updateMorph();
  window.addEventListener("scroll", requestMorph, { passive: true });
  window.addEventListener("resize", requestMorph);
}

function parsePathToAbsolute(d) {
  const tokens = d.match(/[a-zA-Z]|[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi) || [];
  const segments = [];
  let index = 0;
  let command = "";
  let current = { x: 0, y: 0 };
  let subpathStart = { x: 0, y: 0 };

  const isCommand = (token) => /^[a-zA-Z]$/.test(token);
  const readNumber = () => Number(tokens[index++]);
  const hasNumbers = () => index < tokens.length && !isCommand(tokens[index]);

  while (index < tokens.length) {
    if (isCommand(tokens[index])) {
      command = tokens[index++];
    }

    const normalized = command.toLowerCase();
    const relative = command === normalized;

    if (normalized === "z") {
      segments.push({ type: "Z", values: [] });
      current = { ...subpathStart };
      command = "";
      continue;
    }

    if (normalized === "m") {
      while (hasNumbers()) {
        const x = readNumber();
        const y = readNumber();
        current = relative ? { x: current.x + x, y: current.y + y } : { x, y };
        subpathStart = { ...current };
        segments.push({ type: "M", values: [current.x, current.y] });
      }
      continue;
    }

    if (normalized === "c") {
      while (hasNumbers()) {
        const x1 = readNumber();
        const y1 = readNumber();
        const x2 = readNumber();
        const y2 = readNumber();
        const x = readNumber();
        const y = readNumber();
        const values = relative
          ? [current.x + x1, current.y + y1, current.x + x2, current.y + y2, current.x + x, current.y + y]
          : [x1, y1, x2, y2, x, y];

        segments.push({ type: "C", values });
        current = { x: values[4], y: values[5] };
      }
      continue;
    }

    if (normalized === "l") {
      while (hasNumbers()) {
        const x = readNumber();
        const y = readNumber();
        current = relative ? { x: current.x + x, y: current.y + y } : { x, y };
        segments.push({ type: "L", values: [current.x, current.y] });
      }
    }
  }

  return segments;
}

function createTargetSegments(sourceSegments, shape) {
  const targetSegments = [];
  const drawableCount = Math.max(1, sourceSegments.filter((segment) => segment.type === "M" || segment.type === "C" || segment.type === "L").length);
  let cursor = 0;
  let current = shapePoint(shape, 0);
  let subpathStart = current;

  sourceSegments.forEach((segment) => {
    if (segment.type === "M") {
      current = shapePoint(shape, cursor / drawableCount);
      subpathStart = current;
      cursor += 1;
      targetSegments.push({ type: "M", values: [current.x, current.y] });
      return;
    }

    if (segment.type === "C") {
      const t = cursor / drawableCount;
      const end = shapePoint(shape, t);
      const startTangent = shapeTangent(shape, Math.max(0, t - 1 / drawableCount));
      const endTangent = shapeTangent(shape, t);
      const distance = Math.hypot(end.x - current.x, end.y - current.y);
      const handle = clamp(distance * 0.45, 7, 22);
      const values = [
        current.x + startTangent.x * handle,
        current.y + startTangent.y * handle,
        end.x - endTangent.x * handle,
        end.y - endTangent.y * handle,
        end.x,
        end.y,
      ];

      targetSegments.push({ type: "C", values });
      current = end;
      cursor += 1;
      return;
    }

    if (segment.type === "L") {
      const end = shapePoint(shape, cursor / drawableCount);
      targetSegments.push({ type: "L", values: [end.x, end.y] });
      current = end;
      cursor += 1;
      return;
    }

    targetSegments.push({ type: "Z", values: [] });
    current = subpathStart;
  });

  return targetSegments;
}

function shapePoint(shape, t) {
  const angle = t * Math.PI * 2;
  const center = { x: 112, y: 126 };

  if (shape === "luxe") {
    const radius = 38 + Math.sin(angle * 4) * 7;
    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius * 0.58,
    };
  }

  if (shape === "nova") {
    const radius = 44 * (0.88 + Math.cos(angle * 5) * 0.12);
    return {
      x: center.x + signedPower(Math.cos(angle), 0.68) * radius,
      y: center.y + signedPower(Math.sin(angle), 0.68) * radius * 0.56,
    };
  }

  return {
    x: center.x + Math.sin(angle) * 52,
    y: center.y + Math.sin(angle) * Math.cos(angle) * 34,
  };
}

function shapeTangent(shape, t) {
  const before = shapePoint(shape, wrap01(t - 0.006));
  const after = shapePoint(shape, wrap01(t + 0.006));
  const x = after.x - before.x;
  const y = after.y - before.y;
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
}

function interpolateSegments(fromSegments, toSegments, progress) {
  return fromSegments.map((fromSegment, index) => {
    const toSegment = toSegments[index];
    return {
      type: fromSegment.type,
      values: fromSegment.values.map((value, valueIndex) => {
        return value + (toSegment.values[valueIndex] - value) * progress;
      }),
    };
  });
}

function segmentsToD(segments) {
  return segments
    .map((segment) => {
      if (segment.type === "Z") return "Z";
      return `${segment.type} ${segment.values.map((value) => value.toFixed(3)).join(" ")}`;
    })
    .join(" ");
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
  const copy = dialog.querySelector("#dialog-copy");
  const closeButton = dialog.querySelector(".dialog-close");

  document.addEventListener("click", (event) => {
    const card = event.target.closest(".video-card");
    if (!card) return;

    company.textContent = card.dataset.company;
    title.textContent = card.dataset.title;
    copy.textContent = "Placeholder reel preview. Add Gavin's real video link or thumbnail to the company data when the campaign assets are ready.";

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  });

  closeButton?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function wrap01(value) {
  return ((value % 1) + 1) % 1;
}

function signedPower(value, power) {
  return Math.sign(value) * Math.pow(Math.abs(value), power);
}

function easeInOutCubic(value) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}
