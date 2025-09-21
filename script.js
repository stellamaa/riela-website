// ======================
// RIPPLES BACKGROUND
// ======================
$(document).ready(function () {
  const pixelRatio = window.devicePixelRatio || 1;
  const isMobile = window.innerWidth < 768;

  const $body = $("body");
  $body.ripples({
    resolution: isMobile ? 256 * pixelRatio : 512 * pixelRatio,
    dropRadius: isMobile ? 20 : 35,
    perturbance: 0.05, // subtle distortion
  });

  const ripplesInstance = $body.data("ripples");

  if (ripplesInstance) {
    // 🌊 Add some starter ripples so it's not static at load
    const w = $body.innerWidth();
    const h = $body.innerHeight();
    for (let i = 0; i < 5; i++) {
      ripplesInstance.drop(
        Math.random() * w,
        Math.random() * h,
        isMobile ? 30 : 60,
        isMobile ? 0.007 : 0.007
      );
    }

    // Continuous soft wave motion
    const cols = isMobile ? 4 : 6;
    const rows = isMobile ? 4 : 6;
    let t = 0;

    setInterval(() => {
      t += isMobile ? 0.0002 : 0.0003; // slower, smoother

      const w = $body.innerWidth();
      const h = $body.innerHeight();

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = (i + 0.5) * w / cols + Math.sin(t + i) * 8;
          const y = (j + 0.5) * h / rows + Math.cos(t + j) * 6;

          const radius = isMobile
            ? 25 + Math.sin(t + i + j) * 2
            : 45 + Math.sin(t + i + j) * 3;

          const strength = isMobile
            ? 0.00001 + 0.00001 * Math.cos(t + i + j)
            : 0.000010 + 0.000010 * Math.cos(t + i + j);

          ripplesInstance.drop(x, y, radius, strength);
        }
      }
    }, isMobile ? 40 : 33);
  }

  // ======================
  // INFO PANEL TOGGLE
  // ======================
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

  // ======================
  // BOOKING MODAL
  // ======================
  const modal = document.getElementById("bookingModal");
  const bookBtn = document.querySelector(".book1");
  const closeModal = document.getElementById("closeModal");

  if (modal && bookBtn && closeModal) {
    bookBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.style.display = "flex";
    });

    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });

    // Close modal with Escape key
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.style.display === "flex") {
        modal.style.display = "none";
      }
    });
  }

  // ======================
  // FETCH MOMENCE EVENTS
  // ======================
  async function fetchAppointments() {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();

      const events = data.events || data;
      const container = document.getElementById("appointments");
      if (!container) return;

      container.innerHTML = "";

      if (!events || events.length === 0) {
        container.innerHTML = `
          <div class="no-events">
            <p>No upcoming events right now.<br> Check back soon!</p>
          </div>
        `;
        return;
      }

      events.forEach((event) => {
        const card = document.createElement("div");
        card.classList.add("appointment");

        card.innerHTML = `
          <div>
            <h3>${event.title}</h3>
            <p>${new Date(event.start_date).toLocaleString()}</p>
            <p>${event.description || ""}</p>
          </div>
          <a href="https://momence.com/s/${event.slug}" target="_blank">
            <button>Reserve</button>
          </a>
        `;

        container.appendChild(card);
      });
    } catch (err) {
      console.error("Error fetching appointments:", err);
      const container = document.getElementById("appointments");
      if (container) {
        container.innerHTML =
          "<p class='error'>Could not load appointments.</p>";
      }
    }
  }

  fetchAppointments();
});
