// Spaghetti Clock – noodles start straight and curl as they "cook"
registerSketch('sk2', function (p) {
  let noodles = [];
  const noodleCount = 36;
  const topY = 200;
  const bottomY = 540;
  let cookStart = null;
  let cookDurationSec = 60 * 8; // default: 8 minutes
  let simCook = false;
  let inputBox, startButton;

  p.setup = function () {
    const canvas = p.createCanvas(800, 800);
    p.noiseSeed(42);
    p.strokeCap(p.ROUND);

    // --- USER INPUT UI (below header) ---
    inputBox = p.createInput('8');
    inputBox.size(60);
    inputBox.attribute('type', 'number');
    inputBox.attribute('min', '1');
    inputBox.attribute('max', '60');
    inputBox.style('font-size', '14px');
    inputBox.style('padding', '4px');
    // place BELOW the header, not overlapping text
    inputBox.position(p.width / 2 - 100, 155);

    startButton = p.createButton('Set Cook Time');
    startButton.style('font-size', '14px');
    startButton.style('padding', '4px 8px');
    startButton.position(p.width / 2 - 25, 155);
    startButton.mousePressed(() => {
      const minutes = parseFloat(inputBox.value());
      if (!isNaN(minutes) && minutes > 0) {
        cookDurationSec = minutes * 60;
        console.log(`Cook time set to ${minutes} minute(s).`);
      }
    });

    // Generate noodle baseline data
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
    drawHeader();

    let doneness = 0;
    if (simCook && cookStart) {
      const elapsedSec = (p.millis() - cookStart) / 1000;
      doneness = p.constrain(elapsedSec / cookDurationSec, 0, 1);
      if (doneness >= 1) {
        simCook = false;
        cookStart = null;
      }
    }

    drawPasta(doneness);
  };

  function drawHeader() {
    p.noStroke();
    p.fill('#efe2c7');
    p.rect(0, 10, p.width, 140);
    p.fill('#6b4b2b');
    p.textSize(22);
    p.textAlign(p.CENTER, p.CENTER);

    if (simCook && cookStart) {
      const elapsedSec = Math.min((p.millis() - cookStart) / 1000, cookDurationSec);
      const rem = Math.max(0, cookDurationSec - elapsedSec);
      const mins = Math.floor(rem / 60);
      const secs = Math.ceil(rem % 60);
      p.text(`Cooking... ${mins}m ${secs}s remaining`, p.width / 2, 50);
      p.textSize(14);
      p.text('Press any key or click to pause/resume', p.width / 2, 85);
    } else {
      p.text(`Press any key or click to start cooking (${cookDurationSec / 60} min timer)`, p.width / 2, 50);
      p.textSize(14);
      p.text('Noodles curl into spaghetti as they cook.', p.width / 2, 85);
    }
  }

  function drawPasta(doneness) {
    const left = p.width * 0.08;
    const right = p.width * 0.92;
    const baseColor = p.color(238, 205, 119);

    for (let i = 0; i < noodles.length; i++) {
      const n = noodles[i];
      const jitter = (p.noise(n.seed + p.frameCount * 0.002) - 0.5) * 1.0;
      const y = n.y + jitter;

      const strokeW = p.lerp(n.thickness, Math.max(0.9, n.thickness * 0.45), doneness);
      p.strokeWeight(strokeW);

      const c = p.color(
        p.red(baseColor) + n.hueOffset - doneness * 6,
        p.green(baseColor) + n.hueOffset * 0.3 - doneness * 4,
        p.blue(baseColor) + n.hueOffset * -0.2 - doneness * 2
      );
      p.stroke(c);
      p.noFill();

      const maxAmp = p.lerp(2, 48, doneness);
      const freq = p.lerp(0.008, 0.09, doneness);
      const noiseAmt = p.lerp(0.4, 8, doneness);
      const steps = Math.floor(p.lerp(20, 160, doneness));

      p.beginShape();
      p.curveVertex(left - 20, y);

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = p.lerp(left, right, t);
        const phase = (n.seed * 10 + p.frameCount * 0.02) + t * 100 * freq;
        const sinOffset = Math.sin(phase * p.TWO_PI) * maxAmp;
        const noiseOffset = (p.noise(n.seed + t * 10 + p.frameCount * 0.01) - 0.5) * noiseAmt;
        const bendFinal = p.lerp(0, sinOffset + noiseOffset, doneness);
        p.curveVertex(x, y + bendFinal);
      }

      p.curveVertex(right + 20, y);
      p.endShape();
    }
  }

  p.keyPressed = function () {
    simCook = !simCook;
    cookStart = simCook ? p.millis() : null;
  };

  p.mousePressed = function () {
    simCook = !simCook;
    cookStart = simCook ? p.millis() : null;
  };

  p.windowResized = function () {
    p.resizeCanvas(Math.floor(p.windowWidth * 0.9), 700);
    // reposition UI when resized
    inputBox.position(p.width / 2 - 100, 155);
    startButton.position(p.width / 2 - 25, 155);
  };
});
