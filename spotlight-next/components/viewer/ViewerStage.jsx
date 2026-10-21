"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { buildModel } from "../../lib/models";

// Camera preset directions (model space, multiplied by fit distance).
// Final slot depends on vehicle type: INT for cars, COCKPIT for bikes.
const PRESET_DIRS = {
  FRONT: new THREE.Vector3(0.35, 0.22, 1),
  SIDE: new THREE.Vector3(1, 0.18, 0.25),
  REAR: new THREE.Vector3(-0.35, 0.28, -1),
  TOP: new THREE.Vector3(0.02, 1, 0.02),
};

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function paintCandidates(root) {
  const cands = [];
  const seen = new Set();
  root.traverse((o) => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (!m || !m.isMeshStandardMaterial || seen.has(m)) continue;
      seen.add(m);
      if (m.transparent && m.opacity < 0.9) continue; // glass
      const lum = 0.2126 * m.color.r + 0.7152 * m.color.g + 0.0722 * m.color.b;
      if (lum < 0.02) continue; // tires / dark trim
      const tris = o.geometry?.index ? o.geometry.index.count / 3 : (o.geometry?.attributes?.position?.count || 0) / 3;
      cands.push({ mat: m, tris });
    }
  });
  // Main body paint = material covering the most triangles.
  cands.sort((a, b) => b.tris - a.tris);
  return cands.slice(0, 3).map((c) => c.mat);
}

function archColors(geo, radius, c0, c1) {
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const a = new THREE.Color(c0);
  const b = new THREE.Color(c1);
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const t = THREE.MathUtils.clamp(pos.getX(i) / radius / 2 + 0.5, 0, 1); // left(0) -> right(1)
    tmp.copy(a).lerp(b, t);
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
}

export default function ViewerStage({
  vehicle,
  presetKey,
  presetNonce,
  paintHex,
  reducedMotion,
  onProgress,
  onLoaded,
  onError,
  onPaintable,
  onFirstInteract,
}) {
  const mountRef = useRef(null);
  const apiRef = useRef(null);
  const stateRef = useRef({ vehicle, presetKey, paintHex });
  stateRef.current = { vehicle, presetKey, paintHex };

  // Forward prop changes to the live three scene.
  useEffect(() => {
    apiRef.current?.switchVehicle?.(stateRef.current.vehicle);
  }, [vehicle]);
  useEffect(() => {
    apiRef.current?.goPreset?.(stateRef.current.presetKey);
  }, [presetKey, presetNonce]);
  useEffect(() => {
    apiRef.current?.applyPaint?.(stateRef.current.paintHex);
  }, [paintHex]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      onError?.("webgl");
      return;
    }
    if (!renderer.getContext()) {
      onError?.("webgl");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 200);

    // Studio HDRI environment (procedural room) for real reflections.
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // --- Studio lighting: warm key + red/blue rim accents -----------------
    const key = new THREE.DirectionalLight("#ffffff", 2.4);
    key.position.set(5, 8, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0004;
    scene.add(key);
    const fill = new THREE.HemisphereLight("#bcd0ff", "#0a0c12", 0.35);
    scene.add(fill);
    let rimL = new THREE.DirectionalLight(vehicle.accents[0], 3.2);
    rimL.position.set(-7, 3.5, -5);
    scene.add(rimL);
    let rimR = new THREE.DirectionalLight(vehicle.accents[1], 3.2);
    rimR.position.set(7, 3.5, -5);
    scene.add(rimR);
    const under = new THREE.PointLight("#ffffff", 0.35, 20);
    under.position.set(0, 0.4, 3);
    scene.add(under);

    // --- Glossy reflective floor (mirror dimmed by a dark glaze) ----------
    const FLOOR_R = 4.6;
    const mirror = new Reflector(new THREE.CircleGeometry(FLOOR_R, 72), {
      textureWidth: 1024,
      textureHeight: 1024,
      color: 0x4a5058,
      clipBias: 0.003,
    });
    mirror.rotation.x = -Math.PI / 2;
    mirror.position.y = 0;
    scene.add(mirror);
    const glaze = new THREE.Mesh(
      new THREE.CircleGeometry(FLOOR_R, 72),
      new THREE.MeshBasicMaterial({ color: "#05070c", transparent: true, opacity: 0.62, depthWrite: false })
    );
    glaze.rotation.x = -Math.PI / 2;
    glaze.position.y = 0.002;
    scene.add(glaze);
    const shadowCatcher = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.ShadowMaterial({ opacity: 0.38, depthWrite: false })
    );
    shadowCatcher.rotation.x = -Math.PI / 2;
    shadowCatcher.position.y = 0.004;
    shadowCatcher.receiveShadow = true;
    scene.add(shadowCatcher);

    // --- Turntable: thin metallic ring ------------------------------------
    const deckRing = new THREE.Mesh(
      new THREE.TorusGeometry(FLOOR_R * 0.99, 0.022, 12, 160),
      new THREE.MeshStandardMaterial({ color: "#d4d9e2", metalness: 1, roughness: 0.22 })
    );
    deckRing.rotation.x = -Math.PI / 2;
    deckRing.position.y = 0.012;
    scene.add(deckRing);

    // --- Arch ring: thin glowing arc, warm left -> cool right -------------
    const archGroup = new THREE.Group();
    const archGeo = new THREE.TorusGeometry(3.4, 0.035, 12, 160, Math.PI);
    archColors(archGeo, 3.4, vehicle.accents[0], vehicle.accents[1]);
    const arch = new THREE.Mesh(archGeo, new THREE.MeshBasicMaterial({ vertexColors: true }));
    archGroup.add(arch);
    const haloGeo = new THREE.TorusGeometry(3.4, 0.11, 12, 160, Math.PI);
    archColors(haloGeo, 3.4, vehicle.accents[0], vehicle.accents[1]);
    const halo = new THREE.Mesh(
      haloGeo,
      new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    archGroup.add(halo);
    const footGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const footL = new THREE.Mesh(footGeo, new THREE.MeshBasicMaterial({ color: vehicle.accents[0] }));
    footL.position.set(-3.4, 0, 0);
    const footR = new THREE.Mesh(footGeo, new THREE.MeshBasicMaterial({ color: vehicle.accents[1] }));
    footR.position.set(3.4, 0, 0);
    archGroup.add(footL, footR);
    archGroup.position.set(0, 0.02, -1.15);
    scene.add(archGroup);

    // --- Controls ----------------------------------------------------------
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 2 - 0.03; // never under the floor
    controls.minPolarAngle = 0.06;
    controls.autoRotateSpeed = 1.1;

    let modelGroup = null;
    let paintMats = [];
    let fitDist = 9;
    let modelH = 1.4;
    let disposed = false;
    let loadToken = 0;
    let camTween = null;
    let idleTimer = null;
    let interacted = false;
    const loader = new GLTFLoader();
    const clock = new THREE.Clock();

    const fitCamera = (dir, distScale = 1, targetY = null) => {
      const target = new THREE.Vector3(0, targetY ?? modelH * 0.42, 0);
      const pos = target.clone().add(dir.clone().normalize().multiplyScalar(fitDist * distScale));
      if (dir === PRESET_DIRS.TOP) {
        pos.set(target.x + 0.02, target.y + fitDist * 1.05, target.z + 0.02);
      }
      return { pos, target };
    };

    const flyTo = (pos, target, instant = false) => {
      if (instant || reducedMotion) {
        camera.position.copy(pos);
        controls.target.copy(target);
        controls.update();
        camTween = null;
        return;
      }
      camTween = {
        t: 0,
        dur: 0.8,
        fromPos: camera.position.clone(),
        toPos: pos.clone(),
        fromTg: controls.target.clone(),
        toTg: target.clone(),
      };
    };

    const api = {
      goPreset(name) {
        const v = stateRef.current.vehicle;
        if (name === "INT" || name === "COCKPIT") {
          const ty = v.type === "car" ? modelH * 0.72 : modelH * 0.86;
          const target = new THREE.Vector3(0, ty, 0);
          const side = v.type === "car" ? 1 : 0.55;
          const pos = new THREE.Vector3(side * fitDist * 0.22, ty + fitDist * 0.1, fitDist * 0.3);
          flyTo(pos, target);
          return;
        }
        const dir = PRESET_DIRS[name] || PRESET_DIRS.SIDE;
        const { pos, target } = fitCamera(dir, name === "TOP" ? 1 : 1);
        flyTo(pos, target);
      },
      applyPaint(hex) {
        for (const m of paintMats) {
          if (!m.userData.orig) m.userData.orig = m.color.clone();
          if (!hex) m.color.copy(m.userData.orig);
          else m.color.set(hex);
        }
      },
      async switchVehicle(v) {
        const token = ++loadToken;
        // Fade + remove the previous model.
        if (modelGroup) {
          const old = modelGroup;
          modelGroup = null;
          scene.remove(old);
        }
        paintMats = [];
        onPaintable?.(false);
        onProgress?.(v.modelPath ? 0 : null);

        let obj = null;
        if (v.modelPath) {
          try {
            const gltf = await loader.loadAsync(
              v.modelPath,
              (ev) => {
                if (token !== loadToken || disposed) return;
                if (ev.total > 0) onProgress?.(Math.min(0.99, ev.loaded / ev.total));
                else onProgress?.(null);
              }
            );
            if (token !== loadToken || disposed) return;
            obj = gltf.scene;
          } catch (err) {
            console.error("Model failed to load:", v.modelPath, err);
            if (token !== loadToken || disposed) return;
            onError?.("model");
            return;
          }
        } else {
          obj = buildModel({ kind: v.type, color: v.paintOptions[0]?.hex || "#c8ccd4", h: 0.75, r: 0.38 });
        }
        if (token !== loadToken || disposed) return;

        // Normalize scale + origin via bounding box (bikes auto-fit like cars).
        const box = new THREE.Box3().setFromObject(obj);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const targetSize = 3.4;
        obj.scale.setScalar(targetSize / maxDim);
        box.setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        const min = box.min.clone();
        obj.position.sub(center);
        obj.position.y -= min.y - center.y; // rest bottom on the floor
        obj.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = true;
            if (o.material?.isMeshStandardMaterial) o.material.envMapIntensity = 0.9;
          }
        });

        modelH = size.y * (targetSize / maxDim);
        // Fit so the model fills ~65% of the viewport width.
        const vfov = THREE.MathUtils.degToRad(camera.fov);
        const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
        const fitW = size.x * (targetSize / maxDim);
        fitDist = Math.max(4.2, fitW / 2 / Math.tan(hfov / 2) / 0.65);
        controls.minDistance = fitDist * 0.4;
        controls.maxDistance = fitDist * 2.4;

        // Rim lights + shadow frustum follow the model size.
        const s = targetSize;
        key.shadow.camera.left = -s;
        key.shadow.camera.right = s;
        key.shadow.camera.top = s;
        key.shadow.camera.bottom = -s;
        key.shadow.camera.far = 30;
        key.shadow.camera.updateProjectionMatrix();
        archGroup.scale.setScalar(Math.max(0.72, Math.min(1.25, targetSize / 3.4)));

        // Rim light colors follow the machine accents.
        scene.remove(rimL, rimR);
        rimL = new THREE.DirectionalLight(v.accents[0], 3.2);
        rimL.position.set(-7, 3.5, -5);
        rimR = new THREE.DirectionalLight(v.accents[1], 3.2);
        rimR.position.set(7, 3.5, -5);
        scene.add(rimL, rimR);
        archColors(archGeo, 3.4, v.accents[0], v.accents[1]);
        archGeo.attributes.color.needsUpdate = true;
        archColors(haloGeo, 3.4, v.accents[0], v.accents[1]);
        haloGeo.attributes.color.needsUpdate = true;
        footL.material.color.set(v.accents[0]);
        footR.material.color.set(v.accents[1]);

        modelGroup = new THREE.Group();
        modelGroup.add(obj);
        // Cross-fade: fade the new model in, preserving original opacity.
        const fadeMats = [];
        modelGroup.traverse((o) => {
          if (o.isMesh) {
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            for (const m of mats) {
              if (m && !fadeMats.includes(m)) {
                fadeMats.push(m);
                if (m.userData.fOrig === undefined) {
                  m.userData.fOrig = m.opacity;
                  m.userData.fT = m.transparent;
                }
                m.transparent = true;
                m.opacity = 0;
              }
            }
          }
        });
        scene.add(modelGroup);
        const g = modelGroup;
        const t0 = performance.now();
        const fadeIn = () => {
          if (disposed || modelGroup !== g) return;
          const k = Math.min(1, (performance.now() - t0) / (reducedMotion ? 1 : 450));
          fadeMats.forEach((m) => {
            m.opacity = m.userData.fOrig * k;
          });
          if (k < 1) requestAnimationFrame(fadeIn);
          else fadeMats.forEach((m) => {
            m.opacity = m.userData.fOrig;
            m.transparent = m.userData.fT;
          });
        };
        fadeIn();

        paintMats = paintCandidates(modelGroup);
        onPaintable?.(paintMats.length > 0);
        api.applyPaint(stateRef.current.paintHex);

        const { pos, target } = fitCamera(PRESET_DIRS.SIDE, 1);
        camera.position.copy(pos);
        controls.target.copy(target);
        controls.update();
        onProgress?.(1);
        onLoaded?.();
        // Keep the current preset framing when switching machines in place.
        const pk = stateRef.current.presetKey;
        if (pk && pk !== "SIDE") api.goPreset(pk);
      },
    };
    apiRef.current = api;

    // Auto-rotate: on until the user touches, resume after 3 s idle.
    controls.autoRotate = !reducedMotion;
    const noteInteract = () => {
      if (!interacted) {
        interacted = true;
        onFirstInteract?.();
      }
      controls.autoRotate = false;
      camTween = null;
      if (idleTimer) clearTimeout(idleTimer);
      if (!reducedMotion) {
        idleTimer = setTimeout(() => {
          if (!disposed) controls.autoRotate = true;
        }, 3000);
      }
    };
    controls.addEventListener("start", noteInteract);

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.05);
      if (camTween) {
        camTween.t += dt;
        const k = easeInOutCubic(Math.min(1, camTween.t / camTween.dur));
        camera.position.lerpVectors(camTween.fromPos, camTween.toPos, k);
        controls.target.lerpVectors(camTween.fromTg, camTween.toTg, k);
        if (camTween.t >= camTween.dur) camTween = null;
      }
      controls.update();
      renderer.render(scene, camera);
    });

    api.switchVehicle(stateRef.current.vehicle);

    return () => {
      disposed = true;
      loadToken++;
      if (idleTimer) clearTimeout(idleTimer);
      renderer.setAnimationLoop(null);
      ro.disconnect();
      controls.dispose();
      scene.traverse((o) => {
        if (o.isMesh) {
          o.geometry?.dispose?.();
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => m?.dispose?.());
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mountRef} className="vv-canvas" aria-hidden="true" />;
}
