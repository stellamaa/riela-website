// =============================
// Background Water Ripple System (Perpetual Motion Version)
// Adaptive: Desktop = Full Ripples, Mobile = Optimized or Shimmer
// =============================
jQuery(document).ready(function ($) {
  const $body = $("body");
  const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window);

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

  

  // ---- WebGL Ripple Activation ----
  const enableRipples = () => {
    console.log("🌊 Starting ripple initialization...");
    
    // Check if jQuery and ripples plugin are available
    if (typeof $ === 'undefined' || typeof $.fn.ripples === 'undefined') {
      console.error("❌ jQuery or ripples plugin not available");
      return false;
    }
    
    // Clear any existing ripples first
    try {
      if ($body.data("ripples")) {
        $body.ripples("destroy");
      }
    } catch (e) {
      console.log("No existing ripples to destroy");
    }

    // Optimized settings for mobile - ensure proper touch response
    const mobileSettings = {
      resolution: 300, // Lower resolution for better mobile performance
      dropRadius: 25,  // Slightly larger for better visibility
      perturbance: 0.06, // Higher perturbance for more visible effect on mobile
      interactive: true,
      crossOrigin: 'anonymous'
    };

    const desktopSettings = {
      resolution: 512,
      dropRadius: 40,
      perturbance: 0.05,
      interactive: true,
      crossOrigin: 'anonymous'
    };

    console.log("🌊 Using settings for", isMobile ? "mobile" : "desktop");
    
    try {
      // Initialize with safe settings
      $body.ripples(isMobile ? mobileSettings : desktopSettings);
      console.log("✅ Ripples initialized successfully");
    } catch (error) {
      console.error("❌ Ripples initialization failed:", error);
      return false;
    }

    const ripplesInstance = $body.data("ripples");
    if (!ripplesInstance) {
      console.error("❌ No ripples instance created");
      return false;
    }
    
    console.log("✅ Ripples instance created successfully");

    const w = $body.innerWidth();
    const h = $body.innerHeight();
    // Ocean-like initial wave setup - more visible on mobile
    const initialRipples = isMobile ? 3 : 4;
    for (let i = 0; i < initialRipples; i++) {
      const radius = 50 + Math.random() * 20; // Larger, more gentle radius
      // More visible initial strength, especially on mobile
      const baseStrength = isMobile ? 0.008 : 0.003;
      const strength = baseStrength + Math.random() * 0.004;
      ripplesInstance.drop(Math.random() * w, Math.random() * h, radius, strength);
    }

    // --- Ocean Wave Ripples - Fluid and Natural ---
    let t = 0;
    let wavePhase = 0;
    const baseInterval = isMobile ? 400 : 250; // Even slower for ocean-like flow
    const waveCount = isMobile ? 2 : 3; // Fewer waves for smoother effect

    setInterval(() => {
      // Update performance monitoring
      if (isMobile) {
        performanceMonitor.update();
      }
      
      t += 0.002; // Very slow, ocean-like movement
      wavePhase += 0.01; // Gentle wave progression
      const w = $body.innerWidth();
      const h = $body.innerHeight();

      // Create flowing ocean waves
      for (let wave = 0; wave < waveCount; wave++) {
        const waveOffset = (wave / waveCount) * Math.PI * 2;
        const waveProgress = (wavePhase + waveOffset) % (Math.PI * 2);
        
        // Create flowing wave pattern across screen
        const waveAmplitude = Math.min(w, h) * 0.12; // Gentle wave height
        const waveFrequency = 0.6; // Slower wave frequency
        
        // Create ripples along the wave path
        for (let i = 0; i < 6; i++) {
          const progress = i / 5; // 0 to 1 across screen
          const x = progress * w;
          const y = h / 2 + Math.sin(waveProgress + progress * waveFrequency * Math.PI) * waveAmplitude;
          
          // More visible strength on mobile, gentle on desktop
          const strengthVariation = Math.sin(waveProgress + progress * Math.PI * 0.5) * 0.3 + 0.7;
          const baseStrength = isMobile ? 0.0015 : 0.001; // Increased mobile visibility
          const strength = baseStrength * strengthVariation;
          
          // Large, flowing radius like ocean waves
          const radius = 45 + 8 * Math.sin(waveProgress + progress * 0.8);
          
          ripplesInstance.drop(x, y, radius, strength);
        }
      }
    }, baseInterval);

    // --- Enhanced Mobile Touch Interactions ---
    if (isMobile) {
      let lastTouchTime = 0;
      
      // Ocean-like touch handling for mobile
      $body.on("touchstart", function(e) {
        const now = Date.now();
        // Throttle to prevent too many ripples
        if (now - lastTouchTime < 200) return;
        lastTouchTime = now;
        
        const touches = e.originalEvent.touches || [];
        for (let touch of touches) {
          const x = touch.pageX;
          const y = touch.pageY;
          
          // Create more visible, ocean-like ripple on touch
          ripplesInstance.drop(x, y, 40, 0.025);
        }
      });
      
      console.log("🌊 Mobile touch interactions enabled");
    } else {
      // Desktop mouse interactions - ocean-like
      $body.on("click", function(e) {
        const x = e.pageX;
        const y = e.pageY;
        ripplesInstance.drop(x, y, 35, 0.012);
      });
      
      console.log("🖱️ Desktop mouse interactions enabled");
    }
  };

  // ---- Debug Info ----
  console.log("📱 Mobile detected:", isMobile);
  console.log("🖥️ WebGL available:", canHandleWebGL);
  console.log("🔧 Low-end device:", isLowEnd);
  console.log("📏 Screen width:", window.innerWidth);
  console.log("👆 Touch support:", 'ontouchstart' in window);

  // ---- Decide Which Mode to Use ----
  console.log("🌊 Attempting to enable ripples on all devices");
  const ripplesResult = enableRipples();
  
  // Check if ripples actually worked
  if (!ripplesResult) {
    console.log("❌ Ripples failed to initialize, applying fallback");
    if (isMobile) {
      console.log("💧 Using shimmer fallback for mobile");
      $body.addClass("no-webgl");
    }
  } else {
    console.log("✅ Ripples successfully initialized");
  }
});

  // === Booking Modal ===
  // BOOK button now links directly to Momence - no modal needed

  // === Toggle Button - Simple Info Panel Toggle ===
  const toggleBtn = document.getElementById("toggleBtn");
  const infoPanel = document.getElementById("infoPanel");

  if (toggleBtn && infoPanel) {
    toggleBtn.addEventListener("click", () => {
      if (infoPanel.classList.contains("visible")) {
        // Info panel is open - close it
        infoPanel.classList.remove("visible");
        setTimeout(() => {
          infoPanel.style.display = "none";
        }, 400);
        toggleBtn.textContent = "+";
      } else {
        // Nothing is open - show info panel
        infoPanel.style.display = "flex";
        setTimeout(() => {
          infoPanel.classList.add("visible");
        }, 10);
        toggleBtn.textContent = "−";
      }
    });
  }
