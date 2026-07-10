(() => {
  "use strict";

  const root = document.documentElement;
  const nav = document.getElementById("mainNav");
  const progress = document.getElementById("scrollProgress");
  const backToTop = document.getElementById("backToTop");
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle?.querySelector("i");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  const year = document.getElementById("currentYear");
  if (year) year.textContent = new Date().getFullYear();
})();
