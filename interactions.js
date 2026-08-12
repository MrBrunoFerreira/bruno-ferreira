(() => {
  const root = document.documentElement;
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress span");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let frameRequested = false;

  const updateScrollState = () => {
    frameRequested = false;
    const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const ratio = Math.min(Math.max(window.scrollY / scrollable, 0), 1);

    if (progress) {
      progress.style.transform = `scaleX(${ratio})`;
    }

    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 18);
    }
  };

  const queueScrollUpdate = () => {
    if (!frameRequested) {
      frameRequested = true;
      window.requestAnimationFrame(updateScrollState);
    }
  };

  window.addEventListener("scroll", queueScrollUpdate, { passive: true });
  window.addEventListener("resize", queueScrollUpdate, { passive: true });
  updateScrollState();

  const mainNav = document.querySelector(".main-nav");
  const navToggle = document.querySelector(".nav-toggle");

  if (header && mainNav && navToggle) {
    const setNavigationState = (isOpen) => {
      header.classList.toggle("nav-open", isOpen);
      mainNav.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? navToggle.dataset.labelClose : navToggle.dataset.labelOpen);
    };

    header.classList.add("nav-enhanced");
    navToggle.hidden = false;

    navToggle.addEventListener("click", () => {
      setNavigationState(navToggle.getAttribute("aria-expanded") !== "true");
    });

    mainNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setNavigationState(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setNavigationState(false);
        navToggle.focus();
      }
    });

    window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
      if (event.matches) setNavigationState(false);
    });
  }

  document.querySelectorAll(".publication-list").forEach((list) => {
    const more = list.querySelector(".publication-more");
    const toggle = list.querySelector(".publication-toggle");
    const label = toggle?.querySelector(".publication-toggle-label");

    if (!more || !toggle || !label) return;

    more.hidden = true;
    toggle.hidden = false;

    toggle.addEventListener("click", () => {
      const isExpanded = toggle.getAttribute("aria-expanded") === "true";

      more.hidden = isExpanded;
      toggle.setAttribute("aria-expanded", String(!isExpanded));
      label.textContent = isExpanded ? toggle.dataset.labelMore : toggle.dataset.labelLess;
    });
  });

  const revealElements = document.querySelectorAll([
    ".hero-copy > *",
    ".hero-profile",
    ".section-heading",
    ".about-statement",
    ".about-copy",
    ".about-process article",
    ".role-fit",
    ".project-card",
    ".timeline article",
    ".education-card",
    ".capability-grid article",
    ".publication-list article",
    ".contact-content > *",
  ].join(","));

  revealElements.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${(index % 4) * 65}ms`);
  });

  if (!reducedMotion && "IntersectionObserver" in window) {
    root.classList.add("motion-ready");

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.08,
    });

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  const sectionLinks = [...document.querySelectorAll('.main-nav > a[href^="#"]')];
  const observedSections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && observedSections.length) {
    const navigationObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      sectionLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${visible.target.id}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, {
      rootMargin: "-28% 0px -58% 0px",
      threshold: [0.01, 0.2, 0.5],
    });

    observedSections.forEach((section) => navigationObserver.observe(section));
  }

  if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
        card.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
      });

      card.addEventListener("pointerleave", () => {
        card.style.removeProperty("--pointer-x");
        card.style.removeProperty("--pointer-y");
      });
    });
  }
})();
