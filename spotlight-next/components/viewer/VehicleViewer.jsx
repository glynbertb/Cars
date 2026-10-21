"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import ViewerStage from "./ViewerStage";
import GaugeGrid from "./GaugeGrid";
import PresetControl from "./PresetControl";
import PaintSwatches from "./PaintSwatches";
import ViewerActions from "./ViewerActions";
import ViewerHint from "./ViewerHint";
import BottomSheet from "./BottomSheet";
import { VEHICLE_BY_ID } from "../../data/vehicles";

const HINT_KEY = "spotlight-vv-hint-seen";

function splitTitle(name) {
  const [first, ...rest] = name.split(" ");
  return { first, rest: rest.join(" ") };
}

function machineHash(slug) {
  return `#machine=${slug}`;
}

export default function VehicleViewer({
  index,
  items,
  onIndexChange,
  onClose,
  saved,
  onToggleSave,
  cmp,
  onToggleCmp,
}) {
  const item = items[index];
  const vehicle = VEHICLE_BY_ID[item.id];
  const n = items.length;

  const [preset, setPreset] = useState("SIDE");
  const [presetNonce, setPresetNonce] = useState(0);
  const [paintHex, setPaintHex] = useState("");
  const [loadPct, setLoadPct] = useState(vehicle.modelPath ? 0 : null);
  const [loaded, setLoaded] = useState(!vehicle.modelPath);
  const [failed, setFailed] = useState(null); // null | "model" | "webgl"
  const [paintable, setPaintable] = useState(false);
  const [toast, setToast] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showHand, setShowHand] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [announce, setAnnounce] = useState(vehicle.name);

  const rootRef = useRef(null);
  const toastTimer = useRef(null);
  const prevHash = useRef(null);

  const presets = ["FRONT", "SIDE", "REAR", "TOP", vehicle.type === "car" ? "INT" : "COCKPIT"];
  const { first, rest } = splitTitle(vehicle.name);
  const isSaved = !!saved[item.id];
  const inCompare = cmp.includes(item.id);

  const say = useCallback((msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  const go = useCallback(
    (dir) => {
      const next = (index + dir + n) % n;
      setPaintHex("");
      setFailed(null);
      setLoaded(false);
      const nv = VEHICLE_BY_ID[items[next].id];
      setLoadPct(nv.modelPath ? 0 : null);
      if (!nv.modelPath) setLoaded(true);
      onIndexChange(next);
    },
    [index, n, items, onIndexChange]
  );

  const changePreset = useCallback(
    (p) => {
      setPreset(p);
      setPresetNonce((v) => v + 1);
    },
    []
  );

  const share = useCallback(async () => {
    const url = `${location.origin}${location.pathname}${machineHash(vehicle.slug)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    say("Link copied");
  }, [vehicle.slug, say]);

  const compare = useCallback(() => {
    if (!inCompare && cmp.length >= 3) {
      say("Compare holds up to 3 machines");
      return;
    }
    onToggleCmp(item.id);
  }, [inCompare, cmp.length, onToggleCmp, item.id, say]);

  // Environment flags.
  useEffect(() => {
    const mqM = matchMedia("(max-width: 767px)");
    const mqT = matchMedia("(pointer: coarse)");
    const mqR = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setIsMobile(mqM.matches);
      setIsTouch(mqT.matches);
      setReduced(mqR.matches);
    };
    sync();
    mqM.addEventListener("change", sync);
    mqT.addEventListener("change", sync);
    mqR.addEventListener("change", sync);
    return () => {
      mqM.removeEventListener("change", sync);
      mqT.removeEventListener("change", sync);
      mqR.removeEventListener("change", sync);
    };
  }, []);

  // Scroll lock (restore exact position on close) + focus restore.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const y = window.scrollY;
    document.body.style.overflow = "hidden";
    const prevFocus = document.activeElement;
    rootRef.current?.querySelector(".vv-close")?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      window.scrollTo(0, y);
      if (prevFocus instanceof HTMLElement) prevFocus.focus();
    };
  }, []);

  // Announce machine changes to screen readers.
  useEffect(() => {
    setAnnounce(`${vehicle.name}, ${vehicle.year}, ${vehicle.class}`);
  }, [vehicle]);

  // Deep link: reflect the current machine in the hash; restore on close.
  useEffect(() => {
    if (prevHash.current === null) prevHash.current = location.hash;
    history.replaceState(null, "", machineHash(vehicle.slug));
    return () => {
      if (prevHash.current && !prevHash.current.startsWith("#machine=")) {
        history.replaceState(null, "", prevHash.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle.slug]);

  // Keyboard: Esc closes, arrows switch machines. Focus stays trapped.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      const tag = e.target.closest?.(".vv-presets, .vv-grip");
      if (tag) return; // preset control + sheet handle manage their own arrows
      if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();
        go(-1);
      } else if (e.key === "Tab") {
        const els = rootRef.current?.querySelectorAll(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        );
        if (!els || els.length === 0) return;
        const list = [...els].filter((el) => !el.disabled && el.offsetParent !== null);
        if (list.length === 0) return;
        const firstEl = list[0];
        const lastEl = list[list.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [go, onClose]);

  // First-visit rotate hint (hand glyph, 3 s).
  useEffect(() => {
    let t;
    try {
      if (!localStorage.getItem(HINT_KEY)) {
        setShowHand(true);
        t = setTimeout(() => {
          setShowHand(false);
          try {
            localStorage.setItem(HINT_KEY, "1");
          } catch {}
        }, 3000);
      }
    } catch {}
    return () => clearTimeout(t);
  }, []);

  // Idle-preload the neighbouring models so prev/next is instant.
  useEffect(() => {
    const urls = [items[(index + 1) % n], items[(index - 1 + n) % n]]
      .map((it) => VEHICLE_BY_ID[it.id]?.modelPath)
      .filter(Boolean);
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
    const id = idle(() => {
      urls.forEach((u) => {
        fetch(u, { method: "GET" }).catch(() => {});
      });
    });
    return () => (window.cancelIdleCallback ? cancelIdleCallback(id) : clearTimeout(id));
  }, [index, items, n]);

  // Mobile swipe on the stage area (also drives OrbitControls, which is fine).
  const swipe = useRef(null);
  const onTouchStart = (e) => {
    if (e.touches.length === 1) swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
  };
  const onTouchEnd = (e) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.changedTouches[0].clientX - s.x;
    const dy = e.changedTouches[0].clientY - s.y;
    if (Math.abs(dx) > 70 && Math.abs(dy) < 50 && Date.now() - s.t < 500) go(dx < 0 ? 1 : -1);
  };

  const titleBlock = (
    <div className="vv-titleblock">
      <h2>
        {first} {rest && <em>{rest}</em>}
      </h2>
      <p>
        {vehicle.year} • {vehicle.class} • <span className="vv-star">★</span> {vehicle.rating.toFixed(1)}
      </p>
    </div>
  );

  const gaugeBlock = (
    <GaugeGrid key={vehicle.id} vehicle={vehicle} reduced={reduced} />
  );

  const actionBlock = (
    <ViewerActions
      saved={isSaved}
      inCompare={inCompare}
      onSave={() => onToggleSave(item)}
      onCompare={compare}
      onShare={share}
      saveLabel={isSaved ? `Remove ${vehicle.name} from garage` : `Save ${vehicle.name} to garage`}
    />
  );

  const swatchBlock = paintable ? (
    <PaintSwatches options={vehicle.paintOptions} value={paintHex} onChange={setPaintHex} />
  ) : null;

  const loadOverlay = !loaded && !failed && (
    <div className="vv-loading">
      {vehicle.posterImage && <img src={vehicle.posterImage} alt="" aria-hidden="true" />}
      <div className="vv-ring" role="progressbar" aria-label={`Loading ${vehicle.name} 3D model`}
        aria-valuemin={0} aria-valuemax={100}
        aria-valuenow={loadPct == null ? undefined : Math.round(loadPct * 100)}>
        <svg viewBox="0 0 72 72" aria-hidden="true">
          <circle cx="36" cy="36" r="30" className="vv-ring-track" />
          <circle
            cx="36" cy="36" r="30" className="vv-ring-arc"
            strokeDasharray={2 * Math.PI * 30}
            strokeDashoffset={loadPct == null ? 2 * Math.PI * 30 * 0.25 : 2 * Math.PI * 30 * (1 - loadPct)}
          />
        </svg>
        <b>{loadPct == null ? "…" : `${Math.round(loadPct * 100)}%`}</b>
      </div>
    </div>
  );

  const errorView = failed && (
    <div className="vv-fallback">
      {vehicle.posterImage && <img src={vehicle.posterImage} alt={`${vehicle.name}`} />}
      <p>3D preview unavailable</p>
    </div>
  );

  return (
    <div ref={rootRef} className="vv" role="dialog" aria-modal="true" aria-label={`${vehicle.name} 3D viewer`}>
      <div className="vv-bg" aria-hidden="true" />
      <p className="vv-sr" aria-live="polite">{announce}</p>

      <div className="vv-topbar">
        <span className="vv-logo" aria-hidden="true">
          <i /><b />Spotlight
        </span>
        <button type="button" className="vv-close" onClick={onClose} aria-label="Close 3D viewer">
          <span className="vv-x" aria-hidden="true">✕</span>
          <span className="vv-close-label" aria-hidden="true">CLOSE</span>
        </button>
      </div>

      {!isMobile && (
        <>
          <div className="vv-stagewrap">
            {vehicle.posterImage && <img className="vv-poster" src={vehicle.posterImage} alt="" aria-hidden="true" />}
            <ViewerStage
              vehicle={vehicle}
              presetKey={preset}
              presetNonce={presetNonce}
              paintHex={paintHex}
              reducedMotion={reduced}
              onProgress={setLoadPct}
              onLoaded={() => {
                setLoaded(true);
                setLoadPct(1);
              }}
              onError={(kind) => {
                setFailed(kind);
                setLoaded(true);
              }}
              onPaintable={setPaintable}
              onFirstInteract={() => {}}
            />
            {loadOverlay}
            {errorView}
          </div>

          <aside className="vv-panel" aria-label="Specifications and actions">
            {gaugeBlock}
            {actionBlock}
          </aside>

          <div className="vv-sider">
            <PresetControl presets={presets} value={preset} onChange={changePreset} />
            {swatchBlock}
          </div>

          {titleBlock}

          <div className="vv-pagenav">
            <button type="button" className="vv-page" onClick={() => go(-1)} aria-label="Previous machine">‹</button>
            <button type="button" className="vv-page" onClick={() => go(1)} aria-label="Next machine">›</button>
          </div>

          <ViewerHint touch={isTouch} showHand={showHand && isTouch} />
        </>
      )}

      {isMobile && (
        <>
          <div className="vv-stagewrap m" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {vehicle.posterImage && <img className="vv-poster" src={vehicle.posterImage} alt="" aria-hidden="true" />}
            <ViewerStage
              vehicle={vehicle}
              presetKey={preset}
              presetNonce={presetNonce}
              paintHex={paintHex}
              reducedMotion={reduced}
              onProgress={setLoadPct}
              onLoaded={() => {
                setLoaded(true);
                setLoadPct(1);
              }}
              onError={(kind) => {
                setFailed(kind);
                setLoaded(true);
              }}
              onPaintable={setPaintable}
              onFirstInteract={() => {}}
            />
            {loadOverlay}
            {errorView}
            <button type="button" className="vv-chev l" onClick={() => go(-1)} aria-label="Previous machine">‹</button>
            <button type="button" className="vv-chev r" onClick={() => go(1)} aria-label="Next machine">›</button>
          </div>

          <div className="vv-mpresets">
            <PresetControl presets={presets} value={preset} onChange={changePreset} />
          </div>

          <BottomSheet
            expanded={sheetOpen}
            onExpandChange={setSheetOpen}
            extra={
              <>
                {swatchBlock}
                <p className="vv-desc">{vehicle.description}</p>
              </>
            }
          >
            <div className="vv-mrow">
              <div className="vv-mtitle">
                <h2>
                  {first}
                  <br />
                  {rest && <em>{rest}</em>}
                </h2>
                <p>
                  {vehicle.year} • {vehicle.class} • <span className="vv-star">★</span> {vehicle.rating.toFixed(1)}
                </p>
              </div>
              <div className="vv-mgauges">{gaugeBlock}</div>
            </div>
            <div className="vv-mactions">{actionBlock}</div>
          </BottomSheet>

          {showHand && isTouch && (
            <div className="vv-mhand" aria-hidden="true">
              <ViewerHint touch showHand />
            </div>
          )}
        </>
      )}

      {toast && (
        <div className="vv-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
