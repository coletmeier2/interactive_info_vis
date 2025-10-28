// New sketch: base spaghetti pasta (raw = straight). Iterative cooking will morph these into curled/rounded noodles.
registerSketch('sk2', function (p) {
  let noodles = [];
  const noodleCount = 36;
  const topY = 220;
  const bottomY = 560;
  let cookStart = null;
  const cookDurationSec = 60; // target 8 minutes (seconds)
  let simCook = true; // toggle to simulate cooking with spacebar

  p.setup = function () {
    p.createCanvas(900, 700);
    p.noiseSeed(42);
    // generate noodle baseline data (positions, wiggle seeds, thickness)
    for (let i = 0; i < noodleCount; i++) {
      const y = p.map(i, 0, noodleCount - 1, topY, bottomY);
      noodles.push({
        y,
        seed: p.random(1000),
        thickness: p.random(2.8, 5.2),
        hueOffset: p.random(-8, 8)
      });
    }
  };

  p.draw = function () {
    p.background('#f7f2e6'); // pale kitchen counter
    drawHeader(); // placeholder for timer (will be implemented later)

    // compute doneness from 0..1
    let doneness = 0;
    if (simCook && cookStart) {
      const elapsedSec = (p.millis() - cookStart) / 1000;
      doneness = p.constrain(elapsedSec / cookDurationSec, 0, 1);
    }

    drawPasta(doneness = doneness); // intentionally pass variable for future transforms
  };

  // simple header placeholder
  function drawHeader() {
    p.noStroke();
    p.fill('#efe2c7');
    p.rect(0, 10, p.width, 140);
    p.fill('#6b4b2b');
    p.textSize(28);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('Timer (coming) — press SPACE to simulate cooking', p.width / 2, 70);
  }

  // Draw noodles. For now raw = straight-ish horizontal strands.
  // Later, 'doneness' will control curvature/curl.
  function drawPasta(doneness) {
    const left = p.width * 0.08;
    const right = p.width * 0.92;
    const baseColor = p.color(238, 205, 119); // pasta yellow

    for (let i = 0; i < noodles.length; i++) {
      const n = noodles[i];
      // subtle vertical jitter per noodle seed so raw isn't perfectly identical
      const jitter = p.noise(n.seed + p.frameCount * 0.002) * 0.8 - 0.4;
      const y = n.y + jitter;

      // currently draw raw noodle as a mostly straight bezier with tiny control offsets
      const x1 = left + p.noise(n.seed) * 8;
      const x4 = right - p.noise(n.seed + 100) * 8;

      // control points (small offsets now; will increase with doneness)
      const curlAmount = p.lerp(2, 160, doneness); // how much the noodle can curl when cooked
      const cx1 = p.lerp(x1 + 10, p.width * 0.35, doneness) + p.noise(n.seed + 200) * 12;
      const cy1 = y + p.noise(n.seed + 300) * curlAmount * 0.02;
      const cx2 = p.lerp(x4 - 10, p.width * 0.65, doneness) + p.noise(n.seed + 400) * 12;
      const cy2 = y + p.noise(n.seed + 500) * curlAmount * 0.02;

      p.strokeWeight(n.thickness);
      // slight color variation per noodle
      const c = p.color(
        p.red(baseColor) + n.hueOffset,
        p.green(baseColor) + n.hueOffset * 0.3,
        p.blue(baseColor) + n.hueOffset * -0.2
      );
      p.stroke(c);
      p.noFill();

      // For raw (doneness near 0) this will be nearly straight.
      p.bezier(x1, y, cx1, cy1, cx2, cy2, x4, y);
    }
  }

  // Toggle simple cook simulation
  p.keyPressed = function () {
    if (p.key === ' ') {
      simCook = !simCook;
      if (simCook) cookStart = p.millis();
      else cookStart = null;
    }
  };

  p.windowResized = function () {
    // keep canvas responsive if desired
    p.resizeCanvas(p.windowWidth * 0.9, 700);
  };
});