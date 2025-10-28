// Steak Cooking Clock — 3 Minute Timer with Flip Indicator and Grill Background
registerSketch('sk4', function (p) {
  let running = false;
  let startMillis = 0;
  let elapsedOffset = 0;
  let flipped = false;
  const totalSec = 60 * 8; // 3 minutes
  const flipSec = totalSec / 2; // halfway mark

  p.setup = function () {
    p.createCanvas(900, 640);
    p.noiseSeed(99);
    p.textAlign(p.CENTER, p.CENTER);
  };

  p.draw = function () {
    p.background('#3b2f2a'); // grill base
    drawGrill();
    drawHeader();

    const elapsed = getElapsedSec();
    drawSteak(elapsed);
    drawFooter(elapsed);
  };

  // --- Helper: Time Management ---
  function getElapsedSec() {
    if (running) {
      return p.constrain((p.millis() - startMillis) / 1000 + elapsedOffset, 0, totalSec);
    }
    return p.constrain(elapsedOffset, 0, totalSec);
  }

  // --- Header Display ---
  function drawHeader() {
    p.fill('#e9d7c4');
    p.noStroke();
    p.rect(0, 8, p.width, 110);

    const elapsed = getElapsedSec();
    const remaining = Math.max(0, Math.ceil(totalSec - elapsed));
    p.fill('#3b2f2a');
    p.textSize(26);

    if (running) {
      p.text(`Cooking — ${formatTime(Math.ceil(elapsed))} elapsed • ${formatTime(remaining)} remaining`, p.width / 2, 40);
    } else {
      p.text('Press any key or click to start / pause the 3-minute cook', p.width / 2, 40);
    }

    p.textSize(14);
    p.fill('#5b4a43');
    p.text('Flip indicator shows at halfway. Press F when you flip to mark it.', p.width / 2, 72);
  }

  // --- Grill Background ---
  function drawGrill() {
    const spacing = 40;
    p.stroke('#2b241f');
    p.strokeWeight(12);
    for (let y = 140; y < p.height; y += spacing) p.line(0, y, p.width, y);

    p.stroke(255, 255, 255, 18);
    for (let y = 140; y < p.height; y += spacing) {
      for (let x = 0; x < p.width; x += 6) {
        if ((x / 6 + y / spacing) % 2 === 0) p.line(x, y - 5, x, y + 5);
      }
    }
    p.noStroke();
  }

  // --- Main Steak Drawing (now rectangular) ---
  function drawSteak(elapsed) {
    const cx = p.width / 2;
    const cy = p.height / 2 + 40;
    const w = Math.min(p.width * 0.7, 680);
    const h = Math.min(p.height * 0.35, 220);
    const corner = 40;

    // Colors — vivid pink early on
    const searOuter = p.color('#5a3324');
    const searMid = p.color('#7a3d27');
    const rawPink = p.color('#ffb3b0');
    const midPink = p.color('#d9746a');
    const cookedTan = p.color('#b56a4b');

    const d = p.constrain(elapsed / totalSec, 0, 1);
    const heatCurve = Math.pow(d, 1.3);

    // Steak body (layered rectangles inward)
    const layers = 50;
    for (let i = 0; i < layers; i++) {
      const t = i / layers;
      const inset = t * (w * 0.4);
      const insetY = t * (h * 0.4);
      let col;

      if (t < 0.5) {
        const tt = p.map(t, 0, 0.5, 0, 1);
        col = p.lerpColor(searOuter, searMid, tt);
      } else {
        const tt = p.map(t, 0.5, 1, 0, 1);
        const centerTarget = p.lerpColor(midPink, cookedTan, heatCurve);
        col = p.lerpColor(searMid, centerTarget, tt);
      }

      p.fill(col);
      const wobbleX = p.noise(i * 5, p.frameCount * 0.002) * 6 - 3;
      const wobbleY = p.noise(i * 8, p.frameCount * 0.002) * 4 - 2;
      p.rect(cx - w / 2 + inset + wobbleX, cy - h / 2 + insetY + wobbleY, w - inset * 2, h - insetY * 2, corner * (1 - t));
    }

    // Center — bright pink early on
    const innerColor = p.lerpColor(rawPink, cookedTan, heatCurve);
    const innerInset = p.map(heatCurve, 0, 1, 0, w * 0.4);
    p.fill(innerColor);
    p.rect(cx - w / 2 + innerInset, cy - h / 2 + innerInset * 0.5, w - innerInset * 2, h - innerInset, corner * 0.5);

    // Grill marks
    p.push();
    p.translate(cx, cy);
    p.rotate(-0.2);
    const marks = 5;
    for (let i = -marks; i <= marks; i++) {
      const tx = i * (w / 10);
      const markAlpha = p.map(Math.abs(i), 0, marks, 200, 40) * (1 - d * 0.9);
      p.stroke(40, markAlpha);
      p.strokeWeight(6);
      p.line(tx, -h * 0.45, tx, h * 0.45);
    }
    p.pop();

    // Sizzling bubbles
    if (d > 0.1) {
      for (let s = 0; s < Math.floor(d * 30); s++) {
        const sx = cx + p.random(-w * 0.4, w * 0.4);
        const sy = cy + p.random(-h * 0.3, h * 0.3);
        p.noStroke();
        p.fill(255, 220, 160, p.random(30, 90) * d);
        p.ellipse(sx, sy, p.random(1, 4));
      }
    }

    // Flip Indicator
    if (elapsed >= flipSec && !flipped) {
      const flash = p.abs(Math.sin(p.millis() * 0.007));
      p.fill(255, 70, 70, 200 * flash);
      p.textSize(46);
      p.noStroke();
      p.text('FLIP THE STEAK!', p.width / 2, 120);
      p.textSize(14);
      p.fill(80, 10);
      p.text('Press F to mark flipped (optional)', p.width / 2, 150);
    } else if (flipped) {
      p.fill('#2b6b2b');
      p.textSize(28);
      p.text('Flipped ✓', p.width / 2, 120);
    }
  }

  // --- Footer Progress Bar ---
  function drawFooter(elapsed) {
    const px = p.width * 0.12;
    const pw = p.width * 0.76;
    const py = p.height - 66;
    const h = 28;
    p.noStroke();
    p.fill('#ddd2bf');
    p.rect(px, py, pw, h, 8);

    const prog = p.constrain(elapsed / totalSec, 0, 1);
    p.fill('#c76b3a');
    p.rect(px, py, pw * prog, h, 8);

    p.fill('#3b2f2a');
    p.textSize(14);
    p.text(`${formatTime(Math.floor(elapsed))} / ${formatTime(totalSec)} elapsed`, p.width / 2, py + h / 2);
  }

  // --- Time Formatting ---
  function formatTime(s) {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${nf(mins, 2)}:${nf(secs, 2)}`;
  }

  function nf(n, d) {
    return p.nf(n, d);
  }

  // --- Input Handlers ---
  p.keyPressed = function () {
    if (p.key === 'f' || p.key === 'F') {
      if (getElapsedSec() >= flipSec) flipped = true;
      return;
    }
    toggleRunning();
  };

  p.mousePressed = function () {
    toggleRunning();
  };

  function toggleRunning() {
    if (!running) {
      startMillis = p.millis();
      running = true;
    } else {
      elapsedOffset = getElapsedSec();
      running = false;
    }
  }

  p.windowResized = function () {
    p.resizeCanvas(Math.floor(p.windowWidth * 0.9), 640);
  };
});
