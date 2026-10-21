"use client";
import { useEffect, useState } from "react";
import { BEST } from "../../data/vehicles";

// One circular gauge. Arc length is proportional to the value vs. the best
// across all machines (longer arc = better). The `red` gauge (top speed)
// uses the machine's warm accent; the rest use cool steel blue.
function Gauge({ id, value, display, unit, label, ariaText, fraction, red, accent, reduced }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (reduced) {
      setOn(true);
      return;
    }
    const t = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
    return () => cancelAnimationFrame(t);
  }, [reduced, id]);

  const R = 34;
  const C = 2 * Math.PI * R;
  const frac = Math.max(0.04, Math.min(1, fraction));
  return (
    <div className="vv-gauge" role="img" aria-label={ariaText}>
      <svg viewBox="0 0 84 84" aria-hidden="true">
        <circle cx="42" cy="42" r={R} className="vv-gauge-track" />
        <circle
          cx="42"
          cy="42"
          r={R}
          className="vv-gauge-arc"
          stroke={red ? accent : "#7cc4ff"}
          strokeDasharray={C}
          strokeDashoffset={on ? C * (1 - frac) : C}
          style={reduced ? undefined : { transition: "stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="vv-gauge-num">
        <b>{display}</b>
        {unit && <span>{unit}</span>}
      </div>
      <p>{label}</p>
    </div>
  );
}

export default function GaugeGrid({ vehicle, reduced }) {
  const s = vehicle.specs;
  const gauges = [
    {
      id: "power", value: s.powerHp, display: String(s.powerHp), unit: "",
      label: "power (hp)", ariaText: `Power ${s.powerHp} horsepower`,
      fraction: s.powerHp / BEST.powerHp, red: false,
    },
    {
      id: "zero", value: s.zeroTo100Sec, display: String(s.zeroTo100Sec), unit: "",
      label: "0–100 km/h", ariaText: `Zero to one hundred kilometres per hour in ${s.zeroTo100Sec} seconds`,
      fraction: BEST.zeroTo100Sec / s.zeroTo100Sec, red: false,
    },
    {
      id: "speed", value: s.topSpeedKmh, display: String(s.topSpeedKmh), unit: "",
      label: "top speed", ariaText: `Top speed ${s.topSpeedKmh} kilometres per hour`,
      fraction: s.topSpeedKmh / BEST.topSpeedKmh, red: true,
    },
    {
      id: "weight", value: s.weightKg, display: String(s.weightKg), unit: "kg",
      label: "weight", ariaText: `Weight ${s.weightKg} kilograms`,
      fraction: BEST.weightKg / s.weightKg, red: false,
    },
  ];
  return (
    <div className="vv-gauges" role="group" aria-label={`${vehicle.name} specifications`}>
      {gauges.map((g) => (
        <Gauge key={`${vehicle.id}-${g.id}`} {...g} accent={vehicle.accents[0]} reduced={reduced} />
      ))}
    </div>
  );
}
