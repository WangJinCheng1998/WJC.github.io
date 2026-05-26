/* eslint-disable react/no-unknown-property */
const cardGLB = new URL('./card.glb', import.meta.url).href;
const lanyardPNG = new URL('./lanyard.png?v=dusk-plum-strap', import.meta.url).href;
const profilePhoto = new URL('./wjc.png?v=profile-card', import.meta.url).href;

let React;
let Suspense;
let useEffect;
let useId;
let useRef;
let useState;
let createRoot;
let Canvas;
let extend;
let useFrame;
let Environment;
let Html;
let Lightformer;
let useGLTF;
let useTexture;
let BallCollider;
let CuboidCollider;
let Physics;
let RigidBody;
let useRopeJoint;
let useSphericalJoint;
let MeshLineGeometry;
let MeshLineMaterial;
let THREE;
let h;

function Lanyard({ position = [0, 0, 24], gravity = [0, -40, 0], fov = 22, transparent = true }) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [layoutKey, setLayoutKey] = useState(0);

  useEffect(() => {
    let resizeTimer;
    const syncLayout = () => {
      setIsMobile(window.innerWidth < 768);
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => setLayoutKey((key) => key + 1), 180);
    };

    const root = document.getElementById('lanyard-root');
    const observer = typeof ResizeObserver !== 'undefined' && root ? new ResizeObserver(syncLayout) : null;
    observer?.observe(root);

    const handleResize = () => syncLayout();
    window.addEventListener('resize', handleResize);
    return () => {
      window.clearTimeout(resizeTimer);
      observer?.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return h(
    'div',
    { className: 'lanyard-wrapper' },
    h(
      Canvas,
      {
        key: layoutKey,
        camera: { position, fov },
        dpr: [1, isMobile ? 1.25 : 1.75],
        gl: { alpha: transparent, antialias: true, preserveDrawingBuffer: true },
        onCreated: ({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1),
      },
      h('ambientLight', { intensity: Math.PI }),
      h(
        Suspense,
        { fallback: null },
        h(Physics, { gravity, timeStep: isMobile ? 1 / 30 : 1 / 60 }, h(Band, { isMobile })),
        h(
          Environment,
          { blur: 0.75 },
          h(Lightformer, {
            intensity: 2,
            color: 'white',
            position: [0, -1, 5],
            rotation: [0, 0, Math.PI / 3],
            scale: [100, 0.1, 1],
          }),
          h(Lightformer, {
            intensity: 3,
            color: 'white',
            position: [-1, -1, 1],
            rotation: [0, 0, Math.PI / 3],
            scale: [100, 0.1, 1],
          }),
          h(Lightformer, {
            intensity: 3,
            color: 'white',
            position: [1, 1, 1],
            rotation: [0, 0, Math.PI / 3],
            scale: [100, 0.1, 1],
          }),
          h(Lightformer, {
            intensity: 10,
            color: 'white',
            position: [-10, 0, 14],
            rotation: [0, Math.PI / 2, Math.PI / 3],
            scale: [100, 10, 1],
          })
        )
      )
    )
  );
}

function injectGlassSurfaceStyles() {
  if (document.getElementById('lanyard-glass-surface-styles')) return;
  const style = document.createElement('style');
  style.id = 'lanyard-glass-surface-styles';
  style.textContent = `
    .glass-surface {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      transition: opacity 0.26s ease-out;
    }
    .glass-surface__filter {
      width: 100%;
      height: 100%;
      pointer-events: none;
      position: absolute;
      inset: 0;
      opacity: 0;
      z-index: -1;
    }
    .glass-surface__content {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      border-radius: inherit;
      position: relative;
      z-index: 1;
    }
    .glass-surface--svg {
      background: rgba(255, 255, 255, var(--glass-frost, 0));
      backdrop-filter: var(--filter-id, url(#glass-filter)) saturate(var(--glass-saturation, 1));
      -webkit-backdrop-filter: var(--filter-id, url(#glass-filter)) saturate(var(--glass-saturation, 1));
      box-shadow:
        inset 0 0 2px 1px rgba(255, 255, 255, 0.38),
        inset 0 0 12px 4px rgba(255, 255, 255, 0.13),
        inset 0 -18px 32px rgba(73, 49, 76, 0.16),
        0 8px 22px rgba(4, 8, 20, 0.18);
    }
    .glass-surface--fallback {
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(13px) saturate(1.55) brightness(1.12);
      -webkit-backdrop-filter: blur(13px) saturate(1.55) brightness(1.12);
      border: 1px solid rgba(255, 255, 255, 0.22);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.28),
        inset 0 -1px 0 rgba(255, 255, 255, 0.12),
        0 8px 22px rgba(4, 8, 20, 0.18);
    }
    @keyframes lanyardNeonPulse {
      0%, 100% {
        opacity: 0.72;
        filter: saturate(1.1);
      }
      50% {
        opacity: 1;
        filter: saturate(1.45);
      }
    }
    @keyframes lanyardScan {
      0% { transform: translateY(-115%); }
      100% { transform: translateY(115%); }
    }
    @keyframes lanyardGridDrift {
      0% { background-position: 0 0, 0 0, 0 0, 0 0; }
      100% { background-position: 0 0, 24px 0, 0 24px, 0 0; }
    }
    .lanyard-glass-card {
      pointer-events: none;
      border: 1px solid rgba(90, 244, 255, 0.38);
      background-clip: padding-box;
      box-shadow:
        inset 0 0 0 1px rgba(255, 66, 214, 0.16),
        inset 0 0 18px rgba(54, 230, 255, 0.18),
        inset 0 0 34px rgba(255, 61, 217, 0.08),
        0 0 10px rgba(63, 244, 255, 0.42),
        0 0 24px rgba(255, 62, 218, 0.22),
        0 10px 24px rgba(5, 8, 18, 0.22);
    }
    .lanyard-glass-card .glass-surface__content {
      align-items: stretch;
      justify-content: stretch;
      padding: 5px;
    }
    .lanyard-glass-html {
      pointer-events: auto !important;
    }
    .lanyard-glass-drag-target {
      pointer-events: auto;
      cursor: grab;
      touch-action: none;
    }
    .lanyard-glass-drag-target.is-dragging {
      cursor: grabbing;
    }
    .lanyard-glass-drag-target.is-dragging .lanyard-glass-card {
      box-shadow:
        inset 0 0 0 1px rgba(255, 91, 226, 0.24),
        inset 0 0 22px rgba(54, 230, 255, 0.22),
        inset 0 0 38px rgba(255, 61, 217, 0.12),
        0 0 18px rgba(63, 244, 255, 0.58),
        0 0 36px rgba(255, 62, 218, 0.34),
        0 12px 26px rgba(5, 8, 18, 0.24);
    }
    .lanyard-glass-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background:
        linear-gradient(135deg, rgba(58, 240, 255, 0.26), rgba(255,255,255,0.03) 32%, rgba(255, 64, 210, 0.15) 64%, rgba(255,255,255,0.12)),
        linear-gradient(90deg, rgba(68, 238, 255, 0.08) 1px, transparent 1px),
        linear-gradient(0deg, rgba(255, 64, 210, 0.07) 1px, transparent 1px),
        radial-gradient(circle at 78% 24%, rgba(95, 244, 255, 0.32), transparent 22%);
      background-size: auto, 12px 12px, 12px 12px, auto;
      mix-blend-mode: screen;
      pointer-events: none;
      z-index: 0;
      animation: lanyardGridDrift 9s linear infinite;
    }
    .lanyard-glass-card::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background:
        repeating-linear-gradient(to bottom, rgba(255,255,255,0) 0 5px, rgba(75, 240, 255, 0.2) 5px 6px),
        linear-gradient(90deg, transparent 0 10%, rgba(255, 63, 211, 0.18) 10% 11%, transparent 11% 100%);
      opacity: 0.14;
      pointer-events: none;
      z-index: 0;
      animation: lanyardNeonPulse 2.8s ease-in-out infinite;
    }
    .lanyard-card-layout {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-rows: 12px minmax(0, 1fr) 31px;
      gap: 3px;
      color: rgba(194, 252, 255, 0.84);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
      text-transform: uppercase;
      letter-spacing: 0;
      user-select: none;
      pointer-events: none;
    }
    .lanyard-card-layout::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 5px;
      background:
        linear-gradient(90deg, rgba(85, 245, 255, 0.88) 0 14px, transparent 14px) left top / 26px 1px no-repeat,
        linear-gradient(180deg, rgba(85, 245, 255, 0.88) 0 14px, transparent 14px) left top / 1px 26px no-repeat,
        linear-gradient(270deg, rgba(255, 75, 214, 0.72) 0 14px, transparent 14px) right bottom / 26px 1px no-repeat,
        linear-gradient(0deg, rgba(255, 75, 214, 0.72) 0 14px, transparent 14px) right bottom / 1px 26px no-repeat;
      opacity: 0.72;
      z-index: -1;
      filter: drop-shadow(0 0 4px rgba(70, 242, 255, 0.56));
    }
    .lanyard-card-layout::after {
      content: 'SYS://127';
      position: absolute;
      right: -1px;
      top: 17px;
      writing-mode: vertical-rl;
      font-size: 5.4px;
      font-weight: 900;
      line-height: 1;
      color: rgba(255, 78, 218, 0.58);
      text-shadow: 0 0 5px rgba(255, 78, 218, 0.42);
      pointer-events: none;
    }
    .lanyard-card-topline,
    .lanyard-card-row,
    .lanyard-card-stamps {
      display: flex;
      align-items: center;
      min-width: 0;
    }
    .lanyard-card-topline {
      justify-content: space-between;
      gap: 4px;
      font-size: 6.7px;
      line-height: 1;
      font-weight: 900;
    }
    .lanyard-card-pass,
    .lanyard-card-stamp {
      border: 1px solid rgba(87, 243, 255, 0.32);
      background: rgba(4, 11, 22, 0.38);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.24),
        0 0 8px rgba(68, 239, 255, 0.1);
    }
    .lanyard-card-pass {
      padding: 2px 3px;
      border-radius: 3px;
      color: rgba(188, 255, 253, 0.9);
      text-shadow:
        0 0 3px rgba(68, 239, 255, 0.72),
        0 0 9px rgba(255, 64, 214, 0.26);
      white-space: nowrap;
    }
    .lanyard-card-dot {
      width: 4px;
      height: 4px;
      border-radius: 999px;
      background: rgba(96, 255, 193, 0.95);
      box-shadow: 0 0 8px rgba(96, 255, 193, 0.65);
      flex: 0 0 auto;
    }
    .lanyard-card-photo-frame {
      position: relative;
      align-self: center;
      justify-self: center;
      width: 94%;
      max-width: 96px;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2px;
      border-radius: 5px;
      border: 1px solid rgba(85, 243, 255, 0.58);
      overflow: hidden;
      background:
        linear-gradient(135deg, rgba(14, 31, 46, 0.72), rgba(42, 10, 49, 0.36)),
        rgba(255, 255, 255, 0.1);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.24),
        inset 0 0 14px rgba(255, 72, 214, 0.18),
        0 0 12px rgba(60, 235, 255, 0.36),
        0 0 22px rgba(255, 72, 214, 0.22),
        0 8px 18px rgba(5, 8, 18, 0.24);
    }
    .lanyard-card-photo-frame::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        linear-gradient(90deg, rgba(78, 246, 255, 0.55), transparent 20%, transparent 80%, rgba(255, 75, 214, 0.5)),
        linear-gradient(180deg, rgba(78, 246, 255, 0.38), transparent 18%, transparent 82%, rgba(255, 75, 214, 0.28));
      mix-blend-mode: screen;
      pointer-events: none;
      z-index: 2;
      opacity: 0.58;
    }
    .lanyard-card-photo-frame::after {
      content: '';
      position: absolute;
      inset: 3px;
      border-radius: 3px;
      border: 1px solid rgba(80, 247, 255, 0.34);
      box-shadow:
        inset 8px 0 0 -7px rgba(255, 71, 218, 0.82),
        inset -8px 0 0 -7px rgba(74, 242, 255, 0.82),
        0 0 10px rgba(76, 242, 255, 0.18);
      pointer-events: none;
      z-index: 3;
    }
    .lanyard-card-photo {
      width: 100%;
      height: 100%;
      border-radius: 3px;
      object-fit: contain;
      object-position: center;
      user-select: none;
      -webkit-user-drag: none;
      pointer-events: none;
      opacity: 0.94;
      filter: saturate(1.2) contrast(1.08) brightness(0.98);
    }
    .lanyard-card-meta {
      display: grid;
      gap: 2px;
      align-self: end;
    }
    .lanyard-card-row {
      justify-content: space-between;
      gap: 4px;
      font-size: 6.1px;
      line-height: 1;
    }
    .lanyard-card-row span {
      color: rgba(170, 240, 245, 0.54);
    }
    .lanyard-card-row strong {
      color: rgba(245, 248, 255, 0.9);
      font-weight: 900;
      white-space: nowrap;
      text-shadow: 0 0 5px rgba(82, 243, 255, 0.38);
    }
    .lanyard-card-stamps {
      gap: 2px;
    }
    .lanyard-card-stamp {
      flex: 1 1 0;
      min-width: 0;
      padding: 2px 1px;
      border-radius: 3px;
      color: rgba(218, 251, 255, 0.82);
      font-size: 5.2px;
      font-weight: 900;
      line-height: 1;
      text-align: center;
      white-space: nowrap;
      text-shadow: 0 0 5px rgba(68, 239, 255, 0.36);
    }
  `;
  document.head.appendChild(style);
}

function GlassSurface({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,
  borderWidth = 0.07,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  displace = 0,
  backgroundOpacity = 0,
  saturation = 1,
  distortionScale = -180,
  redOffset = 0,
  greenOffset = 10,
  blueOffset = 20,
  xChannel = 'R',
  yChannel = 'G',
  mixBlendMode = 'difference',
  className = '',
  style = {},
}) {
  const uniqueId = useId().replace(/:/g, '-');
  const filterId = `glass-filter-${uniqueId}`;
  const redGradId = `red-grad-${uniqueId}`;
  const blueGradId = `blue-grad-${uniqueId}`;

  const [svgSupported, setSvgSupported] = useState(false);
  const containerRef = useRef(null);
  const feImageRef = useRef(null);
  const redChannelRef = useRef(null);
  const greenChannelRef = useRef(null);
  const blueChannelRef = useRef(null);
  const gaussianBlurRef = useRef(null);

  const generateDisplacementMap = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    const actualWidth = rect?.width || 400;
    const actualHeight = rect?.height || 200;
    const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);
    const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
      </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  };

  const updateDisplacementMap = () => {
    feImageRef.current?.setAttribute('href', generateDisplacementMap());
  };

  useEffect(() => {
    updateDisplacementMap();
    [
      { ref: redChannelRef, offset: redOffset },
      { ref: greenChannelRef, offset: greenOffset },
      { ref: blueChannelRef, offset: blueOffset },
    ].forEach(({ ref, offset }) => {
      if (ref.current) {
        ref.current.setAttribute('scale', (distortionScale + offset).toString());
        ref.current.setAttribute('xChannelSelector', xChannel);
        ref.current.setAttribute('yChannelSelector', yChannel);
      }
    });

    gaussianBlurRef.current?.setAttribute('stdDeviation', displace.toString());
  }, [
    width,
    height,
    borderRadius,
    borderWidth,
    brightness,
    opacity,
    blur,
    displace,
    distortionScale,
    redOffset,
    greenOffset,
    blueOffset,
    xChannel,
    yChannel,
    mixBlendMode,
  ]);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(updateDisplacementMap, 0);
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    setTimeout(updateDisplacementMap, 0);
  }, [width, height]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      setSvgSupported(false);
      return;
    }

    const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    if (isWebkit || isFirefox) {
      setSvgSupported(false);
      return;
    }

    const div = document.createElement('div');
    div.style.backdropFilter = `url(#${filterId})`;
    setSvgSupported(div.style.backdropFilter !== '');
  }, [filterId]);

  const containerStyle = {
    ...style,
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
    '--glass-frost': backgroundOpacity,
    '--glass-saturation': saturation,
    '--filter-id': `url(#${filterId})`,
  };

  return h(
    'div',
    {
      ref: containerRef,
      className: `glass-surface ${svgSupported ? 'glass-surface--svg' : 'glass-surface--fallback'} ${className}`,
      style: containerStyle,
    },
    h(
      'svg',
      { className: 'glass-surface__filter', xmlns: 'http://www.w3.org/2000/svg' },
      h(
        'defs',
        null,
        h(
          'filter',
          { id: filterId, colorInterpolationFilters: 'sRGB', x: '0%', y: '0%', width: '100%', height: '100%' },
          h('feImage', { ref: feImageRef, x: '0', y: '0', width: '100%', height: '100%', preserveAspectRatio: 'none', result: 'map' }),
          h('feDisplacementMap', { ref: redChannelRef, in: 'SourceGraphic', in2: 'map', result: 'dispRed' }),
          h('feColorMatrix', {
            in: 'dispRed',
            type: 'matrix',
            values: '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0',
            result: 'red',
          }),
          h('feDisplacementMap', { ref: greenChannelRef, in: 'SourceGraphic', in2: 'map', result: 'dispGreen' }),
          h('feColorMatrix', {
            in: 'dispGreen',
            type: 'matrix',
            values: '0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0',
            result: 'green',
          }),
          h('feDisplacementMap', { ref: blueChannelRef, in: 'SourceGraphic', in2: 'map', result: 'dispBlue' }),
          h('feColorMatrix', {
            in: 'dispBlue',
            type: 'matrix',
            values: '0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0',
            result: 'blue',
          }),
          h('feBlend', { in: 'red', in2: 'green', mode: 'screen', result: 'rg' }),
          h('feBlend', { in: 'rg', in2: 'blue', mode: 'screen', result: 'output' }),
          h('feGaussianBlur', { ref: gaussianBlurRef, in: 'output', stdDeviation: '0.7' })
        )
      )
    ),
    h('div', { className: 'glass-surface__content' }, children)
  );
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false }) {
  const band = useRef();
  const fixed = useRef();
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();
  const card = useRef();
  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const cameraRef = useRef(null);
  const domDragActive = useRef(false);
  const domDragBounds = useRef(null);
  const domDragPointer = useRef(null);
  const domDragReleaseTimer = useRef(null);
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  const { nodes } = useGLTF(cardGLB);
  const texture = useTexture(lanyardPNG);
  const cardVisualX = 0;
  const cardSize = isMobile ? { width: 102, height: 144 } : { width: 124, height: 175 };
  const ropeLength = 0.9;
  const cardAnchorY = 1.5;
  const [curve] = useState(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], ropeLength]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], ropeLength]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], ropeLength]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, cardAnchorY, 0],
  ]);

  useEffect(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
  }, [texture]);

  useEffect(() => {
    if (!hovered) return undefined;
    document.body.style.cursor = dragged ? 'grabbing' : 'grab';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered, dragged]);

  const getDomPointer = (event) => {
    const canvas = document.querySelector('#lanyard-root canvas');
    const rect = canvas?.getBoundingClientRect();
    if (!rect) return null;
    const pointer = {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((event.clientY - rect.top) / rect.height) * 2 + 1,
    };
    domDragPointer.current = pointer;
    return pointer;
  };

  const getPointerWorldPoint = (pointer, camera) => {
    const point = new THREE.Vector3(pointer.x, pointer.y, 0.5).unproject(camera);
    const direction = point.clone().sub(camera.position).normalize();
    return point.add(direction.multiplyScalar(camera.position.length()));
  };

  const refreshDragBounds = () => {
    const root = document.querySelector('#lanyard-root');
    const canvas = document.querySelector('#lanyard-root canvas');
    const cardElement = document.querySelector('.lanyard-glass-card');
    const rootRect = root?.getBoundingClientRect();
    const mapRect = canvas?.getBoundingClientRect();
    if (!rootRect || !mapRect) {
      domDragBounds.current = null;
      return null;
    }

    const cardRect = cardElement?.getBoundingClientRect();
    const padding = isMobile ? 8 : 12;
    const halfWidth = (cardRect?.width || (isMobile ? 92 : 112)) / 2 + padding;
    const halfHeight = (cardRect?.height || (isMobile ? 130 : 158)) / 2 + padding;
    const centerX = rootRect.left + rootRect.width / 2;
    const centerY = rootRect.top + rootRect.height / 2;
    const bounds = {
      mapRect,
      minX: Math.min(rootRect.left + halfWidth, centerX),
      maxX: Math.max(rootRect.right - halfWidth, centerX),
      minY: Math.min(rootRect.top + halfHeight, centerY),
      maxY: Math.max(rootRect.bottom - halfHeight, centerY),
    };
    domDragBounds.current = bounds;
    return bounds;
  };

  const screenToWorldAtZ = (clientX, clientY, z, camera, mapRect) => {
    const ndcX = ((clientX - mapRect.left) / mapRect.width) * 2 - 1;
    const ndcY = -(((clientY - mapRect.top) / mapRect.height) * 2 - 1);
    const point = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera);
    const direction = point.sub(camera.position).normalize();
    return camera.position.clone().add(direction.multiplyScalar((z - camera.position.z) / direction.z));
  };

  const clampCardTranslation = (translation, camera) => {
    const bounds = domDragBounds.current || refreshDragBounds();
    if (!bounds || !card.current) return translation;

    const rotation = card.current.rotation();
    const visualOffset = new THREE.Vector3(cardVisualX * 2.25, -1.2 + 0.5 * 2.25, -0.05 + 0.08 * 2.25);
    if (typeof rotation?.w === 'number') {
      visualOffset.applyQuaternion(new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w));
    }

    const visualCenter = translation.clone().add(visualOffset);
    const projected = visualCenter.clone().project(camera);
    const clientX = bounds.mapRect.left + ((projected.x + 1) / 2) * bounds.mapRect.width;
    const clientY = bounds.mapRect.top + ((1 - projected.y) / 2) * bounds.mapRect.height;
    const clampedX = THREE.MathUtils.clamp(clientX, bounds.minX, bounds.maxX);
    const clampedY = THREE.MathUtils.clamp(clientY, bounds.minY, bounds.maxY);
    if (clientX === clampedX && clientY === clampedY) return translation;

    const clampedCenter = screenToWorldAtZ(clampedX, clampedY, visualCenter.z, camera, bounds.mapRect);
    return translation.clone().add(clampedCenter.sub(visualCenter));
  };

  const moveWindowDomDrag = (event) => {
    if (!domDragActive.current) return;
    getDomPointer(event);
  };

  const finishDomDrag = () => {
    window.removeEventListener('pointermove', moveWindowDomDrag);
    window.removeEventListener('pointerup', finishDomDrag);
    window.removeEventListener('pointercancel', finishDomDrag);
    if (domDragReleaseTimer.current) window.clearTimeout(domDragReleaseTimer.current);
    domDragReleaseTimer.current = window.setTimeout(() => {
      domDragActive.current = false;
      domDragBounds.current = null;
      domDragPointer.current = null;
      domDragReleaseTimer.current = null;
      hover(false);
      drag(false);
    }, 80);
  };

  const beginDomDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const pointer = getDomPointer(event);
    const camera = cameraRef.current;
    if (!pointer || !camera || !card.current) return;
    if (domDragReleaseTimer.current) {
      window.clearTimeout(domDragReleaseTimer.current);
      domDragReleaseTimer.current = null;
    }
    [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
    domDragActive.current = true;
    refreshDragBounds();
    hover(true);
    window.addEventListener('pointermove', moveWindowDomDrag);
    window.addEventListener('pointerup', finishDomDrag, { once: true });
    window.addEventListener('pointercancel', finishDomDrag, { once: true });
    drag({
      offset: getPointerWorldPoint(pointer, camera).sub(vec.copy(card.current.translation())),
    });
  };

  const moveDomDrag = (event) => {
    if (!domDragActive.current) return;
    event.preventDefault();
    event.stopPropagation();
    getDomPointer(event);
  };

  const endDomDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    } catch {
      // Pointer capture may already have been released by the browser.
    }
    finishDomDrag();
  };

  useFrame((state, delta) => {
    cameraRef.current = state.camera;
    if (dragged && card.current) {
      const pointer = domDragPointer.current || state.pointer;
      const offset = dragged.offset || dragged;
      vec.set(pointer.x, pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      const nextTranslation = clampCardTranslation(
        new THREE.Vector3(vec.x - offset.x, vec.y - offset.y, vec.z - offset.z),
        state.camera
      );
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current.setNextKinematicTranslation({ x: nextTranslation.x, y: nextTranslation.y, z: nextTranslation.z });
    }

    if (!fixed.current || !j1.current || !j2.current || !j3.current || !card.current || !band.current?.geometry) return;

    [j1, j2].forEach((ref) => {
      if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
      const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
      ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
    });

    curve.points[0].copy(j3.current.translation());
    curve.points[1].copy(j2.current.lerped);
    curve.points[2].copy(j1.current.lerped);
    curve.points[3].copy(fixed.current.translation());
    curve.curveType = 'chordal';
    band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));

    ang.copy(card.current.angvel());
    rot.copy(card.current.rotation());
    card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
  });

  return h(
    React.Fragment,
    null,
    h(
      'group',
      { position: [0, 4, 0] },
      h(RigidBody, { ref: fixed, ...segmentProps, type: 'fixed' }),
      h(RigidBody, { position: [0.5, 0, 0], ref: j1, ...segmentProps }, h(BallCollider, { args: [0.1] })),
      h(RigidBody, { position: [1, 0, 0], ref: j2, ...segmentProps }, h(BallCollider, { args: [0.1] })),
      h(RigidBody, { position: [1.5, 0, 0], ref: j3, ...segmentProps }, h(BallCollider, { args: [0.1] })),
      h(
        RigidBody,
        { position: [2, 0, 0], ref: card, ...segmentProps, type: dragged ? 'kinematicPosition' : 'dynamic' },
        h(CuboidCollider, { args: [0.88, 1.24, 0.01] }),
        h(
          'group',
          {
            scale: 2.25,
            position: [0, -1.2, -0.05],
            onPointerOver: () => hover(true),
            onPointerOut: () => hover(false),
            onPointerUp: (event) => {
              event.target.releasePointerCapture(event.pointerId);
              drag(false);
            },
            onPointerDown: (event) => {
              event.target.setPointerCapture(event.pointerId);
              domDragPointer.current = null;
              refreshDragBounds();
              drag({ offset: new THREE.Vector3().copy(event.point).sub(vec.copy(card.current.translation())) });
            },
          },
          h(
            'mesh',
            { geometry: nodes.card.geometry, renderOrder: 1 },
            h('meshBasicMaterial', {
              color: '#ffffff',
              transparent: true,
              opacity: 0.01,
              depthWrite: false,
              side: THREE.DoubleSide,
            })
          ),
          h(
            'mesh',
            { position: [cardVisualX, 0.5, 0.16], renderOrder: 2 },
            h('planeGeometry', { args: [1.02, 1.45] }),
            h('meshBasicMaterial', {
              transparent: true,
              opacity: 0,
              colorWrite: false,
              depthWrite: false,
              side: THREE.DoubleSide,
            })
          ),
          h(
            Html,
            {
              center: true,
              transform: true,
              distanceFactor: 2.5,
              position: [cardVisualX, 0.5, 0.08],
              zIndexRange: [30, 0],
              wrapperClass: 'lanyard-glass-html',
              pointerEvents: 'auto',
              style: { pointerEvents: 'auto' },
            },
            h(
              'div',
              {
                className: `lanyard-glass-drag-target${dragged ? ' is-dragging' : ''}`,
                onPointerDown: beginDomDrag,
                onPointerMove: moveDomDrag,
                onPointerUp: endDomDrag,
                onPointerCancel: endDomDrag,
                onLostPointerCapture: endDomDrag,
                onPointerOver: () => hover(true),
                onPointerOut: () => {
                  if (!domDragActive.current) hover(false);
                },
              },
              h(
                GlassSurface,
                {
                  width: cardSize.width,
                  height: cardSize.height,
                  borderRadius: 8,
                  borderWidth: 0.12,
                  brightness: 62,
                  opacity: 0.86,
                  blur: 9,
                  displace: 0.35,
                  backgroundOpacity: 0.045,
                  saturation: 1.55,
                  distortionScale: -132,
                  redOffset: 4,
                  greenOffset: 14,
                  blueOffset: 24,
                  mixBlendMode: 'screen',
                  className: 'lanyard-glass-card',
                },
                h(
                  'div',
                  { className: 'lanyard-card-layout', 'aria-hidden': 'true' },
                  h(
                    'div',
                    { className: 'lanyard-card-topline' },
                    h('span', { className: 'lanyard-card-pass' }, 'LOCALHOST PASS'),
                    h('span', { className: 'lanyard-card-dot' })
                  ),
                  h(
                    'div',
                    { className: 'lanyard-card-photo-frame' },
                    h('img', {
                      className: 'lanyard-card-photo',
                      src: profilePhoto,
                      alt: '',
                      draggable: false,
                    })
                  ),
                  h(
                    'div',
                    { className: 'lanyard-card-meta' },
                    h('div', { className: 'lanyard-card-row' }, h('span', null, 'ACCESS'), h('strong', null, 'LVL 08')),
                    h('div', { className: 'lanyard-card-row' }, h('span', null, 'PROJECT'), h('strong', null, 'WJC-1998')),
                    h(
                      'div',
                      { className: 'lanyard-card-stamps' },
                      h('span', { className: 'lanyard-card-stamp' }, 'AVAILABLE'),
                      h('span', { className: 'lanyard-card-stamp' }, 'BUILD MODE')
                    )
                  )
                )
              )
            )
          ),
          h(
            'mesh',
            { geometry: nodes.clip.geometry },
            h('meshPhysicalMaterial', {
              color: '#2a2027',
              metalness: 0.68,
              roughness: 0.34,
              clearcoat: 0.35,
              clearcoatRoughness: 0.22,
            })
          ),
          h(
            'mesh',
            { geometry: nodes.clamp.geometry },
            h('meshPhysicalMaterial', {
              color: '#33242b',
              metalness: 0.72,
              roughness: 0.28,
              clearcoat: 0.35,
              clearcoatRoughness: 0.18,
            })
          )
        )
      )
    ),
    h(
      'mesh',
      { ref: band },
      h('meshLineGeometry', null),
      h('meshLineMaterial', {
        color: 'white',
        depthTest: false,
        resolution: isMobile ? [1000, 2000] : [1000, 1000],
        useMap: true,
        map: texture,
        repeat: [-4, 1],
        lineWidth: 1,
      })
    )
  );
}

function mountLanyard(root) {
  if (!root || root.dataset.lanyardMounted === 'true') return true;
  root.dataset.lanyardMounted = 'true';
  createRoot(root).render(h(Lanyard, { position: [0, 0, 24], gravity: [0, -40, 0], fov: 22, transparent: true }));
  return true;
}

function markLanyardError(error) {
  window.__lanyardStatus = { ok: false, message: error?.message || String(error) };
  const root = document.getElementById('lanyard-root');
  if (root) root.dataset.lanyardError = window.__lanyardStatus.message;
  console.warn('Lanyard failed to load:', error);
}

async function bootLanyard() {
  window.__lanyardStatus = { ok: false, phase: 'loading-dependencies' };
  const [
    reactModule,
    reactDomClientModule,
    fiberModule,
    dreiModule,
    rapierModule,
    meshlineModule,
    threeModule,
  ] = await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('@react-three/fiber'),
    import('@react-three/drei'),
    import('@react-three/rapier'),
    import('meshline'),
    import('three'),
  ]);

  React = reactModule.default;
  ({ Suspense, useEffect, useId, useRef, useState } = reactModule);
  ({ createRoot } = reactDomClientModule);
  ({ Canvas, extend, useFrame } = fiberModule);
  ({ Environment, Html, Lightformer, useGLTF, useTexture } = dreiModule);
  ({
    BallCollider,
    CuboidCollider,
    Physics,
    RigidBody,
    useRopeJoint,
    useSphericalJoint,
  } = rapierModule);
  ({ MeshLineGeometry, MeshLineMaterial } = meshlineModule);
  THREE = threeModule;
  h = React.createElement;

  injectGlassSurfaceStyles();
  extend({ MeshLineGeometry, MeshLineMaterial });
  useGLTF.preload(cardGLB);
  window.__lanyardStatus = { ok: true, phase: 'dependencies-ready' };

  if (mountLanyard(document.getElementById('lanyard-root'))) return;

  const observer = new MutationObserver(() => {
    if (mountLanyard(document.getElementById('lanyard-root'))) observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

bootLanyard().catch(markLanyardError);
