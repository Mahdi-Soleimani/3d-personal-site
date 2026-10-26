import { useEffect, useRef } from "react";
import { film, publishFilm } from "@/lib/film";

type ThreeNS = typeof import("three");
type ComposerNS = typeof import("three/examples/jsm/postprocessing/EffectComposer.js");
type RenderPassNS = typeof import("three/examples/jsm/postprocessing/RenderPass.js");
type BloomPassNS = typeof import("three/examples/jsm/postprocessing/UnrealBloomPass.js");

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

const SECTION_IDS = [
  "horizon",
  "mandate",
  "nova",
  "vision",
  "river",
  "foundry",
  "work",
  "method",
  "about",
  "contact",
] as const;

type V3 = InstanceType<ThreeNS["Vector3"]>;
type Pose = { p: V3; l: V3; f: number };

function mount(
  THREE: ThreeNS,
  canvas: HTMLCanvasElement,
  ComposerModule?: ComposerNS,
  RenderPassModule?: RenderPassNS,
  BloomPassModule?: BloomPassNS,
) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bg = 0x0c0b09;
  const copper = 0xe09a55;
  const copperBright = 0xffb775;
  const copperDark = 0x5c3c1e;
  const ivory = 0xf3ecdf;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
    stencil: false,
  });
  renderer.setClearColor(bg, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(bg);
  scene.fog = new THREE.FogExp2(bg, 0.024);

  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 160);
  const camPos = new THREE.Vector3(0.4, 6.2, 15);
  const camLook = new THREE.Vector3(0, -1.2, -1);
  camera.position.copy(camPos);
  camera.lookAt(camLook);

  // Lighting
  scene.add(new THREE.HemisphereLight(0xf6efe4, 0x24160c, 1.4));
  const keyLight = new THREE.DirectionalLight(0xfff6ea, 4.2);
  keyLight.position.set(14, 22, 10);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(copper, 3.2);
  rimLight.position.set(-16, 12, -8);
  scene.add(rimLight);

  const coreLight = new THREE.PointLight(copper, 22, 28, 2);
  coreLight.position.set(0, 2.4, 0);
  scene.add(coreLight);

  // Optional Section Spotlights
  const novaSpot = new THREE.PointLight(copperBright, 0, 15, 2);
  novaSpot.position.set(7.5, 3.0, 6.0);
  scene.add(novaSpot);

  const visionSpot = new THREE.PointLight(0xffeedd, 0, 15, 2);
  visionSpot.position.set(-6.5, 4.2, 0.0);
  scene.add(visionSpot);

  const riverSpot = new THREE.PointLight(copper, 0, 15, 2);
  riverSpot.position.set(6.8, 3.5, -6.5);
  scene.add(riverSpot);

  const foundrySpot = new THREE.PointLight(copperBright, 0, 15, 2);
  foundrySpot.position.set(-7.0, 3.5, -9.5);
  scene.add(foundrySpot);

  const rootGroup = new THREE.Group();
  scene.add(rootGroup);

  // Common Materials
  const copperEdgeMat = new THREE.LineBasicMaterial({
    color: copper,
    transparent: true,
    opacity: 0.85,
  });
  const darkEdgeMat = new THREE.LineBasicMaterial({
    color: 0x4a341e,
    transparent: true,
    opacity: 0.6,
  });
  const obsidianMat = new THREE.MeshStandardMaterial({
    color: 0x14110d,
    metalness: 0.82,
    roughness: 0.28,
  });
  const polishedCopperMat = new THREE.MeshStandardMaterial({
    color: 0x9a5d2b,
    metalness: 0.88,
    roughness: 0.2,
    emissive: copper,
    emissiveIntensity: 0.25,
  });
  const glowingCopperMat = new THREE.MeshStandardMaterial({
    color: copperBright,
    metalness: 0.5,
    roughness: 0.2,
    emissive: copper,
    emissiveIntensity: 1.4,
  });

  // 1. Architectural Floor Radar & Grid
  const floorGridPts: number[] = [];
  for (let i = -24; i <= 24; i++) {
    floorGridPts.push(-28, 0, i * 1.25, 28, 0, i * 1.25);
  }
  for (let i = -22; i <= 22; i++) {
    floorGridPts.push(i * 1.25, 0, -28, i * 1.25, 0, 24);
  }
  const floorGridGeo = new THREE.BufferGeometry();
  floorGridGeo.setAttribute("position", new THREE.Float32BufferAttribute(floorGridPts, 3));
  const floorGrid = new THREE.LineSegments(
    floorGridGeo,
    new THREE.LineBasicMaterial({ color: 0x5a3e23, transparent: true, opacity: 0.45 }),
  );
  rootGroup.add(floorGrid);

  // Concentric radar circles on floor
  const radarRadii = [4.5, 9.0, 14.5, 20.0];
  const radarCircles: InstanceType<ThreeNS["Mesh"]>[] = [];
  radarRadii.forEach((r, idx) => {
    const geo = new THREE.RingGeometry(r - 0.02, r + 0.02, 96);
    const mat = new THREE.MeshBasicMaterial({
      color: copper,
      transparent: true,
      opacity: 0.15 + (idx === 1 ? 0.2 : 0),
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.01;
    rootGroup.add(ring);
    radarCircles.push(ring);
  });

  // Dynamic Expanding Wave Rings (4 Concentric Staggered Shockwaves)
  const waveRingCount = 4;
  const waveRings: InstanceType<ThreeNS["Mesh"]>[] = [];
  for (let i = 0; i < waveRingCount; i++) {
    const waveRingGeo = new THREE.RingGeometry(0.1, 0.28, 64);
    const waveRingMat = new THREE.MeshBasicMaterial({
      color: copperBright,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const wr = new THREE.Mesh(waveRingGeo, waveRingMat);
    wr.rotation.x = Math.PI / 2;
    wr.position.y = 0.02 + i * 0.002;
    rootGroup.add(wr);
    waveRings.push(wr);
  }

  // 4 Main Arterial Circuit Runways connecting Monolith to Modules
  // 1: Center -> Nova (7.5, 0.05, 6.0)
  // 2: Center -> Vision (-6.5, 0.05, 0.0)
  // 3: Center -> River (6.8, 0.05, -6.5)
  // 4: Center -> Foundry (-7.0, 0.05, -9.5)
  const moduleTargets = [
    { name: "Nova", x: 7.5, z: 6.0 },
    { name: "Vision", x: -6.5, z: 0.0 },
    { name: "River", x: 6.8, z: -6.5 },
    { name: "Foundry", x: -7.0, z: -9.5 },
  ];

  interface CircuitArtery {
    line: InstanceType<ThreeNS["Line"]>;
    pulses: InstanceType<ThreeNS["Mesh"]>[];
    targetX: number;
    targetZ: number;
  }
  const circuitArteries: CircuitArtery[] = [];

  moduleTargets.forEach((target) => {
    const midX = target.x * 0.45;
    const midZ = target.z * 0.85;
    const arteryPts = [0, 0.04, 0, midX, 0.04, midZ, target.x, 0.04, target.z];
    const arteryGeo = new THREE.BufferGeometry();
    arteryGeo.setAttribute("position", new THREE.Float32BufferAttribute(arteryPts, 3));
    const arteryLine = new THREE.Line(
      arteryGeo,
      new THREE.LineBasicMaterial({ color: 0x6e4a28, transparent: true, opacity: 0.75 }),
    );
    rootGroup.add(arteryLine);

    const pulses: InstanceType<ThreeNS["Mesh"]>[] = [];
    for (let p = 0; p < 2; p++) {
      const pGeo = new THREE.SphereGeometry(0.09, 12, 12);
      const pMesh = new THREE.Mesh(
        pGeo,
        new THREE.MeshBasicMaterial({ color: copperBright }),
      );
      pMesh.position.set(0, 0.08, 0);
      rootGroup.add(pMesh);
      pulses.push(pMesh);
    }
    circuitArteries.push({ line: arteryLine, pulses, targetX: target.x, targetZ: target.z });
  });

  // 2. Ambient Floating Stardust (450 Particles)
  const particleCount = 450;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);
  const pColors = [
    new THREE.Color(copper),
    new THREE.Color(copperBright),
    new THREE.Color(ivory),
    new THREE.Color(0xb57843),
  ];
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 44;
    particlePositions[i * 3 + 1] = Math.random() * 18 + 0.5;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 44;
    const c = pColors[i % pColors.length];
    particleColors[i * 3] = c.r;
    particleColors[i * 3 + 1] = c.g;
    particleColors[i * 3 + 2] = c.b;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.085,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  rootGroup.add(particles);

  // 3. Central Monolith Architecture & Gimbal Rings (Horizon & Mandate)
  const coreGroup = new THREE.Group();
  rootGroup.add(coreGroup);

  // Octahedral Monolith
  const corePolyGeo = new THREE.OctahedronGeometry(0.75, 0);
  const corePoly = new THREE.Mesh(corePolyGeo, polishedCopperMat);
  corePoly.position.y = 2.2;
  corePoly.add(new THREE.LineSegments(new THREE.EdgesGeometry(corePolyGeo), copperEdgeMat));
  coreGroup.add(corePoly);

  // Outer Counter-Rotating Wireframe Octahedron
  const outerCoreGeo = new THREE.OctahedronGeometry(1.2, 0);
  const outerCoreWire = new THREE.LineSegments(
    new THREE.EdgesGeometry(outerCoreGeo),
    new THREE.LineBasicMaterial({ color: copper, transparent: true, opacity: 0.45 }),
  );
  outerCoreWire.position.y = 2.2;
  coreGroup.add(outerCoreWire);

  // 3 Orbiting Satellites on inclined planes
  const coreSatellites: Array<{ mesh: InstanceType<ThreeNS["Mesh"]>; tilt: number; speed: number; radius: number }> = [];
  const satConfigs = [
    { tilt: 0.35, speed: 0.0014, radius: 2.3 },
    { tilt: -0.45, speed: -0.0011, radius: 3.1 },
    { tilt: 0.7, speed: 0.0018, radius: 1.8 },
  ];
  satConfigs.forEach((cfg) => {
    const sMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.12, 0),
      new THREE.MeshBasicMaterial({ color: copperBright }),
    );
    coreGroup.add(sMesh);
    coreSatellites.push({ mesh: sMesh, tilt: cfg.tilt, speed: cfg.speed, radius: cfg.radius });
  });

  // Inner Radiant Orb
  const innerOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  );
  innerOrb.position.y = 2.2;
  coreGroup.add(innerOrb);

  // Triple Concentric Gimbal Rings
  const gimbalRing1 = new THREE.Mesh(
    new THREE.TorusGeometry(2.1, 0.028, 12, 80),
    new THREE.MeshStandardMaterial({ color: copper, metalness: 0.9, roughness: 0.2 }),
  );
  gimbalRing1.position.y = 2.2;
  coreGroup.add(gimbalRing1);

  const gimbalRing2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.8, 0.022, 12, 90),
    new THREE.MeshBasicMaterial({ color: copperDark }),
  );
  gimbalRing2.position.y = 2.2;
  coreGroup.add(gimbalRing2);

  const gimbalRing3 = new THREE.Mesh(
    new THREE.TorusGeometry(3.6, 0.018, 10, 100),
    new THREE.MeshBasicMaterial({ color: copper, transparent: true, opacity: 0.6 }),
  );
  gimbalRing3.position.y = 2.2;
  coreGroup.add(gimbalRing3);

  // Monolith Pedestal & Circuit Runways
  const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.9, 0.45, 8);
  const pedestal = new THREE.Mesh(pedestalGeo, obsidianMat);
  pedestal.position.y = 0.225;
  pedestal.add(new THREE.LineSegments(new THREE.EdgesGeometry(pedestalGeo), darkEdgeMat));
  coreGroup.add(pedestal);

  // Surrounding Foundation Columns (Mandate Modular Array)
  const mandateColumns: Array<{
    mesh: InstanceType<ThreeNS["Mesh"]>;
    baseY: number;
    targetH: number;
  }> = [];
  const colPos = [
    [-3.8, -2.5],
    [-4.5, 2.0],
    [-2.2, 4.2],
    [2.8, 4.0],
    [4.2, 1.5],
    [3.5, -3.0],
    [0.0, -4.5],
    [-1.8, -4.0],
  ];
  colPos.forEach(([cx, cz], idx) => {
    const ch = 1.2 + (idx % 4) * 0.55;
    const cGeo = idx % 2 === 0 ? new THREE.BoxGeometry(0.85, 1, 0.85) : new THREE.CylinderGeometry(0.48, 0.48, 1, 6);
    const cMesh = new THREE.Mesh(cGeo, obsidianMat);
    cMesh.position.set(cx, ch / 2, cz);
    cMesh.scale.set(1, ch, 1);
    cMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(cGeo), copperEdgeMat));

    // Cap light
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.08, 0.4),
      idx % 3 === 0 ? glowingCopperMat : polishedCopperMat,
    );
    cap.position.y = 0.52;
    cMesh.add(cap);

    coreGroup.add(cMesh);
    mandateColumns.push({ mesh: cMesh, baseY: ch / 2, targetH: ch });
  });

  // Fiber tracks from perimeter to core
  const fiberGeo = new THREE.BufferGeometry();
  const fiberPts = new Float32Array(mandateColumns.length * 2 * 3);
  fiberGeo.setAttribute("position", new THREE.BufferAttribute(fiberPts, 3));
  const fiberLines = new THREE.LineSegments(
    fiberGeo,
    new THREE.LineBasicMaterial({ color: copper, transparent: true, opacity: 0.35 }),
  );
  coreGroup.add(fiberLines);

  // 4. SECTION 03 — NOVA: Multi-Model AI NPU Processor Chip
  const novaGroup = new THREE.Group();
  novaGroup.position.set(7.5, 0.05, 6.0);
  rootGroup.add(novaGroup);

  // Chip Base Substrate
  const chipBaseGeo = new THREE.BoxGeometry(4.8, 0.28, 4.8);
  const chipBase = new THREE.Mesh(chipBaseGeo, obsidianMat);
  chipBase.position.y = 0.14;
  chipBase.add(new THREE.LineSegments(new THREE.EdgesGeometry(chipBaseGeo), copperEdgeMat));
  novaGroup.add(chipBase);

  // Central Router Heat-Spreader
  const routerGeo = new THREE.BoxGeometry(1.6, 0.18, 1.6);
  const routerMesh = new THREE.Mesh(routerGeo, polishedCopperMat);
  routerMesh.position.y = 0.37;
  routerMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(routerGeo), copperEdgeMat));
  novaGroup.add(routerMesh);

  // 3 Multi-Model Satellite Cores (ChatGPT, Claude, Gemini)
  const modelCores: Array<{ mesh: InstanceType<ThreeNS["Mesh"]>; orb: InstanceType<ThreeNS["Mesh"]> }> = [];
  const modelCoreConfigs = [
    { x: -1.4, z: -1.3, color: 0x6ee7b7, name: "ChatGPT" },
    { x: 1.4, z: -1.3, color: 0xf87171, name: "Claude" },
    { x: 0.0, z: 1.5, color: 0x60a5fa, name: "Gemini" },
  ];

  modelCoreConfigs.forEach((cfg) => {
    const coreCasingGeo = new THREE.CylinderGeometry(0.42, 0.48, 0.32, 16);
    const coreCasing = new THREE.Mesh(
      coreCasingGeo,
      new THREE.MeshStandardMaterial({
        color: 0x1f1914,
        metalness: 0.8,
        roughness: 0.25,
        emissive: copper,
        emissiveIntensity: 0.3,
      }),
    );
    coreCasing.position.set(cfg.x, 0.38, cfg.z);
    coreCasing.add(new THREE.LineSegments(new THREE.EdgesGeometry(coreCasingGeo), copperEdgeMat));

    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 16, 16),
      new THREE.MeshBasicMaterial({ color: cfg.color }),
    );
    orb.position.y = 0.28;
    coreCasing.add(orb);

    novaGroup.add(coreCasing);
    modelCores.push({ mesh: coreCasing, orb });
  });

  // Orbiting quantum rings around ChatGPT, Claude, and Gemini
  const modelQuantumRings: Array<{ ring: InstanceType<ThreeNS["Mesh"]>; core: typeof modelCores[0]; speed: number }> = [];
  modelCores.forEach((c, idx) => {
    const qGeo = new THREE.TorusGeometry(0.32, 0.016, 8, 36);
    const qMat = new THREE.MeshBasicMaterial({ color: modelCoreConfigs[idx].color, transparent: true, opacity: 0.85 });
    const qMesh = new THREE.Mesh(qGeo, qMat);
    qMesh.position.y = 0.28;
    qMesh.rotation.x = Math.PI / 3;
    c.mesh.add(qMesh);
    modelQuantumRings.push({ ring: qMesh, core: c, speed: (idx % 2 === 0 ? 1 : -1) * (0.003 + idx * 0.001) });
  });

  // Automated Payment Node & Bus Tracks
  const paymentUnitGeo = new THREE.BoxGeometry(0.9, 0.22, 0.7);
  const paymentUnit = new THREE.Mesh(paymentUnitGeo, glowingCopperMat);
  paymentUnit.position.set(1.5, 0.32, 1.4);
  novaGroup.add(paymentUnit);

  // Animated circuit bus line traces on chip
  const chipTracePts = [
    -1.4, 0.3, -1.3, 0, 0.35, 0,
    1.4, 0.3, -1.3, 0, 0.35, 0,
    0, 0.3, 1.5, 0, 0.35, 0,
    0, 0.35, 0, 1.5, 0.3, 1.4,
  ];
  const chipTraceGeo = new THREE.BufferGeometry();
  chipTraceGeo.setAttribute("position", new THREE.Float32BufferAttribute(chipTracePts, 3));
  novaGroup.add(
    new THREE.LineSegments(
      chipTraceGeo,
      new THREE.LineBasicMaterial({ color: copperBright, transparent: true, opacity: 0.8 }),
    ),
  );

  // Floating orbiting data tokens around Nova
  const novaTokenCount = 6;
  const novaTokens: InstanceType<ThreeNS["Mesh"]>[] = [];
  for (let i = 0; i < novaTokenCount; i++) {
    const token = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.12, 0),
      new THREE.MeshStandardMaterial({
        color: ivory,
        emissive: copper,
        emissiveIntensity: 0.8,
      }),
    );
    novaGroup.add(token);
    novaTokens.push(token);
  }

  // 5. SECTION 04 — VISION: Perspective Rectifier & Mall Object Detection
  const visionGroup = new THREE.Group();
  visionGroup.position.set(-6.5, 0.05, 0.0);
  rootGroup.add(visionGroup);

  // Ground Scanner Grid Platform
  const scannerFloorGeo = new THREE.BoxGeometry(4.4, 0.15, 4.4);
  const scannerFloor = new THREE.Mesh(scannerFloorGeo, obsidianMat);
  scannerFloor.position.y = 0.075;
  scannerFloor.add(new THREE.LineSegments(new THREE.EdgesGeometry(scannerFloorGeo), copperEdgeMat));
  visionGroup.add(scannerFloor);

  // Camera Mast & Sensor Pivot
  const cameraMast = new THREE.Group();
  cameraMast.position.set(0, 0.15, 0);
  visionGroup.add(cameraMast);

  const sensorPivot = new THREE.Group();
  sensorPivot.position.set(0, 3.8, 0);
  cameraMast.add(sensorPivot);

  // Physical 3D Camera Body
  const camBodyGeo = new THREE.BoxGeometry(0.65, 0.42, 0.9);
  const camBody = new THREE.Mesh(camBodyGeo, polishedCopperMat);
  camBody.add(new THREE.LineSegments(new THREE.EdgesGeometry(camBodyGeo), copperEdgeMat));
  sensorPivot.add(camBody);

  const camLensGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.35, 24);
  const camLens = new THREE.Mesh(camLensGeo, obsidianMat);
  camLens.rotation.x = Math.PI / 2;
  camLens.position.z = 0.55;
  camBody.add(camLens);

  // Camera Frustum Rays (Wireframe Pyramid from lens to floor)
  const frustumRayGeo = new THREE.BufferGeometry();
  const frustumPositions = new Float32Array(4 * 2 * 3);
  frustumRayGeo.setAttribute("position", new THREE.BufferAttribute(frustumPositions, 3));
  const frustumLines = new THREE.LineSegments(
    frustumRayGeo,
    new THREE.LineBasicMaterial({ color: copperBright, transparent: true, opacity: 0.75 }),
  );
  sensorPivot.add(frustumLines);

  // Mall Detected Objects on Platform (Cylinder, Box, Prism mentioned in text)
  const detectedObjects: Array<InstanceType<ThreeNS["Mesh"]>> = [];
  const obj1Geo = new THREE.CylinderGeometry(0.38, 0.38, 0.7, 24);
  const obj1 = new THREE.Mesh(obj1Geo, polishedCopperMat);
  obj1.position.set(-1.1, 0.48, -0.9);
  obj1.add(new THREE.LineSegments(new THREE.EdgesGeometry(obj1Geo), copperEdgeMat));
  visionGroup.add(obj1);
  detectedObjects.push(obj1);

  const obj2Geo = new THREE.BoxGeometry(0.75, 0.85, 0.75);
  const obj2 = new THREE.Mesh(obj2Geo, obsidianMat);
  obj2.position.set(0.9, 0.55, -0.6);
  obj2.add(new THREE.LineSegments(new THREE.EdgesGeometry(obj2Geo), copperEdgeMat));
  visionGroup.add(obj2);
  detectedObjects.push(obj2);

  const obj3Geo = new THREE.CylinderGeometry(0.42, 0.42, 0.65, 3);
  const obj3 = new THREE.Mesh(obj3Geo, polishedCopperMat);
  obj3.position.set(-0.2, 0.45, 1.0);
  obj3.add(new THREE.LineSegments(new THREE.EdgesGeometry(obj3Geo), copperEdgeMat));
  visionGroup.add(obj3);
  detectedObjects.push(obj3);

  // 3D Holographic AI Detection Bounding Boxes
  const boundingBoxes: Array<{ box: InstanceType<ThreeNS["LineSegments"]>; target: InstanceType<ThreeNS["Mesh"]> }> = [];
  detectedObjects.forEach((obj) => {
    const bbGeo = new THREE.BoxGeometry(1.05, 1.05, 1.05);
    const bbWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(bbGeo),
      new THREE.LineBasicMaterial({ color: copperBright, transparent: true, opacity: 0.7 }),
    );
    bbWire.position.copy(obj.position);
    bbWire.position.y += 0.2;
    visionGroup.add(bbWire);
    boundingBoxes.push({ box: bbWire, target: obj });
  });

  // Moving Laser Scan Line (Sweeps back and forth across the floor)
  const scanLineGeo = new THREE.BoxGeometry(4.0, 0.04, 0.08);
  const scanLine = new THREE.Mesh(scanLineGeo, glowingCopperMat);
  scanLine.position.y = 0.2;
  visionGroup.add(scanLine);

  // 6. SECTION 05 — RIVER: Human-in-the-Loop Pipeline & Gate
  const riverGroup = new THREE.Group();
  riverGroup.position.set(6.8, 0.05, -6.5);
  rootGroup.add(riverGroup);

  // Elevated Pipeline Beds
  const pipeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.2, 0.6, 2.5),
    new THREE.Vector3(-1.4, 0.8, 1.2),
    new THREE.Vector3(0.0, 1.0, 0.0),
    new THREE.Vector3(1.6, 0.8, -1.2),
    new THREE.Vector3(3.2, 0.6, -2.5),
  ]);
  const pipeTubeGeo = new THREE.TubeGeometry(pipeCurve, 32, 0.16, 12, false);
  const pipeTube = new THREE.Mesh(
    pipeTubeGeo,
    new THREE.MeshStandardMaterial({
      color: 0x1f1914,
      metalness: 0.85,
      roughness: 0.3,
      emissive: copper,
      emissiveIntensity: 0.2,
    }),
  );
  pipeTube.add(new THREE.LineSegments(new THREE.WireframeGeometry(pipeTubeGeo), darkEdgeMat));
  riverGroup.add(pipeTube);

  // HITL Inspection Gate (Mechanical Iris / Gate Tower)
  const hitlGateGroup = new THREE.Group();
  hitlGateGroup.position.set(0, 1.0, 0);
  riverGroup.add(hitlGateGroup);

  const gateRingGeo = new THREE.TorusGeometry(0.75, 0.08, 16, 48);
  const gateRing = new THREE.Mesh(gateRingGeo, polishedCopperMat);
  gateRing.rotation.y = Math.PI / 4;
  hitlGateGroup.add(gateRing);

  // Gate Internal Iris Aperture (Pulse Glow)
  const gateIrisGeo = new THREE.RingGeometry(0.05, 0.68, 24);
  const gateIrisMat = new THREE.MeshBasicMaterial({
    color: copperBright,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  });
  const gateIris = new THREE.Mesh(gateIrisGeo, gateIrisMat);
  gateIris.rotation.y = Math.PI / 4;
  hitlGateGroup.add(gateIris);

  // Human Confirmation Beacon
  const hitlBeacon = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.18, 0),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  );
  hitlBeacon.position.y = 1.05;
  hitlGateGroup.add(hitlBeacon);

  // River Data Pulses (Traveling along the tube)
  const riverPacketCount = 8;
  const riverPackets: InstanceType<ThreeNS["Mesh"]>[] = [];
  for (let i = 0; i < riverPacketCount; i++) {
    const pkt = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      new THREE.MeshBasicMaterial({ color: copperBright }),
    );
    riverGroup.add(pkt);
    riverPackets.push(pkt);
  }

  // Destination PostgreSQL Vault Cylinder
  const vaultGeo = new THREE.CylinderGeometry(0.7, 0.8, 1.6, 16);
  const vaultMesh = new THREE.Mesh(vaultGeo, obsidianMat);
  vaultMesh.position.set(3.4, 0.8, -2.7);
  vaultMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(vaultGeo), copperEdgeMat));
  riverGroup.add(vaultMesh);

  // 7. SECTION 06 — FOUNDRY: Quad-Prism Content Splitter (1 -> 4 Formats)
  const foundryGroup = new THREE.Group();
  foundryGroup.position.set(-7.0, 0.05, -9.5);
  rootGroup.add(foundryGroup);

  // Central Crystal Prism
  const prismGeo = new THREE.OctahedronGeometry(0.85, 0);
  const prismMesh = new THREE.Mesh(prismGeo, polishedCopperMat);
  prismMesh.position.y = 1.6;
  prismMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(prismGeo), copperEdgeMat));
  foundryGroup.add(prismMesh);

  // Incoming Master Data Beam (Top down into prism)
  const masterBeamPts = [0, 5.0, 0, 0, 1.6, 0];
  const masterBeamGeo = new THREE.BufferGeometry();
  masterBeamGeo.setAttribute("position", new THREE.Float32BufferAttribute(masterBeamPts, 3));
  const masterBeam = new THREE.Line(
    masterBeamGeo,
    new THREE.LineBasicMaterial({ color: ivory, linewidth: 2 }),
  );
  foundryGroup.add(masterBeam);

  // 4 Output Matrix Plinths (Article, Telegram, Instagram, Story)
  const plinthConfigs = [
    { id: "article", w: 1.1, h: 0.7, label: "Web", baseAngle: -Math.PI * 0.75 },
    { id: "telegram", w: 0.7, h: 1.0, label: "TG", baseAngle: -Math.PI * 0.25 },
    { id: "instagram", w: 0.85, h: 0.85, label: "IG", baseAngle: Math.PI * 0.25 },
    { id: "story", w: 0.6, h: 1.1, label: "Story", baseAngle: Math.PI * 0.75 },
  ];
  const outputPlinths: Array<{
    mesh: InstanceType<ThreeNS["Mesh"]>;
    laser: InstanceType<ThreeNS["Line"]>;
    baseAngle: number;
  }> = [];

  plinthConfigs.forEach((cfg) => {
    const pGeo = new THREE.BoxGeometry(cfg.w, cfg.h, 0.12);
    const pMesh = new THREE.Mesh(pGeo, obsidianMat);
    pMesh.position.y = 1.3;
    pMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(pGeo), copperEdgeMat));
    foundryGroup.add(pMesh);

    // Laser ray from prism to plinth
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.Float32BufferAttribute([0, 1.6, 0, 0, 1.3, 0], 3));
    const laser = new THREE.Line(
      lGeo,
      new THREE.LineBasicMaterial({ color: copperBright, transparent: true, opacity: 0.8 }),
    );
    foundryGroup.add(laser);

    outputPlinths.push({ mesh: pMesh, laser, baseAngle: cfg.baseAngle });
  });

  // Holographic format badges floating above the 4 plinths
  const plinthBadges: InstanceType<ThreeNS["Mesh"]>[] = [];
  outputPlinths.forEach((plinth) => {
    const bGeo = new THREE.PlaneGeometry(0.45, 0.45);
    const bMat = new THREE.MeshBasicMaterial({
      color: copperBright,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const bMesh = new THREE.Mesh(bGeo, bMat);
    bMesh.position.set(0, 0.85, 0);
    plinth.mesh.add(bMesh);
    plinthBadges.push(bMesh);
  });

  // 8. SECTION 07 & 08 — METHOD: 4 Sequential Architecture Towers
  const methodGroup = new THREE.Group();
  methodGroup.position.set(0, 0.05, -14.0);
  rootGroup.add(methodGroup);

  const methodTowers: Array<{
    mesh: InstanceType<ThreeNS["Mesh"]>;
    ring: InstanceType<ThreeNS["Mesh"]>;
    targetH: number;
  }> = [];

  for (let i = 0; i < 4; i++) {
    const th = 1.6 + i * 0.7;
    const tGeo = new THREE.BoxGeometry(0.85, 1, 0.85);
    const tMesh = new THREE.Mesh(tGeo, obsidianMat);
    tMesh.scale.set(1, th, 1);
    tMesh.position.set((i - 1.5) * 2.4, th / 2, 0);
    tMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(tGeo), copperEdgeMat));

    // Glow Ring near top
    const trGeo = new THREE.RingGeometry(0.48, 0.58, 16);
    const trMesh = new THREE.Mesh(
      trGeo,
      new THREE.MeshBasicMaterial({ color: copper, side: THREE.DoubleSide }),
    );
    trMesh.rotation.x = Math.PI / 2;
    trMesh.position.y = 0.48;
    tMesh.add(trMesh);

    methodGroup.add(tMesh);
    methodTowers.push({ mesh: tMesh, ring: trMesh, targetH: th });
  }

  // Vertical Milestone Confirmation Beacons
  const towerBeacons: InstanceType<ThreeNS["Line"]>[] = [];
  methodTowers.forEach((tower) => {
    const bPts = [0, 0, 0, 0, 8.0, 0];
    const bGeo = new THREE.BufferGeometry();
    bGeo.setAttribute("position", new THREE.Float32BufferAttribute(bPts, 3));
    const bLine = new THREE.Line(
      bGeo,
      new THREE.LineBasicMaterial({ color: copperBright, transparent: true, opacity: 0 }),
    );
    tower.mesh.add(bLine);
    towerBeacons.push(bLine);
  });

  // Camera Keyframe Poses per section
  const heroA = { p: new THREE.Vector3(0.4, 6.2, 15), l: new THREE.Vector3(0, -1.2, -1), f: 68 };
  const heroB = { p: new THREE.Vector3(-4.8, 4.6, 10.5), l: new THREE.Vector3(0.8, 0.4, 0), f: 56 };

  const mandateA = { p: new THREE.Vector3(-3.5, 5.0, 11.2), l: new THREE.Vector3(0.4, 0.7, 0), f: 58 };
  const mandateB = { p: new THREE.Vector3(2.8, 4.5, 9.8), l: new THREE.Vector3(-0.2, 0.8, 0), f: 54 };

  // Nova: Closeup inspection of NPU chip & coprocessors
  const novaA = { p: new THREE.Vector3(9.2, 4.2, 8.8), l: new THREE.Vector3(7.5, 0.4, 6.0), f: 48 };
  const novaB = { p: new THREE.Vector3(6.2, 2.8, 4.2), l: new THREE.Vector3(7.5, 0.4, 6.0), f: 42 };

  // Vision: Oblique 35-degree to Pure 90-degree Zenith overhead
  const visA = { p: new THREE.Vector3(-6.5, 5.2, 4.8), l: new THREE.Vector3(-6.5, 0.4, 0.0), f: 56 };
  const visB = { p: new THREE.Vector3(-6.5, 14.5, 0.1), l: new THREE.Vector3(-6.5, 0.4, 0.0), f: 72 };

  // River: Tracking along data flume into HITL gate
  const riverA = { p: new THREE.Vector3(9.8, 4.6, -4.2), l: new THREE.Vector3(6.8, 1.0, -6.5), f: 52 };
  const riverB = { p: new THREE.Vector3(4.8, 3.2, -8.6), l: new THREE.Vector3(6.8, 1.0, -6.5), f: 48 };

  // Foundry: Framed on crystal prism & 4 fan-out plinths
  const foundryA = { p: new THREE.Vector3(-8.8, 5.6, -6.8), l: new THREE.Vector3(-7.0, 1.5, -9.5), f: 56 };
  const foundryB = { p: new THREE.Vector3(-5.2, 4.0, -11.8), l: new THREE.Vector3(-7.0, 1.5, -9.5), f: 48 };

  // Work: Deep architectural panorama
  const workA = { p: new THREE.Vector3(6.5, 7.2, 11.5), l: new THREE.Vector3(0, 0.5, 0), f: 64 };
  const workB = { p: new THREE.Vector3(-3.2, 6.2, 13.0), l: new THREE.Vector3(0, 0.5, 0), f: 62 };

  // Method: Milestone towers profile
  const methodA = { p: new THREE.Vector3(-6.5, 4.5, -12.2), l: new THREE.Vector3(0, 1.5, -14.0), f: 52 };
  const methodB = { p: new THREE.Vector3(3.2, 4.2, -15.5), l: new THREE.Vector3(0, 1.5, -14.0), f: 48 };

  // End: Majestic monument centered view
  const end = { p: new THREE.Vector3(0, 8.8, 22), l: new THREE.Vector3(0, 0.5, 0), f: 72 };
  const travel = { p: new THREE.Vector3(-5.5, 5.5, 10.5), l: new THREE.Vector3(0, 0.5, 0), f: 60 };

  function mixPose(a: Pose, b: Pose, t: number, intoP: V3, intoL: V3) {
    intoP.lerpVectors(a.p, b.p, t);
    intoL.lerpVectors(a.l, b.l, t);
    return THREE.MathUtils.lerp(a.f, b.f, t);
  }

  const poseP = Array.from({ length: 10 }, () => new THREE.Vector3());
  const poseL = Array.from({ length: 10 }, () => new THREE.Vector3());
  const targetP = new THREE.Vector3();
  const targetL = new THREE.Vector3();
  let targetF = 70;
  let alive = true;

  // Cached layout metrics to avoid Layout Thrashing in rAF
  interface SectionMetric {
    docTop: number;
    height: number;
  }
  const sectionElements = new Map<string, HTMLElement>();
  const sectionMetrics = new Map<string, SectionMetric>();
  let cachedWindowHeight = window.innerHeight || 1;
  let cachedDocHeight = document.documentElement.scrollHeight || 1;

  let liveFovEl: HTMLElement | null = null;
  let liveDepEl: HTMLElement | null = null;
  let liveHeadEl: HTMLElement | null = null;
  let liveRollEl: HTMLElement | null = null;
  let liveSectorEl: HTMLElement | null = null;
  let lastFov = -1;
  let lastDep = -1;
  let lastHead = -1;
  let lastRoll = 999;
  let lastSector = "";

  // Mouse Parallax & Banking Physics state
  let mouseX = 0;
  let mouseY = 0;
  let smoothMouseX = 0;
  let smoothMouseY = 0;
  let currentRoll = 0;

  const SECTOR_NAMES: Record<string, string> = {
    horizon: "01 افق",
    mandate: "02 مسئله و مأموریت",
    nova: "03 اکوسیستم نوا",
    vision: "04 بینایی ماشین",
    river: "05 خط لوله جریان",
    foundry: "06 ماتریس بازتولید",
    work: "07 کارهای منتخب",
    method: "08 روش‌شناسی",
    about: "09 درباره معمار",
    contact: "10 ارتباط و جلسه",
  };

  const onPointerMove = (e: MouseEvent) => {
    mouseX = (e.clientX / (window.innerWidth || 1)) * 2 - 1;
    mouseY = -(e.clientY / (window.innerHeight || 1)) * 2 + 1;
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  function measureLayout() {
    cachedWindowHeight = window.innerHeight || 1;
    cachedDocHeight = document.documentElement.scrollHeight || 1;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    for (const id of SECTION_IDS) {
      let el = sectionElements.get(id);
      if (!el) {
        const found = document.getElementById(id);
        if (found) {
          el = found;
          sectionElements.set(id, found);
        }
      }
      if (el) {
        const rect = el.getBoundingClientRect();
        sectionMetrics.set(id, {
          docTop: rect.top + scrollY,
          height: rect.height,
        });
      }
    }
  }

  function getLocalProgress(id: string, scrollY: number, viewH: number): number {
    const m = sectionMetrics.get(id);
    if (!m) return 0;
    const total = m.height - viewH;
    if (total <= 0) return 0;
    const top = m.docTop - scrollY;
    return clamp(-top / total, 0, 1);
  }

  function getFocusOf(id: string, scrollY: number, viewH: number): number {
    const m = sectionMetrics.get(id);
    if (!m) return 0;
    const top = m.docTop - scrollY;
    const bottom = top + m.height;
    const visible = Math.min(bottom, viewH) - Math.max(top, 0);
    return clamp(visible / viewH, 0, 1);
  }

  // Effect Composer & Bloom Pass
  let composer: InstanceType<ComposerNS["EffectComposer"]> | null = null;
  if (ComposerModule && RenderPassModule && BloomPassModule && !reduced) {
    try {
      const renderPass = new RenderPassModule.RenderPass(scene, camera);
      const bloomPass = new BloomPassModule.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.45,
        0.36,
        0.84,
      );
      composer = new ComposerModule.EffectComposer(renderer);
      composer.addPass(renderPass);
      composer.addPass(bloomPass);
    } catch {
      composer = null;
    }
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    if (composer) {
      composer.setPixelRatio(dpr);
      composer.setSize(w, h);
    }
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }

  const tmpVec = new THREE.Vector3();

  function frame(t: number) {
    if (!alive) return;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const viewH = cachedWindowHeight;

    const locals: Record<string, number> = {};
    for (const id of SECTION_IDS) {
      locals[id] = getLocalProgress(id, scrollY, viewH);
    }

    const max = cachedDocHeight - viewH;
    const page = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
    publishFilm(locals, page);

    const wHero = getFocusOf("horizon", scrollY, viewH);
    const wMandate = getFocusOf("mandate", scrollY, viewH);
    const wNova = getFocusOf("nova", scrollY, viewH);
    const wVision = getFocusOf("vision", scrollY, viewH);
    const wRiver = getFocusOf("river", scrollY, viewH);
    const wFoundry = getFocusOf("foundry", scrollY, viewH);
    const wWork = getFocusOf("work", scrollY, viewH);
    const wMethod = getFocusOf("method", scrollY, viewH);
    const wEnd = Math.max(
      getFocusOf("about", scrollY, viewH),
      getFocusOf("contact", scrollY, viewH),
    );
    const totalNamedFocus =
      wHero +
      wMandate +
      wNova +
      wVision +
      wRiver +
      wFoundry +
      wWork +
      wMethod +
      wEnd;
    const wTravel = Math.max(0, 1 - Math.min(1, totalNamedFocus));

    const spHero = reduced ? 0.35 : locals.horizon || 0;
    const spMandate = reduced ? 0.5 : locals.mandate || 0;
    const spNova = reduced ? 0.4 : locals.nova || 0;
    const spVis = reduced ? 0.45 : locals.vision || 0;
    const spRiver = reduced ? 0.5 : locals.river || 0;
    const spFoundry = reduced ? 0.5 : locals.foundry || 0;
    const spWork = reduced ? 0.5 : locals.work || 0;
    const spMethod = reduced ? 0.5 : locals.method || 0;

    const fovs = [
      mixPose(heroA, heroB, spHero, poseP[0], poseL[0]),
      mixPose(mandateA, mandateB, spMandate, poseP[1], poseL[1]),
      mixPose(novaA, novaB, spNova, poseP[2], poseL[2]),
      mixPose(visA, visB, spVis, poseP[3], poseL[3]),
      mixPose(riverA, riverB, spRiver, poseP[4], poseL[4]),
      mixPose(foundryA, foundryB, spFoundry, poseP[5], poseL[5]),
      mixPose(workA, workB, spWork, poseP[6], poseL[6]),
      mixPose(methodA, methodB, spMethod, poseP[7], poseL[7]),
      end.f,
      travel.f,
    ];
    poseP[8].copy(end.p);
    poseL[8].copy(end.l);
    poseP[9].copy(travel.p);
    poseL[9].copy(travel.l);

    const weights = [
      wHero,
      wMandate,
      wNova,
      wVision,
      wRiver,
      wFoundry,
      wWork,
      wMethod,
      wEnd,
      wTravel,
    ];
    const sum = weights.reduce((acc, val) => acc + val, 0) || 1;

    targetP.set(0, 0, 0);
    targetL.set(0, 0, 0);
    targetF = 0;
    for (let i = 0; i < weights.length; i++) {
      const w = weights[i] / sum;
      if (w <= 0.0001) continue;
      targetP.addScaledVector(poseP[i], w);
      targetL.addScaledVector(poseL[i], w);
      targetF += fovs[i] * w;
    }

    // Camera Banking & Roll Physics (FPV / Steadicam curve bank)
    const deltaX = targetP.x - camPos.x;
    const deltaZ = targetP.z - camPos.z;
    const fwdX = camLook.x - camPos.x;
    const fwdZ = camLook.z - camPos.z;
    const fwdLen = Math.hypot(fwdX, fwdZ) || 1;
    const rightX = -fwdZ / fwdLen;
    const rightZ = fwdX / fwdLen;
    const lateralSpeed = deltaX * rightX + deltaZ * rightZ;

    const maxRoll = 0.16; // ~9.2 degrees maximum bank
    const targetRoll = reduced ? 0 : clamp(-lateralSpeed * 0.1, -maxRoll, maxRoll);
    currentRoll = THREE.MathUtils.lerp(currentRoll, targetRoll, 0.07);

    const glide = reduced ? 1 : 0.07;
    camPos.lerp(targetP, glide);
    camLook.lerp(targetL, glide);

    camera.position.copy(camPos);
    if (!reduced) {
      smoothMouseX = THREE.MathUtils.lerp(smoothMouseX, mouseX, 0.05);
      smoothMouseY = THREE.MathUtils.lerp(smoothMouseY, mouseY, 0.05);
      camera.position.x += smoothMouseX * 0.38;
      camera.position.y += smoothMouseY * 0.22;
    }
    camera.lookAt(camLook);
    if (!reduced && Math.abs(currentRoll) > 0.0001) {
      camera.rotateZ(currentRoll);
    }
    camera.fov += (targetF - camera.fov) * glide;
    camera.updateProjectionMatrix();

    // Harmonic Core Rotations
    if (!reduced) {
      corePoly.rotation.y = t * 0.0007;
      corePoly.rotation.x = Math.sin(t * 0.0005) * 0.25;
      gimbalRing1.rotation.z = t * 0.0009;
      gimbalRing1.rotation.x = t * 0.0004;
      gimbalRing2.rotation.y = -t * 0.0006;
      gimbalRing3.rotation.x = t * 0.0005;

      // Dynamic Expanding Wave Rings (4 Concentric Staggered Shockwaves)
      waveRings.forEach((wr, i) => {
        const phase = (t * 0.00045 + i / waveRingCount) % 1;
        const scale = 0.5 + phase * 28;
        wr.scale.setScalar(scale);
        (wr.material as InstanceType<ThreeNS["MeshBasicMaterial"]>).opacity =
          Math.max(0, (1 - phase) * 0.42);
      });

      // Arterial Circuit Runways Photon Packets
      circuitArteries.forEach((artery, aIdx) => {
        artery.pulses.forEach((pkt, pIdx) => {
          const u = (t * 0.0007 + aIdx * 0.25 + pIdx * 0.5) % 1;
          const midX = artery.targetX * 0.45;
          const midZ = artery.targetZ * 0.85;
          if (u < 0.5) {
            const k = u / 0.5;
            pkt.position.x = midX * k;
            pkt.position.z = midZ * k;
          } else {
            const k = (u - 0.5) / 0.5;
            pkt.position.x = midX + (artery.targetX - midX) * k;
            pkt.position.z = midZ + (artery.targetZ - midZ) * k;
          }
          pkt.position.y = 0.08 + Math.sin(t * 0.003 + pIdx) * 0.02;
        });
      });

      // Horizon Core Satellites & Outer Wireframe
      outerCoreWire.rotation.y = -t * 0.0005;
      outerCoreWire.rotation.z = Math.cos(t * 0.0006) * 0.2;
      coreSatellites.forEach((sat, sIdx) => {
        const angle = t * sat.speed + (sIdx * Math.PI * 2) / 3;
        const x = Math.cos(angle) * sat.radius;
        const z = Math.sin(angle) * sat.radius;
        const y = 2.2 + Math.sin(angle * 2) * sat.tilt;
        sat.mesh.position.set(x, y, z);
        sat.mesh.rotation.x = angle;
        sat.mesh.rotation.y = angle * 2;
      });

      // Nova Model Quantum Rings
      modelQuantumRings.forEach((mq) => {
        mq.ring.rotation.z += mq.speed;
        mq.ring.rotation.y += mq.speed * 0.6;
      });

      // Ambient stardust gentle drift
      const pAttr = particleGeo.getAttribute("position") as InstanceType<ThreeNS["BufferAttribute"]>;
      const pArr = pAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pArr[i * 3 + 1] += Math.sin(t * 0.001 + i) * 0.003;
      }
      pAttr.needsUpdate = true;
    }

    // Dynamic Spotlight Intensities based on active section
    coreLight.intensity = 18 + wHero * 12 + wEnd * 10;
    novaSpot.intensity = wNova * 22;
    visionSpot.intensity = wVision * 25;
    riverSpot.intensity = wRiver * 24;
    foundrySpot.intensity = wFoundry * 24;

    // SECTION 03: Nova Animations
    if (!reduced && wNova > 0.02) {
      novaTokens.forEach((token, i) => {
        const a = t * 0.0012 + (i * Math.PI * 2) / novaTokenCount;
        const rad = 2.2 + Math.sin(t * 0.002 + i) * 0.3;
        token.position.set(Math.cos(a) * rad, 0.45 + Math.sin(a * 2) * 0.15, Math.sin(a) * rad);
        token.rotation.y = a;
      });
      modelCores.forEach((c, idx) => {
        const pulse = Math.sin(t * 0.004 + idx * 2.1) * 0.5 + 0.5;
        c.orb.scale.setScalar(0.85 + pulse * 0.4);
      });
      paymentUnit.scale.y = 1 + Math.sin(t * 0.005) * 0.2;
    }

    // SECTION 04: Vision Camera Frustum & Scan Animation
    if (wVision > 0.01) {
      const tiltProgress = reduced ? 0.5 : spVis;
      const tiltAngle = THREE.MathUtils.degToRad(35 + tiltProgress * 55);
      sensorPivot.rotation.x = tiltAngle;

      const fAttr = frustumRayGeo.getAttribute("position") as InstanceType<ThreeNS["BufferAttribute"]>;
      const spread = 2.0;
      const targetY = -3.7;
      const corners = [
        [-spread, targetY, -spread],
        [spread, targetY, -spread],
        [spread, targetY, spread],
        [-spread, targetY, spread],
      ];
      for (let i = 0; i < 4; i++) {
        fAttr.setXYZ(i * 2, 0, 0, 0);
        fAttr.setXYZ(i * 2 + 1, corners[i][0], corners[i][1], corners[i][2]);
      }
      fAttr.needsUpdate = true;

      const scanPhase = (t * 0.0015) % 1;
      scanLine.position.z = (scanPhase - 0.5) * 3.6;

      // Vision Bounding Boxes pulse when scan line passes
      boundingBoxes.forEach((bb) => {
        const distToScan = Math.abs(bb.box.position.z - scanLine.position.z);
        const isScanning = distToScan < 0.65;
        const targetScale = isScanning ? 1.15 : 1.0;
        bb.box.scale.setScalar(
          THREE.MathUtils.lerp(bb.box.scale.x, targetScale, 0.15),
        );
        (bb.box.material as InstanceType<ThreeNS["LineBasicMaterial"]>).color.setHex(
          isScanning ? copperBright : 0x7c5432,
        );
        (bb.box.material as InstanceType<ThreeNS["LineBasicMaterial"]>).opacity =
          isScanning ? 0.95 : 0.45;
      });
    }

    // SECTION 05: River HITL Gate & Data Packets
    if (wRiver > 0.01) {
      hitlBeacon.rotation.y = t * 0.002;
      const isApproved = spRiver > 0.55;
      gateIris.scale.setScalar(isApproved ? 1.4 : 0.85 + Math.sin(t * 0.006) * 0.15);
      (gateIris.material as InstanceType<ThreeNS["MeshBasicMaterial"]>).opacity =
        isApproved ? 0.9 : 0.45;

      riverPackets.forEach((pkt, i) => {
        let u = ((t * 0.00035 + i / riverPacketCount) % 1);
        if (!isApproved && u > 0.48 && u < 0.54) {
          u = 0.48;
        }
        pipeCurve.getPointAt(u, tmpVec);
        pkt.position.copy(tmpVec);
        pkt.position.y += 0.22;
      });
    }

    // SECTION 06: Foundry Quad-Prism Expansion (1 -> 4 Formats)
    if (wFoundry > 0.01) {
      prismMesh.rotation.y = t * 0.001;
      const spreadDist = 1.4 + spFoundry * 2.8;
      outputPlinths.forEach((plinth) => {
        const px = Math.cos(plinth.baseAngle) * spreadDist;
        const pz = Math.sin(plinth.baseAngle) * spreadDist;
        plinth.mesh.position.set(px, 1.3 + Math.sin(t * 0.002 + plinth.baseAngle) * 0.12, pz);
        plinth.mesh.rotation.y = -plinth.baseAngle + Math.PI / 2;

        const lAttr = plinth.laser.geometry.getAttribute("position") as InstanceType<ThreeNS["BufferAttribute"]>;
        lAttr.setXYZ(0, 0, 1.6, 0);
        lAttr.setXYZ(1, px, plinth.mesh.position.y, pz);
        lAttr.needsUpdate = true;
      });

      // Holographic Format Badges hover animation
      plinthBadges.forEach((badge, idx) => {
        badge.rotation.y = t * 0.0015 + idx;
        badge.position.y = 0.85 + Math.sin(t * 0.003 + idx * 1.5) * 0.08;
      });
    }

    // SECTION 08: Method Towers Step-by-Step Activation
    if (wMethod > 0.01) {
      methodTowers.forEach((tower, idx) => {
        const stepProgress = clamp((spMethod - idx * 0.25) / 0.25, 0, 1);
        const curH = 0.6 + stepProgress * (tower.targetH - 0.6);
        tower.mesh.scale.y = curH;
        tower.mesh.position.y = curH / 2;
        (tower.ring.material as InstanceType<ThreeNS["MeshBasicMaterial"]>).color.setHex(
          stepProgress > 0.8 ? copperBright : 0x4a341e,
        );

        // Vertical Milestone Beacon
        const beacon = towerBeacons[idx];
        if (beacon) {
          const isCompleted = stepProgress >= 0.92;
          (beacon.material as InstanceType<ThreeNS["LineBasicMaterial"]>).opacity =
            isCompleted ? 0.65 + Math.sin(t * 0.005 + idx) * 0.25 : 0;
        }
      });
    }

    // Interactive Field Yaw
    rootGroup.rotation.y = film.yaw + (reduced ? 0 : t * 0.000035);

    // Live HUD updates (Camera orientation)
    const dir = tmpVec;
    camera.getWorldDirection(dir);
    const depression = THREE.MathUtils.radToDeg(Math.atan2(-dir.y, Math.hypot(dir.x, dir.z)));
    const heading = ((THREE.MathUtils.radToDeg(rootGroup.rotation.y) % 360) + 360) % 360;

    if (!liveFovEl) liveFovEl = document.getElementById("fov-live");
    if (!liveDepEl) liveDepEl = document.getElementById("dep-live");
    if (!liveHeadEl) liveHeadEl = document.getElementById("head-live");

    const roundFov = Math.round(camera.fov);
    if (roundFov !== lastFov) {
      if (liveFovEl) liveFovEl.textContent = `${roundFov}°`;
      lastFov = roundFov;
    }
    const roundDep = Math.round(depression);
    if (roundDep !== lastDep) {
      if (liveDepEl) liveDepEl.textContent = `${roundDep}°`;
      lastDep = roundDep;
    }
    const roundHead = Math.round(heading);
    if (roundHead !== lastHead) {
      if (liveHeadEl) liveHeadEl.textContent = `${roundHead}°`;
      lastHead = roundHead;
    }

    if (!liveRollEl) liveRollEl = document.getElementById("roll-live");
    if (!liveSectorEl) liveSectorEl = document.getElementById("sector-live");

    const roundRoll = Math.round(THREE.MathUtils.radToDeg(currentRoll));
    if (roundRoll !== lastRoll) {
      if (liveRollEl) liveRollEl.textContent = `${roundRoll > 0 ? "+" : ""}${roundRoll}°`;
      lastRoll = roundRoll;
    }

    // Active Sector Indicator
    let activeSec = "horizon";
    let maxFocus = 0;
    const focusEntries = [
      ["horizon", wHero],
      ["mandate", wMandate],
      ["nova", wNova],
      ["vision", wVision],
      ["river", wRiver],
      ["foundry", wFoundry],
      ["work", wWork],
      ["method", wMethod],
      ["about", getFocusOf("about", scrollY, viewH)],
      ["contact", getFocusOf("contact", scrollY, viewH)],
    ] as const;
    for (const [id, f] of focusEntries) {
      if (f > maxFocus) {
        maxFocus = f;
        activeSec = id;
      }
    }
    const secName = SECTOR_NAMES[activeSec] || "01 افق";
    if (secName !== lastSector) {
      if (liveSectorEl) liveSectorEl.textContent = secName;
      lastSector = secName;
    }

    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
    document.documentElement.classList.add("gl-on");
  }

  let raf = 0;
  const loop = (t: number) => {
    frame(t);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  let resizeObserver: ResizeObserver | null = null;
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => {
      measureLayout();
    });
    resizeObserver.observe(document.body);
  }
  if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => measureLayout()).catch(() => {});
  }

  const onResize = () => {
    resize();
    measureLayout();
  };
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);
  resize();
  measureLayout();
  requestAnimationFrame(() => measureLayout());

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
    if (resizeObserver) resizeObserver.disconnect();
    document.documentElement.classList.remove("gl-on");
    scene.traverse((obj) => {
      const mesh = obj as InstanceType<ThreeNS["Mesh"]>;
      if (mesh.geometry) mesh.geometry.dispose();
      const material = mesh.material as
        | InstanceType<ThreeNS["Material"]>
        | InstanceType<ThreeNS["Material"]>[]
        | undefined;
      if (Array.isArray(material)) material.forEach((item) => item.dispose());
      else material?.dispose();
    });
    renderer.dispose();
  };
}

export function Observatory() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let dead = false;
    let cleanup = () => {};

    Promise.all([
      import("three"),
      import("three/examples/jsm/postprocessing/EffectComposer.js").catch(() => null),
      import("three/examples/jsm/postprocessing/RenderPass.js").catch(() => null),
      import("three/examples/jsm/postprocessing/UnrealBloomPass.js").catch(() => null),
    ])
      .then(([THREE, composerMod, renderPassMod, bloomPassMod]) => {
        if (dead) return;
        cleanup = mount(
          THREE,
          canvas,
          composerMod || undefined,
          renderPassMod || undefined,
          bloomPassMod || undefined,
        );
      })
      .catch((err) => {
        console.warn("WebGL initialization warning:", err);
      });

    return () => {
      dead = true;
      cleanup();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-svh w-full"
    />
  );
}
