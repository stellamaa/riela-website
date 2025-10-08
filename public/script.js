// =============================
// Background Water Ripple System (Perpetual Motion Version)
// Adaptive: Desktop = Full Ripples, Mobile = Optimized or Shimmer
// =============================
jQuery(document).ready(function ($) {
  const $body = $("body");
  const isMobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);

  // --- Detect WebGL capability ---
  const canHandleWebGL = (() => {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch (e) {
      return false;
    }
  })();

  // --- Detect low-end mobile devices ---
  const isLowEnd =
    isMobile &&
    (!canHandleWebGL ||
      window.devicePixelRatio > 3 ||
      navigator.hardwareConcurrency <= 4);

  // ---- CSS shimmer fallback ----
  const enableShimmer = () => {
    $("body").addClass("shimmer-fallback");
    const shimmerCSS = `
      <style>
      @keyframes shimmer {
        0% { background-position: 0% 0%; }
        100% { background-position: 100% 100%; }
      }
      body.shimmer-fallback {
        background-image: linear-gradient(135deg, rgba(255,255,255,0.06) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.06) 75%, transparent 75%, transparent);
        background-size: 200% 200%;
        animation: shimmer 10s linear infinite;
        background-blend-mode: overlay;
      }
      </style>`;
    $("head").append(shimmerCSS);
  };

  // ---- WebGL Ripple Activation ----
  const enableRipples = () => {
    $body.ripples({
      resolution: isMobile ? 256 : 412,
      dropRadius: isMobile ? 25 : 40,
      perturbance: isMobile ? 0.025 : 0.03,
      interactive: true
    });

    const ripplesInstance = $body.data("ripples");
    if (!ripplesInstance) return;

    const w = $body.innerWidth();
    const h = $body.innerHeight();

    // Initial distributed gentle ripples
    for (let i = 0; i < (isMobile ? 6 : 12); i++) {
      ripplesInstance.drop(Math.random() * w, Math.random() * h, 45, 0.007);
    }

    // --- Continuous Perpetual Ripples ---
    // No fade-out, never stops, always a living water surface
    let t = 0;
    const cols = 6, rows = 6;
    const baseInterval = isMobile ? 120 : 90;

    setInterval(() => {
      t += 0.01;
      const w = $body.innerWidth();
      const h = $body.innerHeight();

      // Perpetual ripple pattern — low amplitude, constant evolution
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const offset = Math.sin(t * 0.5 + i * 0.8 + j * 0.6);
          const x = ((i + 0.5) * w) / cols + Math.sin(t + i) * 20;
          const y = ((j + 0.5) * h) / rows + Math.cos(t + j) * 20;
          const radius = 40 + 5 * Math.sin(t + i + j);
          const strength = 0.001 + 0.0005 * offset;
          ripplesInstance.drop(x, y, radius, strength);
        }
      }
    }, baseInterval);

    // --- Gentle touch interactions on mobile ---
    if (isMobile) {
      let lastTouch = 0;
      $body.on("touchstart touchmove", function (e) {
        const now = Date.now();
        if (now - lastTouch < 300) return;
        lastTouch = now;

        const touches = e.originalEvent.touches || [];
        for (let t of touches) {
          ripplesInstance.drop(t.pageX, t.pageY, 30, 0.03);
        }
      });
    }
  };

  // ---- Decide Which Mode to Use ----
  if (isLowEnd) {
    console.log("💧 Using shimmer fallback (low-end mobile detected)");
    enableShimmer();
  } else if (canHandleWebGL) {
    console.log("🌊 Enabling perpetual ripples");
    enableRipples();
  } else {
    console.log("⚡ No WebGL, fallback shimmer");
    enableShimmer();
  }
});


  // === Booking Modal ===
  const $modal = $("#bookingModal");
  const $close = $("#closeModal");
  const $appointments = $("#appointments");

  $("#openBooking").on("click", function (e) {
    e.preventDefault();
    $modal.fadeIn();

    // Date-agnostic choices that open Momence in a new tab
    const hostId = 89357;
    const serviceGeneral = 94346; // Riela Session
    const serviceWomen = 94520; // Women only (4-5pm)

    const generalUrl = `https://momence.com/appointments/89357`;
    const womenUrl = `https://momence.com/appointments/89357`;

    $appointments.html(`
      <div class="appointment">
        <div>
          <strong>Riela Session</strong><br>
          <span>60 min · €38</span>
        </div>
        <a href="${generalUrl}" target="_blank" rel="noopener noreferrer">
          <button>Book on Momence</button>
        </a>
      </div>

      <div class="appointment">
        <div>
          <strong>Women only (4-5pm)</strong><br>
          <span>60 min · €38</span>
        </div>
        <a href="${womenUrl}" target="_blank" rel="noopener noreferrer">
          <button>Book on Momence</button>
        </a>
      </div>
    `);
  });

  $close.on("click", () => $modal.fadeOut());
  $(window).on("click", (e) => {
    if ($(e.target).is($modal)) $modal.fadeOut();
  });

// === Info Panel Toggle ===
const toggleBtn = document.getElementById("toggleBtn");
const infoPanel = document.getElementById("infoPanel");
if (toggleBtn && infoPanel) {
  toggleBtn.addEventListener("click", () => {
    if (infoPanel.style.display === "flex") {
      infoPanel.style.display = "none";
      toggleBtn.textContent = "+";
    } else {
      infoPanel.style.display = "flex";
      toggleBtn.textContent = "−";
    }
  });
}
