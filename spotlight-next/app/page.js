"use client";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ITEMS, renderThumb } from "../lib/models";
import BackgroundVideo from "../components/BackgroundVideo";
import MusicToggle from "../components/MusicToggle";
import SearchModal from "../components/SearchModal";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Gallery, { Lightbox } from "../components/Gallery";
import Garage, { loadGarage } from "../components/Garage";
import { VEHICLE_BY_SLUG } from "../data/vehicles";
import Editorial from "../components/Editorial";
import About from "../components/About";
import Access from "../components/Access";
import { ScrollProgress, HomeButton, Reveal, useActiveSection, useReveal } from "../components/chrome";

const Viewer = dynamic(() => import("../components/Viewer"), { ssr: false });
const IDS = ["home", "gallery", "garage", "editorial", "about", "access"];

function Section({ id, kicker, title, children }) {
  return (
    <section id={id} className="sp-sec" aria-labelledby={`${id}-h`}>
      <Reveal className="panel">
        <p className="kicker">{kicker}</p>
        <h2 id={`${id}-h`} className="sec-h">{title[0]} <em>{title[1]}</em></h2>
        <div className="rule" aria-hidden />
        {children}
      </Reveal>
    </section>
  );
}

export default function Page() {
  const [thumbs, setThumbs] = useState({});
  const [viewIdx, setViewIdx] = useState(null);
  const [lb, setLb] = useState(null);
  const [saved, setSaved] = useState({});
  const [cmp, setCmp] = useState([]);
  const active = useActiveSection(IDS);
  useReveal();

  useEffect(() => {
    setSaved(loadGarage());
    let dead = false;
    (async () => {
      for (const it of ITEMS) {
        if (dead) return;
        if (it.img) { setThumbs((t) => ({ ...t, [it.id]: it.img })); continue; }
        await new Promise((r) => setTimeout(r, 30));
        if (dead) return;
        setThumbs((t) => ({ ...t, [it.id]: renderThumb(it) }));
      }
    })();
    return () => { dead = true; };
  }, []);

  const open3D = useCallback((item) => {
    const i = ITEMS.findIndex((x) => x.id === item.id);
    if (i < 0) return;
    setLb(null);
    setViewIdx(i);
  }, []);

  const toggleCmp = useCallback((id) => {
    setCmp((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]));
  }, []);

  // Deep link: #machine=<slug> opens the viewer on that machine.
  useEffect(() => {
    const fromHash = () => {
      const m = location.hash.match(/^#machine=([\w-]+)/);
      if (!m) return;
      const v = VEHICLE_BY_SLUG[m[1]];
      if (!v) return;
      const i = ITEMS.findIndex((x) => x.id === v.id);
      if (i >= 0) {
        setLb(null);
        setViewIdx(i);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const toggleSave = useCallback((it) => {
    setSaved((s) => {
      const n2 = { ...s };
      if (n2[it.id]) delete n2[it.id];
      else n2[it.id] = { name: it.name, year: it.year, cat: it.cat, kind: it.kind };
      try { localStorage.setItem("spotlight-garage-v1", JSON.stringify(n2)); } catch {}
      return n2;
    });
  }, []);

  const stepLb = useCallback((d) => {
    setLb((cur) => {
      const i = ITEMS.findIndex((x) => x.id === (cur?.id || ITEMS[0].id));
      return ITEMS[(i + d + ITEMS.length) % ITEMS.length];
    });
  }, []);

  return (
    <main className="sp">
      <BackgroundVideo />
      <ScrollProgress />
      <Navbar active={active} />
      <MusicToggle />
      <SearchModal />

      <section id="home" className="sp-home" aria-label="Spotlight hero">
        <Hero thumbs={thumbs} onView3D={open3D} />
      </section>

      <Section id="gallery" kicker="01 · Browse the collection" title={["The", "Gallery"]}>
        <Gallery thumbs={thumbs} saved={saved} onToggleSave={toggleSave} onLightbox={setLb} onView3D={(it) => open3D(it)} />
      </Section>

      <Section id="garage" kicker="02 · Your personal collection" title={["My", "Garage"]}>
        <Garage saved={saved} onToggleSave={toggleSave} cmp={cmp} onToggleCmp={toggleCmp} onView3D={open3D} />
      </Section>

      <Section id="editorial" kicker="03 · Stories from the fast lane" title={["The", "Editorial"]}>
        <Editorial />
      </Section>

      <Section id="about" kicker="04 · Why Spotlight exists" title={["About", "Spotlight"]}>
        <About />
      </Section>

      <Section id="access" kicker="05 · Membership" title={["Get", "Access"]}>
        <Access />
      </Section>

      <HomeButton active={active} />

      {lb && (
        <Lightbox
          item={lb} thumbs={thumbs} onClose={() => setLb(null)}
          onPrev={() => stepLb(-1)} onNext={() => stepLb(1)} onView3D={open3D}
        />
      )}
      {viewIdx !== null && (
        <Viewer
          index={viewIdx}
          items={ITEMS}
          onIndexChange={setViewIdx}
          onClose={() => setViewIdx(null)}
          saved={saved}
          onToggleSave={toggleSave}
          cmp={cmp}
          onToggleCmp={toggleCmp}
        />
      )}
    </main>
  );
}
