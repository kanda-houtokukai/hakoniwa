(function () {
  "use strict";

  var PLANTED_AT = new Date("2026-08-21T00:00:00+09:00");

  var SKY = [
    { until: 5, top: "#0b1330", bottom: "#1c2748", body: "#e8e6d9", glow: "0 0 18px 6px rgba(232,230,217,0.35)" },
    { until: 8, top: "#7391b5", bottom: "#f2c9a0", body: "#fff3c4", glow: "0 0 26px 10px rgba(255,243,196,0.6)" },
    { until: 17, top: "#5fa8d3", bottom: "#cfe8f5", body: "#ffe28a", glow: "0 0 30px 12px rgba(255,226,138,0.7)" },
    { until: 19, top: "#3d5a80", bottom: "#f4a261", body: "#ffb35c", glow: "0 0 26px 10px rgba(255,179,92,0.6)" },
    { until: 24, top: "#0b1330", bottom: "#1c2748", body: "#e8e6d9", glow: "0 0 18px 6px rgba(232,230,217,0.35)" }
  ];

  var STAGES = [
    {
      minDays: 0,
      name: "種",
      render: function () {
        return (
          '<ellipse cx="150" cy="230" rx="100" ry="16" fill="#8a6a4a"/>' +
          '<ellipse cx="150" cy="226" rx="92" ry="12" fill="#a3805a"/>' +
          '<circle class="seed-pulse" cx="150" cy="222" r="4" fill="#5b7a4a"/>'
        );
      }
    },
    {
      minDays: 3,
      name: "発芽",
      render: function () {
        return (
          '<ellipse cx="150" cy="230" rx="100" ry="16" fill="#8a6a4a"/>' +
          '<ellipse cx="150" cy="226" rx="92" ry="12" fill="#a3805a"/>' +
          '<path d="M150 222 Q148 205 150 195" stroke="#4d7a3c" stroke-width="3" fill="none" stroke-linecap="round"/>' +
          '<ellipse cx="142" cy="197" rx="9" ry="5" fill="#6fae4e" transform="rotate(-25 142 197)"/>' +
          '<ellipse cx="158" cy="197" rx="9" ry="5" fill="#6fae4e" transform="rotate(25 158 197)"/>'
        );
      }
    },
    {
      minDays: 14,
      name: "若木",
      render: function () {
        return (
          '<ellipse cx="150" cy="230" rx="104" ry="17" fill="#8a6a4a"/>' +
          '<ellipse cx="150" cy="226" rx="96" ry="12" fill="#a3805a"/>' +
          '<path d="M150 222 C146 190 152 160 148 130" stroke="#6b4a30" stroke-width="7" fill="none" stroke-linecap="round"/>' +
          '<path d="M149 160 C130 150 118 142 108 132" stroke="#6b4a30" stroke-width="4" fill="none" stroke-linecap="round"/>' +
          '<path d="M149 140 C168 130 180 122 190 112" stroke="#6b4a30" stroke-width="4" fill="none" stroke-linecap="round"/>' +
          '<circle cx="108" cy="128" r="18" fill="#5c9a46"/>' +
          '<circle cx="190" cy="108" r="18" fill="#67a850"/>' +
          '<circle cx="148" cy="122" r="20" fill="#6fae56"/>'
        );
      }
    }
  ];

  function currentStage(days) {
    var chosen = STAGES[0];
    for (var i = 0; i < STAGES.length; i++) {
      if (days >= STAGES[i].minDays) chosen = STAGES[i];
    }
    return chosen;
  }

  function currentSky(hour) {
    for (var i = 0; i < SKY.length; i++) {
      if (hour < SKY[i].until) return SKY[i];
    }
    return SKY[SKY.length - 1];
  }

  function daysSincePlanted(now) {
    var ms = now.getTime() - PLANTED_AT.getTime();
    return Math.max(0, Math.floor(ms / 86400000));
  }

  function formatDate(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function render() {
    var now = new Date();
    var days = daysSincePlanted(now);
    var stage = currentStage(days);
    var sky = currentSky(now.getHours());

    document.body.style.background = "linear-gradient(to bottom, " + sky.top + ", " + sky.bottom + ")";
    var sun = document.getElementById("sky-object");
    sun.style.background = sky.body;
    sun.style.boxShadow = sky.glow;

    document.getElementById("bonsai-svg").innerHTML = stage.render();

    document.getElementById("caption").innerHTML =
      formatDate(PLANTED_AT) + " に種を植えた &mdash; <span class=\"day-count\">" + days + "</span> 日目・" + stage.name;
  }

  render();
  setInterval(render, 60000);
})();
