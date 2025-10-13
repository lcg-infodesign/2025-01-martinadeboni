let table;
let filteredRows = [];
let values = [[], [], [], [], []];
let stats = {};
let dynamicHeight;
let scrollY = 0; // posizione dello scroll

function preload() {
  table = loadTable("dataset.csv", "csv", "header");
}

function setup() {
  // --- FILTRO ---
  for (let i = 0; i < table.getRowCount(); i++) {
    let row = table.getRow(i);
    let col3 = row.getNum(3);
    if (col3 % 3 === 0 && col3 >= 30 && col3 < 42) {
      for (let c = 0; c < 5; c++) values[c].push(row.getNum(c));
      filteredRows.push(row);
    }
  }

  // --- STATISTICHE ---
  stats.mean1 = mean(values[0]);
  stats.std2 = standardDeviation(values[1]);
  stats.mode3 = mode(values[2]);
  stats.median4 = median(values[3]);
  stats.mean5 = mean(values[4]);
  stats.std5 = standardDeviation(values[4]);

  // --- Altezza dinamica ---
  let baseHeight = 1000;
  let rowHeight = 18;
  let tableHeight = filteredRows.length * rowHeight + 120;
  dynamicHeight = baseHeight + max(0, tableHeight - 200);

  createCanvas(950, 800); // finestra fissa
  textFont("monospace");
}

function draw() {
  background(245);
  push();
  translate(0, -scrollY); // applica lo scorrimento

  textAlign(LEFT, CENTER);
  fill(50);
  drawFilteredRows(40, 40);

  let rowHeight = 18;
  let tableHeight = filteredRows.length * rowHeight + 20;
  let yOffset = 40 + tableHeight + 40;

  drawHeader(yOffset);
  drawMeanBar(40, yOffset + 60);
  drawGauge(40, yOffset + 180);
  drawBarChart(500, yOffset + 60);
  drawMedianBox(500, yOffset + 300);
  drawMeanErrorBar(40, yOffset + 420);


  pop();

  drawScrollbar();
}

// --- SCROLL CON MOUSE ---
function mouseWheel(event) {
  scrollY += event.delta / 2; 
  scrollY = constrain(scrollY, 0, dynamicHeight - height);
}

// --- SCROLLBAR VISIVA ---
function drawScrollbar() {
  let visibleRatio = height / dynamicHeight;
  let scrollbarHeight = visibleRatio * height;
  let scrollbarY = map(scrollY, 0, dynamicHeight - height, 0, height - scrollbarHeight);

  noStroke();
  fill(200);
  rect(width - 12, 0, 12, height, 6);
  fill(100, 150, 250);
  rect(width - 12, scrollbarY, 12, scrollbarHeight, 6);
}

// --- HEADER ---
function drawHeader(yStart) {
  fill(20, 60, 120);
  textSize(24);
  textStyle(BOLD);
  text("Analisi statistica dataset filtrato", 40, yStart);
  stroke(20, 60, 120, 150);
  line(40, yStart + 15, 400, yStart + 15);
  noStroke();
  textSize(14);
  fill(70);
  text(`Righe valide: ${filteredRows.length}`, 40, yStart - 30);
}

// --- MEDIA ---
function drawMeanBar(x, y) {
  let maxVal = Math.max(...values[0]);
  let barWidth = map(stats.mean1, 0, maxVal, 0, 350);
  fill(230);
  rect(x, y, 360, 25, 10);
  fill(60, 130, 220);
  rect(x, y, barWidth, 25, 10);
  fill(30);
  textSize(14);
  text(`Media prima colonna (col.0) = ${stats.mean1.toFixed(2)}`, x, y - 15);
}

// --- DEVIAZIONE STANDARD (seconda colonna) ---
function drawGauge(x, y) {
  let sigma = stats.std2;

  // Funzione di interpretazione testuale della deviazione standard
  function describeDeviation(std) {
    if (std < 3) return "Bassa variabilità dei valori (dataset molto uniforme)";
    if (std < 7) return "Variabilità media dei valori";
    if (std < 12) return "Alta variabilità dei dati";
    return "Dispersione molto elevata \n(valori molto diversi tra loro)";
  }

  let descrizione = describeDeviation(sigma);

  // Testo descrittivo
  fill(30);
  textSize(14);
  text(`σ seconda colonna (col.1) = ${sigma.toFixed(2)}`, x, y);
  textSize(13);
  fill(70);
  text(descrizione, x, y + 25);
}


// --- MODA ---
function drawBarChart(x, y) {
  let freq = {};
  for (let v of values[2]) freq[v] = (freq[v] || 0) + 1;
  let keys = Object.keys(freq).map(Number).sort((a, b) => a - b);
  let maxFreq = Math.max(...Object.values(freq));
  let w = 380 / keys.length;
  let moda = stats.mode3;
  let freqModa = freq[moda];

  fill(30);
  textSize(14);
  text(`Moda terza colonna (col.2) = ${moda} (compare ${freqModa} volte)`, x, y - 10);

  let yOffset = y + 10;

  for (let i = 0; i < keys.length; i++) {
    let h = map(freq[keys[i]], 0, maxFreq, 0, 100);
    let isMode = keys[i] === moda;
    fill(isMode ? color(80, 180, 120) : color(140, 170, 230));
    rect(x + i * w, yOffset + 100 - h, w - 4, h, 6);
    fill(40);
    textSize(12);
    textAlign(CENTER);
    text(freq[keys[i]], x + i * w + w / 2, yOffset + 120);
  }

  fill(70);
  textSize(12);
  textAlign(CENTER);
  text("Valori col. 3", x + 190, yOffset + 150);
  textAlign(LEFT);
  fill(50);
  textSize(13);
  text(`Il valore più frequente nella colonna 3 è ${moda},\nche compare ${freqModa} volte.`, x, yOffset + 183);
}

// --- MEDIANA ---
function drawMedianBox(x, y) {
  let sorted = [...values[3]].sort((a, b) => a - b);
  let minVal = sorted[0];
  let maxVal = sorted[sorted.length - 1];
  let med = stats.median4;

  function medianSymbol(value) {
    if (value < 32) return "★☆☆☆☆ (basso)";
    if (value < 36) return "★★★☆☆ (medio)";
    if (value < 39) return "★★★★☆ (alto)";
    return "★★★★★ (molto alto)";
  }

  let symbol = medianSymbol(med);
  textSize(14);
  text(`Mediana quarta colonna (col.3) = ${med} → ${symbol}`, x, y + 10);

}

// --- MEDIA E σ (quinta colonna) ---
function drawMeanErrorBar(x, y) {
  let mean = stats.mean5;
  let std = stats.std5;

  // Limiti del dataset (puoi regolarli)
  let minVal = Math.min(...values[4]);
  let maxVal = Math.max(...values[4]);

  // Mappa coordinate
  let xMean = map(mean, minVal, maxVal, x + 10, x + 360);
  let xMin = map(mean - std, minVal, maxVal, x + 10, x + 360);
  let xMax = map(mean + std, minVal, maxVal, x + 10, x + 360);

  // Fascia deviazione
  fill(150, 200, 255, 80);
  noStroke();
  rect(xMin, y, xMax - xMin, 20, 6);

  // Linea media
  stroke(0);
  strokeWeight(3);
  line(xMean, y - 5, xMean, y + 25);

  // Testo
  noStroke();
  fill(30);
  textSize(14);
  text(`Media quinta colonna (col.4) = ${mean.toFixed(2)} | σ = ${std.toFixed(2)}`, x, y - 15);
  fill(70);
  textSize(12);
  textAlign(CENTER);
  text("Valori col. 5", x + 190, y + 50);
  textAlign(LEFT);
}


// --- TABELLA ---
function drawFilteredRows(x, yStart) {
  let y = yStart;
  let rowHeight = 18;
  let colWidth = 150;

  textSize(12);
  textAlign(LEFT, CENTER);
  fill(80);
  for (let c = 0; c < table.columns.length; c++) {
    text(table.columns[c], x + c * colWidth, y);
  }
  y += rowHeight;
  stroke(200);
  line(x, y - 5, x + table.columns.length * colWidth, y - 5);
  noStroke();

  for (let i = 0; i < filteredRows.length; i++) {
    let row = filteredRows[i];
    fill(i % 2 === 0 ? color(230, 240, 255, 150) : color(245, 245, 245, 150));
    rect(x, y - rowHeight / 2, table.columns.length * colWidth, rowHeight, 4);
    fill(0);
    for (let c = 0; c < table.columns.length; c++) {
      text(row.getString(c), x + c * colWidth, y);
    }
    y += rowHeight;
  }
}

// --- STATISTICHE DI BASE ---
function mean(v) {
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN;
}
function standardDeviation(v) {
  if (!v.length) return NaN;
  let avg = mean(v);
  let sqDiff = v.map(x => (x - avg) ** 2);
  return Math.sqrt(mean(sqDiff));
}
function median(v) {
  if (!v.length) return NaN;
  let s = [...v].sort((a, b) => a - b);
  let mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function mode(v) {
  if (!v.length) return NaN;
  let f = {};
  v.forEach(x => (f[x] = (f[x] || 0) + 1));
  let maxVal = Math.max(...Object.values(f));
  return parseFloat(Object.keys(f).find(k => f[k] === maxVal));
}
