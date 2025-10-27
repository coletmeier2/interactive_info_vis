// ...existing code...
// Example 9
registerSketch('sk3', function (p) {
  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = function () {
    // Cutting board background
    p.noStroke();
    const plankCount = Math.max(4, Math.floor(p.width / 160));
    const plankW = p.width / plankCount;
    const baseA = p.color('#e3b07a');
    const baseB = p.color('#c28a48');

    for (let i = 0; i < plankCount; i++) {
      const t = i / Math.max(1, plankCount - 1);
      const noiseShift = (p.noise(i * 0.28) - 0.5) * 0.12;
      const col = p.lerpColor(baseA, baseB, Math.min(1, Math.max(0, t + noiseShift)));
      p.fill(col);
      // +1 to avoid tiny gaps due to rounding
      p.rect(i * plankW, 0, plankW + 1, p.height);
    }

    // subtle wood grain lines (slightly animated)
    p.strokeWeight(1);
    p.stroke(60, 28); // grayscale with alpha
    for (let y = 0; y < p.height; y += 6) {
      const offset = (p.noise(y * 0.002, p.millis() * 0.00005) - 0.5) * 18;
      p.line(0, y + offset, p.width, y - offset);
    }

    // faint edge wear
    p.noFill();
    p.stroke(255, 255, 255, 8);
    p.strokeWeight(2);
    p.rect(4, 4, p.width - 8, p.height - 8);

    // helper to sample plank color under an x position (keeps separators matching board)
    function plankColorAtX(x) {
      const idx = Math.min(plankCount - 1, Math.max(0, Math.floor(x / plankW)));
      const t = idx / Math.max(1, plankCount - 1);
      const noiseShift = (p.noise(idx * 0.28) - 0.5) * 0.12;
      return p.lerpColor(baseA, baseB, Math.min(1, Math.max(0, t + noiseShift)));
    }

    // Corner time display
    const h = p.hour();
    const m = p.minute();
    const s = p.second();

    //Line Width
    var begin = p.width / 20;
    var end = (p.width / 20) * 19;

    // ...existing code...
    // Hour Line
    var hX = begin + (h / 23 * (end - begin));
    var hY = p.height / 4;

    p.noStroke();
    p.fill(1);
    p.textSize(50);
    p.text(p.nf(h, 2), hX - 30, hY - 40);

    // Asparagus-style hour line (24 segments)
    var asparagusLeft = begin + 8;
    var asparagusRight = end - 8;
    var asparagusW = asparagusRight - asparagusLeft;
    var totalAsparagus = 24;               // <- changed to 24 segments
    var segW_H = asparagusW / totalAsparagus;
    var segRadiusH = Math.max(6, p.width * 0.006);
    var segH_H = Math.max(24, p.width * 0.015);

    // subtle guide under stalk
    p.strokeWeight(12);
    p.stroke('#43523b');
    p.line(end, hY, begin, hY);

    // draw segmented stalk pieces with small bud at top for each segment
    for (var i = 0; i < totalAsparagus; i++) {
      var segX = asparagusLeft + i * segW_H;
      // slight color variation along the stalk
      var t = i / Math.max(1, totalAsparagus - 1);
      var colA = p.color('#6bb24a');
      var colB = p.color('#3b8f2e');
      var stalkCol = p.lerpColor(colA, colB, t * 0.6);

      p.noStroke();
      p.fill(stalkCol);
      p.rect(segX, hY - segH_H / 2, segW_H - 1, segH_H, segRadiusH);

      // darker top stripe for a ridged look
      p.fill('#4a8a2e');
      p.rect(segX, hY - segH_H / 2, segW_H - 1, Math.max(4, segH_H / 3), segRadiusH);

      // small bud/node at the top of each segment
      p.fill('#2f7a2a');
      p.ellipse(segX + segW_H * 0.5, hY - segH_H * 0.6, segW_H * 0.9, segH_H * 0.45);
    }

    // show "cuts" / separators according to hour (map 24h -> 24 segments)
    var choppedH = h % 24;
    if (choppedH === 0) choppedH = 24; // show full set at 0 (midnight) for clarity
    var sepWH = Math.max(3, segW_H * 0.16);
    for (var j = 1; j <= choppedH; j++) {
      var sepXH = asparagusLeft + j * segW_H - sepWH / 2;
      p.noStroke();
      p.fill(plankColorAtX(sepXH));
      p.rect(sepXH, hY - segH_H / 2, sepWH, segH_H, 2);
      // thin highlight line on each cut
      p.stroke('#dfeade');
      p.strokeWeight(1.8);
      p.line(sepXH + sepWH / 2, hY - segH_H / 2 + 2, sepXH + sepWH / 2, hY + segH_H / 2 - 2);
      p.noStroke();
    }

    // tip cluster on the right end
    p.noStroke();
    p.fill('#2f7a2a');
    p.triangle(asparagusRight + 6, hY, asparagusRight + 28, hY - segH_H * 0.6, asparagusRight + 28, hY + segH_H * 0.6);
    p.fill('#3b8f2e');
    p.triangle(asparagusRight + 6, hY, asparagusRight + 20, hY - segH_H * 0.35, asparagusRight + 20, hY + segH_H * 0.35);
    // ...existing code...

    // Minute Line
    var mX = begin + (m / 59 * (end - begin));
    var mY = p.height / 4 * 2;

    p.noStroke();
    p.fill(1);
    p.textSize(50);
    p.text(p.nf(m, 2), mX - 30, mY - 40);

    // Draw carrot minute hand (horizontal, like a carrot on the board)
    // guide line (subtle) under the carrot
    p.strokeWeight(12);
    p.stroke('#b8864fff');
    p.line(end, mY, begin, mY);

    // Carrot layout
    var carrotLeft = begin + 8;
    var carrotRight = end - 8;
    var carrotW = carrotRight - carrotLeft;
    // make carrot noticeably thicker: larger min/max and multiplier
    var carrotH = Math.max(24, p.min(80, p.width * 0.015)); // responsive height (thicker)

    // Draw carrot segments across the shaft so minute cuts can be shown (60 segments)
    var totalSegmentsC = 60;
    var segWc = carrotW / totalSegmentsC;
    var segRadiusC = Math.max(6, carrotH * 0.45);
    var segHc = carrotH + 8;

    // base orange shaft (draw segments to allow 'cut' reveals)
    for (var i = 0; i < totalSegmentsC; i++) {
      var segX = carrotLeft + i * segWc;
      // main body orange
      p.noStroke();
      p.fill('#f18b2b'); // carrot orange
      p.rect(segX, mY - segHc / 2, segWc - 1, segHc, segRadiusC);
      // top shading stripe
      p.fill('#ec9538');
      p.rect(segX, mY - segHc / 2, segWc - 1, Math.max(3, segHc / 3), segRadiusC);
    }

    // Draw tapered point at the right end (triangle overlay)
    p.noStroke();
    p.fill('#e36f16');
    p.triangle(carrotRight + 6, mY, carrotRight + 44, mY - carrotH * 0.6, carrotRight + 44, mY + carrotH * 0.6);
    // small highlight on the tip (wider)
    p.fill('#ff9b39');
    p.triangle(carrotRight + 6, mY, carrotRight + 28, mY - carrotH * 0.25, carrotRight + 28, mY + carrotH * 0.25);

    // leafy top (left)
    p.noStroke();
    // larger leafy top to match thicker carrot
    p.fill('#3f8b2e');
    p.ellipse(carrotLeft - 8, mY - carrotH * 0.45, carrotH * 1.4, carrotH * 0.9);
    p.fill('#2f7a2a');
    p.ellipse(carrotLeft - 2, mY - carrotH * 1.15, carrotH * 1.6, carrotH * 1.0);
    p.fill('#4aa63a');
    p.ellipse(carrotLeft + 12, mY - carrotH * 0.8, carrotH * 1.2, carrotH * 0.85);

    // Show cuts based on current minute by revealing board color between segments
    var choppedC = m; // number of cuts equals current minute (0..59)
    var sepWc = Math.max(2, segWc * 0.16);
    for (var j = 1; j <= choppedC; j++) {
      var sepXc = carrotLeft + j * segWc - sepWc / 2;
      p.noStroke();
      p.fill(plankColorAtX(sepXc));
      p.rect(sepXc, mY - segHc / 2, sepWc, segHc, 2);
      // thin cut line for emphasis
      p.stroke('#f6e8d6');
      p.strokeWeight(1.8);
      p.line(sepXc + sepWc / 2, mY - segHc / 2 + 2, sepXc + sepWc / 2, mY + segHc / 2 - 2);
      p.noStroke();
    }

    // Second Line (green onion)
    var sX = begin + (s / 59 * (end - begin));
    var sY = p.height / 4 * 3;

    // label
    p.noStroke();
    p.fill(1);
    p.textSize(50);
    p.text(p.nf(s, 2), sX - 30, sY - 40);

    // guide line (cutting board line) - lighter and thinner so it doesn't show through rounded rectangles
    p.strokeWeight(14);
    p.stroke('#caa16b'); // lighter wood tone
    p.line(end, sY, begin, sY);

    // Green onion layout
    var onionLeft = begin + 8;
    var onionRight = end - 8;
    var onionW = onionRight - onionLeft;
    var onionH = Math.max(18, p.min(36, p.width * 0.01)); // responsive height

    // Draw bulb (white) on the left - improved: layered shading + root tuft
    p.noStroke();
    // outer bulb
    p.fill('#fffef6');
    p.ellipse(onionLeft, sY, onionH * 1.9, onionH * 1.9);
    // mid shading
    p.fill('#f2eadc');
    p.ellipse(onionLeft - onionH * 0.08, sY - onionH * 0.08, onionH * 1.6, onionH * 1.4);
    // slight warm inner ring
    p.fill('#efe1c8');
    p.ellipse(onionLeft - onionH * 0.04, sY + onionH * 0.06, onionH * 0.9, onionH * 0.9);
    // tiny root base
    p.fill('#b27b4c');
    p.ellipse(onionLeft, sY + onionH * 0.7, onionH * 0.35, onionH * 0.18);
    // root hairs
    p.stroke('#8a5b3a');
    p.strokeWeight(1.5);
    p.line(onionLeft - 2, sY + onionH * 0.6, onionLeft - 8, sY + onionH * 0.95);
    p.line(onionLeft + 2, sY + onionH * 0.6, onionLeft + 8, sY + onionH * 0.95);
    p.noStroke();

    // Keep all segments visible; draw a small separator for each second (one cut per second)
    var totalSegments = 60;            // one potential cut per second across the shaft
    var chopped = s;                   // number of cuts equals current seconds (0..59)
    var segW = onionW / totalSegments;
    var segRadius = 6;

    // Draw all segments (continuous green onion) - make them slightly taller to fully cover guide line
    var segH = onionH + 8;
    for (var i = 0; i < totalSegments; i++) {
      var segX = onionLeft + i * segW;
      p.noStroke();
      p.fill('#6bb24a');
      p.rect(segX, sY - segH / 2, segW - 1, segH, segRadius);
      // subtle top shading
      p.fill('#4a8a2e');
      p.rect(segX, sY - segH / 2, segW - 1, Math.max(3, segH / 3), segRadius);
    }

    // Draw small separators (gaps) between pieces for each cut that has occurred
    var sepW = Math.max(2, segW * 0.18); // narrow separator width
    for (var j = 1; j <= chopped; j++) {
      var sepX = onionLeft + j * segW - sepW / 2;
      // fill separator with the plank color under that x so it blends into the board
      p.noStroke();
      p.fill(plankColorAtX(sepX));
      p.rect(sepX, sY - segH / 2, sepW, segH, 2);
      // thin cut line for visual emphasis
      p.stroke('#d1b9d9');
      p.strokeWeight(2);
      p.line(sepX + sepW / 2, sY - segH / 2 + 2, sepX + sepW / 2, sY + segH / 2 - 2);
      p.noStroke();
    }

    // Draw leafy end at the right
    p.noStroke();
    p.fill('#2f7a2a');
    p.triangle(onionRight + 6, sY, onionRight + 28, sY - 12, onionRight + 18, sY + 6);
    p.fill('#3b8f2e');
    p.triangle(onionRight + 6, sY, onionRight + 28, sY + 12, onionRight + 18, sY - 6);
  }; // close p.draw

  p.windowResized = function () { p.resizeCanvas(p.windowWidth, p.windowHeight); };
});
