import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const ORBIT_NODES = [
  { radius: 2.32, speed: 0.42, tiltX: 0.25, tiltZ: 0.14, phase: 0.3, size: 0.068 },
  { radius: 2.62, speed: -0.31, tiltX: -0.45, tiltZ: 0.32, phase: 2.1, size: 0.056 },
  { radius: 2.15, speed: 0.56, tiltX: 0.72, tiltZ: -0.25, phase: 4.1, size: 0.048 },
  { radius: 2.85, speed: 0.24, tiltX: -0.18, tiltZ: -0.42, phase: 5.2, size: 0.062 },
  { radius: 2.48, speed: -0.48, tiltX: 0.52, tiltZ: 0.44, phase: 1.4, size: 0.044 },
];

function createOrbitRing(radius, color, opacity) {
  const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
  const points = curve.getPoints(120).map((p) => new THREE.Vector3(p.x, 0, p.y));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
  });
  return new THREE.LineLoop(geometry, material);
}

export default function WireframeGlobe() {
  const containerRef = useRef(null);
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

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.12, 7.2);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Dark core sphere occludes rear wireframe lines subtly like the reference aesthetic
    const coreGeom = new THREE.SphereGeometry(1.78, 36, 36);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x050507,
      transparent: true,
      opacity: 0.84,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    rootGroup.add(coreMesh);

    // Primary geodesic triangulated crimson wireframe sphere
    const icoGeom = new THREE.IcosahedronGeometry(1.82, 3);
    const wireGeom = new THREE.WireframeGeometry(icoGeom);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x991128,
      transparent: true,
      opacity: 0.42,
    });
    const wireSphere = new THREE.LineSegments(wireGeom, wireMat);
    rootGroup.add(wireSphere);

    // Secondary bright accent meridian shell
    const accentGeom = new THREE.IcosahedronGeometry(1.835, 1);
    const accentWireGeom = new THREE.WireframeGeometry(accentGeom);
    const accentMat = new THREE.LineBasicMaterial({
      color: 0xff1744,
      transparent: true,
      opacity: 0.2,
    });
    const accentSphere = new THREE.LineSegments(accentWireGeom, accentMat);
    rootGroup.add(accentSphere);

    // Wide tilted planetary orbit ring
    const mainRing = createOrbitRing(2.95, 0x8f0f24, 0.24);
    mainRing.rotation.x = 0.26;
    mainRing.rotation.z = -0.14;
    rootGroup.add(mainRing);

    const innerRing = createOrbitRing(2.38, 0xff1744, 0.12);
    innerRing.rotation.x = -0.45;
    innerRing.rotation.z = 0.22;
    rootGroup.add(innerRing);

    // Orbiting crimson satellite nodes
    const nodeGroups = ORBIT_NODES.map((cfg) => {
      const orbitPivot = new THREE.Group();
      orbitPivot.rotation.x = cfg.tiltX;
      orbitPivot.rotation.z = cfg.tiltZ;

      const nodeWrap = new THREE.Group();
      const sphereGeom = new THREE.IcosahedronGeometry(cfg.size, 1);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: 0xff1744,
        wireframe: true,
        transparent: true,
        opacity: 0.9,
      });
      const nodeMesh = new THREE.Mesh(sphereGeom, sphereMat);

      const coreDotGeom = new THREE.SphereGeometry(cfg.size * 0.42, 10, 10);
      const coreDotMat = new THREE.MeshBasicMaterial({ color: 0xff4569 });
      const coreDot = new THREE.Mesh(coreDotGeom, coreDotMat);

      nodeWrap.add(nodeMesh);
      nodeWrap.add(coreDot);
      orbitPivot.add(nodeWrap);
      rootGroup.add(orbitPivot);

      return { cfg, orbitPivot, nodeWrap };
    });

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

    // Interactive mouse parallax & drag rotation
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let velX = 0;
    let velY = 0;
    let pointerX = 0;
    let pointerY = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
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
          rootGroup.rotation.y += 0.0022 + velY;
          rootGroup.rotation.x += (pointerY * 0.16 - rootGroup.rotation.x) * 0.025 + velX;
        }
        velX *= 0.92;
        velY *= 0.92;
      }

      accentSphere.rotation.y = -elapsed * 0.08;

      for (const item of nodeGroups) {
        const angle = item.cfg.phase + (prefersReducedMotion ? 0 : elapsed * item.cfg.speed);
        item.nodeWrap.position.set(
          Math.cos(angle) * item.cfg.radius,
          0,
          Math.sin(angle) * item.cfg.radius
        );
        item.nodeWrap.rotation.y += 0.02;
      }

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
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

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (fallbackActive) {
    return (
      <div className="hero-globe-canvas-wrap" aria-hidden="true">
        <div className="hero-globe-glow" />
        <svg viewBox="0 0 400 400" width="100%" height="100%">
          <circle
            cx="200"
            cy="200"
            r="128"
            fill="none"
            stroke="#991128"
            strokeWidth="1.2"
            strokeOpacity="0.55"
          />
          <ellipse
            cx="200"
            cy="200"
            rx="180"
            ry="44"
            fill="none"
            stroke="#ff1744"
            strokeWidth="1"
            strokeOpacity="0.3"
          />
          <circle cx="88" cy="142" r="5" fill="#ff1744" />
          <circle cx="310" cy="240" r="6" fill="#ff1744" />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="hero-globe-canvas-wrap"
      title="Interactive 3D Globe — drag to rotate"
    >
      <div className="hero-globe-glow" />
    </div>
  );
}
