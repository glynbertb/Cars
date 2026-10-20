"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { buildModel, makeScene, shadowMesh, camFor } from "../lib/models";

export default function Viewer({ item, rect, thumb, onClose }) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const mount = useRef(null);

  const close = () => { setReady(false); setOpen(false); setTimeout(onClose, 560); };

  useEffect(() => {
    const a = requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
    const t = setTimeout(() => setReady(true), 600);
    const k = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", k);
    return () => { cancelAnimationFrame(a); clearTimeout(t); window.removeEventListener("keydown", k); };
  }, []);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const el = mount.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = makeScene(renderer);
    scene.add(shadowMesh());

    const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    cam.position.set(...camFor(item));

    const ctl = new OrbitControls(cam, renderer.domElement);
    ctl.target.set(0, 0.8, 0); ctl.enableDamping = true; ctl.enablePan = false;
    ctl.autoRotate = true; ctl.autoRotateSpeed = 1.4; ctl.minDistance = 4; ctl.maxDistance = 18; ctl.maxPolarAngle = Math.PI / 2 - 0.04;
    ctl.addEventListener("start", () => (ctl.autoRotate = false));

    // --- 3D Model Loading Logic ---
    let loadedModel = null;

    if (item.model) {
      const loader = new GLTFLoader();
     loader.load(
  item.model,
  (gltf) => {
    const loadedModel = gltf.scene;

    // 1. Calculate bounding box
    const box = new THREE.Box3().setFromObject(loadedModel);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // 2. Increase target size (e.g., change target from 3 to 6 or 7)
    if (maxDim > 0) {
      const targetSize = 3.5; // 👈 Increase this value to make it bigger!
      const scale = targetSize / maxDim;
      loadedModel.scale.set(scale, scale, scale);
    }

    // 3. Center model
    box.setFromObject(loadedModel);
    const center = box.getCenter(new THREE.Vector3());
    loadedModel.position.sub(center);
    loadedModel.position.y += 0.4;

    scene.add(loadedModel);
  },
  undefined,
  (err) => console.error("Error loading model:", err)
);
    } else {
      // Fallback: use procedural model when item.model is missing
      loadedModel = buildModel(item);
      scene.add(loadedModel);
    }

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix();
    };

    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    addEventListener("resize", resize);
    addEventListener("orientationchange", resize);
    renderer.setAnimationLoop(() => { ctl.update(); renderer.render(scene, cam); });

    return () => {
      renderer.setAnimationLoop(null); ro.disconnect(); ctl.dispose(); renderer.dispose();
      removeEventListener("resize", resize);
      removeEventListener("orientationchange", resize);
      document.body.style.overflow = prevOverflow;
      el.removeChild(renderer.domElement);
    };
  }, [item]);

  const style = open
    ? { left: 0, top: 0, right: 0, bottom: 0, width: "100dvw", height: "100dvh", borderRadius: 0 }
    : { left: rect.left, top: rect.top, width: rect.width, height: rect.height, borderRadius: 14 };

  return (
    <div className="vw" style={{ ...style, background: `radial-gradient(90% 80% at 50% 40%, #f4f7fc, ${item.tint})` }} role="dialog" aria-label={`${item.name} 3D view`}>
      {thumb && <img src={thumb} alt="" style={{ opacity: ready ? 0 : 1 }} />}
      <div className="vm" ref={mount} style={{ opacity: ready ? 1 : 0 }} />
      <div className="vui" style={{ opacity: ready ? 1 : 0 }}>
        <button className="vclose" onClick={close} aria-label="Close 3D view">✕</button>
        <div className="vtitle"><h2>{item.name}</h2><p>{item.year} · {item.cat} · ★ {item.score}</p></div>
        <div className="vhint">DRAG TO ROTATE · SCROLL TO ZOOM</div>
      </div>
    </div>
  );
}