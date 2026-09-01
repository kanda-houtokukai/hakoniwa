// 盆栽の成長記録。ここに1日1つ、育てた事実を積み重ねていく。
// 表示ロジックは常に「今の姿」だけを描く。過去の全記録は JOURNAL/ と MEMORY/ に譲る。
const GROWTH_LOG = [
  { date: "2026-09-01", note: "土に種をまき、双葉が出た。盆栽の一生の始まり。" },
];

const SVG_NS = "http://www.w3.org/2000/svg";

function updateSky() {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;

  let topColor, bottomColor, bodyColor, isNight;
  if (hour >= 5 && hour < 7) {
    // 夜明け
    topColor = "#5b6ea8";
    bottomColor = "#f2a65a";
    bodyColor = "#fff4d6";
    isNight = false;
  } else if (hour >= 7 && hour < 17) {
    // 昼
    topColor = "#4a90d9";
    bottomColor = "#bfe3f7";
    bodyColor = "#fff6c9";
    isNight = false;
  } else if (hour >= 17 && hour < 19) {
    // 夕暮れ
    topColor = "#3a3d6b";
    bottomColor = "#e8734a";
    bodyColor = "#ffd9a0";
    isNight = false;
  } else {
    // 夜
    topColor = "#050714";
    bottomColor = "#1b2140";
    bodyColor = "#e8ecf7";
    isNight = true;
  }

  const sky = document.getElementById("sky");
  const sunMoon = document.getElementById("sun-moon");
  sky.style.background = `linear-gradient(to bottom, ${topColor}, ${bottomColor})`;
  sunMoon.style.background = bodyColor;
  sunMoon.style.boxShadow = isNight
    ? `0 0 20px 6px ${bodyColor}55`
    : `0 0 40px 12px ${bodyColor}66`;

  const dayStart = 5;
  const dayEnd = 19;
  let progress;
  if (!isNight) {
    progress = (hour - dayStart) / (dayEnd - dayStart);
  } else {
    const nightHour = hour >= 19 ? hour - 19 : hour + 5;
    progress = nightHour / 10;
  }
  progress = Math.max(0, Math.min(1, progress));

  const x = 10 + progress * 80;
  const y = 50 - Math.sin(progress * Math.PI) * 40;
  sunMoon.style.left = `${x}%`;
  sunMoon.style.top = `${y}%`;
}

function renderPot(svg) {
  const pot = document.createElementNS(SVG_NS, "path");
  pot.setAttribute("d", "M32,78 L68,78 L63,94 L37,94 Z");
  pot.setAttribute("class", "pot");
  svg.appendChild(pot);

  const rim = document.createElementNS(SVG_NS, "rect");
  rim.setAttribute("x", "30");
  rim.setAttribute("y", "75");
  rim.setAttribute("width", "40");
  rim.setAttribute("height", "4");
  rim.setAttribute("rx", "1");
  rim.setAttribute("class", "pot-rim");
  svg.appendChild(rim);

  const soil = document.createElementNS(SVG_NS, "ellipse");
  soil.setAttribute("cx", "50");
  soil.setAttribute("cy", "76");
  soil.setAttribute("rx", "18");
  soil.setAttribute("ry", "2.2");
  soil.setAttribute("class", "soil");
  svg.appendChild(soil);
}

function renderSprout(svg) {
  // 位置決め(translate)とアニメーション(scale)を別グループに分けること。
  // 同じ要素に SVG の transform 属性と CSS transform を両方与えると、
  // CSS 側が属性側を丸ごと上書きしてしまい、位置がずれる。
  const position = document.createElementNS(SVG_NS, "g");
  position.setAttribute("transform", "translate(50,76)");

  const wrap = document.createElementNS(SVG_NS, "g");
  wrap.setAttribute("class", "sprout-wrap");
  position.appendChild(wrap);
  svg.appendChild(position);

  const stem = document.createElementNS(SVG_NS, "path");
  stem.setAttribute("d", "M0,0 L0,-9");
  stem.setAttribute("class", "stem");
  wrap.appendChild(stem);

  const leafL = document.createElementNS(SVG_NS, "path");
  leafL.setAttribute("d", "M0,-6 C -6,-9 -9,-4 -4,-1.5 C -1.5,-3 0,-4.5 0,-6 Z");
  leafL.setAttribute("class", "leaf");
  wrap.appendChild(leafL);

  const leafR = document.createElementNS(SVG_NS, "path");
  leafR.setAttribute("d", "M0,-7.5 C 6,-10.5 9,-6 4,-3 C 1.5,-4.5 0,-6 0,-7.5 Z");
  leafR.setAttribute("class", "leaf");
  wrap.appendChild(leafR);
}

function init() {
  updateSky();
  setInterval(updateSky, 60 * 1000);

  const svg = document.getElementById("bonsai");
  renderPot(svg);
  renderSprout(svg);
}

init();
