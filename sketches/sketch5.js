// Sketch 5 — Productivity vs. Average Compensation (indexed, interactive)
registerSketch('sk5', function (p) {
  let years = [];
  let data = {};
  let slider;
  p.dataLoadMsg = '';

  p.setup = function () {
    p.createCanvas(Math.min(1100, p.windowWidth * 0.95), 560);
    p.textFont('Helvetica');

    // slider for selecting year
    slider = p.createSlider(0, 0, 0, 1);
    slider.position(20, p.height - 36);
    slider.style('width', (p.width - 70) + 'px');

    tryLoad([
      '../productivity_n_hourly_compensation.csv',
      'productivity_n_hourly_compensation.csv'
    ]);
  };

  function tryLoad(paths) {
    if (!paths || paths.length === 0) {
      p.dataLoadMsg = 'No CSV found';
      return;
    }
    const path = paths.shift();
    fetch(path)
      .then(r => { if (!r.ok) throw new Error('not-found'); return r.text(); })
      .then(txt => {
        parseCsvText(txt);
        if (years.length > 0) {
          slider.elt.max = Math.max(0, years.length - 1);
          slider.value(Math.max(0, years.length - 1));
        }
      })
      .catch(err => tryLoad(paths));
  }

  function parseCsvText(txt) {
    const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map(h => h.trim());
    const yearIdx = headers.findIndex(h => /year/i.test(h));
    const avgIdx = headers.findIndex(h => /average_compensation/i.test(h));
    const prodIdx = headers.findIndex(h => /net_productivity_per_hour_worked/i.test(h));

    years = [];
    data = { average_compensation: [], net_productivity_per_hour_worked: [] };

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(s => s.trim());
      const year = parseInt(parts[yearIdx]);
      const avg = parseFloat(parts[avgIdx]);
      const prod = parseFloat(parts[prodIdx]);
      if (!isNaN(year)) {
        years.push(year);
        data.average_compensation.push(isNaN(avg) ? null : avg);
        data.net_productivity_per_hour_worked.push(isNaN(prod) ? null : prod);
      }
    }

    // sort by year
    const combined = years.map((y, i) => ({
      y,
      avg: data.average_compensation[i],
      prod: data.net_productivity_per_hour_worked[i]
    }));
    combined.sort((a, b) => a.y - b.y);
    years = combined.map(c => c.y);
    data.average_compensation = combined.map(c => c.avg);
    data.net_productivity_per_hour_worked = combined.map(c => c.prod);

    // index both series to the first year (100)
    const baseAvg = data.average_compensation[0];
    const baseProd = data.net_productivity_per_hour_worked[0];
    data.average_compensation = data.average_compensation.map(v => (v / baseAvg) * 100);
    data.net_productivity_per_hour_worked = data.net_productivity_per_hour_worked.map(v => (v / baseProd) * 100);
  }

  p.draw = function () {
    p.background('#fff');
    p.fill(34); p.textSize(18); p.textAlign(p.LEFT, p.CENTER);
    p.text('When Work Outpaces Wages — Productivity vs. Average Compensation (Indexed)', 20, 24);

    p.textSize(12); p.fill(90);
    p.text(p.dataLoadMsg, 20, 44);

    if (years.length === 0) return;

    const margin = 60;
    const chartW = p.width - margin * 2;
    const chartH = p.height - 160;
    const baseY = p.height - 80;

    // scale functions
    const allValues = [...data.average_compensation, ...data.net_productivity_per_hour_worked].filter(v => v !== null);
    const minY = Math.min(...allValues) * 0.95;
    const maxY = Math.max(...allValues) * 1.05;
    const scaleY = v => baseY - (v - minY) / (maxY - minY) * chartH;
    const scaleX = i => margin + i / (years.length - 1) * chartW;

    // lines
    const colors = { average_compensation: '#ff6600', net_productivity_per_hour_worked: '#0066cc' };
    Object.keys(data).forEach(key => {
      p.stroke(colors[key]); p.noFill(); p.strokeWeight(2);
      p.beginShape();
      data[key].forEach((v, i) => { if (v !== null) p.vertex(scaleX(i), scaleY(v)); });
      p.endShape();
    });

    // x-axis labels (every other year to reduce overlap)
    p.noStroke(); p.fill(30); p.textSize(10); p.textAlign(p.CENTER, p.TOP);
    for (let i = 0; i < years.length; i += Math.ceil(years.length / 10)) {
      p.text(years[i], scaleX(i), baseY + 4);
    }

    // slider highlight
    const idx = slider.value();
    const highlightX = scaleX(idx);
    p.stroke(0); p.strokeWeight(1); p.line(highlightX, baseY, highlightX, baseY - chartH);
    p.noStroke();

    p.fill(colors.net_productivity_per_hour_worked);
    p.ellipse(highlightX, scaleY(data.net_productivity_per_hour_worked[idx]), 8, 8);
    p.fill(colors.average_compensation);
    p.ellipse(highlightX, scaleY(data.average_compensation[idx]), 8, 8);

    // legend (vertical, below title)
    let lx = margin;       
    let ly = 50;          
    p.textSize(12);
    let legendSpacing = 25;  
    const boxSize = 12;      
    const padding = 6;       

    Object.keys(data).forEach((key, i) => {
      p.fill(colors[key]);
      p.rect(lx, ly + i * legendSpacing, boxSize, boxSize, 3);
      p.fill(30);
      p.textAlign(p.LEFT, p.CENTER);
      p.text(key.replace(/_/g, ' '), lx + boxSize + padding, ly + i * legendSpacing + boxSize / 2);
    });

    // value labels for selected year
    p.textAlign(p.CENTER, p.BOTTOM);
    p.fill(colors.net_productivity_per_hour_worked);
    p.text(data.net_productivity_per_hour_worked[idx].toFixed(1), highlightX, scaleY(data.net_productivity_per_hour_worked[idx]) - 8);
    p.fill(colors.average_compensation);
    p.text(data.average_compensation[idx].toFixed(1), highlightX, scaleY(data.average_compensation[idx]) - 8);
    p.textAlign(p.CENTER, p.TOP);
    p.fill(30);
    p.text(years[idx], highlightX, baseY + 16);

    // y-axis label
    p.push();
    p.translate(20, baseY - chartH/2);
    p.rotate(-p.HALF_PI);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('Indexed Value (1948 = 100)', 0, 0);
    p.pop();
  };

  p.windowResized = function () {
    p.resizeCanvas(Math.min(1100, p.windowWidth * 0.95), 560);
    if (slider) slider.position(20, p.height - 36);
  };
});
