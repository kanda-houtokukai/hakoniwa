(function () {
  "use strict";

  var WIDTH = 800;
  var HEIGHT = 500;
  var svgNS = "http://www.w3.org/2000/svg";

  var dataEl = document.getElementById("garden-data");
  var items = JSON.parse(dataEl.textContent);
  var svg = document.getElementById("tray");

  // 過去に置かれたもの一つひとつから波紋が広がり、砂紋を作る。
  // 何も手を加えなくても、置かれたものが増えるほど砂紋は複雑になる。
  function rippleOffset(x, y) {
    var offset = 0;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var dx = x - item.x;
      var dy = y - item.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var wavelength = 18;
      var amplitude = 3.2;
      var falloff = Math.exp(-dist / 220);
      offset += Math.sin((dist / wavelength) * Math.PI * 2) * amplitude * falloff;
    }
    return offset;
  }

  function drawRakeLines() {
    var g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "rake-lines");
    var spacing = 16;
    for (var y = 30; y < HEIGHT - 30; y += spacing) {
      var d = "";
      for (var x = 20; x <= WIDTH - 20; x += 6) {
        var yy = y + rippleOffset(x, y);
        d += (x === 20 ? "M" : "L") + x.toFixed(1) + " " + yy.toFixed(1) + " ";
      }
      var path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", d.trim());
      path.setAttribute("class", "rake-line");
      g.appendChild(path);
    }
    svg.appendChild(g);
  }

  function drawTitle(g, item) {
    var title = document.createElementNS(svgNS, "title");
    title.textContent = item.date + " · " + item.note;
    g.appendChild(title);
  }

  function drawSprout(item) {
    var g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "garden-item item-sprout");
    g.setAttribute("transform", "translate(" + item.x + ", " + item.y + ")");
    drawTitle(g, item);

    var mound = document.createElementNS(svgNS, "ellipse");
    mound.setAttribute("cx", "0");
    mound.setAttribute("cy", "6");
    mound.setAttribute("rx", "14");
    mound.setAttribute("ry", "5");
    mound.setAttribute("class", "soil-mound");
    g.appendChild(mound);

    var stem = document.createElementNS(svgNS, "path");
    stem.setAttribute("d", "M0,4 C-1,-6 1,-14 0,-22");
    stem.setAttribute("class", "stem");
    g.appendChild(stem);

    var leaf1 = document.createElementNS(svgNS, "path");
    leaf1.setAttribute("d", "M0,-14 C-10,-18 -14,-10 -6,-6 C-3,-9 -1,-12 0,-14 Z");
    leaf1.setAttribute("class", "leaf");
    g.appendChild(leaf1);

    var leaf2 = document.createElementNS(svgNS, "path");
    leaf2.setAttribute("d", "M0,-18 C10,-22 14,-13 6,-9 C3,-13 1,-16 0,-18 Z");
    leaf2.setAttribute("class", "leaf");
    g.appendChild(leaf2);

    svg.appendChild(g);
  }

  var drawers = {
    sprout: drawSprout
  };

  function drawItem(item) {
    var drawer = drawers[item.type];
    if (drawer) {
      drawer(item);
    }
  }

  function drawMeta() {
    var meta = document.getElementById("meta");
    if (!meta || items.length === 0) {
      return;
    }
    var first = items[0].date;
    meta.textContent = first + " から、" + items.length + " のものが置かれた庭";
  }

  drawRakeLines();
  items.forEach(drawItem);
  drawMeta();
})();
