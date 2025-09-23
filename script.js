$(document).ready(function () {
  const $body = $("body");
  const isMobile = window.innerWidth < 768;

  // ✅ Always enable ripples (for initial animation & auto waves)
  $body.ripples({
    resolution: 423,
    dropRadius: 35,
    perturbance: 0.05,
    interactive: !isMobile, // ❌ no user interaction on mobile
  });

  const ripplesInstance = $body.data("ripples");

  if (ripplesInstance) {
    // 🌊 Starter ripples so background isn’t static
    const w = $body.innerWidth();
    const h = $body.innerHeight();
    for (let i = 0; i < 5; i++) {
      ripplesInstance.drop(
        Math.random() * w,
        Math.random() * h,
        60,
        0.007
      );
    }

    // 🌊 Continuous gentle wave motion (works everywhere)
    const cols = 6;
    const rows = 6;
    let t = 0;

    setInterval(() => {
      t += 0.0003;
      const w = $body.innerWidth();
      const h = $body.innerHeight();

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = (i + 0.5) * w / cols + Math.sin(t + i) * 8;
          const y = (j + 0.5) * h / rows + Math.cos(t + j) * 6;

          const radius = 45 + Math.sin(t + i + j) * 3;
          const strength = 0.00001 + 0.00001 * Math.cos(t + i + j);

          ripplesInstance.drop(x, y, radius, strength);
        }
      }
    }, 33);
  }
});
