import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AERO_THEME_MAP } from '../data/aeroThemes';

const ORBIT_NODES = [
  { radius: 2.34, speed: 0.42, tiltX: 0.25, tiltZ: 0.14, phase: 0.3, size: 0.082 },
  { radius: 2.66, speed: -0.31, tiltX: -0.45, tiltZ: 0.32, phase: 2.1, size: 0.068 },
  { radius: 2.18, speed: 0.54, tiltX: 0.72, tiltZ: -0.25, phase: 4.1, size: 0.058 },
  { radius: 2.88, speed: 0.24, tiltX: -0.18, tiltZ: -0.42, phase: 5.2, size: 0.075 },
  { radius: 2.48, speed: -0.46, tiltX: 0.52, tiltZ: 0.44, phase: 1.4, size: 0.055 },
];

const LAND_CLUSTERS = [
  // Americas-inspired organic forms
  { x: 0.24, y: 0.36, rx: 0.09, ry: 0.14, rot: -0.3 },
  { x: 0.28, y: 0.48, rx: 0.045, ry: 0.07, rot: 0.2 },
  { x: 0.32, y: 0.65, rx: 0.065, ry: 0.15, rot: 0.15 },
  // Europe / Africa-inspired organic forms
  { x: 0.54, y: 0.32, rx: 0.085, ry: 0.09, rot: 0.18 },
  { x: 0.56, y: 0.54, rx: 0.085, ry: 0.14, rot: -0.12 },
  // Asia / Oceania-inspired organic forms
  { x: 0.72, y: 0.36, rx: 0.15, ry: 0.13, rot: -0.08 },
  { x: 0.82, y: 0.67, rx: 0.065, ry: 0.06, rot: 0.25 },
  { x: 0.68, y: 0.48, rx: 0.055, ry: 0.07, rot: 0.4 },
];

function paintBiosphereCanvas(canvas, palette) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  // Deep luminous aqua ocean base
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
  oceanGrad.addColorStop(0, palette.oceanTop);
  oceanGrad.addColorStop(0.55, palette.oceanBottom);
  oceanGrad.addColorStop(1, '#064785');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle caustic water band
  const shimmer = ctx.createRadialGradient(w * 0.45, h * 0.38, 20, w * 0.45, h * 0.38, w * 0.52);
  shimmer.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
  shimmer.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = shimmer;
  ctx.fillRect(0, 0, w, h);

  // Stylized Frutiger Eco continents with soft glow
  const landGrad = ctx.createLinearGradient(0, h * 0.15, 0, h * 0.85);
  landGrad.addColorStop(0, palette.landLight);
  landGrad.addColorStop(1, palette.landDark);

  ctx.save();
  ctx.shadowColor = 'rgba(195, 255, 210, 0.45)';
  ctx.shadowBlur = 16;
  ctx.fillStyle = landGrad;

  for (const c of LAND_CLUSTERS) {
    ctx.save();
    ctx.translate(c.x * w, c.y * h);
    ctx.rotate(c.rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, c.rx * w, c.ry * h, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright meadow highlight
    ctx.beginPath();
    ctx.ellipse(-c.rx * w * 0.18, -c.ry * h * 0.22, c.rx * w * 0.55, c.ry * h * 0.48, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(235, 255, 185, 0.35)';
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // Crisp translucent crystal latitude/longitude grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.4;
  for (let i = 1; i < 8; i += 1) {
    const y = (h / 8) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (let i = 0; i < 12; i += 1) {
    const x = (w / 12) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // Soft swirling cloud wisps
  ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
  for (let i = 0; i < 9; i += 1) {
    const cx = ((i * 137) % 100) * 0.01 * w;
    const cy = (0.18 + ((i * 29) % 64) * 0.01) * h;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.09, h * 0.024, -0.14, 0, Math.PI * 2);
    ctx.fill();
  }
}

function createOrbitRing(radius, tube, color, opacity) {
  const geometry = new THREE.TorusGeometry(radius, tube, 14, 128);
  geometry.rotateX(Math.PI / 2);
  const material = new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity,
    roughness: 0.12,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
  });
  return new THREE.Mesh(geometry, material);
}

export default function AeroOrbGlobe({ theme = 'eco' }) {
  const containerRef = useRef(null);
  const sceneObjectsRef = useRef(null);
  const [fallbackActive, setFallbackActive] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setFallbackActive(true);
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const palette = (AERO_THEME_MAP[theme] || AERO_THEME_MAP.eco).globe;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.16, 7.25);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.appendChild(renderer.domElement);

    // Studio sunlit Frutiger Aero lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(palette.hemiSky, palette.hemiGround, 1.15);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffdf2, 2.25);
    sunLight.position.set(4.5, 5.8, 5.2);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(palette.rimLight, 1.25);
    rimLight.position.set(-4.5, -3.2, -3.8);
    scene.add(rimLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Inner stylized eco-earth sphere with procedural glossy texture
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 1024;
    texCanvas.height = 512;
    paintBiosphereCanvas(texCanvas, palette);

    const bioTexture = new THREE.CanvasTexture(texCanvas);
    bioTexture.colorSpace = THREE.SRGBColorSpace;
    bioTexture.wrapS = THREE.RepeatWrapping;

    const coreGeom = new THREE.SphereGeometry(1.66, 48, 48);
    const coreMat = new THREE.MeshPhysicalMaterial({
      map: bioTexture,
      roughness: 0.16,
      metalness: 0.06,
      clearcoat: 0.85,
      clearcoatRoughness: 0.08,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    rootGroup.add(coreMesh);

    // Outer crystal water-drop shell
    const shellGeom = new THREE.SphereGeometry(1.88, 48, 48);
    const shellMat = new THREE.MeshPhysicalMaterial({
      color: palette.shellTint,
      transparent: true,
      opacity: 0.28,
      roughness: 0.04,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0,
      depthWrite: false,
    });
    const shellMesh = new THREE.Mesh(shellGeom, shellMat);
    rootGroup.add(shellMesh);

    // Glossy subtle geodesic meridian shell
    const wireGeom = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.9, 2));
    const wireMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
    });
    const wireSphere = new THREE.LineSegments(wireGeom, wireMat);
    rootGroup.add(wireSphere);

    // Glossy orbital crystal rings
    const mainRing = createOrbitRing(2.92, 0.018, palette.ringMain, 0.72);
    mainRing.rotation.x = 0.28;
    mainRing.rotation.z = -0.15;
    rootGroup.add(mainRing);

    const innerRing = createOrbitRing(2.36, 0.013, palette.ringInner, 0.62);
    innerRing.rotation.x = -0.45;
    innerRing.rotation.z = 0.22;
    rootGroup.add(innerRing);

    // Orbiting glass bubble & emerald pearl satellites
    const nodeGroups = ORBIT_NODES.map((cfg) => {
      const orbitPivot = new THREE.Group();
      orbitPivot.rotation.x = cfg.tiltX;
      orbitPivot.rotation.z = cfg.tiltZ;

      const nodeWrap = new THREE.Group();
      const sphereGeom = new THREE.SphereGeometry(cfg.size, 20, 20);
      const sphereMat = new THREE.MeshPhysicalMaterial({
        color: palette.nodeShell,
        transparent: true,
        opacity: 0.42,
        roughness: 0.06,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
      });
      const nodeMesh = new THREE.Mesh(sphereGeom, sphereMat);

      const coreDotGeom = new THREE.SphereGeometry(cfg.size * 0.48, 14, 14);
      const coreDotMat = new THREE.MeshStandardMaterial({
        color: palette.nodeCore,
        emissive: palette.nodeCore,
        emissiveIntensity: 0.45,
        roughness: 0.15,
      });
      const coreDot = new THREE.Mesh(coreDotGeom, coreDotMat);

      nodeWrap.add(nodeMesh);
      nodeWrap.add(coreDot);
      orbitPivot.add(nodeWrap);
      rootGroup.add(orbitPivot);

      return { cfg, orbitPivot, nodeWrap, sphereMat, coreDotMat };
    });

    sceneObjectsRef.current = {
      texCanvas,
      bioTexture,
      shellMat,
      mainRing,
      innerRing,
      hemiLight,
      rimLight,
      nodeGroups,
    };

    const updateSize = () => {
      const width = container.clientWidth || 500;
      const height = container.clientHeight || 500;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let velX = 0;
    let velY = 0;
    let pointerY = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      pointerY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      if (isDragging) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        velY = dx * 0.0055;
        velX = dy * 0.0055;
        rootGroup.rotation.y += velY;
        rootGroup.rotation.x += velX;
        prevX = e.clientX;
        prevY = e.clientY;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      if (!isDragging) {
        if (!prefersReducedMotion) {
          rootGroup.rotation.y += 0.0024 + velY;
          rootGroup.rotation.x += (pointerY * 0.14 - rootGroup.rotation.x) * 0.025 + velX;
        }
        velX *= 0.92;
        velY *= 0.92;
      }

      wireSphere.rotation.y = -elapsed * 0.09;
      coreMesh.rotation.y = elapsed * 0.08;

      for (const item of nodeGroups) {
        const angle = item.cfg.phase + (prefersReducedMotion ? 0 : elapsed * item.cfg.speed);
        item.nodeWrap.position.set(
          Math.cos(angle) * item.cfg.radius,
          Math.sin(elapsed * 1.4 + item.cfg.phase) * 0.05,
          Math.sin(angle) * item.cfg.radius
        );
      }

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      sceneObjectsRef.current = null;
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      bioTexture.dispose();

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update materials & biosphere texture smoothly when Aero theme switches
  useEffect(() => {
    const objs = sceneObjectsRef.current;
    if (!objs) return;

    const palette = (AERO_THEME_MAP[theme] || AERO_THEME_MAP.eco).globe;
    paintBiosphereCanvas(objs.texCanvas, palette);
    objs.bioTexture.needsUpdate = true;

    objs.shellMat.color.setHex(palette.shellTint);
    objs.mainRing.material.color.setHex(palette.ringMain);
    objs.innerRing.material.color.setHex(palette.ringInner);
    objs.hemiLight.color.setHex(palette.hemiSky);
    objs.hemiLight.groundColor.setHex(palette.hemiGround);
    objs.rimLight.color.setHex(palette.rimLight);

    for (const item of objs.nodeGroups) {
      item.sphereMat.color.setHex(palette.nodeShell);
      item.coreDotMat.color.setHex(palette.nodeCore);
      item.coreDotMat.emissive.setHex(palette.nodeCore);
    }
  }, [theme]);

  if (fallbackActive) {
    return (
      <div className="hero-globe-canvas-wrap" aria-hidden="true">
        <div className="hero-globe-glow" />
        <svg viewBox="0 0 400 400" width="100%" height="100%">
          <defs>
            <radialGradient id="fallbackAeroGlobe" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
              <stop offset="32%" stopColor="#7de8ff" stopOpacity="0.88" />
              <stop offset="72%" stopColor="#1496de" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#094f94" stopOpacity="0.95" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="200" r="126" fill="url(#fallbackAeroGlobe)" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.85" />
          <ellipse cx="200" cy="200" rx="182" ry="44" fill="none" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.6" transform="rotate(-14 200 200)" />
          <ellipse cx="165" cy="145" rx="52" ry="26" fill="#ffffff" fillOpacity="0.45" transform="rotate(-24 165 145)" />
          <circle cx="88" cy="142" r="8" fill="#63f57d" stroke="#ffffff" strokeWidth="2" />
          <circle cx="312" cy="242" r="9" fill="#8ef3ff" stroke="#ffffff" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="hero-globe-canvas-wrap"
      title="Interactive 3D Crystal Biosphere — drag to rotate"
    >
      <div className="hero-globe-glow" />
    </div>
  );
}
