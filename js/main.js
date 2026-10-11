/* R26-SE-018 research website. Small, dependency free.
   Every page works without this file; it only adds motion and convenience. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* navbar: transparent over the banner, solid once the page scrolls */
  var nav = document.querySelector(".navbar");
  var back = document.querySelector(".back-top");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("scrolled", y > 30);
    if (back) back.classList.toggle("show", y > 600);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* mobile menu */
  var btn = document.querySelector(".menu-btn");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("menu-open", open);
    });
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
      });
    });
  }

  /* reveal on scroll */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* count-up numbers */
  var counters = document.querySelectorAll("[data-count]");
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
    var start = null, dur = 1400;
    function fmt(v) { return v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }); }
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = fmt(target); }, dur + 150);   /* always end on the real value */
  }
  if ("IntersectionObserver" in window && !reduce && counters.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* domain page: highlight the section in view */
  var sideLinks = document.querySelectorAll(".sidebar a[href^='#']");
  if (sideLinks.length && "IntersectionObserver" in window) {
    var map = {};
    sideLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          sideLinks.forEach(function (a) { a.classList.remove("active"); });
          map[e.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* documents page: filter by category */
  var filters = document.querySelectorAll(".filter");
  filters.forEach(function (f) {
    f.addEventListener("click", function () {
      var cat = f.getAttribute("data-filter");
      filters.forEach(function (x) { x.classList.toggle("active", x === f); x.setAttribute("aria-pressed", x === f ? "true" : "false"); });
      document.querySelectorAll(".doc-card").forEach(function (c) {
        c.hidden = !(cat === "all" || c.getAttribute("data-cat") === cat);
      });
    });
  });

  /* milestones page: jump to the chosen milestone */
  var msSelect = document.getElementById("ms-select");
  if (msSelect) {
    msSelect.addEventListener("change", function () {
      var el = document.getElementById(msSelect.value);
      if (!el) return;
      document.querySelectorAll(".tl-item").forEach(function (i) { i.classList.toggle("focus", i === el); });
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  }

  /* toast */
  function toast(msg) {
    var t = document.querySelector(".toast");
    if (!t) return;
    t.querySelector("span").textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* contact page: copy the template, and send the form through the visitor's email app */
  var copyBtn = document.getElementById("copy-template");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = document.getElementById("template-text").innerText;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { toast("Template copied to the clipboard"); },
          function () { toast("Select the template text and copy it"); });
      } else {
        toast("Select the template text and copy it");
      }
    });
  }
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var d = new FormData(form);
      var to = form.getAttribute("data-to");
      var subject = "R26-SE-018 | " + (d.get("topic") || "General enquiry");
      var body = "Name: " + d.get("name") + "\nEmail: " + d.get("email") + "\n\n" + d.get("message");
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      toast("Opening your email app");
    });
  }
})();
