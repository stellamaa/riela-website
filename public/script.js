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

  // --- Performance monitoring for mobile optimization ---
  const performanceMonitor = {
    frameCount: 0,
    lastTime: performance.now(),
    fps: 60,
    
    update() {
      this.frameCount++;
      const now = performance.now();
      if (now - this.lastTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
        this.frameCount = 0;
        this.lastTime = now;
        
        // Auto-adjust quality based on performance
        if (isMobile && this.fps < 30) {
          console.log(`📱 Low FPS detected: ${this.fps}, consider reducing quality`);
        }
      }
    }
  };

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
    // Optimized settings for mobile - higher resolution, better performance
    const mobileSettings = {
      resolution: 512, // Higher resolution for crisp mobile experience
      dropRadius: 35,  // Slightly larger for better touch response
      perturbance: 0.04, // Increased for more visible effect
      interactive: true,
      crossOrigin: 'anonymous'
    };

    const desktopSettings = {
      resolution: 512,
      dropRadius: 40,
      perturbance: 0.03,
      interactive: true,
      crossOrigin: 'anonymous'
    };

    $body.ripples(isMobile ? mobileSettings : desktopSettings);

    const ripplesInstance = $body.data("ripples");
    if (!ripplesInstance) return;

    const w = $body.innerWidth();
    const h = $body.innerHeight();

    // Initial distributed gentle ripples - fewer on mobile for performance
    const initialRipples = isMobile ? 4 : 8;
    for (let i = 0; i < initialRipples; i++) {
      ripplesInstance.drop(Math.random() * w, Math.random() * h, 45, 0.005);
    }

    // --- Continuous Perpetual Ripples ---
    let t = 0;
    const cols = isMobile ? 4 : 6; // Fewer columns on mobile
    const rows = isMobile ? 4 : 6; // Fewer rows on mobile
    const baseInterval = isMobile ? 150 : 90; // Slower on mobile for performance

    setInterval(() => {
      // Update performance monitoring
      if (isMobile) {
        performanceMonitor.update();
      }
      
      t += 0.008; // Slightly slower animation on mobile
      const w = $body.innerWidth();
      const h = $body.innerHeight();

      // Perpetual ripple pattern — optimized for mobile
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const offset = Math.sin(t * 0.4 + i * 0.6 + j * 0.5);
          const x = ((i + 0.5) * w) / cols + Math.sin(t + i) * 15;
          const y = ((j + 0.5) * h) / rows + Math.cos(t + j) * 15;
          const radius = 35 + 3 * Math.sin(t + i + j);
          const strength = 0.0008 + 0.0003 * offset;
          ripplesInstance.drop(x, y, radius, strength);
        }
      }
    }, baseInterval);

    // --- Enhanced Mobile Touch Interactions ---
    if (isMobile) {
      let touchStartTime = 0;
      let touchMoveCount = 0;
      let lastTouchX = 0;
      let lastTouchY = 0;
      
      // Optimized touch handling with requestAnimationFrame
      let touchAnimationFrame = null;
      
      const handleTouch = (e) => {
        e.preventDefault();
        
        const now = Date.now();
        const touches = e.originalEvent.touches || [];
        
        // Throttle touch events for performance
        if (now - touchStartTime < 50) return;
        touchStartTime = now;
        
        // Cancel previous animation frame
        if (touchAnimationFrame) {
          cancelAnimationFrame(touchAnimationFrame);
        }
        
        // Use requestAnimationFrame for smooth touch response
        touchAnimationFrame = requestAnimationFrame(() => {
          for (let touch of touches) {
            const x = touch.pageX;
            const y = touch.pageY;
            
            // Calculate movement for dynamic ripple strength
            const deltaX = Math.abs(x - lastTouchX);
            const deltaY = Math.abs(y - lastTouchY);
            const movement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            // Dynamic ripple based on touch movement
            let radius = 25;
            let strength = 0.02;
            
            if (movement > 10) {
              // Fast movement = larger, stronger ripple
              radius = 40;
              strength = 0.04;
            } else if (movement > 5) {
              // Medium movement = medium ripple
              radius = 32;
              strength = 0.03;
            }
            
            // Create ripple with optimized settings
            ripplesInstance.drop(x, y, radius, strength);
            
            lastTouchX = x;
            lastTouchY = y;
          }
        });
      };

      // Enhanced touch event handling
      $body.on("touchstart", function(e) {
        touchMoveCount = 0;
        const touches = e.originalEvent.touches || [];
        if (touches.length > 0) {
          lastTouchX = touches[0].pageX;
          lastTouchY = touches[0].pageY;
        }
        handleTouch(e);
      });

      $body.on("touchmove", function(e) {
        touchMoveCount++;
        // Only process every 3rd touchmove for performance
        if (touchMoveCount % 3 === 0) {
          handleTouch(e);
        }
      });

      // Add touch end for cleanup
      $body.on("touchend", function() {
        if (touchAnimationFrame) {
          cancelAnimationFrame(touchAnimationFrame);
          touchAnimationFrame = null;
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
