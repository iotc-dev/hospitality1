/* =============================================================
   MODA hospitality landing page
   One file, no dependencies, loaded with defer.
   Everything is guarded, because privacy.html and thankyou.html
   load the same script and most of these elements are absent.
   ============================================================= */
(function () {
  "use strict";

  /* -----------------------------------------------------------
     1. Image slots
     Marks any slot whose image has not been supplied yet, so a
     broken-image icon never renders. The neutral block keeps the
     layout accurate until the real file is dropped in.
     ----------------------------------------------------------- */
  function initSlots() {
    var slots = document.querySelectorAll("[data-slot]");
    Array.prototype.forEach.call(slots, function (slot) {
      var img = slot.querySelector("img");
      if (!img) return;
      if (img.complete) {
        if (!img.naturalWidth) slot.classList.add("is-empty");
      } else {
        img.addEventListener("error", function () {
          slot.classList.add("is-empty");
        });
      }
    });
  }

  /* -----------------------------------------------------------
     2. Hero headline swap by ad group
     ?v=hotel | restaurant | cafe | bar
     Rewrites the hero headline, moves the matching venue card to
     the front, and preselects the venue type in both forms.
     With no parameter the default headline stays exactly as
     written in the markup.
     ----------------------------------------------------------- */
  var HEADLINES = {
    hotel:      "Still and sparkling water systems for hotels",
    restaurant: "Still and sparkling water systems for restaurants",
    cafe:       "Still and sparkling water on tap for your cafe",
    bar:        "Sparkling water on tap behind your bar"
  };

  function initVenueVariant() {
    var params = new URLSearchParams(window.location.search);
    var v = (params.get("v") || "").toLowerCase();
    if (!HEADLINES.hasOwnProperty(v)) return;

    var title = document.getElementById("heroTitle");
    if (title) title.textContent = HEADLINES[v];

    // Move the visitor's own venue card to the front of the grid.
    var grid = document.getElementById("venueGrid");
    if (grid) {
      var card = grid.querySelector('[data-venue="' + v + '"]');
      if (card) grid.insertBefore(card, grid.firstElementChild);
    }

    // Preselect the venue type so the visitor has one less field to fill.
    var selects = document.querySelectorAll("[data-venue-select]");
    Array.prototype.forEach.call(selects, function (sel) {
      if (sel.querySelector('option[value="' + v + '"]')) sel.value = v;
    });
  }

  /* -----------------------------------------------------------
     3. FAQ accordion
     Closed by default. Buttons carry aria-expanded and
     aria-controls, panels carry role and hidden.
     ----------------------------------------------------------- */
  function initAccordion() {
    var buttons = document.querySelectorAll(".acc__btn");
    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener("click", function () {
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        if (!panel) return;
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        panel.hidden = open;
      });
    });
  }

  /* -----------------------------------------------------------
     4. Sticky bottom bar
     Appears once the visitor is past the hero, and hides whenever
     a form is on screen so it never covers the thing it points at.
     A scroll threshold is needed as well as the observer, because
     at the top of a long page the form is already out of view.
     ----------------------------------------------------------- */
  function initStickybar() {
    var bar = document.getElementById("stickybar");
    if (!bar) return;

    document.body.classList.add("has-stickybar");

    var forms = document.querySelectorAll(".formcard");
    var ticking = false;

    function formOnScreen() {
      var vh = window.innerHeight;
      for (var i = 0; i < forms.length; i++) {
        var r = forms[i].getBoundingClientRect();
        // Any meaningful part of a form visible counts as on screen.
        if (r.top < vh - 80 && r.bottom > 80) return true;
      }
      return false;
    }

    function update() {
      ticking = false;
      var scrolledEnough = window.pageYOffset > 320;
      bar.classList.toggle("is-visible", scrolledEnough && !formOnScreen());
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* -----------------------------------------------------------
     5. Forms
     Validation in JS so messaging is consistent across browsers.
     Validate on blur, clear the error as soon as it is fixed.

     Submission: posted as JSON to the HubSpot Forms API v3, so the
     markup and the styling of the form stay entirely ours. The
     HubSpot tracking script is loaded through GTM and sets the
     hubspotutk cookie, which is passed through as context.hutk so
     the submission is attributed to the right contact. A successful
     post pushes a form_submission event to the dataLayer for GTM
     and then sends the visitor to thankyou.html.
     ----------------------------------------------------------- */
  var THANKS_URL = "thankyou.html";

  // HubSpot destination. Portal 5379330, form GUID decoded from the
  // share link. Verify the GUID against the form's URL in HubSpot
  // before going live, it is the only value here that was not given
  // to us directly.
  var HS_PORTAL_ID = "5379330";
  var HS_FORM_ID = "6cf5665f-7f07-4162-85f8-7dc4d3173452";
  var HS_ENDPOINT = "https://api.hsforms.com/submissions/v3/integration/submit/"
    + HS_PORTAL_ID + "/" + HS_FORM_ID;

  var GCLID_KEY = "moda_gclid";
  var HS_ERROR = "Something went wrong. Please try again, or call us on 1800 006 632.";
  var AU_PHONE = /^(\+?61|0)[\s-]?[2-478](?:[\s-]?\d){8}$/;
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function fieldOf(el) {
    return el.closest ? el.closest(".field") : null;
  }

  function setError(el, message) {
    var field = fieldOf(el);
    if (!field) return;
    var slot = field.querySelector("[data-error]");
    if (message) {
      field.classList.add("is-invalid");
      if (slot) slot.textContent = message;
      el.setAttribute("aria-invalid", "true");
    } else {
      field.classList.remove("is-invalid");
      if (slot) slot.textContent = "";
      el.removeAttribute("aria-invalid");
    }
  }

  function validate(el) {
    var value = (el.value || "").trim();
    var name = el.name;

    if (el.hasAttribute("required") && !value) {
      if (el.tagName === "SELECT") return "Please choose your venue type.";
      return "This one is needed.";
    }
    if (!value) return "";
    if (name === "email" && !EMAIL.test(value)) return "That email does not look right.";
    if (name === "phone" && !AU_PHONE.test(value.replace(/[\s-]/g, ""))) {
      return "Please enter an Australian phone number.";
    }
    return "";
  }

  // The tracking cookie HubSpot sets, read straight off document.cookie
  // because the tracker is loaded by GTM rather than by this page.
  function getHutk() {
    var m = document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : "";
  }

  // gclid is captured on arrival and kept, so a visitor who lands from an
  // ad, leaves and comes back directly is still credited to the click.
  function getGclid() {
    var fromUrl = new URLSearchParams(window.location.search).get("gclid");
    if (fromUrl) {
      try { localStorage.setItem(GCLID_KEY, fromUrl); } catch (e) {}
      return fromUrl;
    }
    try { return localStorage.getItem(GCLID_KEY) || ""; } catch (e) { return ""; }
  }

  // Selects send the visible label, not the option value, because
  // venue_type is a plain text property in HubSpot and "Hotel" reads
  // better in the CRM than "hotel". Swap to el.value to send the value.
  function valueOf(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    if (!el) return "";
    if (el.tagName === "SELECT") {
      var opt = el.options[el.selectedIndex];
      return opt && opt.value ? opt.textContent.trim() : "";
    }
    return (el.value || "").trim();
  }

  // Left is the field name on this page, right is the HubSpot property.
  function buildPayload(form) {
    var fields = [
      { objectTypeId: "0-1", name: "venue_name", value: valueOf(form, "venue_name") },
      { objectTypeId: "0-1", name: "venue_type", value: valueOf(form, "venue_type") },
      { objectTypeId: "0-1", name: "firstname",  value: valueOf(form, "contact_name") },
      { objectTypeId: "0-1", name: "email",      value: valueOf(form, "email") },
      { objectTypeId: "0-1", name: "phone",      value: valueOf(form, "phone") },
      { objectTypeId: "0-1", name: "city",       value: valueOf(form, "suburb") },
      { objectTypeId: "0-1", name: "message",    value: valueOf(form, "notes") }
    ];

    var gclid = getGclid();
    // The HubSpot property is hs_google_click_id, not gclid.
    if (gclid) fields.push({ objectTypeId: "0-1", name: "hs_google_click_id", value: gclid });

    var payload = {
      fields: fields,
      context: {
        pageUri: window.location.href,
        pageName: document.title
      }
    };

    var hutk = getHutk();
    if (hutk) payload.context.hutk = hutk;

    return payload;
  }

  function initForms() {
    var forms = document.querySelectorAll("[data-form]");

    Array.prototype.forEach.call(forms, function (form) {
      var controls = form.querySelectorAll(".field > input, .field > select, .field > textarea");

      Array.prototype.forEach.call(controls, function (el) {
        el.addEventListener("blur", function () { setError(el, validate(el)); });
        el.addEventListener("input", function () {
          if (fieldOf(el) && fieldOf(el).classList.contains("is-invalid")) {
            if (!validate(el)) setError(el, "");
          }
        });
        if (el.tagName === "SELECT") {
          el.addEventListener("change", function () { setError(el, validate(el)); });
        }
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Honeypot. Filled means a bot, so accept silently and do nothing.
        var hp = form.querySelector('input[name="company_website"]');
        if (hp && hp.value) return;

        var firstBad = null;
        Array.prototype.forEach.call(controls, function (el) {
          var msg = validate(el);
          setError(el, msg);
          if (msg && !firstBad) firstBad = el;
        });
        if (firstBad) { firstBad.focus(); return; }

        var submit = form.querySelector('button[type="submit"]');
        var label = submit ? submit.textContent : "";
        if (submit) { submit.disabled = true; submit.textContent = "Sending..."; }

        fetch(HS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload(form))
        })
          .then(function (res) {
            if (!res.ok) throw new Error("HubSpot returned " + res.status);

            // Conversion signal for GTM, fired before the page changes.
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: "form_submission" });

            window.location.href = THANKS_URL;
          })
          .catch(function (err) {
            if (window.console) console.error("HubSpot form submission failed:", err);
            if (submit) { submit.disabled = false; submit.textContent = label; }
            window.alert(HS_ERROR);
          });
      });
    });
  }

  /* -----------------------------------------------------------
     6. Style strip
     One wide image rendered twice, translated continuously so the
     styles travel left to right past the visitor. Dragging takes
     over from the animation and it resumes shortly after release.
     Pauses on hover and on focus, and does not run at all when the
     visitor has asked for reduced motion.
     ----------------------------------------------------------- */
  var STRIP_SPEED = 26;   // px per second
  var STRIP_RESUME = 900; // ms of stillness after a drag

  function initStyleStrip() {
    var strip = document.querySelector("[data-stylestrip]");
    if (!strip) return;
    var track = strip.querySelector("[data-stylestrip-track]");
    var first = track && track.querySelector("img");
    if (!track || !first) return;

    // Fail quietly if the file has not been supplied yet.
    function markMissing() { strip.classList.add("is-missing"); }
    if (first.complete && !first.naturalWidth) markMissing();
    first.addEventListener("error", markMissing);

    var now = (window.performance && window.performance.now)
      ? function () { return window.performance.now(); }
      : function () { return Date.now(); };

    var offset = 0, loop = 0, last = 0, resumeAt = 0;
    var paused = false, dragging = false, startX = 0, startOffset = 0;

    function measure() { loop = first.getBoundingClientRect().width; }
    function draw() { track.style.transform = "translate3d(" + (-offset) + "px,0,0)"; }
    function wrapOffset() {
      if (!loop) return;
      offset = offset % loop;
      if (offset < 0) offset += loop;
    }

    function frame(t) {
      var dt = last ? (t - last) / 1000 : 0;
      last = t;
      if (!paused && !dragging && t >= resumeAt && loop) {
        // Positive offset moves the track left, so the eye reads the
        // styles left to right. Negate STRIP_SPEED to reverse it.
        offset += STRIP_SPEED * dt;
        wrapOffset();
        draw();
      }
      window.requestAnimationFrame(frame);
    }

    function down(e) {
      dragging = true;
      startX = e.clientX;
      startOffset = offset;
      strip.classList.add("is-dragging");
      if (strip.setPointerCapture) strip.setPointerCapture(e.pointerId);
    }
    function move(e) {
      if (!dragging) return;
      offset = startOffset - (e.clientX - startX);
      wrapOffset();
      draw();
    }
    function up() {
      if (!dragging) return;
      dragging = false;
      strip.classList.remove("is-dragging");
      resumeAt = now() + STRIP_RESUME;
    }

    strip.addEventListener("pointerdown", down);
    strip.addEventListener("pointermove", move);
    strip.addEventListener("pointerup", up);
    strip.addEventListener("pointercancel", up);
    strip.addEventListener("mouseenter", function () { paused = true; });
    strip.addEventListener("mouseleave", function () { paused = false; });
    strip.addEventListener("focusin", function () { paused = true; });
    strip.addEventListener("focusout", function () { paused = false; });

    first.addEventListener("load", measure);
    window.addEventListener("resize", measure, { passive: true });
    measure();

    var reduce = window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) window.requestAnimationFrame(frame);
  }

  /* -----------------------------------------------------------
     7. Footer year
     ----------------------------------------------------------- */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* -----------------------------------------------------------
     8. Email obfuscation
     Addresses are stored as data-u (user) and data-d (domain)
     on .eml links, then assembled here so the raw HTML never
     contains a complete mailto: or readable address.
     ----------------------------------------------------------- */
  function initEmails() {
    var links = document.querySelectorAll(".eml");
    Array.prototype.forEach.call(links, function (el) {
      var addr = el.dataset.u + "@" + el.dataset.d;
      el.href = "mailto:" + addr;
      el.textContent = addr;
    });
  }

  /* ----------------------------------------------------------- */
  initSlots();
  initVenueVariant();
  initAccordion();
  initStickybar();
  initForms();
  initStyleStrip();
  initYear();
  initEmails();

})();
