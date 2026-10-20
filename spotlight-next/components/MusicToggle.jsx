"use client";
import { useEffect, useRef, useState } from "react";

export default function MusicToggle({ src = "/musics/1.mp3", volume = 0.4 }) {
  const audio = useRef(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const a = new Audio(src);
    a.loop = true;
    a.volume = 0;
    audio.current = a;
    return () => a.pause();
  }, [src]);

    useEffect(() => {
    const first = () => setOn(true);
    addEventListener("pointerdown", first, { once: true });
    return () => removeEventListener("pointerdown", first);
  }, []);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const target = on ? volume : 0;
    let raf;
    if (on) a.play().catch(() => setOn(false));
    const step = () => {
      const d = target - a.volume;
      if (Math.abs(d) < 0.02) {
        a.volume = target;
        if (!on) a.pause();
        return;
      }
      a.volume = Math.min(1, Math.max(0, a.volume + Math.sign(d) * 0.02));
      raf = requestAnimationFrame(step);
    };
    step();
    return () => cancelAnimationFrame(raf);
  }, [on, volume]);

  return (
    <button
      className="music"
      onClick={() => setOn(!on)}
      aria-pressed={on}
      aria-label={on ? "Mute music" : "Play music"}
    >
      <span className={on ? "bars on" : "bars"}><i /><i /><i /><i /></span>
    </button>
  );
}