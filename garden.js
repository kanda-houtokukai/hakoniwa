// 箱庭 - 庭師が毎日一手ずつ育てる庭。
// garden-data.json の記録を読み、庭全体を描く。

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function skyColors(hour) {
  // 0-24時を4つの時間帯に分け、空の色を緩やかに補間する。
  const stops = [
    { h: 0, top: "#0b1026", bottom: "#1b2350" }, // 夜
    { h: 5, top: "#2b3a67", bottom: "#e08a6b" }, // 夜明け
    { h: 7, top: "#8fd3f4", bottom: "#f7e7a1" }, // 朝
    { h: 12, top: "#4fa8e0", bottom: "#cdeeff" }, // 昼
    { h: 17, top: "#3c6ea5", bottom: "#f3a35c" }, // 夕
    { h: 19, top: "#1b2350", bottom: "#4a2c5e" }, // 宵
    { h: 24, top: "#0b1026", bottom: "#1b2350" }, // 夜
  ];
  let a = stops[0];
  let b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (hour >= stops[i].h && hour <= stops[i + 1].h) {
      a = stops[i];
      b = stops[i + 1];
      break;
    }
  }
  const span = b.h - a.h || 1;
  const t = (hour - a.h) / span;
  return { top: lerpColor(a.top, b.top, t), bottom: lerpColor(a.bottom, b.bottom, t) };
}

function lerpColor(c1, c2, t) {
  const p1 = hexToRgb(c1);
  const p2 = hexToRgb(c2);
  const r = Math.round(p1.r + (p2.r - p1.r) * t);
  const g = Math.round(p1.g + (p2.g - p1.g) * t);
  const b = Math.round(p1.b + (p2.b - p1.b) * t);
  return `rgb(${r},${g},${b})`;
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// 再帰的に枝を描く。sway は風によるゆらぎ角(ラジアン)。
function drawBranch(ctx, x, y, len, angle, depth, rand, time, seedOffset) {
  if (depth <= 0 || len < 2) return;

  const sway = Math.sin(time * 0.0012 + seedOffset) * (0.05 * depth);
  const a = angle + sway;
  const x2 = x + Math.cos(a) * len;
  const y2 = y + Math.sin(a) * len;

  ctx.lineWidth = Math.max(1, depth * 1.6);
  ctx.strokeStyle = depth > 2 ? "#5b3a29" : "#6b8f3d";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  if (depth === 1) {
    // 若葉
    ctx.fillStyle = "#8fbf5a";
    ctx.beginPath();
    ctx.ellipse(x2, y2, 4, 2.5, a, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const branches = depth > 3 ? 2 : rand() > 0.5 ? 2 : 1;
  const spread = 0.35 + rand() * 0.25;
  for (let i = 0; i < branches; i++) {
    const dir = i === 0 ? -1 : 1;
    drawBranch(
      ctx,
      x2,
      y2,
      len * (0.72 + rand() * 0.1),
      a + dir * spread,
      depth - 1,
      rand,
      time,
      seedOffset + i + 1
    );
  }
}

function renderSapling(ctx, planting, groundY, width, time) {
  const rand = mulberry32(planting.seed);
  const x = width * planting.x;
  const baseLen = 34;
  const depth = 5;
  drawBranch(ctx, x, groundY, baseLen, -Math.PI / 2, depth, rand, time, planting.seed % 100);
}

const PLANT_RENDERERS = {
  sapling: renderSapling,
};

function drawGround(ctx, width, height, groundY) {
  const grad = ctx.createLinearGradient(0, groundY, 0, height);
  grad.addColorStop(0, "#4f7a3d");
  grad.addColorStop(1, "#2f4d26");
  ctx.fillStyle = grad;
  ctx.fillRect(0, groundY, width, height - groundY);

  // 草の質感(決まった模様: 毎回同じ土)
  const rand = mulberry32(1);
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  for (let i = 0; i < width / 6; i++) {
    const bx = rand() * width;
    const by = groundY + rand() * (height - groundY);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + (rand() - 0.5) * 4, by - 4 - rand() * 4);
    ctx.stroke();
  }
}

async function main() {
  const canvas = document.getElementById("garden");
  const ctx = canvas.getContext("2d");

  let data = { plantings: [] };
  try {
    const res = await fetch("garden-data.json");
    data = await res.json();
  } catch (e) {
    console.error("庭の記録を読み込めませんでした", e);
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  function frame(time) {
    const width = canvas.getBoundingClientRect().width;
    const height = canvas.getBoundingClientRect().height;
    const groundY = height * 0.78;

    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    const sky = skyColors(hour);
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, sky.top);
    skyGrad.addColorStop(1, sky.bottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, groundY);

    drawGround(ctx, width, height, groundY);

    for (const planting of data.plantings) {
      const renderer = PLANT_RENDERERS[planting.type];
      if (renderer) renderer(ctx, planting, groundY, width, time);
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

main();
