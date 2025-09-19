// ======================
// RIPPLES BACKGROUND
// ======================
$(document).ready(function () {
  const $body = $("body");
  $body.ripples({
    resolution: 312,
    dropRadius: 40,
    perturbance: 0.04,
  });

  const ripplesInstance = $body.data("ripples");

  if (ripplesInstance) {
    const cols = 10;
    const rows = 10;
    let t = 0;

    setInterval(() => {
      t += 0.0015;
      const w = $body.innerWidth();
      const h = $body.innerHeight();

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = (i + 0.5) * w / cols + Math.sin(t + i) * 10;
          const y = (j + 0.5) * h / rows + Math.cos(t + j) * 8;
          const radius = 35 + Math.sin(t + i + j) * 5;
          const strength = 0.00015 + 0.0005 * Math.cos(t + i + j);

          ripplesInstance.drop(x, y, radius, strength);
        }
      }
    }, 10);
  }
});

// ======================
// INFO PANEL TOGGLE
// ======================
const toggleBtn = document.getElementById("toggleBtn");
const infoPanel = document.getElementById("infoPanel");

toggleBtn.addEventListener("click", () => {
  if (infoPanel.style.display === "flex") {
    infoPanel.style.display = "none";
    toggleBtn.textContent = "+";
  } else {
    infoPanel.style.display = "flex";
    toggleBtn.textContent = "−";
  }
});

// ======================
// BOOKING MODAL
// ======================
const modal = document.getElementById("bookingModal");
const bookBtn = document.querySelector(".book1");
const closeModal = document.getElementById("closeModal");

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

// ======================
// FETCH MOMENCE EVENTS
// ======================
// Fetch appointments
// ======================
// FETCH MOMENCE EVENTS
// ======================
async function fetchAppointments() {
  try {
    const response = await fetch("/api/events");
    const data = await response.json();

    const events = data.events || data; // handles both shapes

    const container = document.getElementById("appointments");
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
    document.getElementById("appointments").innerHTML =
      "<p class='error'>Could not load appointments.</p>";
  }
}


document.addEventListener("DOMContentLoaded", fetchAppointments);

