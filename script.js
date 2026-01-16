/* =========================
   Helpers
   ========================= */
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

/* =========================
   Year
   ========================= */
(() => {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
})();

/* =========================
   Smooth scroll + active link
   ========================= */
const navLinks = $$(".nav-link");
const sections = ["resume", "projects", "contact"]
  .map(id => document.getElementById(id))
  .filter(Boolean);

function setActiveLink(id) {
  navLinks.forEach(a =>
    a.classList.toggle("active", a.getAttribute("href") === `#${id}`)
  );
}

function onScrollActive() {
  const y = window.scrollY + 140;
  let current = sections?.[0]?.id || "resume";

  for (const sec of sections) {
    if (sec.offsetTop <= y) current = sec.id;
  }
  setActiveLink(current);
}
window.addEventListener("scroll", onScrollActive, { passive: true });

navLinks.forEach(a => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    closeMobileNav();
  });
});

/* =========================
   Mobile nav toggle
   ========================= */
const navToggle = $("#navToggle");
const primaryNav = $("#primaryNav");

function openMobileNav() {
  if (!primaryNav || !navToggle) return;
  primaryNav.classList.add("open");
  navToggle.setAttribute("aria-expanded", "true");
}
function closeMobileNav() {
  if (!primaryNav || !navToggle) return;
  primaryNav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}

if (navToggle && primaryNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = primaryNav.classList.contains("open");
    isOpen ? closeMobileNav() : openMobileNav();
  });

  document.addEventListener("click", (e) => {
    const clickedInside = primaryNav.contains(e.target) || navToggle.contains(e.target);
    if (!clickedInside) closeMobileNav();
  });
}

/* =========================
   Scroll progress bar
   ========================= */
const scrollProgress = $("#scrollProgress");
function updateScrollProgress() {
  if (!scrollProgress) return;
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop || document.body.scrollTop;
  const height = doc.scrollHeight - doc.clientHeight;
  const pct = height > 0 ? (scrollTop / height) * 100 : 0;
  scrollProgress.style.width = `${pct}%`;
}
window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

/* =========================
   Reveal on scroll
   ========================= */
const revealEls = $$(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

/* =========================
   Contact form validation
   ========================= */
const form = $("#contactForm");
const statusEl = $("#formStatus");

function setFieldError(name, message) {
  const err = document.querySelector(`[data-error-for="${name}"]`);
  if (err) err.textContent = message || "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim());
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = $("#name")?.value.trim() || "";
    const email = $("#email")?.value.trim() || "";
    const message = $("#message")?.value.trim() || "";

    let ok = true;
    ["name", "email", "message"].forEach(n => setFieldError(n, ""));

    if (name.length < 2) { setFieldError("name", "Please enter your name (at least 2 characters)."); ok = false; }
    if (!isValidEmail(email)) { setFieldError("email", "Please enter a valid email address."); ok = false; }
    if (message.length < 10) { setFieldError("message", "Please write a message (at least 10 characters)."); ok = false; }

    if (!ok) {
      if (statusEl) { statusEl.textContent = "Please fix the errors above."; statusEl.style.color = "red"; }
      return;
    }

    if (statusEl) {
      statusEl.textContent = "Sending message...";
      statusEl.style.color = "black";
    }

    const formData = new FormData(form);
    fetch("send_email.php", { method: "POST", body: formData })
      .then(res => res.json())
      .then(result => {
        if (statusEl) {
          statusEl.textContent = result.message;
          statusEl.style.color = result.status === "success" ? "green" : "red";
        }
        if (result.status === "success") form.reset();
      })
      .catch(() => {
        if (statusEl) {
          statusEl.textContent = "There was an error sending your message.";
          statusEl.style.color = "red";
        }
      });
  });
}


/* =========================
   PDF modal (Certifications)
   ========================= */
const pdfModal = $("#pdfModal");
const openPdfBtn = $("#openPdfBtn");
const closePdfBtn = $("#closePdfBtn");

function openModal() {
  if (!pdfModal) return;
  pdfModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  if (!pdfModal) return;
  pdfModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

if (openPdfBtn) openPdfBtn.addEventListener("click", openModal);
if (closePdfBtn) closePdfBtn.addEventListener("click", closeModal);

if (pdfModal) {
  pdfModal.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target.getAttribute && target.getAttribute("data-close-modal") === "true") {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && pdfModal.getAttribute("aria-hidden") === "false") {
      closeModal();
    }
  });
}
