import { useState, useRef, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────
// WATERCOLOR PALETTE (English Meadow)
// ─────────────────────────────────────────────────────────────
const palette = {
  name: 'English Meadow',
  skyTop: '#cfe6d8',
  skyBot: '#eaf3df',
  sun: '#f6e7b8',
  hillFar: '#a8c9a4',
  hillMid: '#85b58a',
  hillNear: '#5e9a6e',
  grassFar: '#7fb274',
  grassNear: '#4d8a55',
  stem: '#3f7a47',
  leaf: '#5fa05a',
  petals: ['#e89bb0', '#f4c0a3', '#f6dca0', '#c8a8d8', '#9bc4e2', '#e8a8c8'],
  petalCenter: '#f6c95a',
  ink: '#2d4a35',
  paper: '#fdfaf0',
  wood: '#8b6a3f',
  woodDark: '#5e4626',
  cardBg: 'rgba(253, 250, 240, 0.78)',
  cardBorder: '#3f7a47',
  accent: '#d97a7a',
  font: "'Caveat', 'Kalam', cursive",
  fontUI: "'Kalam', cursive",
  style: 'watercolor',
};

const p = palette;
const isWater = true; // palette.style === 'watercolor'

// ─────────────────────────────────────────────────────────────
// SVG: Flower head — 5/6 petals + center
// ─────────────────────────────────────────────────────────────
function Flower({ petalIdx, delay = 0, size = 1, hero = false }) {
  const petal = p.petals[petalIdx % p.petals.length];
  const center = p.petalCenter;
  const petalCount = hero ? 8 : 6;
  const petalLen = (hero ? 28 : 6) * size;
  const petalW = (hero ? 14 : 3.2) * size;
  const r = (hero ? 8 : 1.6) * size;

  return (
    <g style={{
      animation: `flowerBloom 1.2s cubic-bezier(.2,.8,.3,1.2) ${delay}s both`,
      transformOrigin: 'center',
      transformBox: 'fill-box',
    }}>
      {Array.from({ length: petalCount }).map((_, i) => {
        const angle = (i * 360) / petalCount;
        return (
          <ellipse key={i} cx="0" cy={-petalLen * 0.55} rx={petalW} ry={petalLen * 0.55}
            fill={petal} opacity={0.85}
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: 'center', transformBox: 'fill-box' }} />
        );
      })}
      {hero && Array.from({ length: petalCount }).map((_, i) => {
        const angle = (i * 360) / petalCount + (180 / petalCount);
        const p2 = p.petals[(petalIdx + 2) % p.petals.length];
        return (
          <ellipse key={'b' + i} cx="0" cy={-petalLen * 0.42} rx={petalW * 0.7} ry={petalLen * 0.42}
            fill={p2} opacity={0.9}
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: 'center', transformBox: 'fill-box' }} />
        );
      })}
      <circle cx="0" cy="0" r={r} fill={center} />
      {hero && <circle cx="0" cy="0" r={r * 0.55} fill={p.accent} opacity={0.6} />}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// SVG: Stem with leaf + bud/bloom
// ─────────────────────────────────────────────────────────────
function Stem({ height, swayDelay = 0, leafSide = 'left', petalIdx = 0, bloomed = false, bloomDelay = 0, x }) {
  const petal = p.petals[petalIdx % p.petals.length];
  const grow = `stemGrow ${0.7}s cubic-bezier(.18,.9,.4,1.1) both`;
  const sway = `stemSway 4s ease-in-out ${swayDelay}s infinite alternate`;

  return (
    <g style={{ transform: `translateX(${x}px)`, transformBox: 'fill-box' }}>
      <g style={{ transformOrigin: 'bottom center', animation: `${grow}, ${sway}` }}>
        <path
          d={`M 0 0 Q ${leafSide === 'left' ? -3 : 3} ${-height * 0.5} 0 ${-height}`}
          stroke={p.stem} strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.9}
        />
        <g style={{ transform: `translate(0, ${-height * 0.45}px)` }}>
          <path d={leafSide === 'left' ? 'M 0 0 Q -10 -3 -14 4 Q -10 6 0 2 Z' : 'M 0 0 Q 10 -3 14 4 Q 10 6 0 2 Z'}
            fill={p.leaf} opacity={0.85} />
        </g>
        <g style={{ transform: `translate(0, ${-height * 0.72}px)` }}>
          <path d={leafSide === 'left' ? 'M 0 0 Q 7 -2 10 3 Q 7 4 0 1 Z' : 'M 0 0 Q -7 -2 -10 3 Q -7 4 0 1 Z'}
            fill={p.leaf} opacity={0.85} />
        </g>
        <g style={{ transform: `translate(0, ${-height}px)` }}>
          {bloomed ? (
            <Flower petalIdx={petalIdx} delay={bloomDelay} size={1} />
          ) : (
            <circle cx="0" cy="0" r={2.5} fill={petal} opacity={0.85} />
          )}
        </g>
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// MEADOW SCENERY — sky, sun, clouds, hills, trees, grass
// ─────────────────────────────────────────────────────────────
function Cloud({ x, y, scale, delay }) {
  return (
    <g style={{
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      '--x': `${x}px`, '--y': `${y}px`, '--s': scale,
      animation: `cloudDrift 60s linear ${delay}s infinite`,
    }}>
      <ellipse cx="0" cy="0" rx="40" ry="14" fill="white" opacity={0.6} />
      <ellipse cx="-22" cy="4" rx="22" ry="10" fill="white" opacity={0.6} />
      <ellipse cx="20" cy="3" rx="26" ry="11" fill="white" opacity={0.6} />
    </g>
  );
}

function FarTrees({ y, width }) {
  const trees = [];
  for (let i = 0; i < 14; i++) {
    const tx = (i / 14) * width + (i % 3) * 18;
    const th = 18 + (i % 4) * 6;
    trees.push(
      <g key={i} style={{ transform: `translate(${tx}px, ${y}px)` }}>
        <ellipse cx="0" cy={-th * 0.4} rx={th * 0.4} ry={th * 0.45} fill={p.hillMid} opacity={0.9} />
        <rect x="-1.5" y={-th * 0.2} width="3" height={th * 0.3} fill={p.woodDark} opacity={0.7} />
      </g>
    );
  }
  return <g>{trees}</g>;
}

function GrassBlades({ width, height }) {
  const blades = [];
  const yBase = height * 0.82;
  for (let i = 0; i < 80; i++) {
    const x = (i / 80) * width + Math.sin(i * 7.3) * 12;
    const h = 8 + (i % 5) * 4;
    const sway = (i % 4) * 0.3;
    blades.push(
      <path key={i}
        d={`M ${x} ${yBase + (i % 3) * 14} q ${(i % 2 ? 1 : -1) * 2} -${h * 0.5} 0 -${h}`}
        stroke={i % 3 === 0 ? p.grassNear : p.grassFar}
        strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.85}
        style={{
          transformOrigin: `${x}px ${yBase}px`,
          animation: `grassSway 5s ease-in-out ${sway}s infinite alternate`,
        }}
      />
    );
  }
  return <g>{blades}</g>;
}

function Meadow({ width, height }) {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
         style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={p.skyTop} />
          <stop offset="100%" stopColor={p.skyBot} />
        </linearGradient>
        <radialGradient id="sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={p.sun} stopOpacity="1" />
          <stop offset="60%" stopColor={p.sun} stopOpacity="0.4" />
          <stop offset="100%" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* sky */}
      <rect width={width} height={height} fill="url(#sky)" />

      {/* sun */}
      <g style={{ animation: 'sunBreathe 8s ease-in-out infinite alternate', transformOrigin: `${width * 0.78}px ${height * 0.22}px` }}>
        <circle cx={width * 0.78} cy={height * 0.22} r={120} fill="url(#sun)" />
        <circle cx={width * 0.78} cy={height * 0.22} r={42} fill={p.sun} opacity={0.7} />
      </g>

      {/* clouds */}
      <Cloud x={width * 0.15} y={height * 0.18} scale={1.1} delay={0} />
      <Cloud x={width * 0.5} y={height * 0.12} scale={0.8} delay={3} />
      <Cloud x={width * 0.32} y={height * 0.28} scale={0.6} delay={6} />

      {/* far hills */}
      <path
        d={`M 0 ${height * 0.55} Q ${width * 0.2} ${height * 0.42} ${width * 0.45} ${height * 0.5} T ${width} ${height * 0.5} L ${width} ${height * 0.65} L 0 ${height * 0.65} Z`}
        fill={p.hillFar} opacity={0.7}
      />
      <FarTrees y={height * 0.52} width={width} />

      {/* mid hills */}
      <path
        d={`M 0 ${height * 0.65} Q ${width * 0.3} ${height * 0.55} ${width * 0.6} ${height * 0.62} T ${width} ${height * 0.6} L ${width} ${height * 0.78} L 0 ${height * 0.78} Z`}
        fill={p.hillMid}
      />
      {/* near hills */}
      <path
        d={`M 0 ${height * 0.78} Q ${width * 0.4} ${height * 0.7} ${width * 0.7} ${height * 0.76} T ${width} ${height * 0.74} L ${width} ${height} L 0 ${height} Z`}
        fill={p.hillNear}
      />

      <GrassBlades width={width} height={height} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// SIGNPOST TOGGLE — wooden sign with etched text, FLIPS on toggle
// ─────────────────────────────────────────────────────────────
function Signpost({ mode, onToggle }) {
  const flipped = mode === 'km-to-mi';
  const etched = p.paper;
  return (
    <button onClick={onToggle}
      aria-label={`Switch direction. Currently ${mode}`}
      style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', position: 'relative', width: 240, height: 140 }}>
      <svg width="240" height="140" viewBox="0 0 240 140" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="woodGrain" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={p.woodDark} stopOpacity="0.6" />
            <stop offset="50%" stopColor={p.woodDark} stopOpacity="0" />
            <stop offset="100%" stopColor={p.woodDark} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* post */}
        <rect x="114" y="40" width="12" height="100" fill={p.wood} rx="2" />
        <rect x="114" y="40" width="12" height="100" fill="url(#woodGrain)" opacity="0.3" rx="2" />
        {/* hanging chain */}
        <line x1="55" y1="48" x2="55" y2="60" stroke={p.woodDark} strokeWidth="1.5" />
        <line x1="185" y1="48" x2="185" y2="60" stroke={p.woodDark} strokeWidth="1.5" />
        {/* SIGN BOARD — flips on toggle */}
        <g style={{
          transformOrigin: '120px 83px',
          transform: flipped ? 'scaleX(-1)' : 'scaleX(1)',
          transition: 'transform 0.9s cubic-bezier(.2,.8,.3,1.2)',
        }}>
          <rect x="30" y="58" width="180" height="50" fill={p.wood} rx="6" />
          <rect x="30" y="58" width="180" height="50" fill="url(#woodGrain)" opacity="0.4" rx="6" />
          <rect x="30" y="58" width="180" height="50" fill="none" stroke={p.woodDark} strokeWidth="2" rx="6" opacity="0.5" />
          {/* nails */}
          <circle cx="40" cy="68" r="1.5" fill={p.woodDark} />
          <circle cx="200" cy="68" r="1.5" fill={p.woodDark} />
          <circle cx="40" cy="98" r="1.5" fill={p.woodDark} />
          <circle cx="200" cy="98" r="1.5" fill={p.woodDark} />
          {/* tiny decorative leaves */}
          <path d="M 120 56 q -3 -4 -7 -2 q 1 4 7 2 z" fill={p.leaf} opacity="0.85" />
          <path d="M 120 56 q 3 -4 7 -2 q -1 4 -7 2 z" fill={p.leaf} opacity="0.85" />
          {/* COUNTER-FLIPPED CONTENT */}
          <g style={{
            transformOrigin: '120px 83px',
            transform: flipped ? 'scaleX(-1)' : 'scaleX(1)',
            transition: 'transform 0.9s cubic-bezier(.2,.8,.3,1.2)',
          }}>
            {/* ETCHED arrow — dark groove + cream highlight */}
            <line x1="105" y1="85" x2="133" y2="85" stroke={p.woodDark} strokeWidth="3" strokeLinecap="round" opacity="0.85" />
            <path d="M 128 80 L 134 85 L 128 90" stroke={p.woodDark} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85" />
            <line x1="105" y1="84" x2="133" y2="84" stroke={etched} strokeWidth="1.6" strokeLinecap="round" opacity="0.95" />
            <path d="M 128 79 L 134 84 L 128 89" stroke={etched} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95" />
            {/* LEFT text */}
            <text x="71" y="91" textAnchor="middle" style={{ fontFamily: p.font, fontSize: 19, fontWeight: 700, fill: p.woodDark, opacity: 0.9 }}>
              {flipped ? 'km' : 'miles'}
            </text>
            <text x="71" y="90" textAnchor="middle" style={{ fontFamily: p.font, fontSize: 19, fontWeight: 700, fill: etched, opacity: 0.95 }}>
              {flipped ? 'km' : 'miles'}
            </text>
            {/* RIGHT text */}
            <text x="169" y="91" textAnchor="middle" style={{ fontFamily: p.font, fontSize: 19, fontWeight: 700, fill: p.woodDark, opacity: 0.9 }}>
              {flipped ? 'miles' : 'km'}
            </text>
            <text x="169" y="90" textAnchor="middle" style={{ fontFamily: p.font, fontSize: 19, fontWeight: 700, fill: etched, opacity: 0.95 }}>
              {flipped ? 'miles' : 'km'}
            </text>
          </g>
        </g>
        {/* base flowers */}
        <g style={{ transform: 'translate(105px, 138px)' }}>
          <Flower petalIdx={0} delay={0.5} size={0.5} />
        </g>
        <g style={{ transform: 'translate(135px, 138px)' }}>
          <Flower petalIdx={2} delay={0.7} size={0.4} />
        </g>
      </svg>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// CORNER FOLIAGE — wraps the card with leaves/vines
// ─────────────────────────────────────────────────────────────
function CornerFoliage({ position, bloomed, bloomKey }) {
  const baseScales = [0.7, 0.5, 0.6];
  const bloomScales = [1.5, 1.2, 1.4];
  return (
    <svg width="180" height="180" viewBox="0 0 180 180"
         style={{
           position: 'absolute',
           [position[0] === 't' ? 'top' : 'bottom']: -28,
           [position[1] === 'l' ? 'left' : 'right']: -28,
           transform: position[0] === 'b' ? 'scaleY(-1)' : (position[1] === 'r' ? 'scaleX(-1)' : 'none'),
           pointerEvents: 'none', zIndex: 3, overflow: 'visible',
         }}>
      <path d="M 10 10 Q 45 35 38 65 T 80 120 T 150 160"
            stroke={p.stem} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity={0.85} />
      <g style={{ transform: 'translate(42px, 38px) rotate(20deg)' }}>
        <path d="M 0 0 Q 14 -5 18 7 Q 14 9 0 3 Z" fill={p.leaf} opacity={0.85} />
      </g>
      <g style={{ transform: 'translate(54px, 82px) rotate(-15deg)' }}>
        <path d="M 0 0 Q -16 -4 -20 9 Q -16 11 0 3 Z" fill={p.leaf} opacity={0.85} />
      </g>
      <g style={{ transform: 'translate(95px, 125px) rotate(10deg)' }}>
        <path d="M 0 0 Q 16 -4 20 9 Q 16 11 0 3 Z" fill={p.leaf} opacity={0.85} />
      </g>
      {[
        { x: 22, y: 20, idx: 1, i: 0 },
        { x: 64, y: 60, idx: 3, i: 1 },
        { x: 122, y: 142, idx: 4, i: 2 },
      ].map(({ x, y, idx, i }) => (
        <g key={`f-${i}-${bloomKey}`} style={{
          transform: `translate(${x}px, ${y}px) scale(${bloomed ? bloomScales[i] : baseScales[i]})`,
          transformOrigin: 'center',
          transition: 'transform 1.4s cubic-bezier(.2,.8,.3,1.3)',
          transitionDelay: bloomed ? `${0.15 + i * 0.18}s` : '0s',
        }}>
          <Flower petalIdx={idx} size={1} delay={0.2 + i * 0.2} />
        </g>
      ))}
      {bloomed && [
        { x: 38, y: 50, idx: 0, d: 0.5 },
        { x: 80, y: 95, idx: 2, d: 0.7 },
        { x: 100, y: 38, idx: 5, d: 0.4 },
        { x: 145, y: 110, idx: 1, d: 0.85 },
        { x: 30, y: 95, idx: 4, d: 0.6 },
      ].map((f, i) => (
        <g key={`x-${i}-${bloomKey}`} style={{ transform: `translate(${f.x}px, ${f.y}px)` }}>
          <Flower petalIdx={f.idx} size={0.7} delay={f.d} />
        </g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// BUTTERFLY — appears after bloom
// ─────────────────────────────────────────────────────────────
function Butterfly({ x, y, delay, scale = 1 }) {
  const c1 = p.petals[1];
  const c2 = p.petals[3];
  return (
    <svg width="40" height="32" viewBox="0 0 40 32"
         style={{
           position: 'absolute', left: x, top: y,
           '--s': scale,
           animation: `butterflyFly 8s ease-in-out ${delay}s infinite, butterflyAppear 0.6s ease-out ${delay}s both`,
           pointerEvents: 'none', zIndex: 6,
         }}>
      <g style={{ animation: 'wingFlap 0.18s ease-in-out infinite alternate', transformOrigin: '20px 16px' }}>
        <ellipse cx="12" cy="12" rx="8" ry="6" fill={c1} opacity="0.9" />
        <ellipse cx="12" cy="20" rx="6" ry="5" fill={c1} opacity="0.85" />
        <ellipse cx="28" cy="12" rx="8" ry="6" fill={c2} opacity="0.9" />
        <ellipse cx="28" cy="20" rx="6" ry="5" fill={c2} opacity="0.85" />
        <ellipse cx="20" cy="16" rx="1.6" ry="7" fill={p.ink} />
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN CONVERTER — full viewport
// ─────────────────────────────────────────────────────────────
export function Converter() {
  const [mode, setMode] = useState('mi-to-km');
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [bloomed, setBloomed] = useState(false);
  const [bloomKey, setBloomKey] = useState(0);
  const [stems, setStems] = useState([]);
  const stemCounterRef = useRef(0);
  const inputRef = useRef(null);

  const MAX_STEMS = 20;

  const getSize = useCallback(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 760,
  }), []);
  const [size, setSize] = useState(getSize);
  useEffect(() => {
    const onResize = () => setSize(getSize());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [getSize]);
  const width = size.width;
  const height = size.height;

  const handleConvert = () => {
    const num = parseFloat(value);
    if (Number.isNaN(num)) return;
    const r = mode === 'mi-to-km' ? num * 1.609344 : num / 1.609344;
    setResult({ input: num, output: r, mode });
    setBloomed(true);
    setBloomKey((k) => k + 1);
  };

  const handleChange = (e) => {
    const v = e.target.value.replace(/[^0-9.]/g, '');
    const oldLen = value.length;
    setValue(v);
    if (v.length > oldLen && stems.length < MAX_STEMS) {
      const additions = Math.min(v.length - oldLen, MAX_STEMS - stems.length);
      const newOnes = [];
      for (let k = 0; k < additions; k++) {
        const i = stemCounterRef.current++;
        newOnes.push({
          id: i,
          height: 50 + ((i * 17) % 55),
          petalIdx: (i * 3) % p.petals.length,
          side: i % 2 === 0 ? 'left' : 'right',
          delay: 0,
          slot: stems.length + k,
        });
      }
      setStems((s) => [...s, ...newOnes]);
    }
    if (bloomed) setBloomed(false);
    if (result) setResult(null);
  };

  const toggleMode = () => {
    setMode((m) => (m === 'mi-to-km' ? 'km-to-mi' : 'mi-to-km'));
    setBloomed(false);
    setResult(null);
  };

  const fromUnit = mode === 'mi-to-km' ? 'miles' : 'kilometers';
  const toUnit = mode === 'mi-to-km' ? 'kilometers' : 'miles';
  const fromAbbr = mode === 'mi-to-km' ? 'mi' : 'km';

  const stemAreaWidth = 540;
  const stemSpacing = stemAreaWidth / Math.max(stems.length, 1);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: p.fontUI,
      color: p.ink,
      background: p.skyTop,
    }}>
      <Meadow width={width} height={height} />

      {/* Foreground stems */}
      <svg width={stemAreaWidth} height={130} viewBox={`0 0 ${stemAreaWidth} 130`}
           style={{ position: 'absolute', left: '50%', top: height * 0.62, transform: 'translateX(-50%)', overflow: 'visible', zIndex: 4, pointerEvents: 'none' }}>
        <g style={{ transform: 'translateY(130px)' }}>
          {stems.map((s, i) => (
            <Stem key={s.id} height={s.height} swayDelay={(s.id % 7) * 0.3}
              leafSide={s.side} petalIdx={s.petalIdx} bloomed={bloomed}
              bloomDelay={i * 0.05} x={i * stemSpacing + stemSpacing / 2} />
          ))}
        </g>
      </svg>

      {/* Butterflies post-bloom */}
      {bloomed && (
        <>
          <Butterfly x={width * 0.18} y={height * 0.35} delay={0.8} scale={1} />
          <Butterfly x={width * 0.78} y={height * 0.42} delay={1.1} scale={0.9} />
          <Butterfly x={width * 0.65} y={height * 0.25} delay={1.4} scale={0.8} />
          <Butterfly x={width * 0.30} y={height * 0.20} delay={1.7} scale={0.85} />
        </>
      )}

      {/* CARD */}
      <div style={{
        position: 'absolute', left: '50%', top: height * 0.32,
        transform: 'translate(-50%, -50%)',
        width: 620, maxWidth: '92%',
        padding: '36px 48px 30px',
        background: p.cardBg, borderRadius: 18,
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 4px 24px rgba(60, 90, 60, 0.15), inset 0 0 0 1px rgba(255,255,255,0.5)',
        zIndex: 2, textAlign: 'center',
      }}>
        <CornerFoliage position="tl" bloomed={bloomed} bloomKey={bloomKey} />
        <CornerFoliage position="tr" bloomed={bloomed} bloomKey={bloomKey} />
        <CornerFoliage position="bl" bloomed={bloomed} bloomKey={bloomKey} />
        <CornerFoliage position="br" bloomed={bloomed} bloomKey={bloomKey} />

        {/* Title */}
        <div style={{ fontFamily: p.font, fontSize: 30, fontWeight: 700, color: p.ink, marginBottom: 4 }}>
          Spring Bloom
        </div>
        <div style={{ fontFamily: p.fontUI, fontSize: 13, color: p.ink, opacity: 0.6, marginBottom: 18, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          a unit converter
        </div>

        {/* Signpost */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
          <Signpost mode={mode} onToggle={toggleMode} />
        </div>

        {/* Input row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', marginTop: 4 }}>
          <div style={{ position: 'relative' }}>
            <input ref={inputRef} type="text" inputMode="decimal" value={value}
              onChange={handleChange} onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
              placeholder="0"
              style={{
                width: 200, fontFamily: p.font, fontSize: 56, fontWeight: 700,
                textAlign: 'center', color: p.ink, background: 'transparent',
                border: 'none', borderBottom: `3px solid ${p.cardBorder}`,
                outline: 'none', padding: '8px 4px', caretColor: p.accent,
              }}
            />
          </div>
          <div style={{ fontFamily: p.font, fontSize: 28, fontWeight: 600, color: p.ink, opacity: 0.7 }}>
            {fromUnit}
          </div>
        </div>

        {/* Result */}
        <div style={{ minHeight: 60, marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: p.font }}>
          {result ? (
            <div style={{
              animation: 'resultRise 1.2s cubic-bezier(.2,.8,.3,1.2) 0.3s both',
              fontSize: 38, fontWeight: 700, color: p.ink,
              display: 'flex', alignItems: 'baseline', gap: 8,
            }}>
              <span style={{ opacity: 0.55, fontSize: 24 }}>≈</span>
              <span>{result.output.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
              <span style={{ fontSize: 22, opacity: 0.7 }}>{toUnit}</span>
            </div>
          ) : (
            <div style={{ fontSize: 18, color: p.ink, opacity: 0.45, fontStyle: 'italic' }}>
              {value ? `press convert to bloom your ${fromAbbr}` : `type a number in ${fromUnit} to plant a seed`}
            </div>
          )}
        </div>

        {/* Convert button */}
        <button onClick={handleConvert} disabled={!value}
          style={{
            marginTop: 18, position: 'relative',
            background: value ? p.cardBorder : p.hillFar,
            color: p.paper, border: 'none', borderRadius: 8,
            padding: '14px 38px', fontFamily: p.font, fontSize: 22, fontWeight: 700,
            cursor: value ? 'pointer' : 'not-allowed',
            letterSpacing: 0.5,
            boxShadow: value ? `0 4px 0 ${p.woodDark}, 0 6px 16px rgba(0,0,0,0.15)` : 'none',
            transition: 'all 0.18s',
            transform: bloomed ? 'translateY(2px)' : 'translateY(0)',
            opacity: value ? 1 : 0.5,
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(3px)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <span style={{ position: 'absolute', left: -10, top: '50%', transform: 'translateY(-50%) rotate(-30deg)', fontSize: 0 }}>
            <svg width="22" height="22" viewBox="0 0 22 22"><path d="M 4 18 Q 0 8 8 4 Q 12 12 4 18 Z" fill={p.leaf} /></svg>
          </span>
          <span style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%) rotate(30deg) scaleX(-1)', fontSize: 0 }}>
            <svg width="22" height="22" viewBox="0 0 22 22"><path d="M 4 18 Q 0 8 8 4 Q 12 12 4 18 Z" fill={p.leaf} /></svg>
          </span>
          {bloomed ? '✿ Bloomed ✿' : 'Convert'}
        </button>
      </div>
    </div>
  );
}
