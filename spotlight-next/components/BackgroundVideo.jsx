"use client";
import { useEffect, useRef, useState } from "react";

const CLIPS = ["/videos/1.mp4", "/videos/2.mp4", "/videos/3.mp4", "/videos/4.mp4"]; 

export default function BackgroundVideo() {
  const [i, setI] = useState(0);
  const [reduce, setReduce] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setReduce(matchMedia("(prefers-reduced-motion: reduce)").matches);
    const onVis = () => {
      const v = ref.current;
      if (!v) return;
      if (document.hidden) v.pause();
      else v.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (reduce) return null;

  return (
    <div className="bgv" aria-hidden>
      <video
        ref={ref}
        key={i}
        src={CLIPS[i]}
        autoPlay
        muted
        playsInline
        preload="auto"
        loop={CLIPS.length === 1}
        onEnded={() => setI((i + 1) % CLIPS.length)}
      />
    </div>
  );
}
