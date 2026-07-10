(() => {
  "use strict";

  const root = document.documentElement;
  const nav = document.getElementById("mainNav");
  const progress = document.getElementById("scrollProgress");
  const backToTop = document.getElementById("backToTop");
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle?.querySelector("i");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const storage = {
    get(key) {
      try { return window.localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, value); } catch { /* Storage may be unavailable in strict privacy contexts. */ }
    }
  };

  const setTheme = (theme) => {
    root.setAttribute("data-bs-theme", theme);
    storage.set("portfolio-theme", theme);
    if (themeIcon) {
      themeIcon.className = theme === "dark" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
    }
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute("content", theme === "dark" ? "#070b14" : "#f5f7fb");
  };

  const savedTheme = storage.get("portfolio-theme");
  setTheme(savedTheme || "dark");

  themeToggle?.addEventListener("click", () => {
    setTheme(root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark");
  });

  const onScroll = () => {
    const y = window.scrollY;
    nav?.classList.toggle("scrolled", y > 18);
    backToTop?.classList.toggle("visible", y > 500);

    const height = document.documentElement.scrollHeight - window.innerHeight;
    const percent = height > 0 ? (y / height) * 100 : 0;
    if (progress) progress.style.width = `${percent}%`;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });

  const revealElements = document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right, .reveal-scale");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("revealed"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -45px" });
    revealElements.forEach((element) => revealObserver.observe(element));
  }

  const navLinks = [...document.querySelectorAll(".navbar .nav-link")];
  const sections = [...document.querySelectorAll("main section[id]")];
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-35% 0px -55%", threshold: 0 });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const collapse = document.getElementById("navbarContent");
      if (collapse?.classList.contains("show") && window.bootstrap) {
        window.bootstrap.Collapse.getOrCreateInstance(collapse).hide();
      }
    });
  });

  const typewriter = document.getElementById("typewriter");
  if (typewriter && !reducedMotion) {
    let words;
    try {
      words = JSON.parse(typewriter.dataset.words || "[]");
    } catch {
      words = [];
    }

    if (words.length) {
      let wordIndex = 0;
      let charIndex = words[0].length;
      let deleting = true;

      const tick = () => {
        const word = words[wordIndex];
        charIndex += deleting ? -1 : 1;
        typewriter.textContent = word.slice(0, charIndex);

        let delay = deleting ? 34 : 58;
        if (!deleting && charIndex === word.length) {
          deleting = true;
          delay = 1500;
        } else if (deleting && charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          delay = 320;
        }
        window.setTimeout(tick, delay);
      };
      window.setTimeout(tick, 1200);
    }
  }

  /* Precision cursor: a fast core and a softly delayed targeting ring. */
  const cursorDot = document.getElementById("cursorDot");
  const cursorRing = document.getElementById("cursorRing");
  if (finePointer && !reducedMotion && cursorDot && cursorRing) {
    document.body.classList.add("cursor-enabled");
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let ringX = pointerX;
    let ringY = pointerY;

    const renderCursor = () => {
      ringX += (pointerX - ringX) * 0.16;
      ringY += (pointerY - ringY) * 0.16;
      cursorDot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      window.requestAnimationFrame(renderCursor);
    };

    window.addEventListener("mousemove", (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      document.body.classList.add("cursor-ready");
      document.body.classList.toggle("cursor-hover", Boolean(event.target.closest("a, button, [data-tilt]")));
    }, { passive: true });
    window.addEventListener("mousedown", () => document.body.classList.add("cursor-down"));
    window.addEventListener("mouseup", () => document.body.classList.remove("cursor-down"));
    window.addEventListener("mouseout", (event) => {
      if (!event.relatedTarget) document.body.classList.remove("cursor-ready");
    });
    renderCursor();
  }

  /* Subtle 3D response for featured surfaces. */
  if (finePointer && !reducedMotion) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -5;
        const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 5;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* Animated service graph: lightweight canvas nodes inspired by distributed systems. */
  const canvas = document.getElementById("techCanvas");
  if (canvas && !reducedMotion) {
    const context = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let nodes = [];
    let canvasPointer = { x: -1000, y: -1000 };
    let accentColor = getComputedStyle(root).getPropertyValue("--accent").trim();

    const makeNode = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      radius: Math.random() * 1.2 + 0.5
    });

    const resizeCanvas = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(64, Math.max(22, Math.floor(width / 28)));
      nodes = Array.from({ length: count }, makeNode);
      accentColor = getComputedStyle(root).getPropertyValue("--accent").trim();
    };

    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("mousemove", (event) => {
      canvasPointer = { x: event.clientX, y: event.clientY };
    }, { passive: true });
    themeToggle?.addEventListener("click", () => {
      window.setTimeout(() => { accentColor = getComputedStyle(root).getPropertyValue("--accent").trim(); }, 0);
    });

    const drawNetwork = () => {
      context.clearRect(0, 0, width, height);
      nodes.forEach((node, index) => {
        const pointerDistance = Math.hypot(node.x - canvasPointer.x, node.y - canvasPointer.y);
        if (pointerDistance < 130 && pointerDistance > 0) {
          node.x += ((node.x - canvasPointer.x) / pointerDistance) * 0.28;
          node.y += ((node.y - canvasPointer.y) / pointerDistance) * 0.28;
        }

        node.x += node.vx;
        node.y += node.vy;
        if (node.x < -10) node.x = width + 10;
        if (node.x > width + 10) node.x = -10;
        if (node.y < -10) node.y = height + 10;
        if (node.y > height + 10) node.y = -10;

        context.globalAlpha = 0.7;
        context.fillStyle = accentColor;
        context.beginPath();
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        context.fill();

        for (let otherIndex = index + 1; otherIndex < nodes.length; otherIndex += 1) {
          const other = nodes[otherIndex];
          const distance = Math.hypot(node.x - other.x, node.y - other.y);
          if (distance > 115) continue;
          context.globalAlpha = (1 - distance / 115) * 0.17;
          context.strokeStyle = accentColor;
          context.lineWidth = 0.6;
          context.beginPath();
          context.moveTo(node.x, node.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      });
      context.globalAlpha = 1;
      window.requestAnimationFrame(drawNetwork);
    };

    resizeCanvas();
    drawNetwork();
  }

  const year = document.getElementById("currentYear");
  if (year) year.textContent = new Date().getFullYear();
})();
