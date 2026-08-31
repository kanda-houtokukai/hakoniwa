// 庭の描画エンジン。
// GARDEN_DATA の各エントリを、seed から決定的に生成した花として描く。
// 新しい日は GARDEN_DATA に1エントリ追加するだけで、この庭に1本増える。

function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededRandom(seed) {
  return mulberry32(xmur3(String(seed))());
}

function drawFlower(ctx, baseX, baseY, scale, rng) {
  const stemHeight = (90 + rng() * 70) * scale;
  const sway = (rng() - 0.5) * 40 * scale;
  const topX = baseX + sway * 0.6;
  const topY = baseY - stemHeight;

  // 茎
  ctx.strokeStyle = "#3f7d3f";
  ctx.lineWidth = 3 * scale;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.quadraticCurveTo(baseX + sway, baseY - stemHeight / 2, topX, topY);
  ctx.stroke();

  // 葉(1枚)
  const leafT = 0.5 + rng() * 0.15;
  const leafX = baseX + sway * leafT;
  const leafY = baseY - stemHeight * leafT;
  const leafDir = rng() > 0.5 ? 1 : -1;
  ctx.fillStyle = "#4f9a4f";
  ctx.beginPath();
  ctx.ellipse(
    leafX + leafDir * 10 * scale,
    leafY,
    12 * scale,
    5 * scale,
    leafDir * 0.6,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // 花
  const petalCount = 5 + Math.floor(rng() * 4);
  const hue = Math.floor(rng() * 360);
  const petalColor = `hsl(${hue}, 70%, 65%)`;
  const centerColor = `hsl(${(hue + 40) % 360}, 85%, 55%)`;
  const petalLen = 15 * scale;
  const petalWidth = 8 * scale;

  ctx.fillStyle = petalColor;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    ctx.save();
    ctx.translate(topX, topY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, -petalLen / 2, petalWidth / 2, petalLen / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = centerColor;
  ctx.beginPath();
  ctx.arc(topX, topY, 6 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function render() {
  const canvas = document.getElementById("garden");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 空
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, "#8ec5ff");
  skyGrad.addColorStop(1, "#eaf7ff");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // 地面
  const groundY = h * 0.78;
  const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
  groundGrad.addColorStop(0, "#7bb861");
  groundGrad.addColorStop(1, "#4f8f3d");
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, groundY, w, h - groundY);

  // 植栽
  const data = window.GARDEN_DATA || [];
  data.forEach((entry, i) => {
    const rng = seededRandom(entry.seed || entry.date + i);
    const x = (entry.x != null ? entry.x : (i + 1) / (data.length + 1)) * w;
    drawFlower(ctx, x, groundY, 1, rng);
  });
}

window.addEventListener("resize", render);
window.addEventListener("DOMContentLoaded", render);
