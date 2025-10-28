// New sketch: steak cooker — 3 minute timer with flip indicator; center gets less pink over time
registerSketch('sk4', function (p) {
  let running = false;
  let startMillis = 0;
  let elapsedOffset = 0; // seconds accumulated while paused
  let flipped = false; // user can mark flipped (optional)
  const totalSec = 180; // 3 minutes total
  const flipSec = totalSec / 2; // indicate flip at halfway (90s)

  p.setup = function () {
    p.createCanvas(900, 640);
    p.noiseSeed(99);
    p.textAlign(p.CENTER, p.CENTER);
  };

  p.draw = function () {
    p.background('#efe7df'); // kitchen counter
    drawHeader();
    const elapsed = getElapsedSec();
    drawSteak(elapsed);
    drawFooter(elapsed);
  };

  function getElapsedSec() {
    if (running) {
      return p.constrain((p.millis() - startMillis) / 1000 + elapsedOffset, 0, totalSec);
    }
    return p.constrain(elapsedOffset, 0, totalSec);
  }

  function drawHeader() {
    // top timer bar
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

  function drawSteak(elapsed) {
    const cx = p.width / 2;
    const cy = p.height / 2 + 40;
    const rx = Math.min(p.width * 0.42, 360);
    const ry = Math.min(p.height * 0.28, 200);

    // Colors
    const searOuter = p.color('#6b3d2a'); // browned seared edge
    const searMid = p.color('#8b4b34');
    const rawPink = p.color('#e9928e'); // raw center
    const cookedTan = p.color('#c17d57'); // transition

    // Doneness ratio 0..1
    const d = p.constrain(elapsed / totalSec, 0, 1);

    // Pink radius shrinks as doneness increases
    const minInner = Math.min(rx, ry) * 0.02;
    const maxInner = Math.min(rx, ry) * 0.55;
    const innerR = p.lerp(maxInner, minInner, d);

    // Draw outer seared base
    p.noStroke();
    // layered ellipses to simulate gradient from sear -> cooked -> pink
    const layers = 60;
    for (let i = 0; i <= layers; i++) {
      const t = i / layers; // 0 outer -> 1 center
      const lerpR = p.lerp(rx, innerR, t);
      const lerpRy = p.lerp(ry, innerR * (ry / rx), t);
      // pick color blending: outer->mid->center. bias center more pink while cooking diminishes pink
      let col;
      if (t < 0.5) {
        const tt = p.map(t, 0, 0.5, 0, 1);
        col = p.lerpColor(searOuter, searMid, tt);
      } else {
        const tt = p.map(t, 0.5, 1, 0, 1);
        // as steak cooks more (d increases) shift center toward cookedTan
        const centerTarget = p.lerpColor(rawPink, cookedTan, d);
        col = p.lerpColor(searMid, centerTarget, tt);
      }
      p.fill(col);
      // slight surface noise to break perfect symmetry
      const wobbleX = p.noise(i * 7, p.frameCount * 0.002) * 6 - 3;
      const wobbleY = p.noise(i * 11, p.frameCount * 0.002) * 4 - 2;
      p.ellipse(cx + wobbleX, cy + wobbleY, lerpR * 2, lerpRy * 2);
    }

    // Pink core highlight: draw a final inner ellipse representing remaining pink area
    p.fill(p.lerpColor(rawPink, cookedTan, d));
    p.ellipse(cx, cy, innerR * 2, innerR * (ry / rx) * 2);

    // simple grill marks (fade as it cooks)
    p.push();
    p.translate(cx, cy);
    p.rotate(-0.25);
    const marks = 6;
    for (let i = -marks; i <= marks; i++) {
      const tx = i * (rx / 6);
      const markAlpha = p.map(Math.abs(i), 0, marks, 200, 40) * (1 - d * 0.9);
      p.stroke(40, markAlpha);
      p.strokeWeight(6);
      p.line(tx, -ry * 0.9, tx, ry * 0.9);
    }
    p.pop();

    // subtle sizzling dots as it cooks more
    if (d > 0.3) {
      for (let s = 0; s < Math.floor(d * 30); s++) {
        const a = p.random(p.TWO_PI);
        const r = p.random(innerR * 0.9, rx * 0.9);
        const sx = cx + Math.cos(a) * r * 0.6;
        const sy = cy + Math.sin(a) * r * 0.6;
        p.noStroke();
        p.fill(255, 220, 160, p.random(30, 90) * d);
        p.ellipse(sx, sy, p.random(1, 4));
      }
    }

    // Flip indicator if halfway reached and not yet flipped
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

  function drawFooter(elapsed) {
    // status bar at bottom with progress
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

  function formatTime(s) {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${nf(mins, 2)}:${nf(secs, 2)}`;
  }

  // wrapper to match p5 instance mode nf availability
  function nf(n, d) {
    return p.nf(n, d);
  }

  // Input handlers:
  p.keyPressed = function () {
    // toggle run/pause on any key
    if (p.key === 'f' || p.key === 'F') {
      // mark flipped manually
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
      // start or resume
      startMillis = p.millis();
      running = true;
    } else {
      // pause
      elapsedOffset = getElapsedSec();
      running = false;
    }
    // do not auto-clear flipped; user may flip manually
  }

  p.windowResized = function () {
    p.resizeCanvas(Math.floor(p.windowWidth * 0.9), 640);
  };
});