// script.js
document.addEventListener("DOMContentLoaded", function () {
  // initialize ripple engine: pass container and path to image
  // Make sure you put your background image at: bg.jpg
  const engine = window.initRipple("#gl", "bg.jpg");

  // Small UI interactions (menu / left arrow demo)
  const menuBtn = document.querySelector(".menu");
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      alert("Menu clicked (placeholder)");
    });
  }
  const leftArrow = document.querySelector(".left-arrow");
  if (leftArrow) {
    leftArrow.addEventListener("click", () => {
      alert("Prev (placeholder)");
    });
  }
});
